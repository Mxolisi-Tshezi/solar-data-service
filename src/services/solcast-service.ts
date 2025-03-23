import axios from 'axios';
import { RadiationWeatherResponse } from '../models/radiation-weather';
import { RooftopPvResponse } from '../models/rooftop-pv';
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
        throw new Error('No data returned from Solcast API');
      }
      
      // The mock API returns both radiation/weather and PV data
      const radiationWeatherData = response.data.radiation_weather as RadiationWeatherResponse;
      const rooftopPvData = response.data.rooftop_pv as RooftopPvResponse;
      
      return this.combineData(radiationWeatherData, rooftopPvData);
    } catch (error) {
      logger.error('Error fetching data from Solcast API', error);
      throw error;
    }
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
}