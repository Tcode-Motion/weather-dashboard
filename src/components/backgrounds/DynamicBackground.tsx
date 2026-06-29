/* ───────────────────────────────────────────────────
 *  DynamicBackground — Weather-reactive animated BG
 * ─────────────────────────────────────────────────── */

import { useEffect, useRef, useMemo } from 'react';
import { useWeather } from '../../contexts/WeatherContext';
import { useSettings } from '../../contexts/SettingsContext';
import { getConditionFromCode } from '../../utils/weatherCodes';
import { WEATHER_THEMES, getWeatherThemeKey } from '../../constants/theme';
import type { TimeOfDay } from '../../types/weather';
import './DynamicBackground.css';

export default function DynamicBackground() {
  const { weatherData } = useWeather();
  const { settings } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const { themeKey, condition } = useMemo(() => {
    if (!weatherData) {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = settings.theme === 'dark' || (settings.theme === 'system' && isSystemDark);
      return { themeKey: isDark ? 'landing-dark' : 'landing-light', condition: 'clear' as const };
    }
    const cond = getConditionFromCode(weatherData.current.weatherCode);
    const tod: TimeOfDay = weatherData.current.isDay ? 'day' : 'night';
    return { themeKey: getWeatherThemeKey(cond, tod), condition: cond };
  }, [weatherData, settings.theme]);

  const theme = WEATHER_THEMES[themeKey] ?? WEATHER_THEMES['clear-day'];

  // Canvas particle effects
  useEffect(() => {
    if (!settings.animations) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles based on weather
    const initParticles = () => {
      const count = condition === 'rain' ? 120 :
                    condition === 'snow' ? 80 :
                    condition === 'thunderstorm' ? 150 :
                    condition === 'clear' && !weatherData?.current.isDay ? 60 : 0;

      particlesRef.current = Array.from({ length: count }, () => createParticle(canvas, condition));
    };

    initParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(p => {
        updateParticle(p, canvas, condition);
        drawParticle(ctx, p, condition);
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [condition, settings.animations, weatherData?.current.isDay]);

  return (
    <div className="dynamic-background" aria-hidden="true">
      <div
        className="gradient-layer"
        style={{
          background: `linear-gradient(135deg, ${theme.gradientStart} 0%, ${theme.gradientMid} 50%, ${theme.gradientEnd} 100%)`,
        }}
      />
      {settings.animations && <canvas ref={canvasRef} className="particles-canvas" />}
      <div className="noise-overlay" />
    </div>
  );
}

// ── Particle System ──────────────────────────────

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

function createParticle(canvas: HTMLCanvasElement, condition: string): Particle {
  const base: Particle = {
    x: Math.random() * canvas.width,
    y: -10,
    vx: 0, vy: 0,
    size: 2,
    opacity: Math.random() * 0.5 + 0.3,
    life: 0,
    maxLife: 1000,
  };

  switch (condition) {
    case 'rain':
    case 'drizzle':
      return { ...base, y: Math.random() * -canvas.height, vx: -1, vy: 12 + Math.random() * 8, size: 1.5, maxLife: canvas.height };
    case 'thunderstorm':
      return { ...base, y: Math.random() * -canvas.height, vx: -2, vy: 15 + Math.random() * 10, size: 2, maxLife: canvas.height };
    case 'snow':
    case 'sleet':
      return { ...base, y: Math.random() * -100, vx: Math.random() * 2 - 1, vy: 1 + Math.random() * 2, size: 2 + Math.random() * 3, maxLife: canvas.height + 200 };
    default: // stars
      return { ...base, x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: 0, vy: 0, size: 1 + Math.random() * 2, opacity: Math.random(), maxLife: Infinity };
  }
}

function updateParticle(p: Particle, canvas: HTMLCanvasElement, condition: string) {
  p.x += p.vx;
  p.y += p.vy;
  p.life++;

  if (condition === 'snow' || condition === 'sleet') {
    p.vx = Math.sin(p.life * 0.02) * 0.5;
  }

  // Stars twinkle
  if (condition === 'clear') {
    p.opacity = 0.3 + Math.sin(p.life * 0.03 + p.x) * 0.4;
  }

  // Reset if off-screen
  if (p.y > canvas.height + 10 || p.x < -10 || p.x > canvas.width + 10) {
    p.x = Math.random() * canvas.width;
    p.y = -10;
    p.life = 0;
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle, condition: string) {
  ctx.save();
  ctx.globalAlpha = p.opacity;

  switch (condition) {
    case 'rain':
    case 'drizzle':
    case 'thunderstorm':
      ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
      ctx.lineWidth = p.size * 0.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2);
      ctx.stroke();
      break;

    case 'snow':
    case 'sleet':
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;

    default: // stars
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
}
