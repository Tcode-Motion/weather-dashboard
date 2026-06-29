/* ───────────────────────────────────────────────────
 *  Settings & Preferences Types
 * ─────────────────────────────────────────────────── */

export type ThemeMode = 'light' | 'dark' | 'system';
export type TempUnit = 'celsius' | 'fahrenheit';
export type WindUnit = 'ms' | 'kmh' | 'mph' | 'knots';
export type PressureUnit = 'hpa' | 'mmhg' | 'inhg';
export type DistanceUnit = 'km' | 'miles';
export type TimeFormat = '12h' | '24h';

export interface AppSettings {
  theme: ThemeMode;
  tempUnit: TempUnit;
  windUnit: WindUnit;
  pressureUnit: PressureUnit;
  distanceUnit: DistanceUnit;
  timeFormat: TimeFormat;
  animations: boolean;
  highContrast: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  tempUnit: 'celsius',
  windUnit: 'kmh',
  pressureUnit: 'hpa',
  distanceUnit: 'km',
  timeFormat: '12h',
  animations: true,
  highContrast: false,
};
