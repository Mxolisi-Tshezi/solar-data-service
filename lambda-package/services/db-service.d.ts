import { CombinedDataPoint } from '../models/combined-data';
export declare class DatabaseService {
    private pool;
    constructor();
    /**
     * Initialize the database connection pool with credentials
     */
    private initializePool;
    /**
     * Initializes the database schema if it doesn't exist
     */
    initializeDatabase(): Promise<void>;
    /**
     * Stores multiple data points in the database with upsert logic
     */
    storeData(dataPoints: CombinedDataPoint[]): Promise<void>;
    /**
     * Upserts a single data point - if it exists, update it, otherwise insert
     */
    private upsertDataPoint;
    /**
     * Retrieve recent data points from the database
     */
    getRecentData(limit?: number): Promise<CombinedDataPoint[]>;
    /**
     * Cleanup connection pool on shutdown
     */
    close(): Promise<void>;
}
