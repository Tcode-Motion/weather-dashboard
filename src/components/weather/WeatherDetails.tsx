/* ───────────────────────────────────────────────────
 *  WeatherDetails — Compact sidebar detail grid
 * ─────────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import {
  Droplets, Wind, Eye, Gauge, ThermometerSun, CloudRain,
  Navigation, Waves, CloudFog, Sun as SunIcon, Compass,
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useWeather } from '../../contexts/WeatherContext';
import { useSettings } from '../../contexts/SettingsContext';
import {
  convertTemp, tempUnitLabel, convertWind, windUnitLabel,
  convertPressure, pressureUnitLabel, degreesToDirection,
  convertDistance, distanceUnitLabel,
} from '../../utils/units';
import { formatNumber, getUVLabel } from '../../utils/formatters';
import './WeatherDetails.css';

export default function WeatherDetails() {
  const { weatherData } = useWeather();
  const { settings } = useSettings();

  if (!weatherData) return null;

  const { current } = weatherData;
  const tL = tempUnitLabel(settings.tempUnit);
  const wL = windUnitLabel(settings.windUnit);
  const pL = pressureUnitLabel(settings.pressureUnit);
  const dL = distanceUnitLabel(settings.distanceUnit);
  const uvInfo = getUVLabel(current.uvIndex);

  const rows = [
    { icon: ThermometerSun, label: 'Feels Like',    value: `${formatNumber(convertTemp(current.feelsLike, settings.tempUnit), 1)}${tL}`,                  color: '#f97316' },
    { icon: Waves,          label: 'Dew Point',      value: `${formatNumber(convertTemp(current.dewPoint, settings.tempUnit), 1)}${tL}`,                    color: '#22d3ee' },
    { icon: Droplets,       label: 'Humidity',        value: `${current.humidity}%`,                                                                          color: '#38bdf8' },
    { icon: Gauge,          label: 'Pressure',         value: `${formatNumber(convertPressure(current.pressure, settings.pressureUnit), 0)} ${pL}`,           color: '#8b5cf6' },
    { icon: Wind,           label: 'Wind',             value: `${formatNumber(convertWind(current.windSpeed, settings.windUnit), 1)} ${wL}`,                  color: '#06b6d4' },
    { icon: Navigation,     label: 'Gusts',            value: `${formatNumber(convertWind(current.windGusts, settings.windUnit), 1)} ${wL}`,                  color: '#0ea5e9' },
    { icon: Compass,        label: 'Direction',        value: `${degreesToDirection(current.windDirection)} · ${current.windDirection}°`,                     color: '#0ea5e9' },
    { icon: Eye,            label: 'Visibility',       value: `${formatNumber(convertDistance(current.visibility, settings.distanceUnit), 1)} ${dL}`,         color: '#a78bfa' },
    { icon: SunIcon,        label: 'UV Index',         value: `${current.uvIndex} · ${uvInfo.label}`,                                                         color: uvInfo.color },
    { icon: CloudFog,       label: 'Cloud Cover',      value: `${current.cloudCover}%`,                                                                       color: '#94a3b8' },
    { icon: CloudRain,      label: 'Precipitation',    value: `${formatNumber(current.precipitation, 1)} mm`,                                                 color: '#60a5fa' },
  ];

  return (
    <motion.section
      className="wx-details"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Weather details"
    >
      <h2 className="section-title"><Gauge size={14} /> Details</h2>

      <GlassCard hoverable={false} className="details-card">
        {rows.map((row, i) => (
          <div key={row.label} className={`detail-row ${i < rows.length - 1 ? 'detail-row-border' : ''}`}>
            <div className="detail-row-icon" style={{ color: row.color }}>
              <row.icon size={15} />
            </div>
            <span className="detail-row-label">{row.label}</span>
            <span className="detail-row-value">{row.value}</span>
          </div>
        ))}
      </GlassCard>
    </motion.section>
  );
}
