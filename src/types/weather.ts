/* ───────────────────────────────────────────────────
 *  Weather Domain Types
 *  Covers Open-Meteo responses + internal models
 * ─────────────────────────────────────────────────── */

export interface GeoLocation {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  countryCode: string;
  admin1?: string; // state / province
  timezone?: string;
  elevation?: number;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  weatherCode: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
  dewPoint: number;
  precipitation: number;
  isDay: boolean;
  time: string;
}

export interface HourlyData {
  time: string[];
  temperature: number[];
  feelsLike: number[];
  humidity: number[];
  dewPoint: number[];
  pressure: number[];
  cloudCover: number[];
  visibility: number[];
  windSpeed: number[];
  windDirection: number[];
  windGusts: number[];
  precipitation: number[];
  precipitationProbability: number[];
  weatherCode: number[];
  uvIndex: number[];
  isDay: number[];
}

export interface DailyData {
  time: string[];
  weatherCode: number[];
  temperatureMax: number[];
  temperatureMin: number[];
  sunrise: string[];
  sunset: string[];
  uvIndexMax: number[];
  precipitationSum: number[];
  precipitationProbabilityMax: number[];
  windSpeedMax: number[];
  windGustsMax: number[];
  windDirectionDominant: number[];
  precipitationHours: number[];
}

export interface WeatherData {
  location: GeoLocation;
  current: CurrentWeather;
  hourly: HourlyData;
  daily: DailyData;
  fetchedAt: number; // timestamp
}

export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
  pollenTree: number;
  pollenGrass: number;
  pollenWeed: number;
}

export interface SearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  admin1?: string;
  timezone?: string;
  elevation?: number;
  population?: number;
  source?: 'openmeteo' | 'nominatim';
  displayName?: string;
}

export interface FavoriteCity {
  id: string;
  name: string;
  customName?: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  pinned: boolean;
  addedAt: number;
  order: number;
}

export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm'
  | 'sleet';

export type TimeOfDay = 'day' | 'night' | 'sunrise' | 'sunset';

export interface WeatherTheme {
  condition: WeatherCondition;
  timeOfDay: TimeOfDay;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
}

export interface WeatherAdvice {
  clothing: string;
  umbrella: string;
  sunProtection: string;
  hydration: string;
  outdoor: { score: number; label: string; description: string };
  running: { score: number; label: string };
  cycling: { score: number; label: string };
  photography: { score: number; label: string; tip: string };
  stargazing: { score: number; label: string };
  sleepComfort: { score: number; label: string };
  plantWatering: string;
  fishing: { score: number; label: string };
}

export interface WeatherTrend {
  temperature: 'rising' | 'falling' | 'stable';
  pressure: 'rising' | 'falling' | 'stable';
  humidity: 'rising' | 'falling' | 'stable';
  wind: 'increasing' | 'decreasing' | 'stable';
}
