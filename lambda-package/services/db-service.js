"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
// src/services/db-service.ts
const pg_1 = require("pg");
const logger_1 = require("../utils/logger");
const config_1 = require("../config");
class DatabaseService {
    constructor() {
        this.pool = null;
        // We'll initialize the pool after getting credentials
    }
    /**
     * Initialize the database connection pool with credentials
     */
    async initializePool() {
        if (this.pool)
            return; // Already initialized
        // Initialize config to get credentials from Secrets Manager if needed
        await (0, config_1.initializeConfig)();
        logger_1.logger.info('Initializing database connection pool', {
            host: config_1.config.dbHost,
            port: config_1.config.dbPort,
            database: config_1.config.dbName,
            user: config_1.config.dbUser,
            ssl: config_1.config.dbSslEnabled
        });
        this.pool = new pg_1.Pool({
            host: config_1.config.dbHost,
            port: config_1.config.dbPort,
            database: config_1.config.dbName,
            user: config_1.config.dbUser,
            password: config_1.config.dbPassword,
            ssl: config_1.config.dbSslEnabled ? {
                rejectUnauthorized: false
            } : false,
            max: 20, // Max number of clients in the pool
            idleTimeoutMillis: 30000
        });
        this.pool.on('error', (err) => {
            logger_1.logger.error('Unexpected error on idle client', err);
        });
        // Test the connection
        try {
            const client = await this.pool.connect();
            logger_1.logger.info('Successfully connected to database');
            client.release();
        }
        catch (error) {
            logger_1.logger.error('Failed to connect to database', error);
            throw error;
        }
    }
    /**
     * Initializes the database schema if it doesn't exist
     */
    async initializeDatabase() {
        await this.initializePool();
        if (!this.pool)
            throw new Error('Database pool not initialized');
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            // Create the table if it doesn't exist
            await client.query(`
        CREATE TABLE IF NOT EXISTS solar_data (
          id SERIAL PRIMARY KEY,
          period_end TIMESTAMP NOT NULL,
          period VARCHAR(20) NOT NULL,
          air_temp FLOAT,
          dni FLOAT,
          ghi FLOAT,
          relative_humidity FLOAT,
          surface_pressure FLOAT,
          wind_speed_10m FLOAT,
          pv_power_rooftop_w FLOAT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(period_end)
        );
        
        CREATE INDEX IF NOT EXISTS idx_solar_data_period_end ON solar_data(period_end);
      `);
            await client.query('COMMIT');
            logger_1.logger.info('Database initialized successfully');
        }
        catch (error) {
            await client.query('ROLLBACK');
            logger_1.logger.error('Failed to initialize database', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Stores multiple data points in the database with upsert logic
     */
    async storeData(dataPoints) {
        if (!dataPoints || dataPoints.length === 0) {
            logger_1.logger.warn('No data points to store');
            return;
        }
        await this.initializePool();
        if (!this.pool)
            throw new Error('Database pool not initialized');
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            // Use a batch insert with ON CONFLICT for better performance
            for (const dataPoint of dataPoints) {
                await this.upsertDataPoint(client, dataPoint);
            }
            await client.query('COMMIT');
            logger_1.logger.info(`Successfully stored ${dataPoints.length} data points`);
        }
        catch (error) {
            await client.query('ROLLBACK');
            logger_1.logger.error('Failed to store data points', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Upserts a single data point - if it exists, update it, otherwise insert
     */
    async upsertDataPoint(client, dataPoint) {
        const query = `
      INSERT INTO solar_data (
        period_end, period, air_temp, dni, ghi, 
        relative_humidity, surface_pressure, wind_speed_10m, 
        pv_power_rooftop_w, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (period_end) 
      DO UPDATE SET 
        period = $2,
        air_temp = $3,
        dni = $4,
        ghi = $5,
        relative_humidity = $6,
        surface_pressure = $7,
        wind_speed_10m = $8,
        pv_power_rooftop_w = $9,
        created_at = $10
    `;
        const values = [
            dataPoint.period_end,
            dataPoint.period,
            dataPoint.air_temp,
            dataPoint.dni,
            dataPoint.ghi,
            dataPoint.relative_humidity,
            dataPoint.surface_pressure,
            dataPoint.wind_speed_10m,
            dataPoint.pv_power_rooftop_w,
            dataPoint.created_at
        ];
        await client.query(query, values);
    }
    /**
     * Retrieve recent data points from the database
     */
    async getRecentData(limit = 48) {
        await this.initializePool();
        if (!this.pool)
            throw new Error('Database pool not initialized');
        const query = `
      SELECT * FROM solar_data
      ORDER BY period_end DESC
      LIMIT $1
    `;
        const result = await this.pool.query(query, [limit]);
        return result.rows;
    }
    /**
     * Cleanup connection pool on shutdown
     */
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGItc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9kYi1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUE2QjtBQUM3QiwyQkFBc0M7QUFFdEMsNENBQXlDO0FBQ3pDLHNDQUFxRDtBQUVyRCxNQUFhLGVBQWU7SUFHMUI7UUFGUSxTQUFJLEdBQWdCLElBQUksQ0FBQztRQUcvQixzREFBc0Q7SUFDeEQsQ0FBQztJQUVEOztPQUVHO0lBQ0ssS0FBSyxDQUFDLGNBQWM7UUFDMUIsSUFBSSxJQUFJLENBQUMsSUFBSTtZQUFFLE9BQU8sQ0FBQyxzQkFBc0I7UUFFN0Msc0VBQXNFO1FBQ3RFLE1BQU0sSUFBQSx5QkFBZ0IsR0FBRSxDQUFDO1FBRXpCLGVBQU0sQ0FBQyxJQUFJLENBQUMsdUNBQXVDLEVBQUU7WUFDbkQsSUFBSSxFQUFFLGVBQU0sQ0FBQyxNQUFNO1lBQ25CLElBQUksRUFBRSxlQUFNLENBQUMsTUFBTTtZQUNuQixRQUFRLEVBQUUsZUFBTSxDQUFDLE1BQU07WUFDdkIsSUFBSSxFQUFFLGVBQU0sQ0FBQyxNQUFNO1lBQ25CLEdBQUcsRUFBRSxlQUFNLENBQUMsWUFBWTtTQUN6QixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksU0FBSSxDQUFDO1lBQ25CLElBQUksRUFBRSxlQUFNLENBQUMsTUFBTTtZQUNuQixJQUFJLEVBQUUsZUFBTSxDQUFDLE1BQU07WUFDbkIsUUFBUSxFQUFFLGVBQU0sQ0FBQyxNQUFNO1lBQ3ZCLElBQUksRUFBRSxlQUFNLENBQUMsTUFBTTtZQUNuQixRQUFRLEVBQUUsZUFBTSxDQUFDLFVBQVU7WUFDM0IsR0FBRyxFQUFFLGVBQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixrQkFBa0IsRUFBRSxLQUFLO2FBQzFCLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDVCxHQUFHLEVBQUUsRUFBRSxFQUFFLG9D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QixDQUFDO0lBQzVDLENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUssQ0FBQyxLQUFLO1FBQ2hCLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2QsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ25CLENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUFqTUQsMENBaU1DIiwic291cmNlc0NvbnRlbnQiOlsiLy8gc3JjL3NlcnZpY2VzL2RiLXNlcnZpY2UudHNcclxuaW1wb3J0IHsgUG9vbCwgUG9vbENsaWVudCB9IGZyb20gJ3BnJztcclxuaW1wb3J0IHsgQ29tYmluZWREYXRhUG9pbnQgfSBmcm9tICcuLi9tb2RlbHMvY29tYmluZWQtZGF0YSc7XHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XHJcbmltcG9ydCB7IGNvbmZpZywgaW5pdGlhbGl6ZUNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZyc7XHJcblxyXG5leHBvcnQgY2xhc3MgRGF0YWJhc2VTZXJ2aWNlIHtcclxuICBwcml2YXRlIHBvb2w6IFBvb2wgfCBudWxsID0gbnVsbDtcclxuICBcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIC8vIFdlJ2xsIGluaXRpYWxpemUgdGhlIHBvb2wgYWZ0ZXIgZ2V0dGluZyBjcmVkZW50aWFsc1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZSB0aGUgZGF0YWJhc2UgY29ubmVjdGlvbiBwb29sIHdpdGggY3JlZGVudGlhbHNcclxuICAgKi9cclxuICBwcml2YXRlIGFzeW5jIGluaXRpYWxpemVQb29sKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYgKHRoaXMucG9vbCkgcmV0dXJuOyAvLyBBbHJlYWR5IGluaXRpYWxpemVkXHJcbiAgICBcclxuICAgIC8vIEluaXRpYWxpemUgY29uZmlnIHRvIGdldCBjcmVkZW50aWFscyBmcm9tIFNlY3JldHMgTWFuYWdlciBpZiBuZWVkZWRcclxuICAgIGF3YWl0IGluaXRpYWxpemVDb25maWcoKTtcclxuICAgIFxyXG4gICAgbG9nZ2VyLmluZm8oJ0luaXRpYWxpemluZyBkYXRhYmFzZSBjb25uZWN0aW9uIHBvb2wnLCB7XHJcbiAgICAgIGhvc3Q6IGNvbmZpZy5kYkhvc3QsXHJcbiAgICAgIHBvcnQ6IGNvbmZpZy5kYlBvcnQsXHJcbiAgICAgIGRhdGFiYXNlOiBjb25maWcuZGJOYW1lLFxyXG4gICAgICB1c2VyOiBjb25maWcuZGJVc2VyLFxyXG4gICAgICBzc2w6IGNvbmZpZy5kYlNzbEVuYWJsZWRcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICB0aGlzLnBvb2wgPSBuZXcgUG9vbCh7XHJcbiAgICAgIGhvc3Q6IGNvbmZpZy5kYkhvc3QsXHJcbiAgICAgIHBvcnQ6IGNvbmZpZy5kYlBvcnQsXHJcbiAgICAgIGRhdGFiYXNlOiBjb25maWcuZGJOYW1lLFxyXG4gICAgICB1c2VyOiBjb25maWcuZGJVc2VyLFxyXG4gICAgICBwYXNzd29yZDogY29uZmlnLmRiUGFzc3dvcmQsXHJcbiAgICAgIHNzbDogY29uZmlnLmRiU3NsRW5hYmxlZCA/IHtcclxuICAgICAgICByZWplY3RVbmF1dGhvcml6ZWQ6IGZhbHNlXHJcbiAgICAgIH0gOiBmYWxzZSxcclxuICAgICAgbWF4OiAyMCwgLy8gTWF4IG51bWJlciBvZiBjbGllbnRzIGluIHRoZSBwb29sXHJcbiAgICAgIGlkbGVUaW1lb3V0TWlsbGlzOiAzMDAwMFxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHRoaXMucG9vbC5vbignZXJyb3InLCAoZXJyKSA9PiB7XHJcbiAgICAgIGxvZ2dlci5lcnJvcignVW5leHBlY3RlZCBlcnJvciBvbiBpZGxlIGNsaWVudCcsIGVycik7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gVGVzdCB0aGUgY29ubmVjdGlvblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgdGhpcy5wb29sLmNvbm5lY3QoKTtcclxuICAgICAgbG9nZ2VyLmluZm8oJ1N1Y2Nlc3NmdWxseSBjb25uZWN0ZWQgdG8gZGF0YWJhc2UnKTtcclxuICAgICAgY2xpZW50LnJlbGVhc2UoKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIGNvbm5lY3QgdG8gZGF0YWJhc2UnLCBlcnJvcik7XHJcbiAgICAgIHRocm93IGVycm9yO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBJbml0aWFsaXplcyB0aGUgZGF0YWJhc2Ugc2NoZW1hIGlmIGl0IGRvZXNuJ3QgZXhpc3RcclxuICAgKi9cclxuICBwdWJsaWMgYXN5bmMgaW5pdGlhbGl6ZURhdGFiYXNlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgYXdhaXQgdGhpcy5pbml0aWFsaXplUG9vbCgpO1xyXG4gICAgaWYgKCF0aGlzLnBvb2wpIHRocm93IG5ldyBFcnJvcignRGF0YWJhc2UgcG9vbCBub3QgaW5pdGlhbGl6ZWQnKTtcclxuICAgIFxyXG4gICAgY29uc3QgY2xpZW50ID0gYXdhaXQgdGhpcy5wb29sLmNvbm5lY3QoKTtcclxuICAgIFxyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KCdCRUdJTicpO1xyXG4gICAgICBcclxuICAgICAgLy8gQ3JlYXRlIHRoZSB0YWJsZSBpZiBpdCBkb2Vzbid0IGV4aXN0XHJcbiAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShgXHJcbiAgICAgICAgQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgc29sYXJfZGF0YSAoXHJcbiAgICAgICAgICBpZCBTRVJJQUwgUFJJTUFSWSBLRVksXHJcbiAgICAgICAgICBwZXJpb2RfZW5kIFRJTUVTVEFNUCBOT1QgTlVMTCxcclxuICAgICAgICAgIHBlcmlvZCBWQVJDSEFSKDIwKSBOT1QgTlVMTCxcclxuICAgICAgICAgIGFpcl90ZW1wIEZMT0FULFxyXG4gICAgICAgICAgZG5pIEZMT0FULFxyXG4gICAgICAgICAgZ2hpIEZMT0FULFxyXG4gICAgICAgICAgcmVsYXRpdmVfaHVtaWRpdHkgRkxPQVQsXHJcbiAgICAgICAgICBzdXJmYWNlX3ByZXNzdXJlIEZMT0FULFxyXG4gICAgICAgICAgd2luZF9zcGVlZF8xMG0gRkxPQVQsXHJcbiAgICAgICAgICBwdl9wb3dlcl9yb29mdG9wX3cgRkxPQVQsXHJcbiAgICAgICAgICBjcmVhdGVkX2F0IFRJTUVTVEFNUCBOT1QgTlVMTCBERUZBVUxUIE5PVygpLFxyXG4gICAgICAgICAgVU5JUVVFKHBlcmlvZF9lbmQpXHJcbiAgICAgICAgKTtcclxuICAgICAgICBcclxuICAgICAgICBDUkVBVEUgSU5ERVggSUYgTk9UIEVYSVNUUyBpZHhfc29sYXJfZGF0YV9wZXJpb2RfZW5kIE9OIHNvbGFyX2RhdGEocGVyaW9kX2VuZCk7XHJcbiAgICAgIGApO1xyXG4gICAgICBcclxuICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KCdDT01NSVQnKTtcclxuICAgICAgbG9nZ2VyLmluZm8oJ0RhdGFiYXNlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseScpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KCdST0xMQkFDSycpO1xyXG4gICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBpbml0aWFsaXplIGRhdGFiYXNlJywgZXJyb3IpO1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIGNsaWVudC5yZWxlYXNlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIFN0b3JlcyBtdWx0aXBsZSBkYXRhIHBvaW50cyBpbiB0aGUgZGF0YWJhc2Ugd2l0aCB1cHNlcnQgbG9naWNcclxuICAgKi9cclxuICBwdWJsaWMgYXN5bmMgc3RvcmVEYXRhKGRhdGFQb2ludHM6IENvbWJpbmVkRGF0YVBvaW50W10pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICghZGF0YVBvaW50cyB8fCBkYXRhUG9pbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBsb2dnZXIud2FybignTm8gZGF0YSBwb2ludHMgdG8gc3RvcmUnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBhd2FpdCB0aGlzLmluaXRpYWxpemVQb29sKCk7XHJcbiAgICBpZiAoIXRoaXMucG9vbCkgdGhyb3cgbmV3IEVycm9yKCdEYXRhYmFzZSBwb29sIG5vdCBpbml0aWFsaXplZCcpO1xyXG4gICAgXHJcbiAgICBjb25zdCBjbGllbnQgPSBhd2FpdCB0aGlzLnBvb2wuY29ubmVjdCgpO1xyXG4gICAgXHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBjbGllbnQucXVlcnkoJ0JFR0lOJyk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBVc2UgYSBiYXRjaCBpbnNlcnQgd2l0aCBPTiBDT05GTElDVCBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXHJcbiAgICAgIGZvciAoY29uc3QgZGF0YVBvaW50IG9mIGRhdGFQb2ludHMpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLnVwc2VydERhdGFQb2ludChjbGllbnQsIGRhdGFQb2ludCk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGF3YWl0IGNsaWVudC5xdWVyeSgnQ09NTUlUJyk7XHJcbiAgICAgIGxvZ2dlci5pbmZvKGBTdWNjZXNzZnVsbHkgc3RvcmVkICR7ZGF0YVBvaW50cy5sZW5ndGh9IGRhdGEgcG9pbnRzYCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBhd2FpdCBjbGllbnQucXVlcnkoJ1JPTExCQUNLJyk7XHJcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIHN0b3JlIGRhdGEgcG9pbnRzJywgZXJyb3IpO1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIGNsaWVudC5yZWxlYXNlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIFVwc2VydHMgYSBzaW5nbGUgZGF0YSBwb2ludCAtIGlmIGl0IGV4aXN0cywgdXBkYXRlIGl0LCBvdGhlcndpc2UgaW5zZXJ0XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhc3luYyB1cHNlcnREYXRhUG9pbnQoY2xpZW50OiBQb29sQ2xpZW50LCBkYXRhUG9pbnQ6IENvbWJpbmVkRGF0YVBvaW50KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBxdWVyeSA9IGBcclxuICAgICAgSU5TRVJUIElOVE8gc29sYXJfZGF0YSAoXHJcbiAgICAgICAgcGVyaW9kX2VuZCwgcGVyaW9kLCBhaXJfdGVtcCwgZG5pLCBnaGksIFxyXG4gICAgICAgIHJlbGF0aXZlX2h1bWlkaXR5LCBzdXJmYWNlX3ByZXNzdXJlLCB3aW5kX3NwZWVkXzEwbSwgXHJcbiAgICAgICAgcHZfcG93ZXJfcm9vZnRvcF93LCBjcmVhdGVkX2F0XHJcbiAgICAgICkgVkFMVUVTICgkMSwgJDIsICQzLCAkNCwgJDUsICQ2LCAkNywgJDgsICQ5LCAkMTApXHJcbiAgICAgIE9OIENPTkZMSUNUIChwZXJpb2RfZW5kKSBcclxuICAgICAgRE8gVVBEQVRFIFNFVCBcclxuICAgICAgICBwZXJpb2QgPSAkMixcclxuICAgICAgICBhaXJfdGVtcCA9ICQzLFxyXG4gICAgICAgIGRuaSA9ICQ0LFxyXG4gICAgICAgIGdoaSA9ICQ1LFxyXG4gICAgICAgIHJlbGF0aXZlX2h1bWlkaXR5ID0gJDYsXHJcbiAgICAgICAgc3VyZmFjZV9wcmVzc3VyZSA9ICQ3LFxyXG4gICAgICAgIHdpbmRfc3BlZWRfMTBtID0gJDgsXHJcbiAgICAgICAgcHZfcG93ZXJfcm9vZnRvcF93ID0gJDksXHJcbiAgICAgICAgY3JlYXRlZF9hdCA9ICQxMFxyXG4gICAgYDtcclxuICAgIFxyXG4gICAgY29uc3QgdmFsdWVzID0gW1xyXG4gICAgICBkYXRhUG9pbnQucGVyaW9kX2VuZCxcclxuICAgICAgZGF0YVBvaW50LnBlcmlvZCxcclxuICAgICAgZGF0YVBvaW50LmFpcl90ZW1wLFxyXG4gICAgICBkYXRhUG9pbnQuZG5pLFxyXG4gICAgICBkYXRhUG9pbnQuZ2hpLFxyXG4gICAgICBkYXRhUG9pbnQucmVsYXRpdmVfaHVtaWRpdHksXHJcbiAgICAgIGRhdGFQb2ludC5zdXJmYWNlX3ByZXNzdXJlLFxyXG4gICAgICBkYXRhUG9pbnQud2luZF9zcGVlZF8xMG0sXHJcbiAgICAgIGRhdGFQb2ludC5wdl9wb3dlcl9yb29mdG9wX3csXHJcbiAgICAgIGRhdGFQb2ludC5jcmVhdGVkX2F0XHJcbiAgICBdO1xyXG4gICAgXHJcbiAgICBhd2FpdCBjbGllbnQucXVlcnkocXVlcnksIHZhbHVlcyk7XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlIHJlY2VudCBkYXRhIHBvaW50cyBmcm9tIHRoZSBkYXRhYmFzZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBhc3luYyBnZXRSZWNlbnREYXRhKGxpbWl0OiBudW1iZXIgPSA0OCk6IFByb21pc2U8Q29tYmluZWREYXRhUG9pbnRbXT4ge1xyXG4gICAgYXdhaXQgdGhpcy5pbml0aWFsaXplUG9vbCgpO1xyXG4gICAgaWYgKCF0aGlzLnBvb2wpIHRocm93IG5ldyBFcnJvcignRGF0YWJhc2UgcG9vbCBub3QgaW5pdGlhbGl6ZWQnKTtcclxuICAgIFxyXG4gICAgY29uc3QgcXVlcnkgPSBgXHJcbiAgICAgIFNFTEVDVCAqIEZST00gc29sYXJfZGF0YVxyXG4gICAgICBPUkRFUiBCWSBwZXJpb2RfZW5kIERFU0NcclxuICAgICAgTElNSVQgJDFcclxuICAgIGA7XHJcbiAgICBcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucG9vbC5xdWVyeShxdWVyeSwgW2xpbWl0XSk7XHJcbiAgICByZXR1cm4gcmVzdWx0LnJvd3MgYXMgQ29tYmluZWREYXRhUG9pbnRbXTtcclxuICB9XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogQ2xlYW51cCBjb25uZWN0aW9uIHBvb2wgb24gc2h1dGRvd25cclxuICAgKi9cclxuICBwdWJsaWMgYXN5bmMgY2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAodGhpcy5wb29sKSB7XHJcbiAgICAgIGF3YWl0IHRoaXMucG9vbC5lbmQoKTtcclxuICAgICAgdGhpcy5wb29sID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcbn0iXX0=