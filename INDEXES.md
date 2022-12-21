Address index format
====================


How addresses are indexed and stored
------------------------------------

Address indexes are stored in static text files containing newline-delimetered JSON.

Each file contains a subset of addresses that share a common street number and metaphone (a phonetic representation) of the street name or suburb.


JSON structure
--------------

Each line of JSON represents a "street" containing the street name, suburb, state/territory and postcode. 

Within each street there is an array of "blocks" on that street. Each block has a street number and coordinates. Coordinates are stored as a 9-character [geohash](https://en.wikipedia.org/wiki/Geohash) to conserve space and improve compression.

Optionally, within each "block" there may an object mapping unit types to an array of unit numbers.

For a TypeScript type definition, refer to the `Street` type in `src/types.ts`.


Where addresses are indexed
---------------------------

Addresses are indexed by words in the street name and suburb. Additionally, addresses are indexed by the street number.

For each word in the street name and suburb, we take the first letter of the word and the metaphone (a phonetic represenation) of the word. We then index by a combination of the first letter and first three characters of the metaphone. We also index by a combination of the first letter, the street number modulo 20 and the first two characters of the metaphone.

For example, this address:

__Shop 17, Australia Square, 264-278 George Street, Sydney NSW 2000__

...will appear in the following indexes:

* `G/4/JR` (G = first letter of GEORGE, 4 = 264 modulo 20, JR = 2-character metaphone of GEORGE)
* `G/_/JRJ` (G = first letter of GEORGE, _ = no street number, JRJ = 3-character metaphone of GEORGE)
* `S/4/ST` (S = first letter of SYDNEY, 4 = 264 modulo 20, ST = 2-character metaphone of SYDNEY)
* `S/_/STN` (S = first letter of SYDNEY, _ = no street number, STN = 3-character metaphone of SYDNEY)


How an address look will search indexes
---------------------------------------

Address lookups are first cleaned up by removing anything that's not a letter, number or space.

We then analyse each word. Words that includes a digit somewhere (e.g. "123", "123A") require an exact match in the address. Words that do not include a digit (e.g. "sydney", "sidney", "syd") will be searched using a "fuzzy" algorithm that allows for misspellings and prefixes.

For example, the following query:

`17/264 george st sidney`

...would be searched for in the following indexes:

* `G/17/JR` (G = first letter of GEORGE, 17 = 17 modulo 20, JR = 2-character metaphone of GEORGE)
* `G/4/JR` (G = first letter of GEORGE, 4 = 264 modulo 20, JR = 2-character metaphone of GEORGE)
* `S/17/ST` (S = first letter of ST, 17 = 17 modulo 20, ST = 2-character metaphone of ST)
* `S/4/ST` (S = first letter of ST, 4 = 264 modulo 20, ST = 2-character metaphone of ST)
* `S/17/ST` (S = first letter of SIDNEY, 17 = 17 modulo 20, ST = 2-character metaphone of SIDNEY)
* `S/4/ST` (S = first letter of SIDNEY, 4 = 264 modulo 20, ST = 2-character metaphone of SIDNEY)

If the query does not include a number then we have to widen the search to more potential addresses. We use the 3-character metaphones to offset the increase in potential addresses with a stricter fuzzy search.

For example, the following query:

`george st sidney`

...would be searched for in the following indexes:

* `G/_/JRJ` (G = first letter of GEORGE, _ = no number, JRJ = 3-character metaphone of GEORGE)
* `G/_/JRJ` (G = first letter of GEORGE, _ = no number, JRJ = 3-character metaphone of GEORGE)
* `S/_/ST` (S = first letter of ST, _ = no number, ST = 3-character metaphone of ST)
* `S/_/ST` (S = first letter of ST, _ = no number, ST = 3-character metaphone of ST)
* `S/_/STN` (S = first letter of SIDNEY, _ = no number, STN = 3-character metaphone of SIDNEY)
* `S/_/STN` (S = first letter of SIDNEY, _ = no number, STN = 3-character metaphone of SIDNEY)
