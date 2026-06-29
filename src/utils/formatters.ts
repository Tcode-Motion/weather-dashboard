/* ───────────────────────────────────────────────────
 *  Formatting Utilities
 * ─────────────────────────────────────────────────── */

import type { TimeFormat } from '../types/settings';

export function formatTime(isoString: string, format: TimeFormat): string {
  const date = new Date(isoString);
  if (format === '12h') {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatDayName(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function formatHour(isoString: string, format: TimeFormat): string {
  const date = new Date(isoString);
  if (format === '12h') {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  }
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getUVLabel(uv: number): { label: string; color: string } {
  if (uv <= 2)  return { label: 'Low',       color: '#4ade80' };
  if (uv <= 5)  return { label: 'Moderate',   color: '#fbbf24' };
  if (uv <= 7)  return { label: 'High',       color: '#fb923c' };
  if (uv <= 10) return { label: 'Very High',  color: '#ef4444' };
  return              { label: 'Extreme',     color: '#a855f7' };
}

export function getAQILabel(aqi: number): { label: string; color: string } {
  if (aqi <= 50)  return { label: 'Good',                 color: '#4ade80' };
  if (aqi <= 100) return { label: 'Moderate',             color: '#fbbf24' };
  if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', color: '#fb923c' };
  if (aqi <= 200) return { label: 'Unhealthy',            color: '#ef4444' };
  if (aqi <= 300) return { label: 'Very Unhealthy',       color: '#a855f7' };
  return                 { label: 'Hazardous',            color: '#991b1b' };
}

export function getComfortLabel(score: number): { label: string; emoji: string } {
  if (score >= 80) return { label: 'Excellent', emoji: '😊' };
  if (score >= 60) return { label: 'Good',      emoji: '🙂' };
  if (score >= 40) return { label: 'Fair',      emoji: '😐' };
  if (score >= 20) return { label: 'Poor',      emoji: '😟' };
  return                  { label: 'Bad',       emoji: '😫' };
}

/** Compute a 0-100 comfort score from temp, humidity, and wind */
export function computeComfortIndex(temp: number, humidity: number, windSpeed: number): number {
  // Ideal: 20-25°C, 40-60% humidity, 5-15 km/h wind
  let score = 100;

  // Temperature penalty
  const tempDiff = Math.abs(temp - 22);
  score -= Math.min(tempDiff * 3, 40);

  // Humidity penalty
  const humDiff = Math.abs(humidity - 50);
  score -= Math.min(humDiff * 0.5, 25);

  // Wind penalty (too much or too little)
  if (windSpeed > 30) score -= Math.min((windSpeed - 30) * 1.5, 25);
  else if (windSpeed < 2) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}
