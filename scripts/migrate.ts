// scripts/migrate.ts
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { config } from '../src/config';
import { logger } from '../src/utils/logger';

// Load environment variables from .env file
dotenv.config();

/**
 * Runs database migrations to set up the schema
 */
async function runMigrations() {
  const pool = new Pool({
    host: config.dbHost,
    port: config.dbPort,
    database: config.dbName,
    user: config.dbUser,
    password: config.dbPassword,
    ssl: config.dbSslEnabled ? {
      rejectUnauthorized: false
    } : false
  });
  
  const client = await pool.connect();
  
  try {
    logger.info('Starting database migrations');
    
    await client.query('BEGIN');
    
    // Create tables
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
    
    // Add any additional migrations here
    
    await client.query('COMMIT');
    logger.info('Database migrations completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Failed to run database migrations', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Unhandled error in migration script', error);
      process.exit(1);
    });
}