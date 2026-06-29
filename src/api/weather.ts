/* ───────────────────────────────────────────────────
 *  Open-Meteo Weather API Service
 *  Completely free — no API key required
 * ─────────────────────────────────────────────────── */

import { API } from '../constants/api';
import { apiFetch } from './client';
import type { WeatherData, CurrentWeather, HourlyData, DailyData, GeoLocation } from '../types/weather';

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current: Record<string, number | string>;
  hourly: Record<string, (number | string)[]>;
  daily: Record<string, (number | string)[]>;
}

const CURRENT_PARAMS = [
  'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
  'surface_pressure', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
  'weather_code', 'cloud_cover', 'visibility', 'uv_index',
  'dew_point_2m', 'precipitation', 'is_day',
].join(',');

const HOURLY_PARAMS = [
  'temperature_2m', 'apparent_temperature', 'relative_humidity_2m',
  'dew_point_2m', 'surface_pressure', 'cloud_cover', 'visibility',
  'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
  'precipitation', 'precipitation_probability', 'weather_code',
  'uv_index', 'is_day',
].join(',');

const DAILY_PARAMS = [
  'weather_code', 'temperature_2m_max', 'temperature_2m_min',
  'sunrise', 'sunset', 'uv_index_max',
  'precipitation_sum', 'precipitation_probability_max',
  'wind_speed_10m_max', 'wind_gusts_10m_max', 'wind_direction_10m_dominant',
  'precipitation_hours',
].join(',');

export async function fetchWeatherData(location: GeoLocation): Promise<WeatherData> {
  const url = `${API.OPEN_METEO_WEATHER}?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&current=${CURRENT_PARAMS}&hourly=${HOURLY_PARAMS}&daily=${DAILY_PARAMS}` +
    `&timezone=auto&forecast_days=10&forecast_hours=48`;

  const raw = await apiFetch<OpenMeteoResponse>(url);

  const current: CurrentWeather = {
    temperature: raw.current.temperature_2m as number,
    feelsLike: raw.current.apparent_temperature as number,
    humidity: raw.current.relative_humidity_2m as number,
    pressure: raw.current.surface_pressure as number,
    windSpeed: raw.current.wind_speed_10m as number,
    windDirection: raw.current.wind_direction_10m as number,
    windGusts: raw.current.wind_gusts_10m as number,
    weatherCode: raw.current.weather_code as number,
    cloudCover: raw.current.cloud_cover as number,
    visibility: raw.current.visibility as number,
    uvIndex: raw.current.uv_index as number,
    dewPoint: raw.current.dew_point_2m as number,
    precipitation: raw.current.precipitation as number,
    isDay: (raw.current.is_day as number) === 1,
    time: raw.current.time as string,
  };

  const hourly: HourlyData = {
    time: raw.hourly.time as string[],
    temperature: raw.hourly.temperature_2m as number[],
    feelsLike: raw.hourly.apparent_temperature as number[],
    humidity: raw.hourly.relative_humidity_2m as number[],
    dewPoint: raw.hourly.dew_point_2m as number[],
    pressure: raw.hourly.surface_pressure as number[],
    cloudCover: raw.hourly.cloud_cover as number[],
    visibility: raw.hourly.visibility as number[],
    windSpeed: raw.hourly.wind_speed_10m as number[],
    windDirection: raw.hourly.wind_direction_10m as number[],
    windGusts: raw.hourly.wind_gusts_10m as number[],
    precipitation: raw.hourly.precipitation as number[],
    precipitationProbability: raw.hourly.precipitation_probability as number[],
    weatherCode: raw.hourly.weather_code as number[],
    uvIndex: raw.hourly.uv_index as number[],
    isDay: raw.hourly.is_day as number[],
  };

  const daily: DailyData = {
    time: raw.daily.time as string[],
    weatherCode: raw.daily.weather_code as number[],
    temperatureMax: raw.daily.temperature_2m_max as number[],
    temperatureMin: raw.daily.temperature_2m_min as number[],
    sunrise: raw.daily.sunrise as string[],
    sunset: raw.daily.sunset as string[],
    uvIndexMax: raw.daily.uv_index_max as number[],
    precipitationSum: raw.daily.precipitation_sum as number[],
    precipitationProbabilityMax: raw.daily.precipitation_probability_max as number[],
    windSpeedMax: raw.daily.wind_speed_10m_max as number[],
    windGustsMax: raw.daily.wind_gusts_10m_max as number[],
    windDirectionDominant: raw.daily.wind_direction_10m_dominant as number[],
    precipitationHours: raw.daily.precipitation_hours as number[],
  };

  return {
    location,
    current,
    hourly,
    daily,
    fetchedAt: Date.now(),
  };
}
