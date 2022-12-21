import type { Street } from './types';
import MiniSearch from 'minisearch';
import Geohash from 'latlon-geohash';
import { LRUMap } from 'lru_map';
//@ts-ignore - missing types
import metaphone from 'metaphone';
declare function metaphone(word: string): string;

export type GeocodeResult = {
  input: string;
  results: GeocodeResultItem[];
  startTime: number; // milliseconds since epoch - e.g. Date.now()
  duration: number; // in milliseconds
};

type GeocodeResultItem = {
  address: string;
  latitude: number;
  longitude: number;
  score: number;
  id: number;
};

type GeocodeOptions = {
  limit?: number;
  abortPrevious?: boolean;
};

type AddressSearchDocument = {
  id: number;
  address: string;
  streetName: string;
  geohash: string;
  numericWords: NumericWord[];
};

type NumericWord = number | string;

// Hash a string to a JavaScript-safe 53-bit integer
// More info: https://stackoverflow.com/a/52171480
// Source code: https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
/*
    cyrb53 (c) 2018 bryc (github.com/bryc)
    A fast and simple hash function with decent collision resistance.
    Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
    Public domain. Attribution appreciated.
*/
const cyrb53 = function (str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch: number; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

class GeocodeAbortError extends Error {
  constructor() {
    super();
    this.name = 'GeocodeAbortError';
  }
}

const urlBase = new URL('https://www.abc.net.au/res/sites/news-projects/geocoder/data/202208/');

let knownGroupsPromise: Promise<Set<string>> | undefined;
async function getKnownGroups(): Promise<Set<string>> {
  if (knownGroupsPromise) {
    return knownGroupsPromise;
  }
  knownGroupsPromise = (async () => {
    let response = await fetch(new URL(`groups.json.gz`, urlBase).toString());
    let knownGroups = (await response.json()) as string[];
    return new Set(knownGroups);
  })();
  return knownGroupsPromise;
}

let streetsPromises = new Map<string, Promise<Street[]>>();
let streetsAbortControllers = new WeakMap<Promise<Street[]>, AbortController>();
async function getStreets(group: string): Promise<Street[]> {
  let streetsPromise = streetsPromises.get(group);
  if (streetsPromise) {
    return streetsPromise;
  }
  let abortController = new AbortController();
  streetsPromise = (async (): Promise<Street[]> => {
    let streets: Street[] = [];
    let response = await fetch(new URL(`${group}.txt.gz`, urlBase).toString(), {
      signal: abortController.signal
    });
    let reader = response.body?.getReader();
    let textDecoder = new TextDecoder('utf8');
    let incompleteJsonFromPreviousChunk = '';
    let done = false;
    while (reader && !done) {
      let r = await reader.read();
      done = r.done;
      let chunk = textDecoder.decode(r.value);
      let text = incompleteJsonFromPreviousChunk + chunk;
      incompleteJsonFromPreviousChunk = '';
      let lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let json = lines[i];
        try {
          let street = JSON.parse(json) as Street;
          streets.push(street);
        } catch (e: unknown) {
          if (e instanceof SyntaxError && i === lines.length - 1 && !done) {
            // Incomplete JSON on last line. Assume rest of JSON is at beginning of next chunk.
            incompleteJsonFromPreviousChunk = json;
          } else if (e instanceof SyntaxError && !json) {
            // Ignore empty line. Caused by complete JSON on last line of previous chunk and newline delimeter at start of this chunk.
          } else {
            // Unknown error
            throw e;
          }
        }
      }
    }
    return streets;
  })();
  streetsPromises.set(group, streetsPromise);
  streetsAbortControllers.set(streetsPromise, abortController);
  return streetsPromise;
}
function abortStreets(group: string) {
  let streetsPromise = streetsPromises.get(group);
  if (streetsPromise) {
    let abortController = streetsAbortControllers.get(streetsPromise);
    if (abortController) {
      abortController.abort();
    }
    streetsPromises.delete(group);
  }
}

function getSearchIndexKey(group: string, numericWords: NumericWord[]) {
  return [group, ...numericWords.sort()].join(' ');
}

