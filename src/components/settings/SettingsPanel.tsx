/* ───────────────────────────────────────────────────
 *  SettingsPanel — Premium centered square modal
 * ─────────────────────────────────────────────────── */

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, RotateCcw, Sun as SunIcon, Thermometer, Wind, Gauge,
  Ruler, Clock, Sparkles, EyeOff, Settings,
} from 'lucide-react';
import { useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import type { ThemeMode, TempUnit, WindUnit, PressureUnit, DistanceUnit, TimeFormat } from '../../types/settings';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const {
    settings, setTheme, setTempUnit, setWindUnit,
    setPressureUnit, setDistanceUnit, setTimeFormat,
    setAnimations, setHighContrast, resetSettings,
  } = useSettings();

  // Lock body scroll when settings is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="settings-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Settings Centered Dialog Modal */}
          <motion.aside
            className="settings-panel glass-card"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="dialog"
            aria-label="App settings panel"
            aria-modal="true"
          >
            {/* Header */}
            <div className="settings-header">
              <div className="settings-title-group">
                <Settings size={18} className="settings-header-icon" />
                <h2>Preferences</h2>
              </div>
              <button onClick={onClose} aria-label="Close settings panel" className="settings-close-btn">
                <X size={18} />
              </button>
            </div>

            {/* Grid-based Content Body (fits without scrolling) */}
            <div className="settings-grid-body">
              {/* Col 1, Row 1: Theme */}
              <SettingGroup label="Theme Mode" icon={<SunIcon size={14} />}>
                <SegmentedControl
                  options={[
                    { value: 'light', label: '☀️ Light' },
                    { value: 'dark', label: '🌙 Dark' },
                    { value: 'system', label: '💻 System' },
                  ]}
                  value={settings.theme}
                  onChange={(v) => setTheme(v as ThemeMode)}
                />
              </SettingGroup>

              {/* Col 2, Row 1: Temperature */}
              <SettingGroup label="Temperature" icon={<Thermometer size={14} />}>
                <SegmentedControl
                  options={[{ value: 'celsius', label: 'Celsius (°C)' }, { value: 'fahrenheit', label: 'Fahrenheit (°F)' }]}
                  value={settings.tempUnit}
                  onChange={(v) => setTempUnit(v as TempUnit)}
                />
              </SettingGroup>

              {/* Col 1, Row 2: Wind Speed */}
              <SettingGroup label="Wind Speed" icon={<Wind size={14} />}>
                <SegmentedControl
                  options={[
                    { value: 'kmh', label: 'km/h' },
                    { value: 'ms', label: 'm/s' },
                    { value: 'mph', label: 'mph' },
                    { value: 'knots', label: 'kn' },
                  ]}
                  value={settings.windUnit}
                  onChange={(v) => setWindUnit(v as WindUnit)}
                />
              </SettingGroup>

              {/* Col 2, Row 2: Pressure */}
              <SettingGroup label="Atmospheric Pressure" icon={<Gauge size={14} />}>
                <SegmentedControl
                  options={[
                    { value: 'hpa', label: 'hPa' },
                    { value: 'mmhg', label: 'mmHg' },
                    { value: 'inhg', label: 'inHg' },
                  ]}
                  value={settings.pressureUnit}
                  onChange={(v) => setPressureUnit(v as PressureUnit)}
                />
              </SettingGroup>

              {/* Col 1, Row 3: Distance */}
              <SettingGroup label="Distance &amp; Visibility" icon={<Ruler size={14} />}>
                <SegmentedControl
                  options={[{ value: 'km', label: 'Kilometers' }, { value: 'miles', label: 'Miles' }]}
                  value={settings.distanceUnit}
                  onChange={(v) => setDistanceUnit(v as DistanceUnit)}
                />
              </SettingGroup>

              {/* Col 2, Row 3: Time Format */}
              <SettingGroup label="Time Format" icon={<Clock size={14} />}>
                <SegmentedControl
                  options={[{ value: '24h', label: '24-Hour' }, { value: '12h', label: '12-Hour' }]}
                  value={settings.timeFormat}
                  onChange={(v) => setTimeFormat(v as TimeFormat)}
                />
              </SettingGroup>

              {/* Col 1, Row 4: Animations */}
              <SettingGroup label="Animations" icon={<Sparkles size={14} />}>
                <div className="setting-toggle-row">
                  <span className="setting-toggle-desc">Enable smooth motions</span>
                  <ToggleSwitch checked={settings.animations} onChange={setAnimations} label="Toggle animations" />
                </div>
              </SettingGroup>

              {/* Col 2, Row 4: High Contrast */}
              <SettingGroup label="High Contrast" icon={<EyeOff size={14} />}>
                <div className="setting-toggle-row">
                  <span className="setting-toggle-desc">Increase readability</span>
                  <ToggleSwitch checked={settings.highContrast} onChange={setHighContrast} label="Toggle contrast" />
                </div>
              </SettingGroup>
            </div>

            {/* Footer reset button */}
            <div className="settings-footer">
              <button className="settings-reset-btn" onClick={resetSettings}>
                <RotateCcw size={13} /> Reset Preferences to Defaults
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SettingGroup({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="setting-grid-item">
      <div className="setting-item-label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="setting-item-content">
        {children}
      </div>
    </div>
  );
}

function SegmentedControl({ options, value, onChange }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="segmented-control" role="radiogroup">
      {options.map(opt => (
        <button
          key={opt.value}
          className={`segment ${value === opt.value ? 'segment-active' : ''}`}
          onClick={() => onChange(opt.value)}
          role="radio"
          aria-checked={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      className={`toggle-switch ${checked ? 'toggle-on' : ''}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <div className="toggle-thumb" />
    </button>
  );
}
