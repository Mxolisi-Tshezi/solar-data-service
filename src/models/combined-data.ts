export interface CombinedDataPoint {
    id?: string;
    period_end: string;
    period: string;
    air_temp: number;
    dni: number;
    ghi: number;
    relative_humidity: number;
    surface_pressure: number;
    wind_speed_10m: number;
    pv_power_rooftop_w: number; // Already converted from kW to W
    created_at: Date;
  }