let searchDocumentsPromise = new LRUMap<string, Promise<AddressSearchDocument[]>>(100);
async function prepareSearchDocuments(
  groups: string[],
  numericWords: NumericWord[],
  abortPrevious: boolean
): Promise<AddressSearchDocument[]> {
  if (abortPrevious) {
    // cancel pending requests that are no longer needed
    let groupsToAbort = new Set([...streetsPromises.keys()]);
    for (let groupToAbort of groupsToAbort) {
      if (groups.includes(groupToAbort)) {
        // pending request still needed
        groupsToAbort.delete(groupToAbort);
      }
    }
    for (let abortGroup of groupsToAbort) {
      abortStreets(abortGroup);
    }
  }
  let allPromises: Array<Promise<AddressSearchDocument[]>> = [];
  for (let group of groups) {
    let key = getSearchIndexKey(group, numericWords);
    let promise = searchDocumentsPromise.get(key);
    if (!promise) {
      promise = (async () => {
        let searchIndex: AddressSearchDocument[] = [];
        let streets = await getStreets(group);
        for (let street of streets) {
          let streetName = street.a.replace(/[^ -\w]/g, '');
          let addressLines: string[] = [
            '', // building
            '', // street
            [street.s, street.t, street.p].join(' ') // suburb, state and postcode
          ];
          for (let block of street.b) {
            addressLines[1] = [
              block.l ? 'LOT ' : '', // lot number
              block.m ? block.n + '-' + block.m + ' ' : block.n + ' ', // street number
              street.a + ' ', // street name
              street.r ? street.r : '', // street type
              street.x ? ' ' + street.x : '' // street suffix
            ].join('');
            addressLines[0] = block.a ?? ''; // building
            let address = addressLines.filter(line => !!line).join(', ');
            // If we have numeric words in the query, index the block if one of the numeric words match the street number or postcode
            // If we do not have numeric words in the query, index the block
            let indexThisBlock =
              numericWords.length === 0 || numericWords.some(w => w === block.n || w === block.m || w === street.p);
            if (indexThisBlock) {
              searchIndex.push({
                id: cyrb53(address),
                address,
                streetName,
                geohash: block.g,
                numericWords: block.m ? [block.n, block.m, street.p] : [block.n, street.p]
              });
            }
            // If we have numeric words in the query, examine unit numbers in this block
            if (block.u && numericWords.length > 0) {
              for (let unitType in block.u) {
                let unitNumbers = block.u[unitType];
                if (unitType) unitType += ' ';
                // Index units if we're already indexing the block, or if the unit number matches a numeric word in the query
                for (let unitNumber of unitNumbers) {
                  if (Array.isArray(unitNumber) && unitNumber.length === 2) {
                    // range of units - e.g. [1,8]
                    for (let i = unitNumber[0]; i <= unitNumber[1]; i++) {
                      let indexThisUnit = indexThisBlock || numericWords.some(w => w === i);
                      if (indexThisUnit) {
                        let unitAndAddress = unitType + i + ', ' + address;
                        searchIndex.push({
                          id: cyrb53(unitAndAddress),
                          address: unitAndAddress,
                          streetName,
                          geohash: block.g,
                          numericWords: block.m ? [i, block.n, block.m, +street.p] : [i, block.n, +street.p]
                        });
                      }
                    }
                  } else {
                    // single unit number - e.g. 1 or "1A"
                    let indexThisUnit = indexThisBlock || numericWords.some(w => w === unitNumber);
                    if (indexThisUnit) {
                      let unitAndAddress = unitType + unitNumber + ', ' + address;
                      searchIndex.push({
                        id: cyrb53(unitAndAddress),
                        address: unitAndAddress,
                        streetName,
                        geohash: block.g,
                        numericWords: block.m
                          ? [unitNumber, block.n, block.m, +street.p]
                          : [unitNumber, block.n, +street.p]
                      });
                    }
                  }
                }
              }
            }
          }
        }
        return searchIndex;
      })();
      searchDocumentsPromise.set(group, promise);
    }
    allPromises.push(promise);
  }
  let combinedSearchIndexDocuments = new Map<number, AddressSearchDocument>();
  let allResolvedPromises = await Promise.all(allPromises);
  for (let addressSearchDocuments of allResolvedPromises) {
    for (let a of addressSearchDocuments) {
      combinedSearchIndexDocuments.set(a.id, a);
    }
    if (combinedSearchIndexDocuments.size > 10000) {
      break; // search index is getting too big - stop here
    }
  }
  return Array.from(combinedSearchIndexDocuments.values());
}

