export interface RooftopPvDataPoint {
    period_end: string;
    period: string;
    pv_power_rooftop: number;
}
export interface RooftopPvResponse {
    forecasts: RooftopPvDataPoint[];
}
