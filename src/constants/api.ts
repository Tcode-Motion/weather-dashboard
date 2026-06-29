/* ───────────────────────────────────────────────────
 *  API Constants — All free, no API keys required
 * ─────────────────────────────────────────────────── */

export const API = {
  OPEN_METEO_WEATHER: 'https://api.open-meteo.com/v1/forecast',
  OPEN_METEO_GEOCODING: 'https://geocoding-api.open-meteo.com/v1/search',
  OPEN_METEO_AIR_QUALITY: 'https://air-quality-api.open-meteo.com/v1/air-quality',
  NOMINATIM_REVERSE: 'https://nominatim.openstreetmap.org/reverse',
  NOMINATIM_SEARCH: 'https://nominatim.openstreetmap.org/search',
  OSM_TILE: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
} as const;

export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
export const SEARCH_DEBOUNCE_MS = 300;
export const MAX_SEARCH_HISTORY = 10;
export const MAX_HOURLY_HOURS = 48;
export const MAX_DAILY_DAYS = 10;
