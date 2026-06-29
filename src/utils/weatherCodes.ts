/* ───────────────────────────────────────────────────
 *  WMO Weather Interpretation Codes
 *  https://open-meteo.com/en/docs#weathervariables
 * ─────────────────────────────────────────────────── */

import type { WeatherCondition } from '../types/weather';

interface WeatherCodeInfo {
  description: string;
  icon: string;       // lucide icon name
  nightIcon?: string; // alternate icon for night
  condition: WeatherCondition;
}

export const WMO_CODES: Record<number, WeatherCodeInfo> = {
  0:  { description: 'Clear sky',              icon: 'Sun',          nightIcon: 'Moon',         condition: 'clear' },
  1:  { description: 'Mainly clear',           icon: 'Sun',          nightIcon: 'Moon',         condition: 'clear' },
  2:  { description: 'Partly cloudy',          icon: 'CloudSun',     nightIcon: 'CloudMoon',    condition: 'partly-cloudy' },
  3:  { description: 'Overcast',               icon: 'Cloud',                                   condition: 'cloudy' },
  45: { description: 'Fog',                    icon: 'CloudFog',                                condition: 'fog' },
  48: { description: 'Depositing rime fog',    icon: 'CloudFog',                                condition: 'fog' },
  51: { description: 'Light drizzle',          icon: 'CloudDrizzle',                            condition: 'drizzle' },
  53: { description: 'Moderate drizzle',       icon: 'CloudDrizzle',                            condition: 'drizzle' },
  55: { description: 'Dense drizzle',          icon: 'CloudDrizzle',                            condition: 'drizzle' },
  56: { description: 'Light freezing drizzle', icon: 'CloudSnow',                               condition: 'sleet' },
  57: { description: 'Dense freezing drizzle', icon: 'CloudSnow',                               condition: 'sleet' },
  61: { description: 'Slight rain',            icon: 'CloudRain',                               condition: 'rain' },
  63: { description: 'Moderate rain',          icon: 'CloudRain',                               condition: 'rain' },
  65: { description: 'Heavy rain',             icon: 'CloudRain',                               condition: 'rain' },
  66: { description: 'Light freezing rain',    icon: 'CloudSnow',                               condition: 'sleet' },
  67: { description: 'Heavy freezing rain',    icon: 'CloudSnow',                               condition: 'sleet' },
  71: { description: 'Slight snow fall',       icon: 'Snowflake',                               condition: 'snow' },
  73: { description: 'Moderate snow fall',     icon: 'Snowflake',                               condition: 'snow' },
  75: { description: 'Heavy snow fall',        icon: 'Snowflake',                               condition: 'snow' },
  77: { description: 'Snow grains',            icon: 'Snowflake',                               condition: 'snow' },
  80: { description: 'Slight rain showers',    icon: 'CloudRain',                               condition: 'rain' },
  81: { description: 'Moderate rain showers',  icon: 'CloudRain',                               condition: 'rain' },
  82: { description: 'Violent rain showers',   icon: 'CloudRain',                               condition: 'rain' },
  85: { description: 'Slight snow showers',    icon: 'Snowflake',                               condition: 'snow' },
  86: { description: 'Heavy snow showers',     icon: 'Snowflake',                               condition: 'snow' },
  95: { description: 'Thunderstorm',           icon: 'CloudLightning',                          condition: 'thunderstorm' },
  96: { description: 'Thunderstorm with slight hail', icon: 'CloudLightning',                   condition: 'thunderstorm' },
  99: { description: 'Thunderstorm with heavy hail',  icon: 'CloudLightning',                   condition: 'thunderstorm' },
};

export function getWeatherInfo(code: number, isDay: boolean = true): WeatherCodeInfo {
  const info = WMO_CODES[code] ?? WMO_CODES[0];
  if (!isDay && info.nightIcon) {
    return { ...info, icon: info.nightIcon };
  }
  return info;
}

export function getConditionFromCode(code: number): WeatherCondition {
  return (WMO_CODES[code] ?? WMO_CODES[0]).condition;
}
