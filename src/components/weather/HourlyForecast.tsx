/* ───────────────────────────────────────────────────
 *  HourlyForecast — Scrollable 48-hour timeline
 * ─────────────────────────────────────────────────── */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import WeatherIcon from '../ui/WeatherIcon';
import { useWeather } from '../../contexts/WeatherContext';
import { useSettings } from '../../contexts/SettingsContext';
import { convertTemp, tempUnitLabel } from '../../utils/units';
import { formatHour } from '../../utils/formatters';
import './HourlyForecast.css';

export default function HourlyForecast() {
  const { weatherData } = useWeather();
  const { settings } = useSettings();

  const chartData = useMemo(() => {
    if (!weatherData) return [];
    const { hourly } = weatherData;
    const now = new Date();
    return hourly.time
      .map((t, i) => ({ time: t, idx: i }))
      .filter(d => new Date(d.time) >= now)
      .slice(0, 48)
      .map(d => ({
        hour: formatHour(d.time, settings.timeFormat),
        temp: Math.round(convertTemp(hourly.temperature[d.idx], settings.tempUnit)),
        rain: hourly.precipitationProbability[d.idx] ?? 0,
        humidity: hourly.humidity[d.idx],
        code: hourly.weatherCode[d.idx],
        isDay: hourly.isDay[d.idx] === 1,
      }));
  }, [weatherData, settings.tempUnit, settings.timeFormat]);

  if (!weatherData || chartData.length === 0) return null;

  const tempLabel = tempUnitLabel(settings.tempUnit);

  return (
    <motion.section
      className="hourly-forecast"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      aria-label="Hourly forecast"
    >
      <h2 className="section-title">Hourly Forecast</h2>

      {/* Scrollable cards */}
      <div className="hourly-scroll" role="list" aria-label="Hourly weather timeline">
        {chartData.slice(0, 24).map((d, i) => (
          <div key={i} className="hourly-item glass-card" role="listitem">
            <span className="hourly-time">{d.hour}</span>
            <WeatherIcon code={d.code} isDay={d.isDay} size={24} />
            <span className="hourly-temp">{d.temp}{tempLabel}</span>
            {d.rain > 0 && <span className="hourly-rain">💧 {d.rain}%</span>}
          </div>
        ))}
      </div>

      {/* Temperature chart */}
      <div className="hourly-chart glass-card">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} tickLine={false} axisLine={false} interval={3} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip
              contentStyle={{
                background: 'rgba(15, 15, 30, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#f0f0f5',
                fontSize: '13px',
              }}
              formatter={(value: unknown) => [`${value}${tempLabel}`, 'Temperature']}
            />
            <Area type="monotone" dataKey="temp" stroke="#60a5fa" strokeWidth={2.5} fill="url(#tempGradient)" dot={false} animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}
