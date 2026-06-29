/* ───────────────────────────────────────────────────
 *  Header — Full navigation bar with nav links
 * ─────────────────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, RefreshCw, Download,
  WifiOff, LayoutDashboard, BarChart2, Map, Star, Menu, X, HelpCircle, Home,
} from 'lucide-react';
import SearchBar from '../search/SearchBar';
import SettingsPanel from '../settings/SettingsPanel';
import { useWeather } from '../../contexts/WeatherContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useOnline } from '../../hooks/useOnline';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import ExportModal from '../export/ExportModal';
import './Header.css';

const NAV_LINKS = [
  { label: 'Home',      icon: Home,            href: 'reset' },
  { label: 'Dashboard', icon: LayoutDashboard, href: '#weather-hero' },
  { label: 'Forecast',  icon: BarChart2,       href: '#hourly-section' },
  { label: 'Map',       icon: Map,             href: '#weather-map' },
  { label: 'Favorites', icon: Star,            href: '#favorites-section' },
];

const LANDING_NAV_LINKS = [
  { label: 'Home',            icon: LayoutDashboard, href: '.landing-page' },
  { label: 'Featured Cities', icon: Star,            href: '#featured-cities-section' },
  { label: 'Features',        icon: BarChart2,       href: '#features-section' },
  { label: 'Data Sources',    icon: Map,             href: '#data-sources-section' },
  { label: 'FAQ',             icon: HelpCircle,      href: '#faq-section' },
];

export default function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [clock, setClock] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { weatherData, refreshWeather, resetWeather, loading } = useWeather();
  const { settings } = useSettings();
  const isOnline = useOnline();

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString(settings.timeFormat === '12h' ? 'en-US' : 'en-GB', {
        hour: '2-digit', minute: '2-digit',
        hour12: settings.timeFormat === '12h',
      }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [settings.timeFormat]);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Track active section on scroll
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const sections = weatherData
      ? ['#weather-hero', '#hourly-section', '#weather-map', '#favorites-section']
      : ['.landing-page', '#featured-cities-section', '#features-section', '#data-sources-section', '#faq-section'];

    const observers = sections.map(selector => {
      const el = document.querySelector(selector);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(selector);
          }
        },
        { threshold: 0.15, rootMargin: '-64px 0px -40% 0px' }
      );

      observer.observe(el);
      return { observer, el, selector };
    });

    return () => {
      observers.forEach(o => {
        if (o) o.observer.unobserve(o.el);
      });
    };
  }, [weatherData]);

  useKeyboardShortcut({ key: ',', ctrl: true }, () => setSettingsOpen(true));
  useKeyboardShortcut({ key: 'r', ctrl: true }, refreshWeather);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(href);
    }
    setMobileNavOpen(false);
  };

  return (
    <>
      <motion.header
        className={`app-header ${scrolled ? 'app-header-scrolled' : ''}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        role="banner"
      >
        <div className="header-inner">
          {/* ── Left: Logo ──────────────────────────── */}
          <div className="header-left">
            <button
              className="header-logo"
              onClick={() => {
                if (weatherData) {
                  resetWeather();
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              aria-label="Nimbus — Home"
            >
              <span className="logo-cloud">⛅</span>
              <span className="logo-word">Nimbus</span>
            </button>
          </div>

          {/* ── Center: Navigation Buttons ────────────── */}
          <div className="header-center">
            <nav className="header-nav" aria-label="Main navigation">
              {(weatherData ? NAV_LINKS : LANDING_NAV_LINKS).map(link => (
                <button
                  key={link.label}
                  className={`nav-link ${activeSection === link.href ? 'nav-link-active' : ''}`}
                  onClick={() => {
                    if (link.href === 'reset') {
                      resetWeather();
                    } else {
                      scrollTo(link.href);
                    }
                  }}
                  aria-label={`Go to ${link.label}`}
                >
                  <link.icon size={14} />
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* ── Search Bar: Centered in the remaining blank space ── */}
          <div className="header-search-container">
            <SearchBar />
          </div>

          {/* ── Right: Actions ───────────────────────── */}
          <div className="header-right">
            {!isOnline && (
              <span className="offline-badge" aria-label="You are offline">
                <WifiOff size={13} /> Offline
              </span>
            )}

            <span className="header-clock" aria-label="Current time">{clock}</span>

            {weatherData && (
              <button
                className="header-icon-btn"
                onClick={refreshWeather}
                disabled={loading}
                aria-label="Refresh"
                title="Refresh (Ctrl+R)"
              >
                <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              </button>
            )}

            {/* Export */}
            {weatherData && (
              <button
                className="header-icon-btn"
                onClick={() => setExportModalOpen(true)}
                aria-label="Export"
                title="Export data"
              >
                <Download size={17} />
              </button>
            )}

            <button className="header-icon-btn" onClick={() => setSettingsOpen(true)} aria-label="Settings" title="Settings (Ctrl+,)">
              <Settings size={17} />
            </button>

            {/* Mobile menu toggle */}
            <button className="header-mobile-toggle" onClick={() => setMobileNavOpen(v => !v)} aria-label="Toggle menu">
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.nav
              className="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              aria-label="Mobile navigation"
            >
              {(weatherData ? NAV_LINKS : LANDING_NAV_LINKS).map(link => (
                <button
                  key={link.label}
                  className={`mobile-nav-link ${activeSection === link.href ? 'nav-link-active' : ''}`}
                  onClick={() => {
                    setMobileNavOpen(false);
                    if (link.href === 'reset') {
                      resetWeather();
                    } else {
                      scrollTo(link.href);
                    }
                  }}
                >
                  <link.icon size={16} /> {link.label}
                </button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ExportModal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} />
    </>
  );
}
