"use strict";
// import axios from 'axios';
// import { RadiationWeatherResponse, RadiationWeatherDataPoint } from '../models/radiation-weather';
// import { RooftopPvResponse, RooftopPvDataPoint } from '../models/rooftop-pv';
// import { CombinedDataPoint } from '../models/combined-data';
// import { logger } from '../utils/logger';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolcastService = void 0;
// export class SolcastService {
//   private readonly solcastMockUrl = 'https://script.googleusercontent.com/a/macros/solink.co.za/echo?user_content_key=mMFKILKfN4pCpe_K-ymeLawywPBjs738P70RgRcUkk3iWf3cQJDgTcVTT-m8dvWBQzcntX2H1JIhcoxrCpglmQ1NLI4rTLy3OJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMi80zadyHLKCwq8y9dFH4mJT3zkIp4-K468n4RAo2RJxBnu0Hupo_TOS8jmg-86IFx3v2oWP-ldoU2gapZ-4-Ov1eLHQAMkT2dtcwQHkATq_P8HS5eahm695_B1e7ssetegtgkpBvh1_1BiB1RU8w4TrCMwGvcl2MsD64VxOIfL0&lib=MR_mt8Wmapn2W5zwbI-xTtMWO3py5UuMP';
//   private retryCount = 3;
//   private retryDelay = 1000; // ms
//   /**
//    * Fetches combined data from the mock Solcast API
//    */
//   public async fetchSolcastData(): Promise<CombinedDataPoint[]> {
//     try {
//       const response = await this.fetchWithRetry(this.solcastMockUrl);
//       if (!response || !response.data) {
//         logger.warn('No data returned from Solcast API, using mock data fallback');
//         return this.generateMockData();
//       }
//       // The mock API returns both radiation/weather and PV data
//       const radiationWeatherData = response.data.radiation_weather as RadiationWeatherResponse;
//       const rooftopPvData = response.data.rooftop_pv as RooftopPvResponse;
//       // Check if data has the expected structure
//       if (!radiationWeatherData?.forecasts || !rooftopPvData?.forecasts) {
//         logger.warn('Unexpected API response structure, using mock data fallback', {
//           hasRadiationWeather: !!radiationWeatherData,
//           hasRadiationWeatherForecasts: !!radiationWeatherData?.forecasts,
//           hasRooftopPv: !!rooftopPvData,
//           hasRooftopPvForecasts: !!rooftopPvData?.forecasts
//         });
//         return this.generateMockData();
//       }
//       return this.combineData(radiationWeatherData, rooftopPvData);
//     } catch (error) {
//       logger.error('Error fetching data from Solcast API', error);
//       logger.info('Falling back to mock data');
//       return this.generateMockData();
//     }
//   }
//   /**
//    * Fetches data with retry mechanism
//    */
//   private async fetchWithRetry(url: string, attempt = 0): Promise<any> {
//     try {
//       return await axios.get(url, {
//         timeout: 10000, // 10 second timeout
//         headers: {
//           'Accept': 'application/json'
//         }
//       });
//     } catch (error) {
//       if (attempt < this.retryCount) {
//         logger.warn(`Retry attempt ${attempt + 1} for Solcast API`);
//         await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
//         return this.fetchWithRetry(url, attempt + 1);
//       }
//       throw error;
//     }
//   }
//   /**
//    * Combines radiation/weather data with PV data
//    */
//   private combineData(
//     radiationWeatherData: RadiationWeatherResponse,
//     rooftopPvData: RooftopPvResponse
//   ): CombinedDataPoint[] {
//     const combinedData: CombinedDataPoint[] = [];
//     // Create a map of period_end -> PV data for easy lookup
//     const pvDataMap = new Map<string, RooftopPvDataPoint>();
//     rooftopPvData.forecasts.forEach(item => {
//       pvDataMap.set(item.period_end, item);
//     });
//     // Combine data points that share the same period_end
//     for (const weatherItem of radiationWeatherData.forecasts) {
//       const pvItem = pvDataMap.get(weatherItem.period_end);
//       if (pvItem) {
//         // Convert kW to W (multiply by 1000)
//         const pvPowerWatts = pvItem.pv_power_rooftop * 1000;
//         combinedData.push({
//           period_end: weatherItem.period_end,
//           period: weatherItem.period,
//           air_temp: weatherItem.air_temp,
//           dni: weatherItem.dni,
//           ghi: weatherItem.ghi,
//           relative_humidity: weatherItem.relative_humidity,
//           surface_pressure: weatherItem.surface_pressure,
//           wind_speed_10m: weatherItem.wind_speed_10m,
//           pv_power_rooftop_w: pvPowerWatts,
//           created_at: new Date()
//         });
//       }
//     }
//     return combinedData;
//   }
//   /**
//    * Generates mock solar data for development and testing
//    */
//   private generateMockData(): CombinedDataPoint[] {
//     logger.info('Generating mock solar data');
//     const mockData: CombinedDataPoint[] = [];
//     const now = new Date();
//     // Generate 24 hours of mock data points
//     for (let i = 0; i < 24; i++) {
//       const hour = new Date(now);
//       hour.setHours(hour.getHours() + i);
//       // Create some realistic-looking values
//       // Solar values higher during day (6am-6pm), lower at night
//       const isDay = hour.getHours() >= 6 && hour.getHours() <= 18;
//       const timeOfDay = Math.sin((hour.getHours() - 6) * Math.PI / 12); // 0-1 curve peaking at noon
//       const daytimeFactor = isDay ? Math.max(0, timeOfDay) : 0;
//       mockData.push({
//         period_end: hour.toISOString(),
//         period: 'PT30M',
//         air_temp: 15 + 10 * daytimeFactor, // 15°C at night, up to 25°C during day
//         dni: isDay ? 550 + Math.random() * 200 * daytimeFactor : 0,
//         ghi: isDay ? 400 + Math.random() * 300 * daytimeFactor : 0,
//         relative_humidity: 60 - 20 * daytimeFactor + Math.random() * 10, // Higher at night
//         surface_pressure: 1010 + Math.random() * 10,
//         wind_speed_10m: 2 + Math.random() * 8,
//         pv_power_rooftop_w: isDay ? 2000 * daytimeFactor + Math.random() * 500 : 0,
//         created_at: new Date()
//       });
//     }
//     logger.info(`Generated ${mockData.length} mock data points`);
//     return mockData;
//   }
// }
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
class SolcastService {
    constructor() {
        this.solcastMockUrl = 'https://script.googleusercontent.com/a/macros/solink.co.za/echo?user_content_key=mMFKILKfN4pCpe_K-ymeLawywPBjs738P70RgRcUkk3iWf3cQJDgTcVTT-m8dvWBQzcntX2H1JIhcoxrCpglmQ1NLI4rTLy3OJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMi80zadyHLKCwq8y9dFH4mJT3zkIp4-K468n4RAo2RJxBnu0Hupo_TOS8jmg-86IFx3v2oWP-ldoU2gapZ-4-Ov1eLHQAMkT2dtcwQHkATq_P8HS5eahm695_B1e7ssetegtgkpBvh1_1BiB1RU8w4TrCMwGvcl2MsD64VxOIfL0&lib=MR_mt8Wmapn2W5zwbI-xTtMWO3py5UuMP';
        this.retryCount = 3;
        this.retryDelay = 1000; // ms
    }
    /**
     * Fetches combined data from the mock Solcast API
     */
    async fetchSolcastData() {
        try {
            const response = await this.fetchWithRetry(this.solcastMockUrl);
            if (!response || !response.data) {
                logger_1.logger.warn('No data returned from Solcast API, using mock data fallback');
                return this.generateMockData();
            }
            // First, check if the data matches the Google Sheets format
            if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                logger_1.logger.info(`Processing data from Google Sheets format, found ${response.data.data.length} records`);
                return this.processGoogleSheetsData(response.data.data);
            }
            // Otherwise, try the original format
            const radiationWeatherData = response.data.radiation_weather;
            const rooftopPvData = response.data.rooftop_pv;
            // Check if data has the expected structure
            if (!radiationWeatherData?.forecasts || !rooftopPvData?.forecasts) {
                logger_1.logger.warn('Unexpected API response structure, using mock data fallback', {
                    hasRadiationWeather: !!radiationWeatherData,
                    hasRadiationWeatherForecasts: !!radiationWeatherData?.forecasts,
                    hasRooftopPv: !!rooftopPvData,
                    hasRooftopPvForecasts: !!rooftopPvData?.forecasts
                });
                return this.generateMockData();
            }
            return this.combineData(radiationWeatherData, rooftopPvData);
        }
        catch (error) {
            logger_1.logger.error('Error fetching data from Solcast API', error);
            logger_1.logger.info('Falling back to mock data');
            return this.generateMockData();
        }
    }
    /**
     * Process data from Google Sheets format
     */
    processGoogleSheetsData(data) {
        return data.map(item => ({
            period_end: item.period_end,
            period: 'PT30M', // Assuming 30-minute intervals
            air_temp: item.air_temp || 0,
            dni: item.dni || 0,
            ghi: item.ghi || 0,
            relative_humidity: item.relative_humidity || 0,
            surface_pressure: item.surface_pressure || 0,
            wind_speed_10m: item.wind_speed_10m || 0,
            pv_power_rooftop_w: (item.pv_power_rooftop || 0) * 1000, // Convert kW to W
            created_at: new Date()
        }));
    }
    /**
     * Fetches data with retry mechanism
     */
    async fetchWithRetry(url, attempt = 0) {
        try {
            return await axios_1.default.get(url, {
                timeout: 10000, // 10 second timeout
                headers: {
                    'Accept': 'application/json'
                }
            });
        }
        catch (error) {
            if (attempt < this.retryCount) {
                logger_1.logger.warn(`Retry attempt ${attempt + 1} for Solcast API`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
                return this.fetchWithRetry(url, attempt + 1);
            }
            throw error;
        }
    }
    /**
     * Combines radiation/weather data with PV data
     */
    combineData(radiationWeatherData, rooftopPvData) {
        const combinedData = [];
        // Create a map of period_end -> PV data for easy lookup
        const pvDataMap = new Map();
        rooftopPvData.forecasts.forEach(item => {
            pvDataMap.set(item.period_end, item);
        });
        // Combine data points that share the same period_end
        for (const weatherItem of radiationWeatherData.forecasts) {
            const pvItem = pvDataMap.get(weatherItem.period_end);
            if (pvItem) {
                // Convert kW to W (multiply by 1000)
                const pvPowerWatts = pvItem.pv_power_rooftop * 1000;
                combinedData.push({
                    period_end: weatherItem.period_end,
                    period: weatherItem.period,
                    air_temp: weatherItem.air_temp,
                    dni: weatherItem.dni,
                    ghi: weatherItem.ghi,
                    relative_humidity: weatherItem.relative_humidity,
                    surface_pressure: weatherItem.surface_pressure,
                    wind_speed_10m: weatherItem.wind_speed_10m,
                    pv_power_rooftop_w: pvPowerWatts,
                    created_at: new Date()
                });
            }
        }
        return combinedData;
    }
    /**
     * Generates mock solar data for development and testing
     */
    generateMockData() {
        logger_1.logger.info('Generating mock solar data');
        const mockData = [];
        const now = new Date();
        // Generate 24 hours of mock data points
        for (let i = 0; i < 24; i++) {
            const hour = new Date(now);
            hour.setHours(hour.getHours() + i);
            // Create some realistic-looking values
            // Solar values higher during day (6am-6pm), lower at night
            const isDay = hour.getHours() >= 6 && hour.getHours() <= 18;
            const timeOfDay = Math.sin((hour.getHours() - 6) * Math.PI / 12); // 0-1 curve peaking at noon
            const daytimeFactor = isDay ? Math.max(0, timeOfDay) : 0;
            mockData.push({
                period_end: hour.toISOString(),
                period: 'PT30M',
                air_temp: 15 + 10 * daytimeFactor, // 15°C at night, up to 25°C during day
                dni: isDay ? 550 + Math.random() * 200 * daytimeFactor : 0,
                ghi: isDay ? 400 + Math.random() * 300 * daytimeFactor : 0,
                relative_humidity: 60 - 20 * daytimeFactor + Math.random() * 10, // Higher at night
                surface_pressure: 1010 + Math.random() * 10,
                wind_speed_10m: 2 + Math.random() * 8,
                pv_power_rooftop_w: isDay ? 2000 * daytimeFactor + Math.random() * 500 : 0,
                created_at: new Date()
            });
        }
        logger_1.logger.info(`Generated ${mockData.length} mock data points`);
        return mockData;
    }
}
exports.SolcastService = SolcastService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29sY2FzdC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL3NvbGNhc3Qtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsNkJBQTZCO0FBQzdCLHFHQUFxRztBQUNyRyxnRkFBZ0Y7QUFDaEYsK0RBQStEO0FBQy9ELDRDQUE0Qzs7Ozs7O0FBRTVDLGdDQUFnQztBQUNoQyw0Y0FBNGM7QUFFNWMsNEJBQTRCO0FBQzVCLHFDQUFxQztBQUVyQyxRQUFRO0FBQ1IsdURBQXVEO0FBQ3ZELFFBQVE7QUFDUixvRUFBb0U7QUFDcEUsWUFBWTtBQUNaLHlFQUF5RTtBQUV6RSwyQ0FBMkM7QUFDM0Msc0ZBQXNGO0FBQ3RGLDBDQUEwQztBQUMxQyxVQUFVO0FBRVYsbUVBQW1FO0FBQ25FLGtHQUFrRztBQUNsRyw2RUFBNkU7QUFFN0Usb0RBQW9EO0FBQ3BELDZFQUE2RTtBQUM3RSx1RkFBdUY7QUFDdkYseURBQXlEO0FBQ3pELDZFQUE2RTtBQUM3RSwyQ0FBMkM7QUFDM0MsOERBQThEO0FBQzlELGNBQWM7QUFDZCwwQ0FBMEM7QUFDMUMsVUFBVTtBQUVWLHNFQUFzRTtBQUN0RSx3QkFBd0I7QUFDeEIscUVBQXFFO0FBQ3JFLGtEQUFrRDtBQUNsRCx3Q0FBd0M7QUFDeEMsUUFBUTtBQUNSLE1BQU07QUFFTixRQUFRO0FBQ1IseUNBQXlDO0FBQ3pDLFFBQVE7QUFDUiwyRUFBMkU7QUFDM0UsWUFBWTtBQUNaLHNDQUFzQztBQUN0QywrQ0FBK0M7QUFDL0MscUJBQXFCO0FBQ3JCLHlDQUF5QztBQUN6QyxZQUFZO0FBQ1osWUFBWTtBQUNaLHdCQUF3QjtBQUN4Qix5Q0FBeUM7QUFDekMsdUVBQXVFO0FBQ3ZFLDhGQUE4RjtBQUM5Rix3REFBd0Q7QUFDeEQsVUFBVTtBQUNWLHFCQUFxQjtBQUNyQixRQUFRO0FBQ1IsTUFBTTtBQUVOLFFBQVE7QUFDUixvREFBb0Q7QUFDcEQsUUFBUTtBQUNSLHlCQUF5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QUFFLEdBQUcsYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsa0JBQWtCO2dCQUNuRixnQkFBZ0IsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7Z0JBQzNDLGNBQWMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7Z0JBQ3JDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxRSxVQUFVLEVBQUUsSUFBSSxJQUFJLEVBQUU7YUFDdkIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELGVBQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxRQUFRLENBQUMsTUFBTSxtQkFBbUIsQ0FBQyxDQUFDO1FBQzdELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7Q0FDRjtBQW5LRCx3Q0FtS0MiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xyXG4vLyBpbXBvcnQgeyBSYWRpYXRpb25XZWF0aGVyUmVzcG9uc2UsIFJhZGlhdGlvbldlYXRoZXJEYXRhUG9pbnQgfSBmcm9tICcuLi9tb2RlbHMvcmFkaWF0aW9uLXdlYXRoZXInO1xyXG4vLyBpbXBvcnQgeyBSb29mdG9wUHZSZXNwb25zZSwgUm9vZnRvcFB2RGF0YVBvaW50IH0gZnJvbSAnLi4vbW9kZWxzL3Jvb2Z0b3AtcHYnO1xyXG4vLyBpbXBvcnQgeyBDb21iaW5lZERhdGFQb2ludCB9IGZyb20gJy4uL21vZGVscy9jb21iaW5lZC1kYXRhJztcclxuLy8gaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcclxuXHJcbi8vIGV4cG9ydCBjbGFzcyBTb2xjYXN0U2VydmljZSB7XHJcbi8vICAgcHJpdmF0ZSByZWFkb25seSBzb2xjYXN0TW9ja1VybCA9ICdodHRwczovL3NjcmlwdC5nb29nbGV1c2VyY29udGVudC5jb20vYS9tYWNyb3Mvc29saW5rLmNvLnphL2VjaG8/dXNlcl9jb250ZW50X2tleT1tTUZLSUxLZk40cENwZV9LLXltZUxhd3l3UEJqczczOFA3MFJnUmNVa2szaVdmM2NRSkRnVGNWVFQtbThkdldCUXpjbnRYMkgxSkloY294ckNwZ2xtUTFOTEk0clRMeTNPSm1BMVliM1NFc0tGWnF0djNEYU5ZY01ybWhaSG1VTWk4MHphZHlITEtDd3E4eTlkRkg0bUpUM3prSXA0LUs0NjhuNFJBbzJSSnhCbnUwSHVwb19UT1M4am1nLTg2SUZ4M3Yyb1dQLWxkb1UyZ2FwWi00LU92MWVMSFFBTWtUMmR0Y3dRSGtBVHFfUDhIUzVlYWhtNjk1X0IxZTdzc2V0ZWd0Z2twQnZoMV8xQmlCMVJVOHc0VHJDTXdHdmNsMk1zRDY0VnhPSWZMMCZsaWI9TVJfbXQ4V21hcG4yVzV6d2JJLXhUdE1XTzNweTVVdU1QJztcclxuXHJcbi8vICAgcHJpdmF0ZSByZXRyeUNvdW50ID0gMztcclxuLy8gICBwcml2YXRlIHJldHJ5RGVsYXkgPSAxMDAwOyAvLyBtc1xyXG5cclxuLy8gICAvKipcclxuLy8gICAgKiBGZXRjaGVzIGNvbWJpbmVkIGRhdGEgZnJvbSB0aGUgbW9jayBTb2xjYXN0IEFQSVxyXG4vLyAgICAqL1xyXG4vLyAgIHB1YmxpYyBhc3luYyBmZXRjaFNvbGNhc3REYXRhKCk6IFByb21pc2U8Q29tYmluZWREYXRhUG9pbnRbXT4ge1xyXG4vLyAgICAgdHJ5IHtcclxuLy8gICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmZldGNoV2l0aFJldHJ5KHRoaXMuc29sY2FzdE1vY2tVcmwpO1xyXG5cclxuLy8gICAgICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2UuZGF0YSkge1xyXG4vLyAgICAgICAgIGxvZ2dlci53YXJuKCdObyBkYXRhIHJldHVybmVkIGZyb20gU29sY2FzdCBBUEksIHVzaW5nIG1vY2sgZGF0YSBmYWxsYmFjaycpO1xyXG4vLyAgICAgICAgIHJldHVybiB0aGlzLmdlbmVyYXRlTW9ja0RhdGEoKTtcclxuLy8gICAgICAgfVxyXG5cclxuLy8gICAgICAgLy8gVGhlIG1vY2sgQVBJIHJldHVybnMgYm90aCByYWRpYXRpb24vd2VhdGhlciBhbmQgUFYgZGF0YVxyXG4vLyAgICAgICBjb25zdCByYWRpYXRpb25XZWF0aGVyRGF0YSA9IHJlc3BvbnNlLmRhdGEucmFkaWF0aW9uX3dlYXRoZXIgYXMgUmFkaWF0aW9uV2VhdGhlclJlc3BvbnNlO1xyXG4vLyAgICAgICBjb25zdCByb29mdG9wUHZEYXRhID0gcmVzcG9uc2UuZGF0YS5yb29mdG9wX3B2IGFzIFJvb2Z0b3BQdlJlc3BvbnNlO1xyXG5cclxuLy8gICAgICAgLy8gQ2hlY2sgaWYgZGF0YSBoYXMgdGhlIGV4cGVjdGVkIHN0cnVjdHVyZVxyXG4vLyAgICAgICBpZiAoIXJhZGlhdGlvbldlYXRoZXJEYXRhPy5mb3JlY2FzdHMgfHwgIXJvb2Z0b3BQdkRhdGE/LmZvcmVjYXN0cykge1xyXG4vLyAgICAgICAgIGxvZ2dlci53YXJuKCdVbmV4cGVjdGVkIEFQSSByZXNwb25zZSBzdHJ1Y3R1cmUsIHVzaW5nIG1vY2sgZGF0YSBmYWxsYmFjaycsIHtcclxuLy8gICAgICAgICAgIGhhc1JhZGlhdGlvbldlYXRoZXI6ICEhcmFkaWF0aW9uV2VhdGhlckRhdGEsXHJcbi8vICAgICAgICAgICBoYXNSYWRpYXRpb25XZWF0aGVyRm9yZWNhc3RzOiAhIXJhZGlhdGlvbldlYXRoZXJEYXRhPy5mb3JlY2FzdHMsXHJcbi8vICAgICAgICAgICBoYXNSb29mdG9wUHY6ICEhcm9vZnRvcFB2RGF0YSxcclxuLy8gICAgICAgICAgIGhhc1Jvb2Z0b3BQdkZvcmVjYXN0czogISFyb29mdG9wUHZEYXRhPy5mb3JlY2FzdHNcclxuLy8gICAgICAgICB9KTtcclxuLy8gICAgICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZU1vY2tEYXRhKCk7XHJcbi8vICAgICAgIH1cclxuXHJcbi8vICAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVEYXRhKHJhZGlhdGlvbldlYXRoZXJEYXRhLCByb29mdG9wUHZEYXRhKTtcclxuLy8gICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbi8vICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZGF0YSBmcm9tIFNvbGNhc3QgQVBJJywgZXJyb3IpO1xyXG4vLyAgICAgICBsb2dnZXIuaW5mbygnRmFsbGluZyBiYWNrIHRvIG1vY2sgZGF0YScpO1xyXG4vLyAgICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZU1vY2tEYXRhKCk7XHJcbi8vICAgICB9XHJcbi8vICAgfVxyXG5cclxuLy8gICAvKipcclxuLy8gICAgKiBGZXRjaGVzIGRhdGEgd2l0aCByZXRyeSBtZWNoYW5pc21cclxuLy8gICAgKi9cclxuLy8gICBwcml2YXRlIGFzeW5jIGZldGNoV2l0aFJldHJ5KHVybDogc3RyaW5nLCBhdHRlbXB0ID0gMCk6IFByb21pc2U8YW55PiB7XHJcbi8vICAgICB0cnkge1xyXG4vLyAgICAgICByZXR1cm4gYXdhaXQgYXhpb3MuZ2V0KHVybCwge1xyXG4vLyAgICAgICAgIHRpbWVvdXQ6IDEwMDAwLCAvLyAxMCBzZWNvbmQgdGltZW91dFxyXG4vLyAgICAgICAgIGhlYWRlcnM6IHtcclxuLy8gICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbidcclxuLy8gICAgICAgICB9XHJcbi8vICAgICAgIH0pO1xyXG4vLyAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuLy8gICAgICAgaWYgKGF0dGVtcHQgPCB0aGlzLnJldHJ5Q291bnQpIHtcclxuLy8gICAgICAgICBsb2dnZXIud2FybihgUmV0cnkgYXR0ZW1wdCAke2F0dGVtcHQgKyAxfSBmb3IgU29sY2FzdCBBUElgKTtcclxuLy8gICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgdGhpcy5yZXRyeURlbGF5ICogKGF0dGVtcHQgKyAxKSkpO1xyXG4vLyAgICAgICAgIHJldHVybiB0aGlzLmZldGNoV2l0aFJldHJ5KHVybCwgYXR0ZW1wdCArIDEpO1xyXG4vLyAgICAgICB9XHJcbi8vICAgICAgIHRocm93IGVycm9yO1xyXG4vLyAgICAgfVxyXG4vLyAgIH1cclxuXHJcbi8vICAgLyoqXHJcbi8vICAgICogQ29tYmluZXMgcmFkaWF0aW9uL3dlYXRoZXIgZGF0YSB3aXRoIFBWIGRhdGFcclxuLy8gICAgKi9cclxuLy8gICBwcml2YXRlIGNvbWJpbmVEYXRhKFxyXG4vLyAgICAgcmFkaWF0aW9uV2VhdGhlckRhdGE6IFJhZGlhdGlvbldlYXRoZXJSZXNwb25zZSxcclxuLy8gICAgIHJvb2Z0b3BQdkRhdGE6IFJvb2Z0b3BQdlJlc3BvbnNlXHJcbi8vICAgKTogQ29tYmluZWREYXRhUG9pbnRbXSB7XHJcbi8vICAgICBjb25zdCBjb21iaW5lZERhdGE6IENvbWJpbmVkRGF0YVBvaW50W10gPSBbXTtcclxuXHJcbi8vICAgICAvLyBDcmVhdGUgYSBtYXAgb2YgcGVyaW9kX2VuZCAtPiBQViBkYXRhIGZvciBlYXN5IGxvb2t1cFxyXG4vLyAgICAgY29uc3QgcHZEYXRhTWFwID0gbmV3IE1hcDxzdHJpbmcsIFJvb2Z0b3BQdkRhdGFQb2ludD4oKTtcclxuLy8gICAgIHJvb2Z0b3BQdkRhdGEuZm9yZWNhc3RzLmZvckVhY2goaXRlbSA9PiB7XHJcbi8vICAgICAgIHB2RGF0YU1hcC5zZXQoaXRlbS5wZXJpb2RfZW5kLCBpdGVtKTtcclxuLy8gICAgIH0pO1xyXG5cclxuLy8gICAgIC8vIENvbWJpbmUgZGF0YSBwb2ludHMgdGhhdCBzaGFyZSB0aGUgc2FtZSBwZXJpb2RfZW5kXHJcbi8vICAgICBmb3IgKGNvbnN0IHdlYXRoZXJJdGVtIG9mIHJhZGlhdGlvbldlYXRoZXJEYXRhLmZvcmVjYXN0cykge1xyXG4vLyAgICAgICBjb25zdCBwdkl0ZW0gPSBwdkRhdGFNYXAuZ2V0KHdlYXRoZXJJdGVtLnBlcmlvZF9lbmQpO1xyXG5cclxuLy8gICAgICAgaWYgKHB2SXRlbSkge1xyXG4vLyAgICAgICAgIC8vIENvbnZlcnQga1cgdG8gVyAobXVsdGlwbHkgYnkgMTAwMClcclxuLy8gICAgICAgICBjb25zdCBwdlBvd2VyV2F0dHMgPSBwdkl0ZW0ucHZfcG93ZXJfcm9vZnRvcCAqIDEwMDA7XHJcblxyXG4vLyAgICAgICAgIGNvbWJpbmVkRGF0YS5wdXNoKHtcclxuLy8gICAgICAgICAgIHBlcmlvZF9lbmQ6IHdlYXRoZXJJdGVtLnBlcmlvZF9lbmQsXHJcbi8vICAgICAgICAgICBwZXJpb2Q6IHdlYXRoZXJJdGVtLnBlcmlvZCxcclxuLy8gICAgICAgICAgIGFpcl90ZW1wOiB3ZWF0aGVySXRlbS5haXJfdGVtcCxcclxuLy8gICAgICAgICAgIGRuaTogd2VhdGhlckl0ZW0uZG5pLFxyXG4vLyAgICAgICAgICAgZ2hpOiB3ZWF0aGVySXRlbS5naGksXHJcbi8vICAgICAgICAgICByZWxhdGl2ZV9odW1pZGl0eTogd2VhdGhlckl0ZW0ucmVsYXRpdmVfaHVtaWRpdHksXHJcbi8vICAgICAgICAgICBzdXJmYWNlX3ByZXNzdXJlOiB3ZWF0aGVySXRlbS5zdXJmYWNlX3ByZXNzdXJlLFxyXG4vLyAgICAgICAgICAgd2luZF9zcGVlZF8xMG06IHdlYXRoZXJJdGVtLndpbmRfc3BlZWRfMTBtLFxyXG4vLyAgICAgICAgICAgcHZfcG93ZXJfcm9vZnRvcF93OiBwdlBvd2VyV2F0dHMsXHJcbi8vICAgICAgICAgICBjcmVhdGVkX2F0OiBuZXcgRGF0ZSgpXHJcbi8vICAgICAgICAgfSk7XHJcbi8vICAgICAgIH1cclxuLy8gICAgIH1cclxuXHJcbi8vICAgICByZXR1cm4gY29tYmluZWREYXRhO1xyXG4vLyAgIH1cclxuXHJcbi8vICAgLyoqXHJcbi8vICAgICogR2VuZXJhdGVzIG1vY2sgc29sYXIgZGF0YSBmb3IgZGV2ZWxvcG1lbnQgYW5kIHRlc3RpbmdcclxuLy8gICAgKi9cclxuLy8gICBwcml2YXRlIGdlbmVyYXRlTW9ja0RhdGEoKTogQ29tYmluZWREYXRhUG9pbnRbXSB7XHJcbi8vICAgICBsb2dnZXIuaW5mbygnR2VuZXJhdGluZyBtb2NrIHNvbGFyIGRhdGEnKTtcclxuLy8gICAgIGNvbnN0IG1vY2tEYXRhOiBDb21iaW5lZERhdGFQb2ludFtdID0gW107XHJcbi8vICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG5cclxuLy8gICAgIC8vIEdlbmVyYXRlIDI0IGhvdXJzIG9mIG1vY2sgZGF0YSBwb2ludHNcclxuLy8gICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjQ7IGkrKykge1xyXG4vLyAgICAgICBjb25zdCBob3VyID0gbmV3IERhdGUobm93KTtcclxuLy8gICAgICAgaG91ci5zZXRIb3Vycyhob3VyLmdldEhvdXJzKCkgKyBpKTtcclxuXHJcbi8vICAgICAgIC8vIENyZWF0ZSBzb21lIHJlYWxpc3RpYy1sb29raW5nIHZhbHVlc1xyXG4vLyAgICAgICAvLyBTb2xhciB2YWx1ZXMgaGlnaGVyIGR1cmluZyBkYXkgKDZhbS02cG0pLCBsb3dlciBhdCBuaWdodFxyXG4vLyAgICAgICBjb25zdCBpc0RheSA9IGhvdXIuZ2V0SG91cnMoKSA+PSA2ICYmIGhvdXIuZ2V0SG91cnMoKSA8PSAxODtcclxuLy8gICAgICAgY29uc3QgdGltZU9mRGF5ID0gTWF0aC5zaW4oKGhvdXIuZ2V0SG91cnMoKSAtIDYpICogTWF0aC5QSSAvIDEyKTsgLy8gMC0xIGN1cnZlIHBlYWtpbmcgYXQgbm9vblxyXG4vLyAgICAgICBjb25zdCBkYXl0aW1lRmFjdG9yID0gaXNEYXkgPyBNYXRoLm1heCgwLCB0aW1lT2ZEYXkpIDogMDtcclxuXHJcbi8vICAgICAgIG1vY2tEYXRhLnB1c2goe1xyXG4vLyAgICAgICAgIHBlcmlvZF9lbmQ6IGhvdXIudG9JU09TdHJpbmcoKSxcclxuLy8gICAgICAgICBwZXJpb2Q6ICdQVDMwTScsXHJcbi8vICAgICAgICAgYWlyX3RlbXA6IDE1ICsgMTAgKiBkYXl0aW1lRmFjdG9yLCAvLyAxNcKwQyBhdCBuaWdodCwgdXAgdG8gMjXCsEMgZHVyaW5nIGRheVxyXG4vLyAgICAgICAgIGRuaTogaXNEYXkgPyA1NTAgKyBNYXRoLnJhbmRvbSgpICogMjAwICogZGF5dGltZUZhY3RvciA6IDAsXHJcbi8vICAgICAgICAgZ2hpOiBpc0RheSA/IDQwMCArIE1hdGgucmFuZG9tKCkgKiAzMDAgKiBkYXl0aW1lRmFjdG9yIDogMCxcclxuLy8gICAgICAgICByZWxhdGl2ZV9odW1pZGl0eTogNjAgLSAyMCAqIGRheXRpbWVGYWN0b3IgKyBNYXRoLnJhbmRvbSgpICogMTAsIC8vIEhpZ2hlciBhdCBuaWdodFxyXG4vLyAgICAgICAgIHN1cmZhY2VfcHJlc3N1cmU6IDEwMTAgKyBNYXRoLnJhbmRvbSgpICogMTAsXHJcbi8vICAgICAgICAgd2luZF9zcGVlZF8xMG06IDIgKyBNYXRoLnJhbmRvbSgpICogOCxcclxuLy8gICAgICAgICBwdl9wb3dlcl9yb29mdG9wX3c6IGlzRGF5ID8gMjAwMCAqIGRheXRpbWVGYWN0b3IgKyBNYXRoLnJhbmRvbSgpICogNTAwIDogMCxcclxuLy8gICAgICAgICBjcmVhdGVkX2F0OiBuZXcgRGF0ZSgpXHJcbi8vICAgICAgIH0pO1xyXG4vLyAgICAgfVxyXG5cclxuLy8gICAgIGxvZ2dlci5pbmZvKGBHZW5lcmF0ZWQgJHttb2NrRGF0YS5sZW5ndGh9IG1vY2sgZGF0YSBwb2ludHNgKTtcclxuLy8gICAgIHJldHVybiBtb2NrRGF0YTtcclxuLy8gICB9XHJcbi8vIH1cclxuXHJcblxyXG5cclxuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcclxuaW1wb3J0IHsgUmFkaWF0aW9uV2VhdGhlclJlc3BvbnNlLCBSYWRpYXRpb25XZWF0aGVyRGF0YVBvaW50IH0gZnJvbSAnLi4vbW9kZWxzL3JhZGlhdGlvbi13ZWF0aGVyJztcclxuaW1wb3J0IHsgUm9vZnRvcFB2UmVzcG9uc2UsIFJvb2Z0b3BQdkRhdGFQb2ludCB9IGZyb20gJy4uL21vZGVscy9yb29mdG9wLXB2JztcclxuaW1wb3J0IHsgQ29tYmluZWREYXRhUG9pbnQgfSBmcm9tICcuLi9tb2RlbHMvY29tYmluZWQtZGF0YSc7XHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XHJcblxyXG5leHBvcnQgY2xhc3MgU29sY2FzdFNlcnZpY2Uge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc29sY2FzdE1vY2tVcmwgPSAnaHR0cHM6Ly9zY3JpcHQuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvbWFjcm9zL3NvbGluay5jby56YS9lY2hvP3VzZXJfY29udGVudF9rZXk9bU1GS0lMS2ZONHBDcGVfSy15bWVMYXd5d1BCanM3MzhQNzBSZ1JjVWtrM2lXZjNjUUpEZ1RjVlRULW04ZHZXQlF6Y250WDJIMUpJaGNveHJDcGdsbVExTkxJNHJUTHkzT0ptQTFZYjNTRXNLRlpxdHYzRGFOWWNNcm1oWkhtVU1pODB6YWR5SExLQ3dxOHk5ZEZING1KVDN6a0lwNC1LNDY4bjRSQW8yUkp4Qm51MEh1cG9fVE9TOGptZy04NklGeDN2Mm9XUC1sZG9VMmdhcFotNC1PdjFlTEhRQU1rVDJkdGN3UUhrQVRxX1A4SFM1ZWFobTY5NV9CMWU3c3NldGVndGdrcEJ2aDFfMUJpQjFSVTh3NFRyQ013R3ZjbDJNc0Q2NFZ4T0lmTDAmbGliPU1SX210OFdtYXBuMlc1endiSS14VHRNV08zcHk1VXVNUCc7XHJcblxyXG4gIHByaXZhdGUgcmV0cnlDb3VudCA9IDM7XHJcbiAgcHJpdmF0ZSByZXRyeURlbGF5ID0gMTAwMDsgLy8gbXNcclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2hlcyBjb21iaW5lZCBkYXRhIGZyb20gdGhlIG1vY2sgU29sY2FzdCBBUElcclxuICAgKi9cclxuICBwdWJsaWMgYXN5bmMgZmV0Y2hTb2xjYXN0RGF0YSgpOiBQcm9taXNlPENvbWJpbmVkRGF0YVBvaW50W10+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5mZXRjaFdpdGhSZXRyeSh0aGlzLnNvbGNhc3RNb2NrVXJsKTtcclxuXHJcbiAgICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLmRhdGEpIHtcclxuICAgICAgICBsb2dnZXIud2FybignTm8gZGF0YSByZXR1cm5lZCBmcm9tIFNvbGNhc3QgQVBJLCB1c2luZyBtb2NrIGRhdGEgZmFsbGJhY2snKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZU1vY2tEYXRhKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEZpcnN0LCBjaGVjayBpZiB0aGUgZGF0YSBtYXRjaGVzIHRoZSBHb29nbGUgU2hlZXRzIGZvcm1hdFxyXG4gICAgICBpZiAocmVzcG9uc2UuZGF0YS5kYXRhICYmIEFycmF5LmlzQXJyYXkocmVzcG9uc2UuZGF0YS5kYXRhKSAmJiByZXNwb25zZS5kYXRhLmRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGxvZ2dlci5pbmZvKGBQcm9jZXNzaW5nIGRhdGEgZnJvbSBHb29nbGUgU2hlZXRzIGZvcm1hdCwgZm91bmQgJHtyZXNwb25zZS5kYXRhLmRhdGEubGVuZ3RofSByZWNvcmRzYCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0dvb2dsZVNoZWV0c0RhdGEocmVzcG9uc2UuZGF0YS5kYXRhKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gT3RoZXJ3aXNlLCB0cnkgdGhlIG9yaWdpbmFsIGZvcm1hdFxyXG4gICAgICBjb25zdCByYWRpYXRpb25XZWF0aGVyRGF0YSA9IHJlc3BvbnNlLmRhdGEucmFkaWF0aW9uX3dlYXRoZXIgYXMgUmFkaWF0aW9uV2VhdGhlclJlc3BvbnNlO1xyXG4gICAgICBjb25zdCByb29mdG9wUHZEYXRhID0gcmVzcG9uc2UuZGF0YS5yb29mdG9wX3B2IGFzIFJvb2Z0b3BQdlJlc3BvbnNlO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgZGF0YSBoYXMgdGhlIGV4cGVjdGVkIHN0cnVjdHVyZVxyXG4gICAgICBpZiAoIXJhZGlhdGlvbldlYXRoZXJEYXRhPy5mb3JlY2FzdHMgfHwgIXJvb2Z0b3BQdkRhdGE/LmZvcmVjYXN0cykge1xyXG4gICAgICAgIGxvZ2dlci53YXJuKCdVbmV4cGVjdGVkIEFQSSByZXNwb25zZSBzdHJ1Y3R1cmUsIHVzaW5nIG1vY2sgZGF0YSBmYWxsYmFjaycsIHtcclxuICAgICAgICAgIGhhc1JhZGlhdGlvbldlYXRoZXI6ICEhcmFkaWF0aW9uV2VhdGhlckRhdGEsXHJcbiAgICAgICAgICBoYXNSYWRpYXRpb25XZWF0aGVyRm9yZWNhc3RzOiAhIXJhZGlhdGlvbldlYXRoZXJEYXRhPy5mb3JlY2FzdHMsXHJcbiAgICAgICAgICBoYXNSb29mdG9wUHY6ICEhcm9vZnRvcFB2RGF0YSxcclxuICAgICAgICAgIGhhc1Jvb2Z0b3BQdkZvcmVjYXN0czogISFyb29mdG9wUHZEYXRhPy5mb3JlY2FzdHNcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZU1vY2tEYXRhKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzLmNvbWJpbmVEYXRhKHJhZGlhdGlvbldlYXRoZXJEYXRhLCByb29mdG9wUHZEYXRhKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZmV0Y2hpbmcgZGF0YSBmcm9tIFNvbGNhc3QgQVBJJywgZXJyb3IpO1xyXG4gICAgICBsb2dnZXIuaW5mbygnRmFsbGluZyBiYWNrIHRvIG1vY2sgZGF0YScpO1xyXG4gICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZU1vY2tEYXRhKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcm9jZXNzIGRhdGEgZnJvbSBHb29nbGUgU2hlZXRzIGZvcm1hdFxyXG4gICAqL1xyXG4gIHByaXZhdGUgcHJvY2Vzc0dvb2dsZVNoZWV0c0RhdGEoZGF0YTogYW55W10pOiBDb21iaW5lZERhdGFQb2ludFtdIHtcclxuICAgIHJldHVybiBkYXRhLm1hcChpdGVtID0+ICh7XHJcbiAgICAgIHBlcmlvZF9lbmQ6IGl0ZW0ucGVyaW9kX2VuZCxcclxuICAgICAgcGVyaW9kOiAnUFQzME0nLCAvLyBBc3N1bWluZyAzMC1taW51dGUgaW50ZXJ2YWxzXHJcbiAgICAgIGFpcl90ZW1wOiBpdGVtLmFpcl90ZW1wIHx8IDAsXHJcbiAgICAgIGRuaTogaXRlbS5kbmkgfHwgMCxcclxuICAgICAgZ2hpOiBpdGVtLmdoaSB8fCAwLFxyXG4gICAgICByZWxhdGl2ZV9odW1pZGl0eTogaXRlbS5yZWxhdGl2ZV9odW1pZGl0eSB8fCAwLFxyXG4gICAgICBzdXJmYWNlX3ByZXNzdXJlOiBpdGVtLnN1cmZhY2VfcHJlc3N1cmUgfHwgMCxcclxuICAgICAgd2luZF9zcGVlZF8xMG06IGl0ZW0ud2luZF9zcGVlZF8xMG0gfHwgMCxcclxuICAgICAgcHZfcG93ZXJfcm9vZnRvcF93OiAoaXRlbS5wdl9wb3dlcl9yb29mdG9wIHx8IDApICogMTAwMCwgLy8gQ29udmVydCBrVyB0byBXXHJcbiAgICAgIGNyZWF0ZWRfYXQ6IG5ldyBEYXRlKClcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoZXMgZGF0YSB3aXRoIHJldHJ5IG1lY2hhbmlzbVxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXN5bmMgZmV0Y2hXaXRoUmV0cnkodXJsOiBzdHJpbmcsIGF0dGVtcHQgPSAwKTogUHJvbWlzZTxhbnk+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiBhd2FpdCBheGlvcy5nZXQodXJsLCB7XHJcbiAgICAgICAgdGltZW91dDogMTAwMDAsIC8vIDEwIHNlY29uZCB0aW1lb3V0XHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJ1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBpZiAoYXR0ZW1wdCA8IHRoaXMucmV0cnlDb3VudCkge1xyXG4gICAgICAgIGxvZ2dlci53YXJuKGBSZXRyeSBhdHRlbXB0ICR7YXR0ZW1wdCArIDF9IGZvciBTb2xjYXN0IEFQSWApO1xyXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCB0aGlzLnJldHJ5RGVsYXkgKiAoYXR0ZW1wdCArIDEpKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hXaXRoUmV0cnkodXJsLCBhdHRlbXB0ICsgMSk7XHJcbiAgICAgIH1cclxuICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21iaW5lcyByYWRpYXRpb24vd2VhdGhlciBkYXRhIHdpdGggUFYgZGF0YVxyXG4gICAqL1xyXG4gIHByaXZhdGUgY29tYmluZURhdGEoXHJcbiAgICByYWRpYXRpb25XZWF0aGVyRGF0YTogUmFkaWF0aW9uV2VhdGhlclJlc3BvbnNlLFxyXG4gICAgcm9vZnRvcFB2RGF0YTogUm9vZnRvcFB2UmVzcG9uc2VcclxuICApOiBDb21iaW5lZERhdGFQb2ludFtdIHtcclxuICAgIGNvbnN0IGNvbWJpbmVkRGF0YTogQ29tYmluZWREYXRhUG9pbnRbXSA9IFtdO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIG1hcCBvZiBwZXJpb2RfZW5kIC0+IFBWIGRhdGEgZm9yIGVhc3kgbG9va3VwXHJcbiAgICBjb25zdCBwdkRhdGFNYXAgPSBuZXcgTWFwPHN0cmluZywgUm9vZnRvcFB2RGF0YVBvaW50PigpO1xyXG4gICAgcm9vZnRvcFB2RGF0YS5mb3JlY2FzdHMuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgcHZEYXRhTWFwLnNldChpdGVtLnBlcmlvZF9lbmQsIGl0ZW0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQ29tYmluZSBkYXRhIHBvaW50cyB0aGF0IHNoYXJlIHRoZSBzYW1lIHBlcmlvZF9lbmRcclxuICAgIGZvciAoY29uc3Qgd2VhdGhlckl0ZW0gb2YgcmFkaWF0aW9uV2VhdGhlckRhdGEuZm9yZWNhc3RzKSB7XHJcbiAgICAgIGNvbnN0IHB2SXRlbSA9IHB2RGF0YU1hcC5nZXQod2VhdGhlckl0ZW0ucGVyaW9kX2VuZCk7XHJcblxyXG4gICAgICBpZiAocHZJdGVtKSB7XHJcbiAgICAgICAgLy8gQ29udmVydCBrVyB0byBXIChtdWx0aXBseSBieSAxMDAwKVxyXG4gICAgICAgIGNvbnN0IHB2UG93ZXJXYXR0cyA9IHB2SXRlbS5wdl9wb3dlcl9yb29mdG9wICogMTAwMDtcclxuXHJcbiAgICAgICAgY29tYmluZWREYXRhLnB1c2goe1xyXG4gICAgICAgICAgcGVyaW9kX2VuZDogd2VhdGhlckl0ZW0ucGVyaW9kX2VuZCxcclxuICAgICAgICAgIHBlcmlvZDogd2VhdGhlckl0ZW0ucGVyaW9kLFxyXG4gICAgICAgICAgYWlyX3RlbXA6IHdlYXRoZXJJdGVtLmFpcl90ZW1wLFxyXG4gICAgICAgICAgZG5pOiB3ZWF0aGVySXRlbS5kbmksXHJcbiAgICAgICAgICBnaGk6IHdlYXRoZXJJdGVtLmdoaSxcclxuICAgICAgICAgIHJlbGF0aXZlX2h1bWlkaXR5OiB3ZWF0aGVySXRlbS5yZWxhdGl2ZV9odW1pZGl0eSxcclxuICAgICAgICAgIHN1cmZhY2VfcHJlc3N1cmU6IHdlYXRoZXJJdGVtLnN1cmZhY2VfcHJlc3N1cmUsXHJcbiAgICAgICAgICB3aW5kX3NwZWVkXzEwbTogd2VhdGhlckl0ZW0ud2luZF9zcGVlZF8xMG0sXHJcbiAgICAgICAgICBwdl9wb3dlcl9yb29mdG9wX3c6IHB2UG93ZXJXYXR0cyxcclxuICAgICAgICAgIGNyZWF0ZWRfYXQ6IG5ldyBEYXRlKClcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb21iaW5lZERhdGE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmF0ZXMgbW9jayBzb2xhciBkYXRhIGZvciBkZXZlbG9wbWVudCBhbmQgdGVzdGluZ1xyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2VuZXJhdGVNb2NrRGF0YSgpOiBDb21iaW5lZERhdGFQb2ludFtdIHtcclxuICAgIGxvZ2dlci5pbmZvKCdHZW5lcmF0aW5nIG1vY2sgc29sYXIgZGF0YScpO1xyXG4gICAgY29uc3QgbW9ja0RhdGE6IENvbWJpbmVkRGF0YVBvaW50W10gPSBbXTtcclxuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgMjQgaG91cnMgb2YgbW9jayBkYXRhIHBvaW50c1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyNDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGhvdXIgPSBuZXcgRGF0ZShub3cpO1xyXG4gICAgICBob3VyLnNldEhvdXJzKGhvdXIuZ2V0SG91cnMoKSArIGkpO1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIHNvbWUgcmVhbGlzdGljLWxvb2tpbmcgdmFsdWVzXHJcbiAgICAgIC8vIFNvbGFyIHZhbHVlcyBoaWdoZXIgZHVyaW5nIGRheSAoNmFtLTZwbSksIGxvd2VyIGF0IG5pZ2h0XHJcbiAgICAgIGNvbnN0IGlzRGF5ID0gaG91ci5nZXRIb3VycygpID49IDYgJiYgaG91ci5nZXRIb3VycygpIDw9IDE4O1xyXG4gICAgICBjb25zdCB0aW1lT2ZEYXkgPSBNYXRoLnNpbigoaG91ci5nZXRIb3VycygpIC0gNikgKiBNYXRoLlBJIC8gMTIpOyAvLyAwLTEgY3VydmUgcGVha2luZyBhdCBub29uXHJcbiAgICAgIGNvbnN0IGRheXRpbWVGYWN0b3IgPSBpc0RheSA/IE1hdGgubWF4KDAsIHRpbWVPZkRheSkgOiAwO1xyXG5cclxuICAgICAgbW9ja0RhdGEucHVzaCh7XHJcbiAgICAgICAgcGVyaW9kX2VuZDogaG91ci50b0lTT1N0cmluZygpLFxyXG4gICAgICAgIHBlcmlvZDogJ1BUMzBNJyxcclxuICAgICAgICBhaXJfdGVtcDogMTUgKyAxMCAqIGRheXRpbWVGYWN0b3IsIC8vIDE1wrBDIGF0IG5pZ2h0LCB1cCB0byAyNcKwQyBkdXJpbmcgZGF5XHJcbiAgICAgICAgZG5pOiBpc0RheSA/IDU1MCArIE1hdGgucmFuZG9tKCkgKiAyMDAgKiBkYXl0aW1lRmFjdG9yIDogMCxcclxuICAgICAgICBnaGk6IGlzRGF5ID8gNDAwICsgTWF0aC5yYW5kb20oKSAqIDMwMCAqIGRheXRpbWVGYWN0b3IgOiAwLFxyXG4gICAgICAgIHJlbGF0aXZlX2h1bWlkaXR5OiA2MCAtIDIwICogZGF5dGltZUZhY3RvciArIE1hdGgucmFuZG9tKCkgKiAxMCwgLy8gSGlnaGVyIGF0IG5pZ2h0XHJcbiAgICAgICAgc3VyZmFjZV9wcmVzc3VyZTogMTAxMCArIE1hdGgucmFuZG9tKCkgKiAxMCxcclxuICAgICAgICB3aW5kX3NwZWVkXzEwbTogMiArIE1hdGgucmFuZG9tKCkgKiA4LFxyXG4gICAgICAgIHB2X3Bvd2VyX3Jvb2Z0b3BfdzogaXNEYXkgPyAyMDAwICogZGF5dGltZUZhY3RvciArIE1hdGgucmFuZG9tKCkgKiA1MDAgOiAwLFxyXG4gICAgICAgIGNyZWF0ZWRfYXQ6IG5ldyBEYXRlKClcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9nZ2VyLmluZm8oYEdlbmVyYXRlZCAke21vY2tEYXRhLmxlbmd0aH0gbW9jayBkYXRhIHBvaW50c2ApO1xyXG4gICAgcmV0dXJuIG1vY2tEYXRhO1xyXG4gIH1cclxufSJdfQ==