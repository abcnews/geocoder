declare type GeocodeResult = {
    input: string;
    group: string;
    duration: number;
    results: Array<{
        address: string;
        latitude: number;
        longitude: number;
        score: number;
        id: number;
    }>;
};
declare type GeocodeOptions = {
    limit?: number;
};
declare function geocode(input: string, options?: GeocodeOptions): Promise<GeocodeResult>;

export { GeocodeResult, geocode as default };
