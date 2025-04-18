// import axios from 'axios';
// import { RadiationWeatherResponse, RadiationWeatherDataPoint } from '../models/radiation-weather';
// import { RooftopPvResponse, RooftopPvDataPoint } from '../models/rooftop-pv';
// import { CombinedDataPoint } from '../models/combined-data';
// import { logger } from '../utils/logger';

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



import axios from 'axios';
import { RadiationWeatherResponse, RadiationWeatherDataPoint } from '../models/radiation-weather';
import { RooftopPvResponse, RooftopPvDataPoint } from '../models/rooftop-pv';
import { CombinedDataPoint } from '../models/combined-data';
import { logger } from '../utils/logger';

export class SolcastService {
  private readonly solcastMockUrl = 'https://script.googleusercontent.com/a/macros/solink.co.za/echo?user_content_key=mMFKILKfN4pCpe_K-ymeLawywPBjs738P70RgRcUkk3iWf3cQJDgTcVTT-m8dvWBQzcntX2H1JIhcoxrCpglmQ1NLI4rTLy3OJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMi80zadyHLKCwq8y9dFH4mJT3zkIp4-K468n4RAo2RJxBnu0Hupo_TOS8jmg-86IFx3v2oWP-ldoU2gapZ-4-Ov1eLHQAMkT2dtcwQHkATq_P8HS5eahm695_B1e7ssetegtgkpBvh1_1BiB1RU8w4TrCMwGvcl2MsD64VxOIfL0&lib=MR_mt8Wmapn2W5zwbI-xTtMWO3py5UuMP';

  private retryCount = 3;
  private retryDelay = 1000; // ms

  /**
   * Fetches combined data from the mock Solcast API
   */
  public async fetchSolcastData(): Promise<CombinedDataPoint[]> {
    try {
      const response = await this.fetchWithRetry(this.solcastMockUrl);

      if (!response || !response.data) {
        logger.warn('No data returned from Solcast API, using mock data fallback');
        return this.generateMockData();
      }

      // First, check if the data matches the Google Sheets format
      if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        logger.info(`Processing data from Google Sheets format, found ${response.data.data.length} records`);
        return this.processGoogleSheetsData(response.data.data);
      }

      // Otherwise, try the original format
      const radiationWeatherData = response.data.radiation_weather as RadiationWeatherResponse;
      const rooftopPvData = response.data.rooftop_pv as RooftopPvResponse;

      // Check if data has the expected structure
      if (!radiationWeatherData?.forecasts || !rooftopPvData?.forecasts) {
        logger.warn('Unexpected API response structure, using mock data fallback', {
          hasRadiationWeather: !!radiationWeatherData,
          hasRadiationWeatherForecasts: !!radiationWeatherData?.forecasts,
          hasRooftopPv: !!rooftopPvData,
          hasRooftopPvForecasts: !!rooftopPvData?.forecasts
        });
        return this.generateMockData();
      }

      return this.combineData(radiationWeatherData, rooftopPvData);
    } catch (error) {
      logger.error('Error fetching data from Solcast API', error);
      logger.info('Falling back to mock data');
      return this.generateMockData();
    }
  }

  /**
   * Process data from Google Sheets format
   */
  private processGoogleSheetsData(data: any[]): CombinedDataPoint[] {
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
  private async fetchWithRetry(url: string, attempt = 0): Promise<any> {
    try {
      return await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json'
        }
      });
    } catch (error) {
      if (attempt < this.retryCount) {
        logger.warn(`Retry attempt ${attempt + 1} for Solcast API`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Combines radiation/weather data with PV data
   */
  private combineData(
    radiationWeatherData: RadiationWeatherResponse,
    rooftopPvData: RooftopPvResponse
  ): CombinedDataPoint[] {
    const combinedData: CombinedDataPoint[] = [];

    // Create a map of period_end -> PV data for easy lookup
    const pvDataMap = new Map<string, RooftopPvDataPoint>();
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
  private generateMockData(): CombinedDataPoint[] {
    logger.info('Generating mock solar data');
    const mockData: CombinedDataPoint[] = [];
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

    logger.info(`Generated ${mockData.length} mock data points`);
    return mockData;
  }
}