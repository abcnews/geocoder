export type Street = {
  b: Block[], // blocks
  a: string, // name
  r?: string, // type
  x?: string, // suffix
  s: string, // suburb
  t: string, // state
  p: string, // postcode
};

export type Block = {
  a?: string, // name
  u?: { [type: string]: AddressNumber[] }, // units
  n: number | string, // number
  m?: number | string, // numberLast
  l?: true, // lot
  g: string, // geohash
};

export type AddressNumber = number | [number, number] | string;
