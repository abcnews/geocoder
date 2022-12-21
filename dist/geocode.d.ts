declare type GeocodeResult = {
    input: string;
    results: GeocodeResultItem[];
    startTime: number;
    duration: number;
};
declare type GeocodeResultItem = {
    address: string;
    latitude: number;
    longitude: number;
    score: number;
    id: number;
};
declare type GeocodeOptions = {
    limit?: number;
    abortPrevious?: boolean;
};
declare class GeocodeAbortError extends Error {
    constructor();
}
declare function geocode(input: string, options?: GeocodeOptions): Promise<GeocodeResult>;

export { GeocodeAbortError, GeocodeResult, geocode as default, geocode };
