/* ═══════════════════════════════════════════════════
 *  App.tsx — Root application component
 *  Nimbus Weather Platform
 *
 *  Layout order (priority high → low):
 *  1. WeatherHero        — current temp / condition
 *  2. HourlyForecast     — next 24h
 *  3. DailyForecast      — 7-day
 *  4. WeatherDetails     — (sidebar) all metrics
 *  5. AirQualityPanel    — (sidebar) AQI
 *  6. SunMoonPanel       — (sidebar) sun/moon
 *  7. WeatherCharts      — analysis
 *  8. WeatherMap         — map (lazy)
 *  9. WeatherAdvice      — tips
 * 10. FavoritesList      — saved cities
 * ═══════════════════════════════════════════════════ */

import { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsProvider } from './contexts/SettingsContext';
import { WeatherProvider, useWeather } from './contexts/WeatherContext';
import { ToastProvider } from './components/ui/Toast';
import DynamicBackground from './components/backgrounds/DynamicBackground';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LandingPage from './components/weather/LandingPage';
import WeatherHero from './components/weather/WeatherHero';
import WeatherDetails from './components/weather/WeatherDetails';
import HourlyForecast from './components/weather/HourlyForecast';
import DailyForecast from './components/weather/DailyForecast';
import WeatherAdvice from './components/weather/WeatherAdvice';
import FavoritesList from './components/favorites/FavoritesList';
import AirQualityPanel from './components/weather/AirQualityPanel';
import SunMoonPanel from './components/weather/SunMoonPanel';
import { SkeletonCard } from './components/ui/Skeleton';
import './styles/index.css';
import './styles/animations.css';
import './styles/layout.css';

// Lazy-loaded heavy components
const WeatherCharts = lazy(() => import('./components/charts/WeatherCharts'));
const WeatherMap    = lazy(() => import('./components/map/WeatherMap'));

function AppContent() {
  const { weatherData, loading, error } = useWeather();
  const showDashboard = weatherData || loading;

  return (
    <div className="app-layout">
      <Header />

      <main className="app-main" id="main-content">
        <AnimatePresence mode="wait">
          {/* ── Landing Page ─────────────────────── */}
          {!showDashboard && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <LandingPage />
            </motion.div>
          )}

          {/* ── Dashboard ────────────────────────── */}
          {showDashboard && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            >
              {/* Error banner (non-blocking) */}
              {error && !weatherData && (
                <div className="error-banner glass-card" role="alert">
                  <p>⚠️ {error}</p>
                  <p className="error-hint">Try searching a different city or check your connection.</p>
                </div>
              )}

              {/* Two-column grid */}
              <div className="content-grid">
                {/* ── Main Column (left) ──────────── */}
                <div className="col-main">
                  {/* P1: Current weather */}
                  <section id="weather-hero">
                    <WeatherHero />
                  </section>

                  {/* P2: Core forecasts */}
                  <section id="hourly-section">
                    <HourlyForecast />
                  </section>

                  <DailyForecast />

                  {/* P3: Analysis charts */}
                  <Suspense fallback={<SkeletonCard height="360px" />}>
                    <WeatherCharts />
                  </Suspense>

                  {/* P4: Map (lazy) */}
                  <section id="weather-map">
                    <Suspense fallback={<SkeletonCard height="400px" />}>
                      <WeatherMap />
                    </Suspense>
                  </section>

                  {/* P5: Tips and extras */}
                  <WeatherAdvice />

                  <section id="favorites-section">
                    <FavoritesList />
                  </section>
                </div>

                {/* ── Sidebar (right) ─────────────── */}
                <div className="col-side">
                  {/* P1 sidebar: All metrics */}
                  <WeatherDetails />
                  {/* P2 sidebar: Air quality */}
                  <AirQualityPanel />
                  {/* P3 sidebar: Sun & Moon */}
                  <SunMoonPanel />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <WeatherProvider>
        <ToastProvider>
          <DynamicBackground />
          <AppContent />
        </ToastProvider>
      </WeatherProvider>
    </SettingsProvider>
  );
}
