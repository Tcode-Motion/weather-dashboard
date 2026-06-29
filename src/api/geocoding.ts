/* ───────────────────────────────────────────────────
 *  Geocoding API — Open-Meteo + Nominatim fallback
 *  + IP-based country detection for smarter bias
 *  No API key required
 * ─────────────────────────────────────────────────── */

import { API } from '../constants/api';
import { apiFetch } from './client';
import type { SearchResult, GeoLocation } from '../types/weather';

interface OpenMeteoGeoResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    country_code: string;
    admin1?: string;
    timezone?: string;
    elevation?: number;
    population?: number;
  }>;
}

interface NominatimSearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  importance?: number;
}

// ── IP-based country detection (free, no key) ──────
let _detectedCountry: string | null = null;
let _detectedLat: number | null = null;
let _detectedLon: number | null = null;

export async function detectUserCountry(): Promise<{ country: string; lat: number; lon: number } | null> {
  if (_detectedCountry) return { country: _detectedCountry, lat: _detectedLat!, lon: _detectedLon! };

  try {
    // Uses ipapi.co free tier (no key needed, 1000 req/day)
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('ipapi failed');
    const data = await res.json();
    _detectedCountry = (data.country_code as string) ?? null;
    _detectedLat = (data.latitude as number) ?? null;
    _detectedLon = (data.longitude as number) ?? null;
    if (_detectedCountry && _detectedLat && _detectedLon) {
      return { country: _detectedCountry, lat: _detectedLat, lon: _detectedLon };
    }
  } catch {
    // Fallback: ip-api.com (also free)
    try {
      const res = await fetch('http://ip-api.com/json/?fields=countryCode,lat,lon', { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        _detectedCountry = data.countryCode ?? null;
        _detectedLat = data.lat ?? null;
        _detectedLon = data.lon ?? null;
        if (_detectedCountry && _detectedLat && _detectedLon) {
          return { country: _detectedCountry, lat: _detectedLat, lon: _detectedLon };
        }
      }
    } catch { /* ignore */ }
  }
  return null;
}

// ── Main city search with geo-bias ─────────────────
export async function searchCities(
  query: string,
  userLat?: number,
  userLon?: number,
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const trimmed = query.trim();

  // Run both Open-Meteo and Nominatim in parallel for best coverage
  const [openMeteoResults, nominatimResults] = await Promise.allSettled([
    searchOpenMeteo(trimmed),
    searchNominatim(trimmed),
  ]);

  const omResults = openMeteoResults.status === 'fulfilled' ? openMeteoResults.value : [];
  const nomResults = nominatimResults.status === 'fulfilled' ? nominatimResults.value : [];

  // Merge, deduplicate, and rank
  const merged = mergeAndRank(omResults, nomResults, userLat, userLon);
  return merged.slice(0, 10);
}

async function searchOpenMeteo(query: string): Promise<SearchResult[]> {
  try {
    const url = `${API.OPEN_METEO_GEOCODING}?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
    const data = await apiFetch<OpenMeteoGeoResponse>(url, { cacheTtl: 60000 });
    return (data.results ?? []).map(r => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      countryCode: r.country_code,
      admin1: r.admin1,
      timezone: r.timezone,
      elevation: r.elevation,
      population: r.population,
      source: 'openmeteo' as const,
    }));
  } catch {
    return [];
  }
}

async function searchNominatim(query: string): Promise<SearchResult[]> {
  try {
    const url = `${API.NOMINATIM_SEARCH}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8&accept-language=en`;
    const data = await apiFetch<NominatimSearchResult[]>(url, { cacheTtl: 60000 });
    if (!Array.isArray(data)) return [];

    return data.map((r, idx) => {
      const addr = r.address ?? {};
      const name = addr.city || addr.town || addr.village || addr.county || r.display_name.split(',')[0];
      const countryCode = (addr.country_code ?? '').toUpperCase();
      return {
        id: -(idx + 1) * 100000, // negative IDs for nominatim to avoid collision
        name,
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
        country: addr.country ?? '',
        countryCode,
        admin1: addr.state,
        source: 'nominatim' as const,
        displayName: r.display_name,
      };
    });
  } catch {
    return [];
  }
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mergeAndRank(
  omResults: SearchResult[],
  nomResults: SearchResult[],
  userLat?: number,
  userLon?: number,
): SearchResult[] {
  // Start with Open-Meteo results (higher quality names)
  const seen = new Set<string>();
  const all: Array<SearchResult & { score: number }> = [];

  const scoreResult = (r: SearchResult, sourceBonus: number): number => {
    let score = sourceBonus;

    // Population bonus (larger cities score higher when query is ambiguous)
    if (r.population) score += Math.log10(r.population + 1) * 5;

    // Geo-proximity bonus
    if (userLat != null && userLon != null) {
      const dist = haversineDistance(userLat, userLon, r.latitude, r.longitude);
      // Massive bonus for same country / region
      if (dist < 100) score += 60;
      else if (dist < 500) score += 40;
      else if (dist < 1500) score += 20;
      else if (dist < 5000) score += 8;
    }

    // Detected country bonus (even without precise coords)
    if (_detectedCountry && r.countryCode === _detectedCountry) score += 30;

    return score;
  };

  // Add Open-Meteo results first (better geocoding)
  for (const r of omResults) {
    const key = `${r.latitude.toFixed(2)},${r.longitude.toFixed(2)}`;
    if (!seen.has(key)) {
      seen.add(key);
      all.push({ ...r, score: scoreResult(r, 20) });
    }
  }

  // Add Nominatim results that aren't duplicates (good for obscure places)
  for (const r of nomResults) {
    const key = `${r.latitude.toFixed(2)},${r.longitude.toFixed(2)}`;
    if (!seen.has(key)) {
      seen.add(key);
      all.push({ ...r, score: scoreResult(r, 10) });
    }
  }

  return all.sort((a, b) => b.score - a.score);
}

// ── Reverse geocode ─────────────────────────────────
interface NominatimResult {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation> {
  const url = `${API.NOMINATIM_REVERSE}?lat=${lat}&lon=${lon}&format=json&accept-language=en`;

  try {
    const data = await apiFetch<NominatimResult>(url, { cacheTtl: 300000 });
    const addr = data.address;
    const name = addr.city || addr.town || addr.village || 'Unknown';

    return {
      latitude: lat,
      longitude: lon,
      name,
      country: addr.country || '',
      countryCode: (addr.country_code || '').toUpperCase(),
      admin1: addr.state,
    };
  } catch {
    return {
      latitude: lat,
      longitude: lon,
      name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      country: '',
      countryCode: '',
    };
  }
}

export function searchResultToLocation(result: SearchResult): GeoLocation {
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country,
    countryCode: result.countryCode,
    admin1: result.admin1,
    timezone: result.timezone,
    elevation: result.elevation,
  };
}
