/* ───────────────────────────────────────────────────
 *  WeatherAdvice — Smart lifestyle suggestions
 * ─────────────────────────────────────────────────── */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Shirt, Umbrella, Footprints, Bike, Camera, Star, Moon, Droplets, Fish,
  TreePine, Sun as SunIcon, Activity,
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useWeather } from '../../contexts/WeatherContext';
import { generateWeatherAdvice, computeWeatherTrends } from '../../utils/weatherAdvice';
import './WeatherAdvice.css';

export default function WeatherAdvice() {
  const { weatherData } = useWeather();

  const advice = useMemo(() => {
    if (!weatherData) return null;
    return generateWeatherAdvice(weatherData.current);
  }, [weatherData]);

  const trends = useMemo(() => {
    if (!weatherData) return null;
    return computeWeatherTrends(weatherData.hourly);
  }, [weatherData]);

  if (!advice || !weatherData) return null;

  const trendArrow = (trend: string) => {
    if (trend === 'rising' || trend === 'increasing') return '↗️';
    if (trend === 'falling' || trend === 'decreasing') return '↘️';
    return '→';
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return 'var(--color-success)';
    if (score >= 40) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const items = [
    { icon: Shirt, title: 'Clothing', text: advice.clothing },
    { icon: Umbrella, title: 'Umbrella', text: advice.umbrella },
    { icon: SunIcon, title: 'Sun Protection', text: advice.sunProtection },
    { icon: Droplets, title: 'Hydration', text: advice.hydration },
    { icon: Activity, title: 'Outdoor Score', text: `${advice.outdoor.score}/100 — ${advice.outdoor.description}`, score: advice.outdoor.score },
    { icon: Footprints, title: 'Running', text: `${advice.running.score}/100 — ${advice.running.label}`, score: advice.running.score },
    { icon: Bike, title: 'Cycling', text: `${advice.cycling.score}/100 — ${advice.cycling.label}`, score: advice.cycling.score },
    { icon: Camera, title: 'Photography', text: `${advice.photography.score}/100 — ${advice.photography.tip}`, score: advice.photography.score },
    { icon: Star, title: 'Stargazing', text: `${advice.stargazing.score}/100 — ${advice.stargazing.label}`, score: advice.stargazing.score },
    { icon: Moon, title: 'Sleep Comfort', text: `${advice.sleepComfort.score}/100 — ${advice.sleepComfort.label}`, score: advice.sleepComfort.score },
    { icon: TreePine, title: 'Plant Care', text: advice.plantWatering },
    { icon: Fish, title: 'Fishing', text: `${advice.fishing.score}/100 — ${advice.fishing.label}`, score: advice.fishing.score },
  ];

  return (
    <motion.section
      className="weather-advice"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      aria-label="Weather intelligence and advice"
    >
      <h2 className="section-title">Weather Intelligence</h2>

      {trends && (
        <div className="trends-bar glass-card">
          <span className="trend-item">🌡️ Temp {trendArrow(trends.temperature)} {trends.temperature}</span>
          <span className="trend-item">💨 Wind {trendArrow(trends.wind)} {trends.wind}</span>
          <span className="trend-item">💧 Humidity {trendArrow(trends.humidity)} {trends.humidity}</span>
          <span className="trend-item">🔵 Pressure {trendArrow(trends.pressure)} {trends.pressure}</span>
        </div>
      )}

      <div className="advice-grid">
        {items.map((item, i) => (
          <GlassCard key={item.title} delay={i * 0.03} className="advice-card">
            <div className="advice-header">
              <item.icon size={18} style={{ color: item.score !== undefined ? scoreColor(item.score) : 'var(--color-accent)' }} />
              <span className="advice-title">{item.title}</span>
              {item.score !== undefined && (
                <div className="advice-score-bar">
                  <div className="advice-score-fill" style={{ width: `${item.score}%`, background: scoreColor(item.score) }} />
                </div>
              )}
            </div>
            <p className="advice-text">{item.text}</p>
          </GlassCard>
        ))}
      </div>
    </motion.section>
  );
}
