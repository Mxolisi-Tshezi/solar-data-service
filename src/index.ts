import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, ScheduledEvent } from 'aws-lambda';
import { SolcastService } from './services/solcast-service';
import { DatabaseService } from './services/db-service';
import { logger } from './utils/logger';
import { initializeConfig } from './config';

/**
 * Lambda handler for scheduled events (cron jobs)
 */
export const scheduledHandler = async (event: ScheduledEvent, context: Context): Promise<void> => {
    logger.info('Starting scheduled data collection', { event });

    // Initialize configuration (loads credentials from Secrets Manager if needed)
    await initializeConfig();

    const solcastService = new SolcastService();
    const dbService = new DatabaseService();

    try {
        // Initialize database schema if needed
        await dbService.initializeDatabase();

        // Fetch data from Solcast API
        const data = await solcastService.fetchSolcastData();
        logger.info(`Fetched ${data.length} data points from Solcast API`);

        // Store data in PostgreSQL
        await dbService.storeData(data);

        logger.info('Scheduled data collection completed successfully');
    } catch (error) {
        logger.error('Error in scheduled data collection', error);
        throw error;
    } finally {
        await dbService.close();
    }
};

/**
 * Lambda handler for API Gateway HTTP API events
 * This provides an endpoint to trigger collection manually and retrieve data
 */
export const apiHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    logger.info('Received API request', { path: event.path, method: event.httpMethod });

    // Initialize configuration (loads credentials from Secrets Manager if needed)
    await initializeConfig();

    const solcastService = new SolcastService();
    const dbService = new DatabaseService();

    try {
        // Initialize database schema if needed
        await dbService.initializeDatabase();

        if (event.path === '/collect' && event.httpMethod === 'POST') {
            // Manually trigger data collection
            const data = await solcastService.fetchSolcastData();
            await dbService.storeData(data);

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Data collection successful',
                    count: data.length
                })
            };
        } else if (event.path === '/data' && event.httpMethod === 'GET') {
            // Retrieve recent data
            const limit = event.queryStringParameters?.limit
                ? parseInt(event.queryStringParameters.limit, 10)
                : 48;

            const data = await dbService.getRecentData(limit);

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    count: data.length,
                    data
                })
            };
        } else {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Not Found'
                })
            };
        }
    } catch (error) {
        logger.error('Error handling API request', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Internal Server Error',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    } finally {
        await dbService.close();
    }
};

// Default handler - acts as a router
export const handler = async (event: any, context: Context): Promise<any> => {
    // Check if the event is a scheduled event
    if (event.source === 'aws.events') {
        return scheduledHandler(event, context);
    }

    // Otherwise, treat it as an API Gateway event
    return apiHandler(event, context);
};