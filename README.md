geocoder
========

Browser-based geocoder for Australian addresses.


Features
--------

* Based on GNAF (Geocoded National Address File of Australia) database version 202208
* Very fast (e.g. fast enough for search-as-you-type)
* Fuzzy search (typo tolerant, word prefixes, etc.)
* Infinitely scalable when served via a CDN


Function and return type
------------------------

```typescript
function geocode(input: string, options?: { limit?: number, abortPrevious?: boolean }): Promise<GeocodeResult>

type GeocodeResult = {
  input: string,
  startTime: number,
  duration: number,
  results: Array<{
    address: string,
    latitude: number,
    longitude: number,
    score: number,
    id: number
  }>
}
```

Options
-------

* `limit`: Set to a positive integer to limit results, or leave undefined for no limit. (Default: `undefined`)
* `abortPrevious`: Set to `true` to abort unresolved calls to geocode() before starting this one. Intended for use with search-as-you-type user interfaces. Will abort pending HTTP requests that are no longer needed, and abort unresolved calls to geocode() by throwing a `GeocodeAbortError`. (Default: `false`)


Example
-------

```typescript
import geocode from 'geocoder';

geocode('114 grey', { limit: 5, abortPrevious: true }).then(result => console.log(result)).catch(e => console.error(e));
  
/* 
Returns addresses:
  1. 114 Grey Street, Kalbarri WA 6536
  2. 114 Grey Street, Traralgon VIC 3844
  3. 114 Grey Street, East Melbourne VIC 3002
  4. 114 Grey Street, Glen Innes NSW 2370
  5. 114 Grey Street, South Brisbane QLD 4101
*/
```


CORS issues
-----------

To avoid CORS issues, requests should come from a URL with a domain ending in `abc.net.au`.

For local development purposes, you can add `127.0.0.1 localhost.abc.net.au` to your `/etc/hosts` file and serve the page from http://localhost.abc.net.au.


Building
--------

Common JS, ES Modules and browser bundles are located in the `dist` directory and are built from the source code at `src/geocode.ts`.

To re-build, run:
```sh
npm install && npm run build
```
from the project root directory.


Data files
----------

See [DATA.md](DATA.md)


Demo
----

https://www.abc.net.au/res/sites/news-projects/geocoder/0.6.0/


Authors
-------

* Andrew Kesper (kesper.andrew@abc.net.au)
