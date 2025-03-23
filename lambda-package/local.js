"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const solcast_service_1 = require("./services/solcast-service");
const db_service_1 = require("./services/db-service");
const logger_1 = require("./utils/logger");
// Load environment variables from .env file
dotenv_1.default.config();
/**
 * Run the data collection process locally
 */
async function runLocalCollection() {
    logger_1.logger.info('Starting local data collection');
    const solcastService = new solcast_service_1.SolcastService();
    const dbService = new db_service_1.DatabaseService();
    try {
        // Initialize database schema
        await dbService.initializeDatabase();
        logger_1.logger.info('Database initialized successfully');
        // Fetch data from Solcast API
        const data = await solcastService.fetchSolcastData();
        logger_1.logger.info(`Fetched ${data.length} data points from Solcast API`);
        // Store data in PostgreSQL
        await dbService.storeData(data);
        logger_1.logger.info('Data stored successfully in the database');
        // Retrieve and display recent data
        const recentData = await dbService.getRecentData(5);
        logger_1.logger.info('Recent data samples:', {
            samples: recentData.map(item => ({
                period_end: item.period_end,
                air_temp: item.air_temp,
                ghi: item.ghi,
                pv_power_w: item.pv_power_rooftop_w
            }))
        });
        logger_1.logger.info('Local data collection completed successfully');
    }
    catch (error) {
        logger_1.logger.error('Error in local data collection', error);
    }
    finally {
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
        logger_1.logger.error('Unhandled error in local collection script', error);
        process.exit(1);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvREFBNEI7QUFDNUIsZ0VBQTREO0FBQzVELHNEQUF3RDtBQUN4RCwyQ0FBd0M7QUFFeEMsNENBQTRDO0FBQzVDLGdCQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFFaEI7O0dBRUc7QUFDSCxLQUFLLFVBQVUsa0JBQWtCO0lBQy9CLGVBQU0sQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztJQUU5QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLEVBQUUsQ0FBQztJQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLDRCQUFlLEVBQUUsQ0FBQztJQUV4QyxJQUFJLENBQUM7UUFDSCw2QkFBNkI7UUFDN0IsTUFBTSxTQUFTLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUNyQyxlQUFNLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7UUFFakQsOEJBQThCO1FBQzlCLE1BQU0sSUFBSSxHQUFHLE1BQU0sY0FBYyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDckQsZUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxNQUFNLCtCQUErQixDQUFDLENBQUM7UUFFbkUsMkJBQTJCO1FBQzNCLE1BQU0sU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxlQUFNLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFFeEQsbUNBQW1DO1FBQ25DLE1BQU0sVUFBVSxHQUFHLE1BQU0sU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRCxlQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFO1lBQ2xDLE9BQU8sRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDL0IsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUMzQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZCLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztnQkFDYixVQUFVLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjthQUNwQyxDQUFDLENBQUM7U0FDSixDQUFDLENBQUM7UUFFSCxlQUFNLENBQUMsSUFBSSxDQUFDLDhDQUE4QyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixlQUFNLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3hELENBQUM7WUFBUyxDQUFDO1FBQ1QsTUFBTSxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDMUIsQ0FBQztBQUNILENBQUM7QUFFRCxtREFBbUQ7QUFDbkQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO0lBQzVCLGtCQUFrQixFQUFFO1NBQ2pCLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDVCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUMsQ0FBQztTQUNELEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1FBQ2YsZUFBTSxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkb3RlbnYgZnJvbSAnZG90ZW52JztcclxuaW1wb3J0IHsgU29sY2FzdFNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL3NvbGNhc3Qtc2VydmljZSc7XHJcbmltcG9ydCB7IERhdGFiYXNlU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMvZGItc2VydmljZSc7XHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vdXRpbHMvbG9nZ2VyJztcclxuXHJcbi8vIExvYWQgZW52aXJvbm1lbnQgdmFyaWFibGVzIGZyb20gLmVudiBmaWxlXHJcbmRvdGVudi5jb25maWcoKTtcclxuXHJcbi8qKlxyXG4gKiBSdW4gdGhlIGRhdGEgY29sbGVjdGlvbiBwcm9jZXNzIGxvY2FsbHlcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHJ1bkxvY2FsQ29sbGVjdGlvbigpIHtcclxuICBsb2dnZXIuaW5mbygnU3RhcnRpbmcgbG9jYWwgZGF0YSBjb2xsZWN0aW9uJyk7XHJcbiAgXHJcbiAgY29uc3Qgc29sY2FzdFNlcnZpY2UgPSBuZXcgU29sY2FzdFNlcnZpY2UoKTtcclxuICBjb25zdCBkYlNlcnZpY2UgPSBuZXcgRGF0YWJhc2VTZXJ2aWNlKCk7XHJcbiAgXHJcbiAgdHJ5IHtcclxuICAgIC8vIEluaXRpYWxpemUgZGF0YWJhc2Ugc2NoZW1hXHJcbiAgICBhd2FpdCBkYlNlcnZpY2UuaW5pdGlhbGl6ZURhdGFiYXNlKCk7XHJcbiAgICBsb2dnZXIuaW5mbygnRGF0YWJhc2UgaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5Jyk7XHJcbiAgICBcclxuICAgIC8vIEZldGNoIGRhdGEgZnJvbSBTb2xjYXN0IEFQSVxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHNvbGNhc3RTZXJ2aWNlLmZldGNoU29sY2FzdERhdGEoKTtcclxuICAgIGxvZ2dlci5pbmZvKGBGZXRjaGVkICR7ZGF0YS5sZW5ndGh9IGRhdGEgcG9pbnRzIGZyb20gU29sY2FzdCBBUElgKTtcclxuICAgIFxyXG4gICAgLy8gU3RvcmUgZGF0YSBpbiBQb3N0Z3JlU1FMXHJcbiAgICBhd2FpdCBkYlNlcnZpY2Uuc3RvcmVEYXRhKGRhdGEpO1xyXG4gICAgbG9nZ2VyLmluZm8oJ0RhdGEgc3RvcmVkIHN1Y2Nlc3NmdWxseSBpbiB0aGUgZGF0YWJhc2UnKTtcclxuICAgIFxyXG4gICAgLy8gUmV0cmlldmUgYW5kIGRpc3BsYXkgcmVjZW50IGRhdGFcclxuICAgIGNvbnN0IHJlY2VudERhdGEgPSBhd2FpdCBkYlNlcnZpY2UuZ2V0UmVjZW50RGF0YSg1KTtcclxuICAgIGxvZ2dlci5pbmZvKCdSZWNlbnQgZGF0YSBzYW1wbGVzOicsIHsgXHJcbiAgICAgIHNhbXBsZXM6IHJlY2VudERhdGEubWFwKGl0ZW0gPT4gKHtcclxuICAgICAgICBwZXJpb2RfZW5kOiBpdGVtLnBlcmlvZF9lbmQsXHJcbiAgICAgICAgYWlyX3RlbXA6IGl0ZW0uYWlyX3RlbXAsXHJcbiAgICAgICAgZ2hpOiBpdGVtLmdoaSxcclxuICAgICAgICBwdl9wb3dlcl93OiBpdGVtLnB2X3Bvd2VyX3Jvb2Z0b3Bfd1xyXG4gICAgICB9KSlcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBsb2dnZXIuaW5mbygnTG9jYWwgZGF0YSBjb2xsZWN0aW9uIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHknKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgbG9nZ2VyLmVycm9yKCdFcnJvciBpbiBsb2NhbCBkYXRhIGNvbGxlY3Rpb24nLCBlcnJvcik7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGF3YWl0IGRiU2VydmljZS5jbG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gUnVuIHRoZSBzY3JpcHQgaWYgdGhpcyBmaWxlIGlzIGV4ZWN1dGVkIGRpcmVjdGx5XHJcbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xyXG4gIHJ1bkxvY2FsQ29sbGVjdGlvbigpXHJcbiAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgIHByb2Nlc3MuZXhpdCgwKTtcclxuICAgIH0pXHJcbiAgICAuY2F0Y2goKGVycm9yKSA9PiB7XHJcbiAgICAgIGxvZ2dlci5lcnJvcignVW5oYW5kbGVkIGVycm9yIGluIGxvY2FsIGNvbGxlY3Rpb24gc2NyaXB0JywgZXJyb3IpO1xyXG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XHJcbiAgICB9KTtcclxufSJdfQ==