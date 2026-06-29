/* ───────────────────────────────────────────────────
 *  Air Quality API — Open-Meteo
 *  Completely free — no API key required
 * ─────────────────────────────────────────────────── */

import { API } from '../constants/api';
import { apiFetch } from './client';
import type { AirQualityData } from '../types/weather';

interface AQIResponse {
  current: {
    european_aqi: number;
    pm2_5: number;
    pm10: number;
    nitrogen_dioxide: number;
    ozone: number;
    sulphur_dioxide: number;
    carbon_monoxide: number;
    alder_pollen?: number;
    birch_pollen?: number;
    grass_pollen?: number;
    mugwort_pollen?: number;
    olive_pollen?: number;
    ragweed_pollen?: number;
  };
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData | null> {
  const params = [
    'european_aqi', 'pm2_5', 'pm10', 'nitrogen_dioxide',
    'ozone', 'sulphur_dioxide', 'carbon_monoxide',
    'alder_pollen', 'birch_pollen', 'grass_pollen',
    'mugwort_pollen', 'olive_pollen', 'ragweed_pollen',
  ].join(',');

  const url = `${API.OPEN_METEO_AIR_QUALITY}?latitude=${lat}&longitude=${lon}&current=${params}`;

  try {
    const data = await apiFetch<AQIResponse>(url);
    const c = data.current;

    return {
      aqi: c.european_aqi,
      pm25: c.pm2_5,
      pm10: c.pm10,
      no2: c.nitrogen_dioxide,
      o3: c.ozone,
      so2: c.sulphur_dioxide,
      co: c.carbon_monoxide,
      pollenTree: Math.max(c.alder_pollen ?? 0, c.birch_pollen ?? 0, c.olive_pollen ?? 0),
      pollenGrass: c.grass_pollen ?? 0,
      pollenWeed: Math.max(c.mugwort_pollen ?? 0, c.ragweed_pollen ?? 0),
    };
  } catch {
    return null;
  }
}