const states = new Set(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']);

const prettyAddress = (address: string): string => {
  return address.toUpperCase().replace(/(^|[^A-Z])(['A-Z]+)/g, (entireMatch, separator, word) => {
    let prettyWord = states.has(word) ? word : word.substring(0, 1) + word.substring(1).toLowerCase();
    return separator + prettyWord;
  });
};

let currentSearchIndexKey = '';
let currentSearchIndex: MiniSearch<AddressSearchDocument> | undefined;
let geocodeCache = new LRUMap<string, GeocodeResultItem[]>(100);
async function geocode(input: string, options: GeocodeOptions = {}): Promise<GeocodeResult> {
  let startTime = Date.now();
  let cleanedInput = input
    .toUpperCase()
    .replace(/[^-A-Z0-9\/,\. ]/g, '')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
  let results = geocodeCache.get(cleanedInput);
  if (results) {
    return { input, results, startTime, duration: Date.now() - startTime };
  }
  let words: NumericWord[] = cleanedInput.split(' ').map(word => (isFinite(+word) ? +word : word));
  let normalWords: string[] = [];
  let numericWords: NumericWord[] = [];
  words.forEach(word => (typeof word === 'number' || /\d/.test(word) ? numericWords : normalWords).push(word));
  let numberGroups = new Set<number>(
    numericWords.map(n => (typeof n === 'number' ? n : +n.replace(/[^\d]/g, '')) % 20)
  );
  let groups: Set<string> = new Set();
  let knownGroups = await getKnownGroups();
  for (let word of normalWords) {
    let letter = word.substring(0, 1);
    let phonetic = metaphone(word);
    if (numberGroups.size > 0) {
      let phonetic2 = phonetic.substring(0, 2);
      for (let n of numberGroups) {
        let group = [letter, n, phonetic2].join('/');
        if (knownGroups.has(group)) {
          groups.add(group);
        }
      }
    } else {
      let phonetic3 = phonetic.substring(0, 3);
      let group = [letter, '_', phonetic3].join('/');
      if (knownGroups.has(group)) {
        groups.add(group);
      }
    }
  }
  let newSearchIndexKey = [...Array.from(groups.values()), ...numericWords].sort().join(' ');
  if (!currentSearchIndex || currentSearchIndexKey !== newSearchIndexKey) {
    currentSearchIndexKey = newSearchIndexKey;
    let documents: AddressSearchDocument[];
    try {
      documents = await prepareSearchDocuments(
        Array.from(groups.values()),
        numericWords,
        options.abortPrevious ?? false
      );
    } catch (e: unknown) {
      if (options.abortPrevious && e instanceof DOMException && e.name === 'AbortError') {
        throw new GeocodeAbortError();
      } else {
        throw e; // unexpected error
      }
    }
    currentSearchIndex = new MiniSearch<AddressSearchDocument>({
      fields: ['address', 'streetName'],
      storeFields: ['address', 'geohash']
    });
    if (documents && currentSearchIndex.documentCount === 0) {
      currentSearchIndex.addAll(documents);
    }
  }
  results = [];
  let addressSearchResults = currentSearchIndex.search(input, {
    fuzzy: term => (/\d/.test(term) ? false : 0.333), // disable fuzzy search for words containing numbers
    prefix: term => (/\d/.test(term) ? false : true), // disable prefix search for words containing numbers
    weights: { fuzzy: 0.25, prefix: 0.5 },
    boost: { streetName: 2 },
    maxFuzzy: 4
  });
  let highestScoreIsPositive = addressSearchResults[0]?.score > 0;
  for (let addressSearchResult of addressSearchResults) {
    if (addressSearchResult.score === 0 && highestScoreIsPositive) {
      break; // stop if we reach useless results
    }
    let g = Geohash.decode(addressSearchResult['geohash'] as string);
    results.push({
      address: prettyAddress(addressSearchResult['address'] as string),
      latitude: g.lat,
      longitude: g.lon,
      score: addressSearchResult.score,
      id: addressSearchResult.id as number
    });
    if (results.length === options.limit) {
      break; // limit reached
    }
  }
  geocodeCache.set(cleanedInput, results);
  return { input, results, startTime, duration: Date.now() - startTime };
}

export default geocode;
export { geocode, GeocodeAbortError };
