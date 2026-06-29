/* ───────────────────────────────────────────────────
 *  WeatherHero — Compact hero with all quick stats
 * ─────────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import { MapPin, RefreshCw, Droplets, Wind, Eye, Gauge, ArrowUp, ArrowDown, ThermometerSun, CloudFog, Star } from 'lucide-react';
import WeatherIcon from '../ui/WeatherIcon';
import { useWeather } from '../../contexts/WeatherContext';
import { useSettings } from '../../contexts/SettingsContext';
import { convertTemp, tempUnitLabel, convertWind, windUnitLabel } from '../../utils/units';
import { getWeatherInfo } from '../../utils/weatherCodes';
import { formatNumber } from '../../utils/formatters';
import { SkeletonCard } from '../ui/Skeleton';
import './WeatherHero.css';

export default function WeatherHero() {
  const { weatherData, loading, refreshWeather, isFavorite, addFavorite, removeFavorite } = useWeather();
  const { settings } = useSettings();

  if (loading && !weatherData) return <SkeletonCard height="280px" />;
  if (!weatherData) return null;

  const { current, location, daily } = weatherData;
  const info = getWeatherInfo(current.weatherCode, current.isDay);
  const tempLabel = tempUnitLabel(settings.tempUnit);
  const temp   = Math.round(convertTemp(current.temperature, settings.tempUnit));
  const feels  = Math.round(convertTemp(current.feelsLike,   settings.tempUnit));
  const high   = Math.round(convertTemp(daily.temperatureMax[0], settings.tempUnit));
  const low    = Math.round(convertTemp(daily.temperatureMin[0], settings.tempUnit));
  const wind   = formatNumber(convertWind(current.windSpeed, settings.windUnit), 1);
  const wLabel = windUnitLabel(settings.windUnit);

  return (
    <motion.section
      className="weather-hero glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Current weather"
      id="weather-hero"
    >
      {/* Top row: location + actions */}
      <div className="hero-topbar">
        <div className="hero-location">
          <MapPin size={14} />
          <h1 className="hero-city">{location.name}</h1>
          {location.admin1 && <span className="hero-state">{location.admin1}</span>}
          <span className="hero-country">{location.country}</span>
        </div>
        <div className="hero-actions">
          <button
            className={`hero-fav ${isFavorite ? 'hero-fav-active' : ''}`}
            onClick={isFavorite ? () => removeFavorite(`${location.latitude}-${location.longitude}`) : addFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button className="hero-refresh" onClick={refreshWeather} aria-label="Refresh weather" title="Refresh (Ctrl+R)">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main temperature display */}
      <div className="hero-body">
        <div className="hero-left">
          <motion.div
            className="hero-temp"
            key={temp}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {temp}<span className="hero-temp-unit">{tempLabel}</span>
          </motion.div>

          <p className="hero-condition">{info.description}</p>

          <div className="hero-range">
            <span className="hero-high"><ArrowUp size={12} />{high}°</span>
            <span className="hero-sep">·</span>
            <span className="hero-low"><ArrowDown size={12} />{low}°</span>
            <span className="hero-sep">·</span>
            <span className="hero-feels"><ThermometerSun size={12} />Feels {feels}°</span>
          </div>
        </div>

        <motion.div
          className="hero-icon-col"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <WeatherIcon code={current.weatherCode} isDay={current.isDay} size={88} className="hero-wx-icon" />
        </motion.div>
      </div>

      {/* Quick stats bar */}
      <div className="hero-stats-bar">
        <div className="hero-stat">
          <Droplets size={14} className="stat-icon" />
          <span>{current.humidity}%</span>
          <label>Humidity</label>
        </div>
        <div className="hero-stat">
          <Wind size={14} className="stat-icon" />
          <span>{wind} {wLabel}</span>
          <label>Wind</label>
        </div>
        <div className="hero-stat">
          <Eye size={14} className="stat-icon" />
          <span>{formatNumber(current.visibility / 1000, 0)} km</span>
          <label>Visibility</label>
        </div>
        <div className="hero-stat">
          <Gauge size={14} className="stat-icon" />
          <span>{formatNumber(current.pressure, 0)}</span>
          <label>hPa</label>
        </div>
        <div className="hero-stat">
          <CloudFog size={14} className="stat-icon" />
          <span>{current.cloudCover}%</span>
          <label>Clouds</label>
        </div>
        <div className="hero-stat">
          <span className="stat-uv-badge" style={{ background: current.uvIndex >= 8 ? '#ef4444' : current.uvIndex >= 6 ? '#f97316' : current.uvIndex >= 3 ? '#fbbf24' : '#4ade80' }}>UV {current.uvIndex}</span>
          <label>UV Index</label>
        </div>
      </div>
    </motion.section>
  );
}
