#!/usr/bin/env -S npx ts-eager

// Refer to DATA.md and INDEXES.md for more information about how this data is structured.

import { Street, Block, AddressNumber } from '../src/types';
import { resolve } from 'node:path';
import fs from 'node:fs';
import { once } from 'events';
import postgres from 'postgres';
import dotenv from 'dotenv';
import Geohash from 'latlon-geohash';
import LRUMap from 'mnemonist/lru-map';
import MultiMap from 'mnemonist/multi-map';
//@ts-ignore - missing types
import metaphone from 'metaphone';
declare function metaphone(word: string): string;

dotenv.config();

function numberOrString(text: string): number | string {
  let number = +text;
  return isFinite(number) ? number : text;
}

// We want users to see address suggestions once they have entered part of their street name or suburb.
// Assign streets to groups based on the street number, and each word from their street name and suburb
// e.g. "114 GREY STREET, SOUTH BRISBANE QLD 4101" => ["G/4/KR", "G/_/KR", "S/4/S0", "S/_/S0", "B/4/BR", "B/_/BRS"]
function getGroups(streetNumber: number | string, streetName: string, suburb: string): string[] {
  let groups: string[] = [];
  let words = [streetName, suburb]
    .join(' ')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/ {2,}/g, ' ')
    .split(' ');
  let number = getStreetNumberGroup(streetNumber);
  for (let word of words) {
    let letter = word.substring(0, 1);
    let phonetic3 = metaphone(word).substring(0, 3);
    if (phonetic3.length > 0) {
      groups.push([letter, '_', phonetic3].join('/'));
    }
    if (number !== null) {
      let phonetic2 = phonetic3.substring(0, 2);
      if (phonetic2.length > 0) {
        groups.push([letter, number, phonetic2].join('/'));
      }
    }
  }
  return groups;
}

// Assign street number to a numbered group between 0-19.
// e.g. "2" => 2, "9A" => 9, "20" => 0, "123" => 3, "234" => 14
function getStreetNumberGroup(streetNumber: number | string): number | null {
  let group = +streetNumber.toString().replace(/[^\d]/g, '') % 20;
  return isFinite(group) ? group : null;
}

