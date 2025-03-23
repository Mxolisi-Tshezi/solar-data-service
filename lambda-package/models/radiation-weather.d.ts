export interface RadiationWeatherDataPoint {
    period_end: string;
    period: string;
    air_temp: number;
    dni: number;
    ghi: number;
    relative_humidity: number;
    surface_pressure: number;
    wind_speed_10m: number;
}
export interface RadiationWeatherResponse {
    forecasts: RadiationWeatherDataPoint[];
}
