/* ───────────────────────────────────────────────────
 *  WeatherCharts — Interactive multi-metric charts
 * ─────────────────────────────────────────────────── */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import GlassCard from '../ui/GlassCard';
import { useWeather } from '../../contexts/WeatherContext';
import { useSettings } from '../../contexts/SettingsContext';
import { convertTemp, convertWind } from '../../utils/units';
import { formatHour } from '../../utils/formatters';
import './WeatherCharts.css';

type ChartType = 'temperature' | 'humidity' | 'wind' | 'pressure' | 'rain' | 'uv' | 'clouds';

const CHART_CONFIGS: Record<ChartType, { label: string; color: string; unit: string }> = {
  temperature: { label: 'Temperature', color: '#f97316', unit: '°' },
  humidity:    { label: 'Humidity',     color: '#3b82f6', unit: '%' },
  wind:        { label: 'Wind Speed',   color: '#06b6d4', unit: '' },
  pressure:    { label: 'Pressure',     color: '#8b5cf6', unit: ' hPa' },
  rain:        { label: 'Rain Probability', color: '#60a5fa', unit: '%' },
  uv:          { label: 'UV Index',     color: '#eab308', unit: '' },
  clouds:      { label: 'Cloud Cover',  color: '#94a3b8', unit: '%' },
};

export default function WeatherCharts() {
  const { weatherData } = useWeather();
  const { settings } = useSettings();
  const [activeChart, setActiveChart] = useState<ChartType>('temperature');

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
        temperature: Math.round(convertTemp(hourly.temperature[d.idx], settings.tempUnit)),
        humidity: hourly.humidity[d.idx],
        wind: Math.round(convertWind(hourly.windSpeed[d.idx], settings.windUnit) * 10) / 10,
        pressure: Math.round(hourly.pressure[d.idx]),
        rain: hourly.precipitationProbability[d.idx] ?? 0,
        uv: hourly.uvIndex[d.idx] ?? 0,
        clouds: hourly.cloudCover[d.idx],
      }));
  }, [weatherData, settings.tempUnit, settings.windUnit, settings.timeFormat]);

  if (!weatherData || chartData.length === 0) return null;

  const config = CHART_CONFIGS[activeChart];
  const tooltipStyle = {
    background: 'rgba(15, 15, 30, 0.9)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#f0f0f5',
    fontSize: '13px',
  };

  const renderChart = () => {
    const commonProps = { data: chartData, margin: { top: 10, right: 10, left: -20, bottom: 0 } };

    if (activeChart === 'rain') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} tickLine={false} axisLine={false} interval={3} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v}${config.unit}`, config.label]} />
          <Bar dataKey={activeChart} fill={config.color} radius={[4, 4, 0, 0]} animationDuration={800} />
        </BarChart>
      );
    }

    if (activeChart === 'pressure') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} tickLine={false} axisLine={false} interval={3} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v}${config.unit}`, config.label]} />
          <Line type="monotone" dataKey={activeChart} stroke={config.color} strokeWidth={2.5} dot={false} animationDuration={800} />
        </LineChart>
      );
    }

    return (
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id={`grad-${activeChart}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={config.color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={config.color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} tickLine={false} axisLine={false} interval={3} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v}${config.unit}`, config.label]} />
        <Area type="monotone" dataKey={activeChart} stroke={config.color} strokeWidth={2.5} fill={`url(#grad-${activeChart})`} dot={false} animationDuration={800} />
      </AreaChart>
    );
  };

  return (
    <motion.section
      className="weather-charts"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      aria-label="Weather charts"
    >
      <h2 className="section-title">Weather Charts</h2>

      <div className="chart-tabs" role="tablist" aria-label="Chart type selector">
        {(Object.keys(CHART_CONFIGS) as ChartType[]).map(key => (
          <button
            key={key}
            className={`chart-tab ${activeChart === key ? 'chart-tab-active' : ''}`}
            onClick={() => setActiveChart(key)}
            role="tab"
            aria-selected={activeChart === key}
            style={activeChart === key ? { borderColor: CHART_CONFIGS[key].color, color: CHART_CONFIGS[key].color } : {}}
          >
            {CHART_CONFIGS[key].label}
          </button>
        ))}
      </div>

      <GlassCard className="chart-container" hoverable={false}>
        <ResponsiveContainer width="100%" height={280}>
          {renderChart()}
        </ResponsiveContainer>
      </GlassCard>
    </motion.section>
  );
}
