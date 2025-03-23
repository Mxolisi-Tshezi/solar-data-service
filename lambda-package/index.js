"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.apiHandler = exports.scheduledHandler = void 0;
const solcast_service_1 = require("./services/solcast-service");
const db_service_1 = require("./services/db-service");
const logger_1 = require("./utils/logger");
const config_1 = require("./config");
/**
 * Lambda handler for scheduled events (cron jobs)
 */
const scheduledHandler = async (event, context) => {
    logger_1.logger.info('Starting scheduled data collection', { event });
    // Initialize configuration (loads credentials from Secrets Manager if needed)
    await (0, config_1.initializeConfig)();
    const solcastService = new solcast_service_1.SolcastService();
    const dbService = new db_service_1.DatabaseService();
    try {
        // Initialize database schema if needed
        await dbService.initializeDatabase();
        // Fetch data from Solcast API
        const data = await solcastService.fetchSolcastData();
        logger_1.logger.info(`Fetched ${data.length} data points from Solcast API`);
        // Store data in PostgreSQL
        await dbService.storeData(data);
        logger_1.logger.info('Scheduled data collection completed successfully');
    }
    catch (error) {
        logger_1.logger.error('Error in scheduled data collection', error);
        throw error;
    }
    finally {
        await dbService.close();
    }
};
exports.scheduledHandler = scheduledHandler;
/**
 * Lambda handler for API Gateway HTTP API events
 * This provides an endpoint to trigger collection manually and retrieve data
 */
