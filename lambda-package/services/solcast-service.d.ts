import { CombinedDataPoint } from '../models/combined-data';
export declare class SolcastService {
    private readonly solcastMockUrl;
    private retryCount;
    private retryDelay;
    /**
     * Fetches combined data from the mock Solcast API
     */
    fetchSolcastData(): Promise<CombinedDataPoint[]>;
    /**
     * Process data from Google Sheets format
     */
    private processGoogleSheetsData;
    /**
     * Fetches data with retry mechanism
     */
    private fetchWithRetry;
    /**
     * Combines radiation/weather data with PV data
     */
    private combineData;
    /**
     * Generates mock solar data for development and testing
     */
    private generateMockData;
}
