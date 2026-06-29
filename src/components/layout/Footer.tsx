/* ───────────────────────────────────────────────────
 *  Footer — Rich App Footer with credits and developer details
 * ─────────────────────────────────────────────────── */

import { CloudSun, ExternalLink, Keyboard, User, Heart, Shield, Code } from 'lucide-react';
import './Footer.css';

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'],  action: 'Focus search' },
  { keys: ['Ctrl', 'R'],  action: 'Refresh data' },
  { keys: ['Ctrl', ','],  action: 'Open settings' },
  { keys: ['↑', '↓'],    action: 'Navigate results' },
  { keys: ['Enter'],       action: 'Select result' },
  { keys: ['Esc'],         action: 'Close panel' },
];

export default function Footer() {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-inner">
        {/* Brand Column */}
        <div className="footer-brand">
          <div className="footer-logo">
            <CloudSun size={24} strokeWidth={1.4} />
            <span>Nimbus</span>
          </div>
          <p className="footer-tagline">
            A premium, high-performance open-source weather platform.<br />
            Free forever — no tracking, no API keys, fully offline capable.
          </p>
          <div className="footer-badges">
            <span className="footer-badge">🌐 Open-Meteo</span>
            <span className="footer-badge">🗺️ OpenStreetMap</span>
            <span className="footer-badge">⚛️ React + TS</span>
            <span className="footer-badge">🍃 PWA Caching</span>
          </div>
        </div>

        {/* Data Sources Column */}
        <div className="footer-col">
          <h3 className="footer-col-title">Data Services</h3>
          <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="footer-link">
            <ExternalLink size={12} /> Open-Meteo API
          </a>
          <a href="https://nominatim.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="footer-link">
            <ExternalLink size={12} /> OSM Geocoding
          </a>
          <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="footer-link">
            <ExternalLink size={12} /> Map Radar Tiles
          </a>
          <a href="https://ipapi.co" target="_blank" rel="noopener noreferrer" className="footer-link">
            <ExternalLink size={12} /> ipapi.co (IP Fallback)
          </a>
        </div>

        {/* About the Developer Column */}
        <div className="footer-col">
          <h3 className="footer-col-title"><User size={13} /> The Project</h3>
          <a href="https://github.com/Tcode-Motion" target="_blank" rel="noopener noreferrer" className="footer-link">
            <Code size={12} /> Creator Github
          </a>
          <a href="https://github.com/Tcode-Motion/weather-dashboard" target="_blank" rel="noopener noreferrer" className="footer-link">
            <Code size={12} /> Source Code
          </a>
          <span className="footer-link-text">
            <Shield size={12} /> MIT License
          </span>
          <span className="footer-link-text">
            <Heart size={12} style={{ color: '#ef4444' }} /> Made for everyone
          </span>
        </div>

        {/* Keyboard Shortcuts Column */}
        <div className="footer-col">
          <h3 className="footer-col-title"><Keyboard size={13} /> Keyboard Shortcuts</h3>
          <div className="footer-shortcuts">
            {SHORTCUTS.map(s => (
              <div key={s.action} className="footer-shortcut">
                <div className="footer-keys">
                  {s.keys.map(k => <kbd key={k}>{k}</kbd>)}
                </div>
                <span>{s.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Nimbus Weather · Designed and Coded by <strong>Tcode-Motion</strong></p>
        <p>Weather data © Open-Meteo · Map © OpenStreetMap contributors</p>
      </div>
    </footer>
  );
}
