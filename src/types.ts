export type Street = {
  b: Block[]; // blocks
  a: string; // name
  r?: string; // type (street, road, etc.)
  x?: string; // suffix (east, west, etc.)
  s: string; // suburb
  t: string; // state
  p: string; // postcode
};

export type Block = {
  a?: string; // building name (none if undefined)
  u?: { [type: string]: AddressNumber[] }; // units (none if undefined)
  n: number | string; // number
  m?: number | string; // last number (none if undefined)
  l?: true; // is lot? (false if undefined)
  g: string; // geohash
};

export type AddressNumber =
  | number // single unit number
  | [number, number] // range of consecutive unit numbers (e.g. [1,20])
  | string; // single unit number containing non-numeric characters (e.g. "2A")
