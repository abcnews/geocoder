import type { Street } from './types';
import MiniSearch, { SearchResult as MiniSearchResult } from 'minisearch';
import Geohash from 'latlon-geohash';
//@ts-ignore - missing types
import metaphone from 'metaphone';
declare function metaphone(word: string): string;

export type GeocodeResult = {
  input: string;
  group: string;
  duration: number; // in milliseconds
  results: Array<{
    address: string;
    latitude: number;
    longitude: number;
    score: number;
    id: number;
  }>;
};

type GeocodeOptions = {
  limit?: number;
};

type SearchIndexDocument = {
  id: number;
  address: string;
  geohash: string;
  numericWords: NumericWord[];
};

type NumericWord = number | string;

const knownGroups = new Set<string>(require('../groups.json'));
let currentGroup: string | null = null;
let currentGroupData: string | null = null;

let fetchController = new AbortController();

const miniSearch = new MiniSearch<SearchIndexDocument>({ fields: ['address'] });
let searchIndexDocuments: SearchIndexDocument[] = [];
let currentSearchIndexKey: string | null = null;

function getSearchIndexKey(group: string, numericWords: NumericWord[]) {
  return [group, ...numericWords.sort()].join('|');
}

function getGroup(word: string): string | null {
  let cleanedWord = word.toUpperCase().replace(/[^A-Z]+/g, '');
  let group = cleanedWord.substring(0, 1) + metaphone(cleanedWord).substring(0, 3); // first letter followed by metaphone of up to 3 characters
  return knownGroups.has(group) ? group : null;
}

function loadGroupData(group: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (group === currentGroup && currentGroupData) {
      // group hasn't changed and the data is already loaded
      resolve(currentGroupData);
      return;
    }
    fetchController.abort(); // abort any existing requests
    fetchController = new AbortController();
    currentGroup = group;
    let url = `https://www.abc.net.au/res/sites/news-projects/geocoder/data/202111/${group}.txt.gz`;
    fetch(url, { signal: fetchController.signal })
      .then(response => {
        response.text().then(data => {
          currentGroupData = data;
          resolve(data);
        });
      })
      .catch(e => {
        // We expect possible AbortErrors, but other issues should be passed on.
        if (e.name !== 'AbortError') reject(e);
      });
  });
}

function prepareSearchIndex(group: string, numericWords: NumericWord[]): Promise<void> {
  return new Promise((resolve, reject) => {
    let newSearchIndexKey = getSearchIndexKey(group, numericWords);
    if (newSearchIndexKey === currentSearchIndexKey) {
      // no need to rebuild search index
      resolve();
      return;
    }
    loadGroupData(group)
      .then(data => {
        searchIndexDocuments = [];
        let id = 0;
        let lines = data.split('\n');
        for (let line of lines) {
          let street: Street;
          try {
            street = JSON.parse(line);
          } catch {
            continue;
          }
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
            let indexThisBlock = numericWords.length === 0 || numericWords.some(w => w === block.n || w === block.m || w === street.p);
            if (indexThisBlock) {
              searchIndexDocuments[id] = {
                id,
                address,
                geohash: block.g,
                numericWords: block.m ? [block.n, block.m, street.p] : [block.n, street.p],
              };
              id++;
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
                        searchIndexDocuments[id] = {
                          id,
                          address: unitType + i + ', ' + address,
                          geohash: block.g,
                          numericWords: block.m ? [i, block.n, block.m, +street.p] : [i, block.n, +street.p],
                        };
                        id++;
                      }
                    }
                  } else {
                    // single unit number - e.g. 1 or "1A"
                    let indexThisUnit = indexThisBlock || numericWords.some(w => w === unitNumber);
                    if (indexThisUnit) {
                      searchIndexDocuments[id] = {
                        id,
                        address: unitType + unitNumber + ', ' + address,
                        geohash: block.g,
                        numericWords: block.m ? [unitNumber, block.n, block.m, +street.p] : [unitNumber, block.n, +street.p],
                      };
                      id++;
                    }
                  }
                }
              }
            }
          }
          if (id > 10000) {
            break; // search index is getting too big - stop here
          }
        }
        miniSearch.removeAll();
        miniSearch.addAll(searchIndexDocuments); // consider using addAllAsync if performance is slow
        resolve();
      })
      .catch(reject);
  });
}

const states = new Set(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']);

const prettyAddress = (address: string): string => {
  return address.toUpperCase().replace(/(^|[^A-Z])(['A-Z]+)/g, (entireMatch, separator, word) => {
    let prettyWord = states.has(word) ? word : word.substring(0, 1) + word.substring(1).toLowerCase();
    return separator + prettyWord;
  });
};

export default function geocode(input: string, options: GeocodeOptions = {}): Promise<GeocodeResult> {
  return new Promise((resolve, reject) => {
    let startTime = Date.now();
    let cleanedInput = input
      .replace(/'/g, '')
      .replace(/[^\w\d]+/g, ' ')
      .replace(/\s+/g, ' ')
      .toUpperCase();
    let words: NumericWord[] = cleanedInput.split(' ').map(word => (isFinite(+word) ? +word : word));
    let numericWords: NumericWord[] = [];
    let streetName: string | null = null; // street name will determine the search group
    for (let word of words) {
      let isNumeric = typeof word === 'number' || /\d/.test(word);
      if (isNumeric) {
        numericWords.push(word);
      } else if (streetName === null && typeof word === 'string' && word.length > 3 && numericWords.length > 0) {
        // first >3 letter word after a numeric word is assumed to be the street name
        streetName = word;
      }
    }
    if (streetName === null) {
      // fallback: use first non-numeric word
      let firstWord = words.find(word => typeof word === 'string' && !/\d/.test(word));
      if (firstWord && typeof firstWord === 'string') {
        streetName = firstWord;
      }
    }
    if (streetName === null) return;
    let group = getGroup(streetName);
    if (!group) return;
    prepareSearchIndex(group, numericWords)
      .then(() => {
        let miniSearchResults: MiniSearchResult[] = miniSearch.search(input, {
          fuzzy: term => (/\d/.test(term) ? false : 0.333), // disable fuzzy search for words containing numbers
          prefix: term => (/\d/.test(term) ? false : true), // disable prefix search for words containing numbers
          weights: { fuzzy: 0.1, prefix: 0.5 },
          filter:
            numericWords.length === 0
              ? undefined
              : result => {
                  let doc = searchIndexDocuments[result.id];
                  if (doc && doc.numericWords.length > 0) {
                    for (let inputWord of numericWords) {
                      for (let docWord of doc.numericWords) {
                        if (inputWord === docWord) {
                          return true;
                        }
                      }
                    }
                  }
                  return false;
                }
        });
        let result: GeocodeResult = {
          results: [],
          group: group ?? '',
          input,
          duration: 0
        };
        let highestScoreIsPositive = miniSearchResults[0]?.score > 0;
        for (let miniSearchResult of miniSearchResults) {
          if (miniSearchResult.score === 0 && highestScoreIsPositive) {
            break; // stop if we reach useless results
          }
          let doc = searchIndexDocuments[miniSearchResult.id];
          let g = Geohash.decode(doc.geohash);
          result.results.push({
            address: prettyAddress(doc.address),
            latitude: g.lat,
            longitude: g.lon,
            score: miniSearchResult.score,
            id: doc.id
          });
          if (result.results.length === options.limit) {
            break; // limit reached
          }
        }
        result.duration = Date.now() - startTime;
        resolve(result);
      })
      .catch(reject);
  });
}
