/* ───────────────────────────────────────────────────
 *  SunMoonPanel — Sunrise/Sunset arc + Moon phase
 * ─────────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import { Sunrise, Sunset } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { useSettings } from '../../contexts/SettingsContext';
import GlassCard from '../ui/GlassCard';
import { formatTime } from '../../utils/formatters';
import { getMoonPhaseInfo } from '../../utils/moonPhase';
import './SunMoonPanel.css';

export default function SunMoonPanel() {
  const { weatherData } = useWeather();
  const { settings } = useSettings();

  if (!weatherData) return null;

  const { current, daily } = weatherData;
  const sunriseStr = daily.sunrise[0];
  const sunsetStr  = daily.sunset[0];
  const moonInfo = getMoonPhaseInfo();

  // Compute sun arc progress 0–1
  let sunProgress = 0.5;
  if (sunriseStr && sunsetStr) {
    const now = Date.now();
    const rise = new Date(sunriseStr).getTime();
    const set  = new Date(sunsetStr).getTime();
    sunProgress = Math.max(0, Math.min(1, (now - rise) / (set - rise)));
  }

  // Day length
  const dayLengthMs = sunriseStr && sunsetStr
    ? new Date(sunsetStr).getTime() - new Date(sunriseStr).getTime()
    : 0;
  const dayHours = Math.floor(dayLengthMs / 3600000);
  const dayMinutes = Math.floor((dayLengthMs % 3600000) / 60000);

  // Sun arc path
  const arcR = 80;
  const arcCx = 100;
  const arcCy = 85;
  const arcStart = { x: arcCx - arcR, y: arcCy };
  const arcEnd   = { x: arcCx + arcR, y: arcCy };

  // Sun position on arc
  const sunArcAngle = Math.PI - (sunProgress * Math.PI);
  const sunPosX = arcCx + arcR * Math.cos(sunArcAngle);
  const sunPosY = arcCy - arcR * Math.sin(sunArcAngle);

  return (
    <motion.section
      className="sun-moon-section"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      aria-label="Sun and moon information"
    >
      <h2 className="section-title"><Sunrise size={14} /> Sun &amp; Moon</h2>

      <GlassCard hoverable={false} className="sun-moon-card">
        {/* Sun arc SVG */}
        <div className="sun-arc-wrapper">
          <svg viewBox="0 0 200 100" className="sun-arc-svg" aria-label={`Sun progress: ${Math.round(sunProgress * 100)}%`}>
            {/* Background arc */}
            <path
              d={`M ${arcStart.x} ${arcCy} A ${arcR} ${arcR} 0 0 1 ${arcEnd.x} ${arcCy}`}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Progress arc */}
            <path
              d={`M ${arcStart.x} ${arcCy} A ${arcR} ${arcR} 0 0 1 ${arcEnd.x} ${arcCy}`}
              fill="none"
              stroke="rgba(251,191,36,0.3)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${sunProgress * 251} 251`}
            />
            {/* Horizon line */}
            <line x1="15" y1={arcCy} x2="185" y2={arcCy} stroke="var(--color-border)" strokeWidth="1" />
            {/* Sun dot */}
            <circle cx={sunPosX} cy={sunPosY} r="6" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 8px #fbbf24)' }} />
            <circle cx={sunPosX} cy={sunPosY} r="10" fill="rgba(251,191,36,0.2)" />
          </svg>

          {/* Times */}
          <div className="sun-times">
            <div className="sun-time">
              <Sunrise size={14} />
              <span>{sunriseStr ? formatTime(sunriseStr, settings.timeFormat) : '—'}</span>
            </div>
            <div className="sun-daylength">
              {dayHours}h {dayMinutes}m
            </div>
            <div className="sun-time">
              <Sunset size={14} />
              <span>{sunsetStr ? formatTime(sunsetStr, settings.timeFormat) : '—'}</span>
            </div>
          </div>
        </div>

        {/* Moon phase */}
        <div className="moon-section">
          <div className="moon-phase-display">
            <span className="moon-emoji-large">{moonInfo.emoji}</span>
            <div className="moon-info">
              <strong>{moonInfo.name}</strong>
              <span>{moonInfo.illumination}% illuminated</span>
              {moonInfo.nextFullMoon && (
                <span className="moon-next">Next full moon: {moonInfo.nextFullMoon}</span>
              )}
            </div>
          </div>
        </div>

        {/* Current status */}
        <div className="day-night-badge">
          <span className={`day-night-dot ${current.isDay ? 'is-day' : 'is-night'}`} />
          {current.isDay ? '☀️ Daytime' : '🌙 Nighttime'}
        </div>
      </GlassCard>
    </motion.section>
  );
}
