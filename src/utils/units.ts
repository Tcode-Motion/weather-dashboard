/* ───────────────────────────────────────────────────
 *  Unit Conversion Utilities
 * ─────────────────────────────────────────────────── */

import type { TempUnit, WindUnit, PressureUnit, DistanceUnit } from '../types/settings';

// ── Temperature ──────────────────────────────────
export function convertTemp(celsius: number, unit: TempUnit): number {
  if (unit === 'fahrenheit') return celsius * 9 / 5 + 32;
  return celsius;
}

export function tempUnitLabel(unit: TempUnit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

// ── Wind Speed (Open-Meteo returns km/h) ─────────
export function convertWind(kmh: number, unit: WindUnit): number {
  switch (unit) {
    case 'ms':    return kmh / 3.6;
    case 'mph':   return kmh / 1.609344;
    case 'knots': return kmh / 1.852;
    default:      return kmh;
  }
}

export function windUnitLabel(unit: WindUnit): string {
  switch (unit) {
    case 'ms':    return 'm/s';
    case 'mph':   return 'mph';
    case 'knots': return 'kn';
    default:      return 'km/h';
  }
}

// ── Pressure (Open-Meteo returns hPa) ────────────
export function convertPressure(hpa: number, unit: PressureUnit): number {
  switch (unit) {
    case 'mmhg': return hpa * 0.750062;
    case 'inhg': return hpa * 0.02953;
    default:     return hpa;
  }
}

export function pressureUnitLabel(unit: PressureUnit): string {
  switch (unit) {
    case 'mmhg': return 'mmHg';
    case 'inhg': return 'inHg';
    default:     return 'hPa';
  }
}

// ── Distance / Visibility (Open-Meteo returns m) ─
export function convertDistance(meters: number, unit: DistanceUnit): number {
  if (unit === 'miles') return meters / 1609.344;
  return meters / 1000; // km
}

export function distanceUnitLabel(unit: DistanceUnit): string {
  return unit === 'miles' ? 'mi' : 'km';
}

// ── Wind Direction ───────────────────────────────
const DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                     'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'] as const;

export function degreesToDirection(deg: number): string {
  const idx = Math.round(((deg % 360 + 360) % 360) / 22.5) % 16;
  return DIRECTIONS[idx];
}
