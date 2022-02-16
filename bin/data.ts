#!/usr/bin/env -S npx ts-eager

import { Street, Block, AddressNumber } from '../types';
import { resolve } from 'node:path';
import fs from 'node:fs';
import { once } from 'events';
import postgres from 'postgres';
import dotenv from 'dotenv';
import Geohash from 'latlon-geohash';
//@ts-expect-error - missing types
import metaphone from 'metaphone';
declare function metaphone(word: string): string;

dotenv.config();

function numberOrString(text: string): number | string {
  let number = +text;
  return isFinite(number) ? number : text;
}

async function data() {
  let dataDirectory = resolve(__dirname, '../data');
  let parentDirectory = resolve(__dirname, '..');
  fs.mkdirSync(dataDirectory, { mode: 0o755, recursive: true });
  let outputStreams = new Map<string, fs.WriteStream>();
  let outputGroups = new Set<string>();
  let street: Street | undefined;
  let numOutput = 0;
  let saveStreet = () => {
    if (!street) return;
    // We want users to see address suggestions once they have entered part of their street name.
    // Group data by first letter of street name, then by metaphone of street name.
    // Metaphone length is limited to three characters.
    // e.g. EXAMPLE => EEKS
    let group = (street.a.substring(0, 1) + metaphone(street.a).substring(0, 3)).toUpperCase();
    let outputStream = outputStreams.get(group);
    if (!outputStream) {
      // create new output stream for this group
      outputStream = fs.createWriteStream(resolve(dataDirectory, `${group}.txt`));
      outputStreams.set(group, outputStream);
    }
    outputStream.write(JSON.stringify(street)+'\n'); // Minified JSON, new line delimited (aka JSONL, ND-JSON, JSON-ND)
    outputGroups.add(group);
    numOutput++;
    console.log(numOutput, group, street.b.length, street.a, street.s, street.t, street.p);
  };
  let sql = postgres();
  await sql`
    CREATE MATERIALIZED VIEW IF NOT EXISTS gnaf_202111_gda2020.aggregated_address_principals AS
    SELECT building_name, coalesce(number_first, lot_number) AS number_first, number_first IS NULL AS is_lot, number_last, street_name, street_type, street_suffix, locality_name, postcode, state, avg(latitude) AS latitude, avg(longitude) AS longitude, array_agg(flat_number ORDER BY flat_number) AS flat_numbers
    FROM gnaf_202111_gda2020.address_principals
    GROUP BY street_name, street_type, street_suffix, locality_name, state, postcode, building_name, coalesce(number_first, lot_number), number_last, number_first IS NULL
    ORDER BY street_name, street_type, street_suffix, locality_name, state, postcode, building_name, coalesce(number_first, lot_number), number_last, number_first IS NULL
  `;
  await sql<AggregatedAddressRow[]>`SELECT * FROM gnaf_202111_gda2020.aggregated_address_principals`.stream(a => {
    if (!a.number_first || !a.street_name || !a.locality_name || !a.state || !a.postcode || !a.latitude || !a.longitude) {
      console.error('Skip incomplete address', a);
      return;
    }
    if (street === undefined || street.a !== a.street_name || street.r !== (a.street_type ?? undefined) || street.x !== (a.street_suffix ?? undefined) || street.s !== a.locality_name || street.t !== a.state || street.p !== a.postcode) {
      // time for a new street and set of metaphones
      if (street) {
        // save the existing street
        saveStreet();
      }
      street = {
        a: a.street_name,
        r: a.street_type ?? undefined,
        x: a.street_suffix ?? undefined,
        s: a.locality_name,
        t: a.state,
        p: a.postcode,
        b: [],
      };
    }
    // Add block to street
    let block: Block = {
      a: a.building_name ?? undefined,
      n: numberOrString(a.number_first),
      m: a.number_last && !a.is_lot ? numberOrString(a.number_last) : undefined,
      l: a.is_lot ? true : undefined,
      g: Geohash.encode(+a.latitude, +a.longitude, 9), // 9 character geohash gives maximum error of +/- 2.4 metres from exact location - see https://gis.stackexchange.com/a/115501
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
          unitNumber = str.substring(lastSpace+1);
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
          if (runOfUnits.length > 2) { // add range of numbers: [first, last]
            aggregatedUnits.push([
              runOfUnits[0],
              runOfUnits[runOfUnits.length-1],
            ]);
            runOfUnits = [];
          }
          else if (runOfUnits.length > 0) { // add all numbers individually
            aggregatedUnits.push(...runOfUnits);
            runOfUnits = [];
          }
          runOfUnits = [];
        };
        for (let unit of sortedUnits) {
          if (typeof unit === 'number' && (runOfUnits[runOfUnits.length-1] === unit-1 || runOfUnits[runOfUnits.length-1] === undefined)) {
            runOfUnits.push(unit);
          }
          else {
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
  });
  if (street) {
    saveStreet();
  }
  let closePromises: Promise<any>[] = [];
  for (let [metaphone, outputStream] of outputStreams) {
    outputStream.close();
    closePromises.push(once(outputStream, 'close'));
  }
  await Promise.all(closePromises);
  let groupList = Array.from(outputGroups.values()).sort();
  fs.writeFileSync(resolve(parentDirectory, `groups.json`), JSON.stringify(groupList)); // single line of minified JSON
  console.log('Done!');
  process.exit(0);
}

data();

type AggregatedAddressRow = {
  building_name: string | null,
  flat_numbers: (string | null)[] | null,
  number_first: string | null,
  number_last: string | null,
  is_lot: boolean,
  street_name: string | null,
  street_type: string | null,
  street_suffix: string | null,
  locality_name: string | null,
  postcode: string | null,
  state: string | null,
  latitude: string | null,
  longitude: string | null,
};
