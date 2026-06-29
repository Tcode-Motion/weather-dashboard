/* ───────────────────────────────────────────────────
 *  WeatherMap — Leaflet interactive map
 * ─────────────────────────────────────────────────── */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import { useWeather } from '../../contexts/WeatherContext';
import './WeatherMap.css';

export default function WeatherMap() {
  const { weatherData, fetchWeatherByCoords } = useWeather();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;

      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      if (cancelled) return;

      const lat = weatherData?.location.latitude ?? 51.505;
      const lon = weatherData?.location.longitude ?? -0.09;

      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 10,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Custom marker icon
      const icon = L.divIcon({
        className: 'map-marker-custom',
        html: '<div class="marker-pulse"></div><div class="marker-dot"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lon], { icon }).addTo(map);
      markerRef.current = marker;
      mapRef.current = map;

      // Click to get weather
      map.on('click', (e: L.LeafletMouseEvent) => {
        fetchWeatherByCoords(e.latlng.lat, e.latlng.lng);
      });

      // Map loaded

      // Fix tile rendering issue
      setTimeout(() => map.invalidateSize(), 100);
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Only init once

  // Update marker position when location changes
  useEffect(() => {
    if (!mapRef.current || !weatherData || !markerRef.current) return;
    const { latitude, longitude } = weatherData.location;
    markerRef.current.setLatLng([latitude, longitude]);
    mapRef.current.setView([latitude, longitude], 10, { animate: true });
  }, [weatherData?.location.latitude, weatherData?.location.longitude]);

  const toggleFullscreen = () => {
    const container = mapContainerRef.current?.parentElement;
    if (!container) return;

    if (!isFullscreen) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
    setTimeout(() => mapRef.current?.invalidateSize(), 200);
  };

  return (
    <motion.section
      className="weather-map-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      aria-label="Weather map"
    >
      <h2 className="section-title">Interactive Map</h2>
      <GlassCard className="map-card" hoverable={false}>
        <div className="map-toolbar">
          <span className="map-hint">Click anywhere on the map to check weather</span>
          <button className="map-fullscreen-btn" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
        <div ref={mapContainerRef} className="map-container" role="application" aria-label="Interactive weather map" />
      </GlassCard>
    </motion.section>
  );
}

// Prevent tree-shaking of Leaflet types
declare const L: typeof import('leaflet');
