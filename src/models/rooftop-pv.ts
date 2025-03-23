export interface RooftopPvDataPoint {
    period_end: string;
    period: string;
    pv_power_rooftop: number; //kW, needs conversion to W
  }
  
  export interface RooftopPvResponse {
    forecasts: RooftopPvDataPoint[];
  }