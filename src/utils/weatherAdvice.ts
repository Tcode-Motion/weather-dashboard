/* ───────────────────────────────────────────────────
 *  Weather Intelligence — Smart Advice Engine
 *  Rule-based system computing lifestyle suggestions
 * ─────────────────────────────────────────────────── */

import type { CurrentWeather, WeatherAdvice, WeatherTrend, HourlyData } from '../types/weather';
import { getMoonPhase } from './moonPhase';

export function generateWeatherAdvice(current: CurrentWeather): WeatherAdvice {
  const { temperature: temp, feelsLike, humidity, windSpeed, uvIndex, cloudCover, precipitation, weatherCode } = current;
  const isRaining = precipitation > 0 || [51,53,55,61,63,65,80,81,82].includes(weatherCode);

  return {
    clothing:       getClothingSuggestion(feelsLike, windSpeed, isRaining),
    umbrella:       getUmbrellaSuggestion(isRaining, weatherCode),
    sunProtection:  getSunProtection(uvIndex),
    hydration:      getHydration(temp, humidity),
    outdoor:        getOutdoorScore(temp, humidity, windSpeed, isRaining, uvIndex),
    running:        getRunningScore(temp, humidity, windSpeed, isRaining),
    cycling:        getCyclingScore(temp, windSpeed, isRaining, cloudCover),
    photography:    getPhotographyScore(cloudCover, humidity, windSpeed),
    stargazing:     getStargazingScore(cloudCover, current.isDay),
    sleepComfort:   getSleepComfort(temp, humidity),
    plantWatering:  getPlantWatering(temp, humidity, isRaining),
    fishing:        getFishingScore(windSpeed, cloudCover),
  };
}

function getClothingSuggestion(feelsLike: number, wind: number, rain: boolean): string {
  let suggestion = '';
  if (feelsLike <= 0) suggestion = '🧥 Heavy winter coat, layers, gloves, and scarf';
  else if (feelsLike <= 10) suggestion = '🧥 Warm jacket and layers recommended';
  else if (feelsLike <= 18) suggestion = '🧶 Light jacket or sweater';
  else if (feelsLike <= 25) suggestion = '👕 Light, comfortable clothing';
  else if (feelsLike <= 32) suggestion = '🩳 Light, breathable fabrics';
  else suggestion = '🥵 Minimal, UV-protective clothing. Stay cool!';

  if (rain) suggestion += ' + 🌂 waterproof layer';
  if (wind > 30) suggestion += ' + windbreaker';
  return suggestion;
}

function getUmbrellaSuggestion(raining: boolean, code: number): string {
  if ([95,96,99].includes(code)) return '⛈️ Stay indoors if possible — thunderstorms!';
  if ([65,82].includes(code)) return '☔ Definitely bring an umbrella — heavy rain';
  if (raining) return '🌂 Bring an umbrella — rain expected';
  return '☀️ No umbrella needed';
}

function getSunProtection(uv: number): string {
  if (uv <= 2)  return '😎 Low UV — no protection needed';
  if (uv <= 5)  return '🧴 Moderate UV — sunscreen SPF 30+ recommended';
  if (uv <= 7)  return '🧴 High UV — sunscreen, hat, and sunglasses recommended';
  if (uv <= 10) return '⚠️ Very high UV — seek shade, SPF 50+, protective clothing';
  return '🚨 Extreme UV — avoid outdoor exposure between 10am–4pm';
}

function getHydration(temp: number, humidity: number): string {
  const heatIndex = temp + (humidity > 40 ? (humidity - 40) * 0.1 : 0);
  if (heatIndex > 35) return '🚨 Critical — drink water every 15 minutes';
  if (heatIndex > 30) return '💧 Stay well hydrated — drink water frequently';
  if (heatIndex > 25) return '💧 Remember to drink water regularly';
  return '💧 Normal hydration is fine';
}

function getOutdoorScore(temp: number, humidity: number, wind: number, rain: boolean, uv: number): { score: number; label: string; description: string } {
  let score = 100;
  score -= Math.min(Math.abs(temp - 22) * 3, 30);
  score -= Math.min(Math.abs(humidity - 50) * 0.4, 15);
  if (wind > 25) score -= 15;
  if (rain) score -= 25;
  if (uv > 8) score -= 10;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label: string, description: string;
  if (score >= 80)      { label = 'Excellent'; description = 'Perfect weather for outdoor activities!'; }
  else if (score >= 60) { label = 'Good';      description = 'Great conditions with minor caveats.'; }
  else if (score >= 40) { label = 'Fair';      description = 'Manageable but not ideal outdoors.'; }
  else if (score >= 20) { label = 'Poor';      description = 'Consider indoor alternatives.'; }
  else                  { label = 'Bad';       description = 'Best to stay indoors.'; }

  return { score, label, description };
}

function getRunningScore(temp: number, humidity: number, wind: number, rain: boolean): { score: number; label: string } {
  let score = 100;
  score -= Math.min(Math.abs(temp - 15) * 2.5, 35);
  if (humidity > 70) score -= 15;
  if (wind > 30) score -= 15;
  if (rain) score -= 20;
  score = Math.max(0, Math.min(100, Math.round(score)));
  const label = score >= 70 ? 'Great' : score >= 40 ? 'Okay' : 'Not recommended';
  return { score, label };
}

