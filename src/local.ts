import dotenv from 'dotenv';
import { SolcastService } from './services/solcast-service';
import { DatabaseService } from './services/db-service';
import { logger } from './utils/logger';

// Load environment variables from .env file
dotenv.config();

/**
 * Run the data collection process locally
 */
async function runLocalCollection() {
  logger.info('Starting local data collection');
  
  const solcastService = new SolcastService();
  const dbService = new DatabaseService();
  
  try {
    // Initialize database schema
    await dbService.initializeDatabase();
    logger.info('Database initialized successfully');
    
    // Fetch data from Solcast API
    const data = await solcastService.fetchSolcastData();
    logger.info(`Fetched ${data.length} data points from Solcast API`);
    
    // Store data in PostgreSQL
    await dbService.storeData(data);
    logger.info('Data stored successfully in the database');
    
    // Retrieve and display recent data
    const recentData = await dbService.getRecentData(5);
    logger.info('Recent data samples:', { 
      samples: recentData.map(item => ({
        period_end: item.period_end,
        air_temp: item.air_temp,
        ghi: item.ghi,
        pv_power_w: item.pv_power_rooftop_w
      }))
    });
    
    logger.info('Local data collection completed successfully');
  } catch (error) {
    logger.error('Error in local data collection', error);
  } finally {
    await dbService.close();
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  runLocalCollection()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Unhandled error in local collection script', error);
      process.exit(1);
    });
}