async function data() {
  let directory = resolve(__dirname, '../data/202208');
  let writeStreams = new LRUMap<string, fs.WriteStream>(2000);
  let knownGroups = new Set<string>();
  let street: Street | undefined;
  let numOutput = 0;
  let saveStreet = async () => {
    if (!street) return;
    let groupBlocks = new MultiMap<string, Block>();
    for (let block of street.b) {
      if (!street) return;
      let groups = getGroups(block.n, street.a, street.s);
      for (let group of groups) {
        groupBlocks.set(group, block);
      }
    }
    for (let [group, blocks] of groupBlocks.associations()) {
      let data: Street = { ...street, b: blocks };
      let writeStream = writeStreams.get(group);
      if (!writeStream) {
        // create new output stream for this group
        let parentDirectory = resolve(directory, group, '..');
        if (!fs.existsSync(parentDirectory)) {
          fs.mkdirSync(parentDirectory, { mode: 0o755, recursive: true });
        }
        writeStream = fs.createWriteStream(resolve(directory, `${group}.txt`), { flags: 'a' });
        let evictedWriteStream = writeStreams.setpop(group, writeStream);
        if (evictedWriteStream?.evicted) {
          // Too many files open. Close the least-recently-used file
          await (async () => {
            evictedWriteStream.value.close();
            return once(evictedWriteStream.value, 'close');
          })();
        }
      }
      await (async () => {
        if (writeStream) {
          let jsonLines = JSON.stringify(data) + '\n'; // Minified JSON, new line delimited (aka JSONL, ND-JSON, JSON-ND)
          if (!writeStream.write(jsonLines)) {
            // Stream has reached high water mark. Wait for it to drain.
            return once(writeStream, 'drain');
          }
        }
      })();
      knownGroups.add(group);
      numOutput++;
      console.log(numOutput, group, data.b.length, data.a, data.s, data.t, data.p);
    }
  };
  let sql = postgres();
  await sql`SET search_path TO gnaf_202208_gda2020,public`;
  await sql`
    CREATE MATERIALIZED VIEW IF NOT EXISTS aggregated_address_principals AS
    SELECT building_name, coalesce(number_first, lot_number) AS number_first, number_first IS NULL AS is_lot, number_last, street_name, street_type, street_suffix, locality_name, postcode, state, avg(latitude) AS latitude, avg(longitude) AS longitude, array_agg(flat_number ORDER BY flat_number) AS flat_numbers
    FROM address_principals
    GROUP BY street_name, street_type, street_suffix, locality_name, state, postcode, building_name, coalesce(number_first, lot_number), number_last, number_first IS NULL
    ORDER BY street_name, street_type, street_suffix, locality_name, state, postcode, building_name, coalesce(number_first, lot_number), number_last, number_first IS NULL
  `;
  let cursor = sql<AggregatedAddressRow[]>`
    SELECT *
    FROM aggregated_address_principals
    ORDER BY street_name, street_type, street_suffix, locality_name, state, postcode, building_name, number_first, number_last, number_first IS NULL
  `.cursor(2000);
  for await (const rows of cursor) {
    for (let a of rows) {
      if (
        !a.number_first ||
        !a.street_name ||
        !a.locality_name ||
        !a.state ||
        !a.postcode ||
        !a.latitude ||
        !a.longitude
      ) {
        console.error('Skip incomplete address', a);
        continue;
      }
      if (
        street === undefined ||
        street.a !== a.street_name ||
        street.r !== (a.street_type ?? undefined) ||
        street.x !== (a.street_suffix ?? undefined) ||
        street.s !== a.locality_name ||
        street.t !== a.state ||
        street.p !== a.postcode
      ) {
        // time for a new street
        if (street) {
          // save the existing street
          await saveStreet();
        }
        street = {
          a: a.street_name,
          r: a.street_type ?? undefined,
          x: a.street_suffix ?? undefined,
          s: a.locality_name,
          t: a.state,
          p: a.postcode,
          b: []
        };
      }
      // Add block to street
      let block: Block = {
        a: a.building_name ?? undefined,
        n: numberOrString(a.number_first),
        m: a.number_last && !a.is_lot ? numberOrString(a.number_last) : undefined,
        l: a.is_lot ? true : undefined,
        g: Geohash.encode(+a.latitude, +a.longitude, 9) // 9 character geohash gives maximum error of +/- 2.4 metres from exact location - see https://gis.stackexchange.com/a/115501
      };
      if (a.flat_numbers && a.flat_numbers.length > 0) {
        let unitLookup = new Map<string, Set<number | string>>();
        for (let str of a.flat_numbers) {
          if (str === null || str === 'NULL') {
            continue;
          }
          let lastSpace = str.lastIndexOf(' ');
          let unitType = '';
          let unitNumber: number | string = str;
          if (lastSpace !== -1) {
            unitType = str.substring(0, lastSpace);
            unitNumber = str.substring(lastSpace + 1);
          }
          unitNumber = numberOrString(unitNumber);
          let unitSet = unitLookup.get(unitType);
          if (unitSet === undefined) {
            unitSet = new Set<number | string>();
            unitLookup.set(unitType, unitSet);
          }
          unitSet.add(unitNumber);
        }
        for (let [unitType, unitSet] of unitLookup) {
          let sortedUnits = Array.from(unitSet.values()).sort((a, b) => {
            if (typeof a !== typeof b) {
              return (typeof a).localeCompare(typeof b); // numbers before strings
            }
            if (typeof a === 'number' && typeof b === 'number') {
              return a - b; // ascending number order
            }
            return a.toString().localeCompare(b.toString()); // ascending string order
          });
          let aggregatedUnits: AddressNumber[] = [];
          let runOfUnits: number[] = [];
          let endRun = () => {
            if (runOfUnits.length > 2) {
              // add range of numbers: [first, last]
              aggregatedUnits.push([runOfUnits[0], runOfUnits[runOfUnits.length - 1]]);
              runOfUnits = [];
            } else if (runOfUnits.length > 0) {
              // add all numbers individually
              aggregatedUnits.push(...runOfUnits);
              runOfUnits = [];
            }
            runOfUnits = [];
          };
          for (let unit of sortedUnits) {
            if (
              typeof unit === 'number' &&
              (runOfUnits[runOfUnits.length - 1] === unit - 1 || runOfUnits[runOfUnits.length - 1] === undefined)
            ) {
              runOfUnits.push(unit);
            } else {
              endRun();
              aggregatedUnits.push(unit);
            }
          }
          endRun();
          if (aggregatedUnits.length > 0) {
            if (!block.u) {
              block.u = {};
            }
            block.u[unitType] = aggregatedUnits;
          }
        }
      }
      street.b.push(block);
    }
  }
  if (street) {
    await saveStreet();
  }
  // Close all open write streams
  let closingWriteStreams: Promise<any>[] = [];
  for (let [word, writeStream] of writeStreams) {
    writeStream.close();
    closingWriteStreams.push(once(writeStream, 'close'));
  }
  await Promise.all(closingWriteStreams);
  let knownGroupsSorted = Array.from(knownGroups.values()).sort();
  let wordNumbers = new MultiMap<string, number>();
  for (let knownGroup of knownGroupsSorted) {
    let [letter, number, word] = knownGroup.split('/');
    let n = +number;
    if (isFinite(n)) {
      wordNumbers.set(word, n);
    }
  }
  fs.writeFileSync(resolve(directory, `groups.json`), JSON.stringify(Array.from(knownGroups.values()).sort())); // single line of minified JSON
  console.log('Done!');
  process.exit(0);
}

data();

type AggregatedAddressRow = {
  building_name: string | null;
  flat_numbers: (string | null)[] | null;
  number_first: string | null;
  number_last: string | null;
  is_lot: boolean;
  street_name: string | null;
  street_type: string | null;
  street_suffix: string | null;
  locality_name: string | null;
  postcode: string | null;
  state: string | null;
  latitude: string | null;
  longitude: string | null;
};
