/* ───────────────────────────────────────────────────
 *  Weather Context — Central weather data state
 *  - Restores last-visited city on reload
 *  - Does NOT auto-detect location silently
 *    (user must click locate or search)
 * ─────────────────────────────────────────────────── */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { WeatherData, GeoLocation, AirQualityData, FavoriteCity } from '../types/weather';
import { fetchWeatherData } from '../api/weather';
import { fetchAirQuality } from '../api/airQuality';
import { reverseGeocode } from '../api/geocoding';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface WeatherContextValue {
  weatherData: WeatherData | null;
  airQuality: AirQualityData | null;
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
  fetchWeather: (location: GeoLocation) => Promise<void>;
  fetchWeatherByCoords: (lat: number, lon: number) => Promise<void>;
  refreshWeather: () => Promise<void>;
  resetWeather: () => void;
  favorites: FavoriteCity[];
  isFavorite: boolean;
  addFavorite: () => void;
  removeFavorite: (id: string) => void;
  togglePin: (id: string) => void;
}

const WeatherContext = createContext<WeatherContextValue | null>(null);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useLocalStorage<GeoLocation | null>('nimbus_last_location', null);
  const [favorites, setFavorites] = useLocalStorage<FavoriteCity[]>('nimbus_favorites', []);
  const abortRef = useRef<AbortController | null>(null);

  const isFavorite = !!(location && favorites.some(f => f.latitude === location.latitude && f.longitude === location.longitude));

  const addFavorite = useCallback(() => {
    if (!location || isFavorite) return;
    const fav: FavoriteCity = {
      id: `${location.latitude}-${location.longitude}`,
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      country: location.country,
      countryCode: location.countryCode,
      pinned: false,
      addedAt: Date.now(),
      order: favorites.length,
    };
    setFavorites(prev => [...prev, fav]);
  }, [location, isFavorite, favorites.length, setFavorites]);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  }, [setFavorites]);

  const togglePin = useCallback((id: string) => {
    setFavorites(prev => prev.map(f => f.id === id ? { ...f, pinned: !f.pinned } : f));
  }, [setFavorites]);

  const fetchWeather = useCallback(async (loc: GeoLocation) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setLocation(loc);
    setLastLocation(loc);

    try {
      const [weather, aqi] = await Promise.all([
        fetchWeatherData(loc),
        fetchAirQuality(loc.latitude, loc.longitude),
      ]);
      setWeatherData(weather);
      setAirQuality(aqi);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [setLastLocation]);

  const fetchWeatherByCoords = useCallback(async (lat: number, lon: number) => {
    const loc = await reverseGeocode(lat, lon);
    await fetchWeather(loc);
  }, [fetchWeather]);

  const refreshWeather = useCallback(async () => {
    if (location) await fetchWeather(location);
  }, [location, fetchWeather]);

  const resetWeather = useCallback(() => {
    setWeatherData(null);
    setAirQuality(null);
    setLocation(null);
    setLastLocation(null);
  }, [setLastLocation]);

  // On mount: restore last city ONLY (no silent IP auto-detect)
  useEffect(() => {
    if (lastLocation && !weatherData) {
      fetchWeather(lastLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WeatherContext.Provider value={{
      weatherData, airQuality, location, loading, error,
      fetchWeather, fetchWeatherByCoords, refreshWeather, resetWeather,
      favorites, isFavorite, addFavorite, removeFavorite, togglePin,
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather(): WeatherContextValue {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider');
  return ctx;
}
