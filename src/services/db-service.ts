// src/services/db-service.ts
import { Pool, PoolClient } from 'pg';
import { CombinedDataPoint } from '../models/combined-data';
import { logger } from '../utils/logger';
import { config, initializeConfig } from '../config';

export class DatabaseService {
  private pool: Pool | null = null;
  
  constructor() {
    // We'll initialize the pool after getting credentials
  }

  /**
   * Initialize the database connection pool with credentials
   */
  private async initializePool(): Promise<void> {
    if (this.pool) return; // Already initialized
    
    // Initialize config to get credentials from Secrets Manager if needed
    await initializeConfig();
    
    logger.info('Initializing database connection pool', {
      host: config.dbHost,
      port: config.dbPort,
      database: config.dbName,
      user: config.dbUser,
      ssl: config.dbSslEnabled
    });
    
    this.pool = new Pool({
      host: config.dbHost,
      port: config.dbPort,
      database: config.dbName,
      user: config.dbUser,
      password: config.dbPassword,
      ssl: config.dbSslEnabled ? {
        rejectUnauthorized: false
      } : false,
      max: 20, // Max number of clients in the pool
      idleTimeoutMillis: 30000
    });
    
    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });
    
    // Test the connection
    try {
      const client = await this.pool.connect();
      logger.info('Successfully connected to database');
      client.release();
    } catch (error) {
      logger.error('Failed to connect to database', error);
      throw error;
    }
  }
  
  /**
   * Initializes the database schema if it doesn't exist
   */
  public async initializeDatabase(): Promise<void> {
    await this.initializePool();
    if (!this.pool) throw new Error('Database pool not initialized');
    
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
      logger.info('Database initialized successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to initialize database', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Stores multiple data points in the database with upsert logic
   */
  public async storeData(dataPoints: CombinedDataPoint[]): Promise<void> {
    if (!dataPoints || dataPoints.length === 0) {
      logger.warn('No data points to store');
      return;
    }
    
    await this.initializePool();
    if (!this.pool) throw new Error('Database pool not initialized');
    
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Use a batch insert with ON CONFLICT for better performance
      for (const dataPoint of dataPoints) {
        await this.upsertDataPoint(client, dataPoint);
      }
      
      await client.query('COMMIT');
      logger.info(`Successfully stored ${dataPoints.length} data points`);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to store data points', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Upserts a single data point - if it exists, update it, otherwise insert
   */
  private async upsertDataPoint(client: PoolClient, dataPoint: CombinedDataPoint): Promise<void> {
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
  public async getRecentData(limit: number = 48): Promise<CombinedDataPoint[]> {
    await this.initializePool();
    if (!this.pool) throw new Error('Database pool not initialized');
    
    const query = `
      SELECT * FROM solar_data
      ORDER BY period_end DESC
      LIMIT $1
    `;
    
    const result = await this.pool.query(query, [limit]);
    return result.rows as CombinedDataPoint[];
  }
  
  /**
   * Cleanup connection pool on shutdown
   */
  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}