const apiHandler = async (event, context) => {
    logger_1.logger.info('Received API request', { path: event.path, method: event.httpMethod });
    // Initialize configuration (loads credentials from Secrets Manager if needed)
    await (0, config_1.initializeConfig)();
    const solcastService = new solcast_service_1.SolcastService();
    const dbService = new db_service_1.DatabaseService();
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
        }
        else if (event.path === '/data' && event.httpMethod === 'GET') {
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
        }
        else {
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
    }
    catch (error) {
        logger_1.logger.error('Error handling API request', error);
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
    }
    finally {
        await dbService.close();
    }
};
exports.apiHandler = apiHandler;
// Default handler - acts as a router
const handler = async (event, context) => {
    // Check if the event is a scheduled event
    if (event.source === 'aws.events') {
        return (0, exports.scheduledHandler)(event, context);
    }
    // Otherwise, treat it as an API Gateway event
    return (0, exports.apiHandler)(event, context);
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsZ0VBQTREO0FBQzVELHNEQUF3RDtBQUN4RCwyQ0FBd0M7QUFDeEMscUNBQTRDO0FBRTVDOztHQUVHO0FBQ0ksTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsS0FBcUIsRUFBRSxPQUFnQixFQUFpQixFQUFFO0lBQzdGLGVBQU0sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBRTdELDhFQUE4RTtJQUM5RSxNQUFNLElBQUEseUJBQWdCLEdBQUUsQ0FBQztJQUV6QixNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLEVBQUUsQ0FBQztJQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLDRCQUFlLEVBQUUsQ0FBQztJQUV4QyxJQUFJLENBQUM7UUFDRCx1Q0FBdUM7UUFDdkMsTUFBTSxTQUFTLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUVyQyw4QkFBOEI7UUFDOUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNyRCxlQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLE1BQU0sK0JBQStCLENBQUMsQ0FBQztRQUVuRSwyQkFBMkI7UUFDM0IsTUFBTSxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhDLGVBQU0sQ0FBQyxJQUFJLENBQUMsa0RBQWtELENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNiLGVBQU0sQ0FBQyxLQUFLLENBQUMsb0NBQW9DLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDMUQsTUFBTSxLQUFLLENBQUM7SUFDaEIsQ0FBQztZQUFTLENBQUM7UUFDUCxNQUFNLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM1QixDQUFDO0FBQ0wsQ0FB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QUFDO1FBQ1AsTUFBTSxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDNUIsQ0FBQztBQUNMLENBQUMsQ0FBQztBQXpFVyxRQUFBLFVBQVUsY0F5RXJCO0FBRUYscUNBQXFDO0FBQzlCLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxLQUFVLEVBQUUsT0FBZ0IsRUFBZ0IsRUFBRTtJQUN4RSwwQ0FBMEM7SUFDMUMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLFlBQVksRUFBRSxDQUFDO1FBQ2hDLE9BQU8sSUFBQSx3QkFBZ0IsRUFBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELDhDQUE4QztJQUM5QyxPQUFPLElBQUEsa0JBQVUsRUFBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDdEMsQ0FBQyxDQUFDO0FBUlcsUUFBQSxPQUFPLFdBUWxCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCwgQ29udGV4dCwgU2NoZWR1bGVkRXZlbnQgfSBmcm9tICdhd3MtbGFtYmRhJztcclxuaW1wb3J0IHsgU29sY2FzdFNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL3NvbGNhc3Qtc2VydmljZSc7XHJcbmltcG9ydCB7IERhdGFiYXNlU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvZGItc2VydmljZSc7XHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vdXRpbHMvbG9nZ2VyJztcclxuaW1wb3J0IHsgaW5pdGlhbGl6ZUNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcclxuXHJcbi8qKlxyXG4gKiBMYW1iZGEgaGFuZGxlciBmb3Igc2NoZWR1bGVkIGV2ZW50cyAoY3JvbiBqb2JzKVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNjaGVkdWxlZEhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IFNjaGVkdWxlZEV2ZW50LCBjb250ZXh0OiBDb250ZXh0KTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgICBsb2dnZXIuaW5mbygnU3RhcnRpbmcgc2NoZWR1bGVkIGRhdGEgY29sbGVjdGlvbicsIHsgZXZlbnQgfSk7XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSBjb25maWd1cmF0aW9uIChsb2FkcyBjcmVkZW50aWFscyBmcm9tIFNlY3JldHMgTWFuYWdlciBpZiBuZWVkZWQpXHJcbiAgICBhd2FpdCBpbml0aWFsaXplQ29uZmlnKCk7XHJcblxyXG4gICAgY29uc3Qgc29sY2FzdFNlcnZpY2UgPSBuZXcgU29sY2FzdFNlcnZpY2UoKTtcclxuICAgIGNvbnN0IGRiU2VydmljZSA9IG5ldyBEYXRhYmFzZVNlcnZpY2UoKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIEluaXRpYWxpemUgZGF0YWJhc2Ugc2NoZW1hIGlmIG5lZWRlZFxyXG4gICAgICAgIGF3YWl0IGRiU2VydmljZS5pbml0aWFsaXplRGF0YWJhc2UoKTtcclxuXHJcbiAgICAgICAgLy8gRmV0Y2ggZGF0YSBmcm9tIFNvbGNhc3QgQVBJXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHNvbGNhc3RTZXJ2aWNlLmZldGNoU29sY2FzdERhdGEoKTtcclxuICAgICAgICBsb2dnZXIuaW5mbyhgRmV0Y2hlZCAke2RhdGEubGVuZ3RofSBkYXRhIHBvaW50cyBmcm9tIFNvbGNhc3QgQVBJYCk7XHJcblxyXG4gICAgICAgIC8vIFN0b3JlIGRhdGEgaW4gUG9zdGdyZVNRTFxyXG4gICAgICAgIGF3YWl0IGRiU2VydmljZS5zdG9yZURhdGEoZGF0YSk7XHJcblxyXG4gICAgICAgIGxvZ2dlci5pbmZvKCdTY2hlZHVsZWQgZGF0YSBjb2xsZWN0aW9uIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHknKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBpbiBzY2hlZHVsZWQgZGF0YSBjb2xsZWN0aW9uJywgZXJyb3IpO1xyXG4gICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgICBhd2FpdCBkYlNlcnZpY2UuY2xvc2UoKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBMYW1iZGEgaGFuZGxlciBmb3IgQVBJIEdhdGV3YXkgSFRUUCBBUEkgZXZlbnRzXHJcbiAqIFRoaXMgcHJvdmlkZXMgYW4gZW5kcG9pbnQgdG8gdHJpZ2dlciBjb2xsZWN0aW9uIG1hbnVhbGx5IGFuZCByZXRyaWV2ZSBkYXRhXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgYXBpSGFuZGxlciA9IGFzeW5jIChldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnQsIGNvbnRleHQ6IENvbnRleHQpOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xyXG4gICAgbG9nZ2VyLmluZm8oJ1JlY2VpdmVkIEFQSSByZXF1ZXN0JywgeyBwYXRoOiBldmVudC5wYXRoLCBtZXRob2Q6IGV2ZW50Lmh0dHBNZXRob2QgfSk7XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSBjb25maWd1cmF0aW9uIChsb2FkcyBjcmVkZW50aWFscyBmcm9tIFNlY3JldHMgTWFuYWdlciBpZiBuZWVkZWQpXHJcbiAgICBhd2FpdCBpbml0aWFsaXplQ29uZmlnKCk7XHJcblxyXG4gICAgY29uc3Qgc29sY2FzdFNlcnZpY2UgPSBuZXcgU29sY2FzdFNlcnZpY2UoKTtcclxuICAgIGNvbnN0IGRiU2VydmljZSA9IG5ldyBEYXRhYmFzZVNlcnZpY2UoKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIEluaXRpYWxpemUgZGF0YWJhc2Ugc2NoZW1hIGlmIG5lZWRlZFxyXG4gICAgICAgIGF3YWl0IGRiU2VydmljZS5pbml0aWFsaXplRGF0YWJhc2UoKTtcclxuXHJcbiAgICAgICAgaWYgKGV2ZW50LnBhdGggPT09ICcvY29sbGVjdCcgJiYgZXZlbnQuaHR0cE1ldGhvZCA9PT0gJ1BPU1QnKSB7XHJcbiAgICAgICAgICAgIC8vIE1hbnVhbGx5IHRyaWdnZXIgZGF0YSBjb2xsZWN0aW9uXHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzb2xjYXN0U2VydmljZS5mZXRjaFNvbGNhc3REYXRhKCk7XHJcbiAgICAgICAgICAgIGF3YWl0IGRiU2VydmljZS5zdG9yZURhdGEoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0RhdGEgY29sbGVjdGlvbiBzdWNjZXNzZnVsJyxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogZGF0YS5sZW5ndGhcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5wYXRoID09PSAnL2RhdGEnICYmIGV2ZW50Lmh0dHBNZXRob2QgPT09ICdHRVQnKSB7XHJcbiAgICAgICAgICAgIC8vIFJldHJpZXZlIHJlY2VudCBkYXRhXHJcbiAgICAgICAgICAgIGNvbnN0IGxpbWl0ID0gZXZlbnQucXVlcnlTdHJpbmdQYXJhbWV0ZXJzPy5saW1pdFxyXG4gICAgICAgICAgICAgICAgPyBwYXJzZUludChldmVudC5xdWVyeVN0cmluZ1BhcmFtZXRlcnMubGltaXQsIDEwKVxyXG4gICAgICAgICAgICAgICAgOiA0ODtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBkYlNlcnZpY2UuZ2V0UmVjZW50RGF0YShsaW1pdCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IGRhdGEubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwNCxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdOb3QgRm91bmQnXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciBoYW5kbGluZyBBUEkgcmVxdWVzdCcsIGVycm9yKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdJbnRlcm5hbCBTZXJ2ZXIgRXJyb3InLFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgYXdhaXQgZGJTZXJ2aWNlLmNsb3NlKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vLyBEZWZhdWx0IGhhbmRsZXIgLSBhY3RzIGFzIGEgcm91dGVyXHJcbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBhbnksIGNvbnRleHQ6IENvbnRleHQpOiBQcm9taXNlPGFueT4gPT4ge1xyXG4gICAgLy8gQ2hlY2sgaWYgdGhlIGV2ZW50IGlzIGEgc2NoZWR1bGVkIGV2ZW50XHJcbiAgICBpZiAoZXZlbnQuc291cmNlID09PSAnYXdzLmV2ZW50cycpIHtcclxuICAgICAgICByZXR1cm4gc2NoZWR1bGVkSGFuZGxlcihldmVudCwgY29udGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT3RoZXJ3aXNlLCB0cmVhdCBpdCBhcyBhbiBBUEkgR2F0ZXdheSBldmVudFxyXG4gICAgcmV0dXJuIGFwaUhhbmRsZXIoZXZlbnQsIGNvbnRleHQpO1xyXG59OyJdfQ==