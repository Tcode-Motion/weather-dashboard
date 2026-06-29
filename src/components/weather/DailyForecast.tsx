/* ───────────────────────────────────────────────────
 *  DailyForecast — 10-day expandable forecast
 * ─────────────────────────────────────────────────── */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Droplets, Wind, Sunrise, Sunset } from 'lucide-react';
import WeatherIcon from '../ui/WeatherIcon';
import GlassCard from '../ui/GlassCard';
import { useWeather } from '../../contexts/WeatherContext';
import { useSettings } from '../../contexts/SettingsContext';
import { convertTemp, convertWind, windUnitLabel } from '../../utils/units';
import { formatDayName, formatDate, formatTime, formatNumber } from '../../utils/formatters';
import { getWeatherInfo } from '../../utils/weatherCodes';
import { getMoonPhaseInfo } from '../../utils/moonPhase';
import './DailyForecast.css';

export default function DailyForecast() {
  const { weatherData } = useWeather();
  const { settings } = useSettings();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (!weatherData) return null;

  const { daily } = weatherData;
  const wLabel = windUnitLabel(settings.windUnit);

  // Find overall temp range for bar sizing
  const allMaxes = daily.temperatureMax;
  const allMins = daily.temperatureMin;
  const overallMin = Math.min(...allMins);
  const overallMax = Math.max(...allMaxes);
  const range = overallMax - overallMin || 1;

  return (
    <motion.section
      className="daily-forecast"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      aria-label="10-day forecast"
    >
      <h2 className="section-title">10-Day Forecast</h2>

      <div className="daily-list">
        {daily.time.map((day, i) => {
          const isExpanded = expandedIdx === i;
          const info = getWeatherInfo(daily.weatherCode[i]);
          const high = convertTemp(daily.temperatureMax[i], settings.tempUnit);
          const low = convertTemp(daily.temperatureMin[i], settings.tempUnit);
          const barLeft = ((daily.temperatureMin[i] - overallMin) / range) * 100;
          const barWidth = ((daily.temperatureMax[i] - daily.temperatureMin[i]) / range) * 100;
          const date = new Date(day);
          date.setDate(date.getDate()); // ensure correct day
          const moonInfo = getMoonPhaseInfo(date);

          return (
            <GlassCard
              key={day}
              className={`daily-item ${isExpanded ? 'daily-expanded' : ''}`}
              delay={i * 0.04}
              onClick={() => setExpandedIdx(isExpanded ? null : i)}
              hoverable={false}
            >
              <div className="daily-summary">
                <span className="daily-day">{formatDayName(day)}</span>
                <span className="daily-date">{formatDate(day)}</span>
                <WeatherIcon code={daily.weatherCode[i]} size={24} />
                <span className="daily-desc">{info.description}</span>

                {daily.precipitationProbabilityMax[i] > 0 && (
                  <span className="daily-rain">
                    <Droplets size={12} /> {daily.precipitationProbabilityMax[i]}%
                  </span>
                )}

                <div className="daily-temp-bar-wrapper">
                  <span className="daily-low">{formatNumber(low, 0)}°</span>
                  <div className="daily-temp-bar">
                    <div
                      className="daily-temp-fill"
                      style={{ left: `${barLeft}%`, width: `${Math.max(barWidth, 8)}%` }}
                    />
                  </div>
                  <span className="daily-high">{formatNumber(high, 0)}°</span>
                </div>

                <ChevronDown
                  size={16}
                  className={`daily-chevron ${isExpanded ? 'daily-chevron-open' : ''}`}
                />
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="daily-details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="daily-detail-grid">
                      <div className="daily-detail-item">
                        <Sunrise size={14} /> Sunrise
                        <strong>{daily.sunrise[i] ? formatTime(daily.sunrise[i], settings.timeFormat) : '—'}</strong>
                      </div>
                      <div className="daily-detail-item">
                        <Sunset size={14} /> Sunset
                        <strong>{daily.sunset[i] ? formatTime(daily.sunset[i], settings.timeFormat) : '—'}</strong>
                      </div>
                      <div className="daily-detail-item">
                        <Wind size={14} /> Wind
                        <strong>{formatNumber(convertWind(daily.windSpeedMax[i], settings.windUnit), 1)} {wLabel}</strong>
                      </div>
                      <div className="daily-detail-item">
                        <Droplets size={14} /> Rain
                        <strong>{formatNumber(daily.precipitationSum[i], 1)} mm</strong>
                      </div>
                      <div className="daily-detail-item">
                        <span>{moonInfo.emoji}</span> Moon
                        <strong>{moonInfo.name}</strong>
                      </div>
                      <div className="daily-detail-item">
                        <span>☀️</span> UV Max
                        <strong>{formatNumber(daily.uvIndexMax[i], 1)}</strong>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          );
        })}
      </div>
    </motion.section>
  );
}
