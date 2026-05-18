import type { WeatherData, ApiResponse } from '@/types';

export async function getWeather(stationId: string): Promise<ApiResponse<WeatherData>> {
  const res = await fetch(`/api/weather/${stationId}`);
  if (!res.ok) return { data: null, error: 'Failed to fetch weather' };
  const json = await res.json();
  return {
    data: {
      condition: json.condition,
      tempCelsius: json.temp_celsius,
      humidity: json.humidity,
      windKph: json.wind_kph,
      rainProbability: json.rain_probability,
      rainMmNextHour: json.rain_mm_next_hour,
      fetchedAt: json.fetched_at,
    },
    error: null,
  };
}
