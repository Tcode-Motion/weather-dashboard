/* ───────────────────────────────────────────────────
 *  AirQualityPanel — AQI display with pollutants
 * ─────────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import { Leaf, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import GlassCard from '../ui/GlassCard';
import './AirQualityPanel.css';

interface AQILevel {
  label: string;
  desc: string;
  color: string;
  bg: string;
  icon: typeof CheckCircle;
  advice: string;
}

function getAQILevel(aqi: number): AQILevel {
  if (aqi <= 50)  return { label: 'Good',        desc: 'Air quality is satisfactory',         color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  icon: CheckCircle,  advice: 'Great day for outdoor activities!' };
  if (aqi <= 100) return { label: 'Moderate',     desc: 'Acceptable for most people',          color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  icon: Info,         advice: 'Unusually sensitive people should reduce prolonged outdoor exertion.' };
  if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', desc: 'Sensitive groups affected', color: '#f97316', bg: 'rgba(249,115,22,0.12)',  icon: AlertTriangle, advice: 'Sensitive groups should limit prolonged outdoor exertion.' };
  if (aqi <= 200) return { label: 'Unhealthy',    desc: 'Everyone may begin to be affected',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: AlertTriangle, advice: 'Everyone should reduce prolonged outdoor exertion.' };
  if (aqi <= 300) return { label: 'Very Unhealthy', desc: 'Health alert for everyone',         color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: AlertTriangle, advice: 'Avoid outdoor exertion. Stay indoors.' };
  return             { label: 'Hazardous',         desc: 'Emergency conditions',               color: '#be123c', bg: 'rgba(190,18,60,0.12)',   icon: AlertTriangle, advice: 'Everyone should avoid all outdoor exertion.' };
}

export default function AirQualityPanel() {
  const { airQuality } = useWeather();

  if (!airQuality) return null;

  const level = getAQILevel(airQuality.aqi);
  const Icon = level.icon;

  const pollutants = [
    { name: 'PM2.5',  value: airQuality.pm25,  unit: 'μg/m³', max: 250 },
    { name: 'PM10',   value: airQuality.pm10,  unit: 'μg/m³', max: 430 },
    { name: 'NO₂',    value: airQuality.no2,   unit: 'μg/m³', max: 400 },
    { name: 'O₃',     value: airQuality.o3,    unit: 'μg/m³', max: 300 },
    { name: 'CO',     value: airQuality.co,    unit: 'μg/m³', max: 30000 },
    { name: 'SO₂',    value: airQuality.so2,   unit: 'μg/m³', max: 350 },
  ].filter(p => p.value != null && p.value > 0);

  return (
    <motion.section
      className="aqi-section"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      aria-label="Air quality"
    >
      <h2 className="section-title"><Leaf size={14} /> Air Quality</h2>

      <GlassCard hoverable={false} className="aqi-card">
        {/* AQI Score */}
        <div className="aqi-score-row" style={{ borderLeftColor: level.color }}>
          <div className="aqi-gauge-wrapper">
            <svg className="aqi-gauge" viewBox="0 0 100 60" aria-label={`AQI ${airQuality.aqi}`}>
              <path d="M10 55 A 45 45 0 0 1 90 55" fill="none" stroke="var(--color-border)" strokeWidth="8" strokeLinecap="round" />
              <path
                d="M10 55 A 45 45 0 0 1 90 55"
                fill="none"
                stroke={level.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${Math.min((airQuality.aqi / 500) * 141, 141)} 141`}
                style={{ filter: `drop-shadow(0 0 6px ${level.color})` }}
              />
            </svg>
            <div className="aqi-value" style={{ color: level.color }}>{airQuality.aqi}</div>
          </div>

          <div className="aqi-info">
            <div className="aqi-badge" style={{ background: level.bg, color: level.color }}>
              <Icon size={13} /> {level.label}
            </div>
            <p className="aqi-desc">{level.desc}</p>
            <p className="aqi-advice">{level.advice}</p>
          </div>
        </div>

        {/* Pollutant bars */}
        {pollutants.length > 0 && (
          <div className="aqi-pollutants">
            {pollutants.map(p => (
              <div key={p.name} className="aqi-pollutant">
                <div className="aqi-pollutant-header">
                  <span className="aqi-pollutant-name">{p.name}</span>
                  <span className="aqi-pollutant-value">{Number(p.value).toFixed(1)} <span className="aqi-pollutant-unit">{p.unit}</span></span>
                </div>
                <div className="aqi-bar-track">
                  <motion.div
                    className="aqi-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((p.value / p.max) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    style={{ background: `linear-gradient(90deg, ${level.color}80, ${level.color})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.section>
  );
}
