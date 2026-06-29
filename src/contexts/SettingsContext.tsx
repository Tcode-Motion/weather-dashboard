/* ───────────────────────────────────────────────────
 *  Settings Context — Global preferences state
 * ─────────────────────────────────────────────────── */

import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { AppSettings, ThemeMode, TempUnit, WindUnit, PressureUnit, DistanceUnit, TimeFormat } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';

interface SettingsContextValue {
  settings: AppSettings;
  setTheme: (theme: ThemeMode) => void;
  setTempUnit: (unit: TempUnit) => void;
  setWindUnit: (unit: WindUnit) => void;
  setPressureUnit: (unit: PressureUnit) => void;
  setDistanceUnit: (unit: DistanceUnit) => void;
  setTimeFormat: (format: TimeFormat) => void;
  setAnimations: (on: boolean) => void;
  setHighContrast: (on: boolean) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useLocalStorage<AppSettings>('nimbus_settings', DEFAULT_SETTINGS);

  // Apply theme to document
  useEffect(() => {
    // Migration for new defaults: dark mode and 12h clock
    const migrated = localStorage.getItem('nimbus_settings_migrated_v2');
    if (!migrated) {
      localStorage.setItem('nimbus_settings_migrated_v2', 'true');
      setSettings(prev => ({
        ...prev,
        theme: 'dark',
        timeFormat: '12h',
      }));
    }
  }, [setSettings]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    let effectiveTheme: 'light' | 'dark' = 'dark';

    if (settings.theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = settings.theme;
    }

    root.setAttribute('data-theme', effectiveTheme);
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('reduce-motion', !settings.animations);
  }, [settings.theme, settings.highContrast, settings.animations]);

  const update = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, [setSettings]);

  const value: SettingsContextValue = {
    settings,
    setTheme: (v) => update('theme', v),
    setTempUnit: (v) => update('tempUnit', v),
    setWindUnit: (v) => update('windUnit', v),
    setPressureUnit: (v) => update('pressureUnit', v),
    setDistanceUnit: (v) => update('distanceUnit', v),
    setTimeFormat: (v) => update('timeFormat', v),
    setAnimations: (v) => update('animations', v),
    setHighContrast: (v) => update('highContrast', v),
    resetSettings: () => setSettings(DEFAULT_SETTINGS),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