function getCyclingScore(temp: number, wind: number, rain: boolean, cloud: number): { score: number; label: string } {
  let score = 100;
  score -= Math.min(Math.abs(temp - 20) * 2, 25);
  if (wind > 20) score -= Math.min((wind - 20) * 2, 30);
  if (rain) score -= 30;
  if (cloud > 90) score -= 5;
  score = Math.max(0, Math.min(100, Math.round(score)));
  const label = score >= 70 ? 'Great' : score >= 40 ? 'Okay' : 'Not recommended';
  return { score, label };
}

function getPhotographyScore(cloud: number, humidity: number, wind: number): { score: number; label: string; tip: string } {
  let score = 70;
  // Interesting clouds are good for photography
  if (cloud >= 20 && cloud <= 60) score += 20;
  if (cloud < 10) score += 5;
  if (humidity > 85) score -= 15; // hazy
  if (wind > 25) score -= 10;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let tip: string;
  if (cloud >= 20 && cloud <= 60) tip = '☁️ Great cloud formations for dramatic shots';
  else if (cloud < 10) tip = '☀️ Clear skies — great for landscapes';
  else tip = '🌫️ Overcast — soft diffused light, good for portraits';

  const label = score >= 70 ? 'Great' : score >= 40 ? 'Good' : 'Fair';
  return { score, label, tip };
}

function getStargazingScore(cloud: number, isDay: boolean): { score: number; label: string } {
  if (isDay) return { score: 0, label: 'Wait for nighttime' };
  let score = 100;
  score -= cloud; // cloud cover directly reduces score
  const moonPhase = getMoonPhase();
  // Full moon (0.5) reduces stargazing due to light
  score -= Math.round((1 - Math.abs(moonPhase - 0.5) * 2) * 20);
  score = Math.max(0, Math.min(100, Math.round(score)));
  const label = score >= 70 ? 'Excellent' : score >= 40 ? 'Fair' : 'Poor';
  return { score, label };
}

function getSleepComfort(temp: number, humidity: number): { score: number; label: string } {
  let score = 100;
  // Ideal sleep: 16-19°C, 40-60% humidity
  score -= Math.min(Math.abs(temp - 17.5) * 5, 40);
  score -= Math.min(Math.abs(humidity - 50) * 0.6, 25);
  score = Math.max(0, Math.min(100, Math.round(score)));
  const label = score >= 70 ? 'Comfortable' : score >= 40 ? 'Tolerable' : 'Uncomfortable';
  return { score, label };
}

function getPlantWatering(temp: number, humidity: number, rain: boolean): string {
  if (rain) return '🌧️ No need to water — nature is handling it!';
  if (temp > 30 && humidity < 40) return '🌱 Water plants twice today — hot and dry!';
  if (temp > 25) return '🌱 Water plants in early morning or evening';
  if (humidity > 70) return '🌱 Reduce watering — humidity is high';
  return '🌱 Normal watering schedule';
}

function getFishingScore(wind: number, cloud: number): { score: number; label: string } {
  let score = 70;
  // Light wind and overcast = good fishing
  if (wind >= 5 && wind <= 15) score += 15;
  if (wind > 25) score -= 20;
  if (cloud >= 50 && cloud <= 80) score += 15;
  score = Math.max(0, Math.min(100, Math.round(score)));
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Fair' : 'Poor';
  return { score, label };
}

// ── Weather Trends ──────────────────────────────

export function computeWeatherTrends(hourly: HourlyData): WeatherTrend {
  const now = new Date();
  const nowIdx = hourly.time.findIndex(t => new Date(t) >= now);
  const start = Math.max(0, nowIdx);
  const end = Math.min(start + 6, hourly.temperature.length - 1);

  if (end <= start) {
    return { temperature: 'stable', pressure: 'stable', humidity: 'stable', wind: 'stable' };
  }

  const trendCalc = (arr: number[]) => {
    const diff = arr[end] - arr[start];
    const threshold = (Math.max(...arr.slice(start, end + 1)) - Math.min(...arr.slice(start, end + 1))) * 0.2;
    if (diff > threshold) return 'up' as const;
    if (diff < -threshold) return 'down' as const;
    return 'stable' as const;
  };

  const tempTrend = trendCalc(hourly.temperature);
  const pressTrend = trendCalc(hourly.pressure);
  const humTrend = trendCalc(hourly.humidity);
  const windTrend = trendCalc(hourly.windSpeed);

  return {
    temperature: tempTrend === 'up' ? 'rising' : tempTrend === 'down' ? 'falling' : 'stable',
    pressure: pressTrend === 'up' ? 'rising' : pressTrend === 'down' ? 'falling' : 'stable',
    humidity: humTrend === 'up' ? 'rising' : humTrend === 'down' ? 'falling' : 'stable',
    wind: windTrend === 'up' ? 'increasing' : windTrend === 'down' ? 'decreasing' : 'stable',
  };
}
