import type { Street } from '../types';
import MiniSearch, { SearchResult as MiniSearchResult, SearchResult } from 'minisearch';
import Geohash from 'latlon-geohash';
//@ts-ignore - missing types
import metaphone from 'metaphone';
declare function metaphone(word: string): string;

export type GeocodeResult = {
  input: string,
  group: string,
  duration: number,
  results: Array<{
    address: string,
    latitude: number,
    longitude: number,
    score: number,
    id: number,
  }>;
};

type SearchIndexDocument = {
  id: number,
  address: string,
  geohash: string,
  numericWords: NumericWord[],
};

type NumericWord = number | string;

const knownGroups = new Set<string>(require('../groups.json'));
let currentGroup: string | null = null;
let currentGroupData: string | null = null;

let fetchController = new AbortController();

const miniSearch = new MiniSearch<SearchIndexDocument>({ fields: ['address'] });
let searchIndexDocuments: SearchIndexDocument[] = [];
let currentSearchIndexKey: string | null = null;

function getSearchIndexKey (group: string, numericWords: NumericWord[]) {
  return [ group, ...numericWords.sort() ].join('|');
}

function getGroup(word: string): string | null {
  let cleanedWord = word.toUpperCase().replace(/[^A-Z]+/g, '');
  let group = cleanedWord.substring(0, 1)+metaphone(cleanedWord).substring(0, 3);
  return knownGroups.has(group) ? group : null;
}

function loadGroupData(group: string, callback: (data: string) => void) {
  if (group === currentGroup && currentGroupData) {
    callback(currentGroupData);
    return;
  }
  fetchController.abort(); // abort any existing requests
  fetchController = new AbortController();
  currentGroup = group;
  let url = `https://www.abc.net.au/res/sites/news-projects/geocoder/data/202111/${group}.txt.gz`;
  fetch(url, { signal: fetchController.signal }).then(response => {
    response.text().then(data => {
      currentGroupData = data;
      callback(data);
    });
  });
}

function prepareSearchIndex(group: string, numericWords: NumericWord[], callback: () => void) {
  let newSearchIndexKey = getSearchIndexKey(group, numericWords);
  if (newSearchIndexKey === currentSearchIndexKey) {
    callback();
    return;
  }
  loadGroupData(group, data => {
    searchIndexDocuments = [];
    let id = 1;
    let lines = data.split('\n');
    for (let line of lines) {
      let street: Street;
      try {
        street = JSON.parse(line);
      }
      catch {
        continue;
      }
      let addressLines: string[] = [
        '', // building
        '', // street
        [street.s, street.t, street.p].join(' '), // suburb
      ];
      for (let block of street.b) {
        addressLines[1] = [
          block.l ? 'LOT ' : '',
          block.m ? block.n+'-'+block.m+' ' : block.n+' ',
          street.a+' ',
          street.r ? street.r : '',
          street.x ? ' '+street.x : '',
        ].join('');
        addressLines[0] = block.a ?? '';
        let address = addressLines.filter(line => !!line).join(', ');
        let indexThisBlock = numericWords.length === 0 || numericWords.some(w => w === block.n || w === street.p);
        if (indexThisBlock) {
          searchIndexDocuments[id] = {
            id,
            address,
            geohash: block.g,
            numericWords: [block.n, street.p],
          };
          id++;
        }
        if (block.u && numericWords.length > 0) {
          for (let unitType in block.u) {
            let unitNumbers = block.u[unitType];
            if (unitType) unitType+=' ';
            for (let unitNumber of unitNumbers) {
              if (Array.isArray(unitNumber) && unitNumber.length === 2) {
                for (let i=unitNumber[0]; i<=unitNumber[1]; i++) {
                  let indexThisUnit = indexThisBlock || numericWords.some(w => w === i);
                  if (indexThisUnit) {
                    searchIndexDocuments[id] = {
                      id,
                      address: unitType+i+', '+address,
                      geohash: block.g,
                      numericWords: [i, block.n, +street.p],
                    };
                    id++;
                  }
                }
              }
              else {
                let indexThisUnit = indexThisBlock || numericWords.some(w => w === unitNumber);
                if (indexThisUnit) {
                  searchIndexDocuments[id] = {
                    id: id++,
                    address: unitType+unitNumber+', '+address,
                    geohash: block.g,
                    numericWords: [unitNumber, block.n, +street.p],
                  };
                  id++;
                }
              }
            }
          }
        }
      }
      if (id > 10000) {
        break; // too much
      }
    }
    miniSearch.removeAll();
    miniSearch.addAll(searchIndexDocuments); // consider addAllAsync if performance is slow
    callback();
  });
}

export default function geocode (input: string, limit: number, callback: (results: GeocodeResult) => void) {
  let startTime = Date.now();
  let cleanedInput = input.replace(/'/g, '').replace(/[^\w\d]+/g, ' ').replace(/\s+/g, ' ').toUpperCase();
  let words: NumericWord[] = cleanedInput.split(' ').map(word => isFinite(+word) ? +word : word);
  let numericWords: NumericWord[] = [];
  let wordForGroup: string | null = null;
  for (let word of words) {
    let isNumeric = typeof word === 'number' || /\d/.test(word);
    if (isNumeric) {
      numericWords.push(word);
    }
    else if (wordForGroup === null && typeof word === 'string' && word.length > 3 && numericWords.length > 0) {
      wordForGroup = word;
    }
  }
  if (wordForGroup === null) {
    let firstWord = words.find(word => typeof word === 'string' && !/\d/.test(word));
    if (firstWord && typeof firstWord === 'string') {
      wordForGroup = firstWord;
    }
  }
  if (wordForGroup === null) return;
  let group = getGroup(wordForGroup);
  if (!group) return;
  prepareSearchIndex(group, numericWords, () => {
    let miniSearchResults: MiniSearchResult[] = miniSearch.search(input, {
      fuzzy: term => /\d/.test(term) ? false : 0.333, // disable fuzzy search for words containing numbers
      prefix: term => /\d/.test(term) ? false : true, // disable prefix search for words containing numbers
      weights: { fuzzy: 0.8, prefix: 0.9 },
      filter: numericWords.length === 0 ? undefined : result => {
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
      },
    });
    let result: GeocodeResult = {
      results: [],
      group: group ?? '',
      input,
      duration: 0,
    };
    for (let miniSearchResult of miniSearchResults) {
      if (miniSearchResult.score === 0) {
        break;
      }
      let doc = searchIndexDocuments[miniSearchResult.id];
      let g = Geohash.decode(doc.geohash);
      result.results.push({
        address: doc.address,
        latitude: g.lat,
        longitude: g.lon,
        score: miniSearchResult.score,
        id: doc.id,
      });
      if (result.results.length === limit) {
        break;
      }
    }
    result.duration = Date.now() - startTime;
    callback(result);
  });
}
