/* ───────────────────────────────────────────────────
 *  Theme Constants — Weather-responsive visuals
 * ─────────────────────────────────────────────────── */

import type { WeatherCondition, TimeOfDay, WeatherTheme } from '../types/weather';

export const WEATHER_THEMES: Record<string, WeatherTheme> = {
  'landing-light': {
    condition: 'clear',
    timeOfDay: 'day',
    gradientStart: '#bae6fd', // sky 200
    gradientMid: '#f1f5f9',   // slate 100
    gradientEnd: '#e0f2fe',   // sky 100
  },
  'landing-dark': {
    condition: 'clear',
    timeOfDay: 'night',
    gradientStart: '#0f172a', // slate 900
    gradientMid: '#1e1b4b',   // indigo 950
    gradientEnd: '#0b0f19',   // very dark blue
  },
  'clear-day': {
    condition: 'clear',
    timeOfDay: 'day',
    gradientStart: '#4facfe',
    gradientMid: '#00f2fe',
    gradientEnd: '#43e97b',
  },
  'clear-night': {
    condition: 'clear',
    timeOfDay: 'night',
    gradientStart: '#0c1445',
    gradientMid: '#1a237e',
    gradientEnd: '#283593',
  },
  'clear-sunset': {
    condition: 'clear',
    timeOfDay: 'sunset',
    gradientStart: '#fa709a',
    gradientMid: '#fee140',
    gradientEnd: '#ff9a76',
  },
  'partly-cloudy-day': {
    condition: 'partly-cloudy',
    timeOfDay: 'day',
    gradientStart: '#667eea',
    gradientMid: '#a8c0ff',
    gradientEnd: '#c2e9fb',
  },
  'partly-cloudy-night': {
    condition: 'partly-cloudy',
    timeOfDay: 'night',
    gradientStart: '#141e30',
    gradientMid: '#243b55',
    gradientEnd: '#2c3e50',
  },
  'cloudy-day': {
    condition: 'cloudy',
    timeOfDay: 'day',
    gradientStart: '#bdc3c7',
    gradientMid: '#94a3b8',
    gradientEnd: '#64748b',
  },
  'cloudy-night': {
    condition: 'cloudy',
    timeOfDay: 'night',
    gradientStart: '#2c3e50',
    gradientMid: '#34495e',
    gradientEnd: '#1a1a2e',
  },
  'fog-day': {
    condition: 'fog',
    timeOfDay: 'day',
    gradientStart: '#d7d2cc',
    gradientMid: '#b8c6db',
    gradientEnd: '#a4b0be',
  },
  'fog-night': {
    condition: 'fog',
    timeOfDay: 'night',
    gradientStart: '#3d3d3d',
    gradientMid: '#4a4a4a',
    gradientEnd: '#2d2d2d',
  },
  'rain-day': {
    condition: 'rain',
    timeOfDay: 'day',
    gradientStart: '#373b44',
    gradientMid: '#4286f4',
    gradientEnd: '#485563',
  },
  'rain-night': {
    condition: 'rain',
    timeOfDay: 'night',
    gradientStart: '#0f0c29',
    gradientMid: '#302b63',
    gradientEnd: '#24243e',
  },
  'snow-day': {
    condition: 'snow',
    timeOfDay: 'day',
    gradientStart: '#e6e9f0',
    gradientMid: '#c2d1e0',
    gradientEnd: '#accbee',
  },
  'snow-night': {
    condition: 'snow',
    timeOfDay: 'night',
    gradientStart: '#1a1a3e',
    gradientMid: '#2a2a5e',
    gradientEnd: '#1e3a5f',
  },
  'thunderstorm-day': {
    condition: 'thunderstorm',
    timeOfDay: 'day',
    gradientStart: '#1a1a2e',
    gradientMid: '#16213e',
    gradientEnd: '#0f3460',
  },
  'thunderstorm-night': {
    condition: 'thunderstorm',
    timeOfDay: 'night',
    gradientStart: '#0a0a1a',
    gradientMid: '#111133',
    gradientEnd: '#0d0d2b',
  },
};

export function getWeatherThemeKey(condition: WeatherCondition, timeOfDay: TimeOfDay): string {
  const tod = timeOfDay === 'sunrise' ? 'day' : timeOfDay;
  const key = `${condition}-${tod}`;
  return key in WEATHER_THEMES ? key : 'clear-day';
}
