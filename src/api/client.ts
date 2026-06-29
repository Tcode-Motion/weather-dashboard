/* ───────────────────────────────────────────────────
 *  API Client — Fetch wrapper with caching & retry
 * ─────────────────────────────────────────────────── */

import { CACHE_TTL } from '../constants/api';

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();

interface FetchOptions {
  cacheTtl?: number;
  retries?: number;
  retryDelay?: number;
}

function getCacheKey(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return `nimbus_c_${hash}`;
}

export async function apiFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { cacheTtl = CACHE_TTL, retries = 2, retryDelay = 1000 } = options;

  // Check memory cache
  const cached = memoryCache.get(url);
  if (cached && Date.now() - cached.timestamp < cacheTtl) {
    return cached.data as T;
  }

  const cacheKey = getCacheKey(url);

  // Check localStorage cache (for offline support)
  try {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      const parsed = JSON.parse(stored) as CacheEntry;
      if (Date.now() - parsed.timestamp < cacheTtl) {
        memoryCache.set(url, parsed);
        return parsed.data as T;
      }
    }
  } catch { /* ignore parse errors */ }

  // Fetch with retry
  let lastError: Error = new Error('Fetch failed');
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json() as T;

      // Update caches
      const entry: CacheEntry = { data, timestamp: Date.now() };
      memoryCache.set(url, entry);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch { /* quota exceeded, ignore */ }

      return data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, retryDelay * (attempt + 1)));
      }
    }
  }

  // Last resort: return stale cache if available
  try {
    const stale = localStorage.getItem(cacheKey);
    if (stale) {
      const parsed = JSON.parse(stale) as CacheEntry;
      return parsed.data as T;
    }
  } catch { /* ignore */ }

  throw lastError;
}

export function clearApiCache(): void {
  memoryCache.clear();
  const keys = Object.keys(localStorage).filter(k => k.startsWith('nimbus_c_'));
  keys.forEach(k => localStorage.removeItem(k));
}
