/* ───────────────────────────────────────────────────
 *  LandingPage — Rich Long-Form Landing Page
 *  Includes 8 global cities weather explorer, interactive
 *  feature templates, about developer/stack section, and FAQ.
 * ─────────────────────────────────────────────────── */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation, Search, CloudSun, Wind, Droplets, Thermometer,
  Eye, Zap, Globe, Loader2, Star, ChevronDown, HelpCircle,
  Code, User, Map, BarChart2, CheckCircle2, Database, ExternalLink,
} from 'lucide-react';
import { searchCities, searchResultToLocation } from '../../api/geocoding';
import { useWeather } from '../../contexts/WeatherContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useDebounce } from '../../hooks/useDebounce';
import type { SearchResult, GeoLocation } from '../../types/weather';
import WeatherIcon from '../ui/WeatherIcon';
import { getWeatherInfo } from '../../utils/weatherCodes';
import './LandingPage.css';

// 8 Featured cities across all continents
const FEATURED_CITIES = [
  { name: 'London',         lat: 51.5074, lon: -0.1278, country: 'United Kingdom', code: 'GB' },
  { name: 'New York',       lat: 40.7128, lon: -74.0060, country: 'United States',  code: 'US' },
  { name: 'Tokyo',          lat: 35.6762, lon: 139.6503, country: 'Japan',          code: 'JP' },
  { name: 'New Delhi',      lat: 28.6139, lon: 77.2090,  country: 'India',          code: 'IN' },
  { name: 'Paris',          lat: 48.8566, lon: 2.3522,   country: 'France',         code: 'FR' },
  { name: 'Sydney',         lat: -33.8688, lon: 151.2093, country: 'Australia',      code: 'AU' },
  { name: 'Cairo',          lat: 30.0444, lon: 31.2357,  country: 'Egypt',          code: 'EG' },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, country: 'Brazil',         code: 'BR' },
];

interface FeaturedWeatherData {
  name: string;
  lat: number;
  lon: number;
  country: string;
  countryCode: string;
  temp: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

// FAQ Component
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`faq-item ${isOpen ? 'faq-item-open' : ''}`}>
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
        <span>{question}</span>
        <ChevronDown size={16} className="faq-chevron" />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Floating stat pill
function StatPill({ icon: Icon, label, value, delay }: { icon: typeof Wind; label: string; value: string; delay: number }) {
  return (
    <motion.div
      className="landing-stat-pill"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      <Icon size={14} />
      <span className="pill-label">{label}</span>
      <span className="pill-value">{value}</span>
    </motion.div>
  );
}

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { fetchWeather, fetchWeatherByCoords } = useWeather();
  const { requestLocation, loading: geoLoading } = useGeolocation();
  const [geoStatus, setGeoStatus] = useState<'idle' | 'asking' | 'loading' | 'error'>('idle');

  // Debounced search logic for landing page
  const debouncedQuery = useDebounce(query, 280);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setResults([]); // Clear stale results immediately
    let active = true;
    setIsSearching(true);
    searchCities(debouncedQuery).then(r => {
      if (active) {
        setResults(r);
        setIsSearching(false);
      }
    });
    return () => { active = false; };
  }, [debouncedQuery]);

  // Featured cities weather state
  const [featuredData, setFeaturedData] = useState<FeaturedWeatherData[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // Fetch featured cities weather on mount
  useEffect(() => {
    let active = true;
    const fetchFeatured = async () => {
      try {
        const promises = FEATURED_CITIES.map(async city => {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m`;
          const res = await fetch(url);
          const data = await res.json();
          return {
            name: city.name,
            lat: city.lat,
            lon: city.lon,
            country: city.country,
            countryCode: city.code,
            temp: data.current.temperature_2m,
            weatherCode: data.current.weather_code,
            windSpeed: data.current.wind_speed_10m,
            humidity: data.current.relative_humidity_2m,
          };
        });
        const allData = await Promise.all(promises);
        if (active) {
          setFeaturedData(allData);
          setFeaturedLoading(false);
        }
      } catch {
        if (active) setFeaturedLoading(false);
      }
    };
    fetchFeatured();
    return () => { active = false; };
  }, []);

  // Search as user types
  const handleInput = useCallback((val: string) => {
    setQuery(val);
    setShowResults(val.length >= 2);
    setResults([]); // Clear stale results immediately on keystroke
  }, []);

  // Use browser/IP location
  const handleLocate = useCallback(() => {
    setGeoStatus('asking');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGeoStatus('loading');
          fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setGeoStatus('loading');
          requestLocation();
          import('../../api/geocoding').then(({ detectUserCountry }) => {
            detectUserCountry().then(info => {
              if (info) fetchWeatherByCoords(info.lat, info.lon);
              else setGeoStatus('error');
            });
          });
        },
        { timeout: 6000 },
      );
    } else {
      setGeoStatus('loading');
      import('../../api/geocoding').then(({ detectUserCountry }) => {
        detectUserCountry().then(info => {
          if (info) fetchWeatherByCoords(info.lat, info.lon);
          else setGeoStatus('error');
        });
      });
    }
  }, [fetchWeatherByCoords, requestLocation]);

  const selectCity = useCallback((r: SearchResult) => {
    const loc = searchResultToLocation(r);
    fetchWeather(loc);
  }, [fetchWeather]);

  const selectFeatured = useCallback((city: FeaturedWeatherData) => {
    const loc: GeoLocation = {
      name: city.name,
      latitude: city.lat,
      longitude: city.lon,
      country: city.country,
      countryCode: city.countryCode,
    };
    fetchWeather(loc);
  }, [fetchWeather]);

  const countryFlag = (code: string) => {
    if (!code || code.length !== 2) return '📍';
    const offset = 0x1F1E6;
    return code.toUpperCase().split('').map(c => String.fromCodePoint(offset + c.charCodeAt(0) - 65)).join('');
  };

  return (
    <div className="landing-page">
      {/* Animated background orbs */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      {/* Hero content */}
      <div className="landing-hero" id="landing-top">
        {/* Logo */}
        <motion.div
          className="landing-logo"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="landing-logo-icon"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CloudSun size={64} strokeWidth={1.3} />
          </motion.div>
          <div className="landing-logo-text">
            <h1>Nimbus</h1>
            <span>Weather Platform</span>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="landing-tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Real-time weather for <em>anywhere on Earth</em> —<br />
          no account, no API key, completely free.
        </motion.p>

        {/* Floating stat pills */}
        <div className="landing-pills">
          <StatPill icon={Thermometer} label="Live temp" value="Real-time" delay={0.4} />
          <StatPill icon={Wind} label="Wind"      value="Hourly"    delay={0.5} />
          <StatPill icon={Droplets} label="Rain"   value="7-day"    delay={0.6} />
          <StatPill icon={Eye} label="Visibility" value="Hourly"    delay={0.7} />
        </div>

        {/* Main CTAs */}
        <motion.div
          className="landing-ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {/* Locate button */}
          <button
            className="landing-btn landing-btn-primary"
            onClick={handleLocate}
            disabled={geoLoading || geoStatus === 'loading'}
            id="btn-use-location"
          >
            {geoStatus === 'loading' || geoLoading
              ? <><Loader2 size={18} className="animate-spin" /> Detecting location…</>
              : geoStatus === 'asking'
              ? <><Loader2 size={18} className="animate-spin" /> Requesting GPS…</>
              : <><Navigation size={18} /> Use My Location</>
            }
          </button>

          {/* Divider */}
          <div className="landing-or"><span>or</span></div>

          {/* Inline search */}
          <div className="landing-search-wrapper">
            <div className={`landing-search-box ${showResults && results.length > 0 ? 'landing-search-open' : ''}`}>
              <Search size={18} className="landing-search-icon" />
              <input
                type="text"
                className="landing-search-input"
                placeholder="Search any city, region or area…"
                value={query}
                onChange={e => handleInput(e.target.value)}
                onFocus={() => query.length >= 2 && setShowResults(true)}
                autoComplete="off"
                spellCheck={false}
                id="landing-city-search"
                aria-label="Search for a city"
              />
              {isSearching && <Loader2 size={16} className="animate-spin landing-search-spinner" />}
            </div>

            {/* Autocomplete dropdown */}
            <AnimatePresence>
              {showResults && (results.length > 0 || (query.length >= 2 && !isSearching)) && (
                <motion.div
                  className="landing-results"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {results.slice(0, 8).map(r => (
                    <button
                      key={`${r.source}-${r.id}`}
                      className="landing-result"
                      onClick={() => selectCity(r)}
                    >
                      <span className="lr-flag">{countryFlag(r.countryCode)}</span>
                      <div className="lr-info">
                        <strong>{r.name}</strong>
                        <span>{[r.admin1, r.country].filter(Boolean).join(', ')}</span>
                      </div>
                      {r.population != null && r.population > 0 && (
                        <span className="lr-pop">
                          {r.population >= 1e6 ? `${(r.population/1e6).toFixed(1)}M`
                            : r.population >= 1000 ? `${Math.round(r.population/1000)}K`
                            : r.population}
                        </span>
                      )}
                    </button>
                  ))}
                  {results.length === 0 && query.length >= 2 && !isSearching && (
                    <div className="landing-no-results">No places found for "{query}"</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {geoStatus === 'error' && (
              <p className="landing-geo-error">⚠️ Could not detect location. Please search manually.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Featured Cities Section */}
      <section className="landing-section landing-featured-section" id="featured-cities-section">
        <h2 className="landing-section-title">
          <Star size={18} /> Global Weather Explorer
        </h2>
        <p className="landing-section-subtitle">Real-time parameters in major global metropolises across every continent</p>

        {featuredLoading ? (
          <div className="landing-loading-wrapper">
            <Loader2 size={32} className="animate-spin" />
            <span>Fetching live global weather...</span>
          </div>
        ) : (
          <div className="featured-cities-grid">
            {featuredData.map((city, idx) => {
              const info = getWeatherInfo(city.weatherCode, true);
              return (
                <motion.div
                  key={city.name}
                  className="featured-city-card glass-card"
                  onClick={() => selectFeatured(city)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                >
                  <div className="fc-header">
                    <span className="fc-flag">{countryFlag(city.countryCode)}</span>
                    <div className="fc-city-info">
                      <h3>{city.name}</h3>
                      <span>{city.country}</span>
                    </div>
                  </div>
                  <div className="fc-body">
                    <div className="fc-temp">{Math.round(city.temp)}°C</div>
                    <WeatherIcon code={city.weatherCode} isDay={true} size={48} className="fc-icon" />
                  </div>
                  <div className="fc-desc">{info.description}</div>
                  <div className="fc-details">
                    <div className="fc-detail">
                      <Wind size={12} />
                      <span>{city.windSpeed} km/h</span>
                    </div>
                    <div className="fc-detail">
                      <Droplets size={12} />
                      <span>{city.humidity}%</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Interactive Feature Previews Showcase */}
      <section className="landing-section landing-showcase-section" id="features-section">
        <h2 className="landing-section-title">
          <Zap size={18} /> Experience Nimbus
        </h2>
        <p className="landing-section-subtitle">Visual layouts and analytic parameters crafted for professional meteorology</p>

        <div className="showcase-grid">
          {/* Showcase Card 1: Charts */}
          <div className="showcase-card glass-card">
            <div className="showcase-header">
              <BarChart2 size={16} className="showcase-icon" />
              <h3>Interactive Charts</h3>
            </div>
            <p className="showcase-desc">Explore hourly fluctuations of temperature, wind speed, pressure, and humidity in rich graphical curves.</p>
            <div className="showcase-preview-body">
              {/* Dummy Chart Layout */}
              <div className="chart-preview-bar-row">
                {[60, 80, 55, 90, 75, 95, 65, 85, 100, 70].map((h, i) => (
                  <div key={i} className="chart-preview-bar-col">
                    <div className="chart-preview-bar" style={{ height: `${h}%` }}>
                      <span className="chart-preview-tooltip">{Math.round(h * 0.3)}°</span>
                    </div>
                    <span className="chart-preview-label">{12 + i}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Showcase Card 2: Air Quality */}
          <div className="showcase-card glass-card">
            <div className="showcase-header">
              <Wind size={16} className="showcase-icon" />
              <h3>Air Quality Analytics</h3>
            </div>
            <p className="showcase-desc">Full analytics on European AQI levels and specific metrics for particulate concentrations.</p>
            <div className="showcase-preview-body">
              <div className="aqi-preview-circle">
                <div className="aqi-preview-val">34</div>
                <div className="aqi-preview-lbl">Good</div>
              </div>
              <div className="aqi-preview-metrics">
                <div className="aqi-metric"><span>PM2.5</span><span className="aqi-bar"><span style={{ width: '25%' }} /></span></div>
                <div className="aqi-metric"><span>PM10</span><span className="aqi-bar"><span style={{ width: '45%' }} /></span></div>
              </div>
            </div>
          </div>

          {/* Showcase Card 3: Map Radar */}
          <div className="showcase-card glass-card">
            <div className="showcase-header">
              <Map size={16} className="showcase-icon" />
              <h3>OpenStreetMap Integration</h3>
            </div>
            <p className="showcase-desc">An interactive Leaflet map that pins weather stations, and outlines temperatures globally.</p>
            <div className="showcase-preview-body map-preview-bg">
              <div className="map-preview-marker">📍 London: 18°C</div>
            </div>
          </div>

          {/* Showcase Card 4: AI Advisor */}
          <div className="showcase-card glass-card">
            <div className="showcase-header">
              <Star size={16} className="showcase-icon" />
              <h3>Personalized Advice</h3>
            </div>
            <p className="showcase-desc">Real-time parameters generated context advice for stargazing, cycling, sleep comfort, and plant watering.</p>
            <div className="showcase-preview-body advice-preview">
              <div className="advice-pill">🚲 Cycling: Excellent</div>
              <div className="advice-pill">🌌 Stargazing: Poor (Cloudy)</div>
              <div className="advice-pill">🌱 Watering: Not needed today</div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer & Stack Section */}
      <section className="landing-section landing-about-section">
        <h2 className="landing-section-title">
          <User size={18} /> Creator &amp; Technologies
        </h2>
        <p className="landing-section-subtitle">The mission behind Nimbus and our modern technology stack</p>

        <div className="about-grid">
          {/* Column 1: Creator info */}
          <div className="about-card glass-card">
            <div className="about-badge"><Code size={12} /> The Developer</div>
            <h3>Tcode-Motion</h3>
            <p className="about-creator-desc">
              Nimbus was designed and engineered by <strong>Tcode-Motion</strong> as a demonstration of high-performance modern web styling, complete PWA caching support, and user-first data visualization. 
            </p>
            <p className="about-creator-desc">
              The mission was to build a commercial-quality, stunning weather portal that remains <strong>completely free</strong>, contains zero tracking cookies, gathers no personal database files, and bypasses paid API keys entirely.
            </p>
            <div className="about-bullets">
              <div className="about-bullet"><CheckCircle2 size={14} /> 100% Client-Side Calculations</div>
              <div className="about-bullet"><CheckCircle2 size={14} /> No Tracking Analytics or Advertisements</div>
              <div className="about-bullet"><CheckCircle2 size={14} /> MIT Licensed Open-Source Codebase</div>
            </div>
          </div>

          {/* Column 2: Tech stack */}
          <div className="about-card glass-card">
            <div className="about-badge"><Globe size={12} /> Tech Stack</div>
            <h3>Core Infrastructures</h3>
            <div className="tech-stack-items">
              <div className="tech-item"><strong>React 19 &amp; TSX</strong> — Strongly typed reactive components</div>
              <div className="tech-item"><strong>Vite</strong> — Lightning-fast rollups and hot reloads</div>
              <div className="tech-item"><strong>Framer Motion</strong> — High performance physics-based animations</div>
              <div className="tech-item"><strong>Leaflet.js</strong> — Responsive interactive mapping</div>
              <div className="tech-item"><strong>Chart.js</strong> — Complex weather parameter rendering</div>
              <div className="tech-item"><strong>HTML5 Canvas</strong> — Particle systems for weather background reactive effects</div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="landing-section landing-sources-section" id="data-sources-section">
        <h2 className="landing-section-title">
          <Database size={18} /> Data Sources &amp; APIs
        </h2>
        <p className="landing-section-subtitle">Transparent, high-accuracy public services powering the Nimbus platform</p>

        <div className="sources-grid">
          {/* Card 1: Open-Meteo */}
          <div className="source-card glass-card">
            <div className="source-badge">Weather &amp; Climate</div>
            <h3>Open-Meteo Forecast API</h3>
            <p className="source-desc">
              Powering our core meteorological telemetry. Open-Meteo aggregates leading global numerical weather prediction (NWP) runs, providing hourly updates on temperature, relative humidity, UV indices, precipitation probability, and wind gusts at any coordinate.
            </p>
            <div className="source-footer-links">
              <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={11} /> open-meteo.com
              </a>
            </div>
          </div>

          {/* Card 2: Nominatim OSM */}
          <div className="source-card glass-card">
            <div className="source-badge">Geocoding &amp; Search</div>
            <h3>Nominatim OpenStreetMap</h3>
            <p className="source-desc">
              Resolving cities and region autocomplete queries in real-time. Nominatim searches the massive OpenStreetMap database for geographical coordinates, country flags, administrative divisions, and populations, giving search results international coverage.
            </p>
            <div className="source-footer-links">
              <a href="https://nominatim.org" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={11} /> nominatim.org
              </a>
            </div>
          </div>

          {/* Card 3: OpenStreetMap Tiles */}
          <div className="source-card glass-card">
            <div className="source-badge">Interactive Maps</div>
            <h3>OpenStreetMap Carto Tiles</h3>
            <p className="source-desc">
              Rendering interactive mapping radars on our Leaflet canvas. OSM's crowd-sourced geospatial map tiles outline national boundaries, mountain grids, and global highways completely free, matching the accuracy of paid mapping services.
            </p>
            <div className="source-footer-links">
              <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={11} /> openstreetmap.org
              </a>
            </div>
          </div>

          {/* Card 4: ipapi.co Geolocation */}
          <div className="source-card glass-card">
            <div className="source-badge">IP Location Fallback</div>
            <h3>ipapi.co Geolocation</h3>
            <p className="source-desc">
              Securing region detection fallback. If browser GPS permissions are rejected, ipapi.co matches your network IP to the closest geographic region to provide immediate weather forecasts on launch, bypassing GPS access hurdles.
            </p>
            <div className="source-footer-links">
              <a href="https://ipapi.co" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={11} /> ipapi.co
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="landing-section landing-faq-section" id="faq-section">
        <h2 className="landing-section-title">
          <HelpCircle size={18} /> Frequently Asked Questions
        </h2>
        <p className="landing-section-subtitle">Learn more about features, updates, and compatibility</p>

        <div className="faq-list">
          <FaqItem
            question="1. Is Nimbus Weather completely free?"
            answer="Yes! Nimbus is 100% free and open-source under the MIT license. It doesn't require any registrations, API keys, advertisements, or paid subscriptions. It is built as a public utility weather platform."
          />
          <FaqItem
            question="2. How does location detection work?"
            answer="Nimbus only checks your location when you explicitly click 'Use My Location'. First, it requests high-precision GPS coordinates from your browser. If that is denied or unavailable, it falls back to your network IP address using secure geocoding lookups to approximate your region."
          />
          <FaqItem
            question="3. Where is my personal data stored?"
            answer="Your searched cities, favorite locations, application preferences (e.g. units, theme, animation switches), and cached metrics are stored entirely in your local browser storage (LocalStorage). We do not host backend databases or track your searches."
          />
          <FaqItem
            question="4. Can I use this app when I am offline?"
            answer="Yes! Nimbus is structured as a Progressive Web App (PWA). Once loaded, the user interface, Leaflet maps, and previously fetched weather forecasts are fully cached locally by service workers. You can access the app even when completely disconnected from the Internet."
          />
          <FaqItem
            question="5. What APIs are used for weather forecasts?"
            answer="We query the Open-Meteo Weather API. It is completely free for non-commercial use, does not require private developer API key registrations, and uses leading global meteorological models to serve high-resolution forecasts."
          />
          <FaqItem
            question="6. What is the source of the geocoding search results?"
            answer="Search queries and autocompletion suggestions are resolved via the Nominatim OpenStreetMap Geocoding API. It provides fast, keyless translations of names, zip codes, and regions into geographical coordinates."
          />
          <FaqItem
            question="7. How does the interactive weather map work?"
            answer="The interactive weather map pins temperatures, weather codes, and coordinates across the globe. It runs on the Leaflet.js mapping framework and pulls free map tiles directly from the OpenStreetMap project."
          />
          <FaqItem
            question="8. How accurate is the meteorological weather data?"
            answer="Open-Meteo processes meteorological forecasts using the world's most advanced numerical weather models, including the Global Forecast System (GFS by NOAA), the European Centre for Medium-Range Weather Forecasts (ECMWF), and the German Weather Service (DWD ICON)."
          />
          <FaqItem
            question="9. How often is the weather information updated?"
            answer="Real-time parameters, hourly details, and daily forecast statistics are updated once every hour, reflecting the latest runs of global meteorological models."
          />
          <FaqItem
            question="10. Does Nimbus support international units?"
            answer="Yes! In the preferences panel (accessible via the settings icon), you can toggle between Celsius and Fahrenheit, wind speeds in km/h, m/s, mph, or knots, atmospheric pressure in hPa, mmHg, or inHg, and distances in kilometers or miles."
          />
          <FaqItem
            question="11. What is the source of the Air Quality Index (AQI) data?"
            answer="Air quality data is fetched via Open-Meteo's AQI endpoint. It compiles atmospheric pollutant concentrations (including PM2.5, PM10, nitrogen dioxide, carbon monoxide, ozone, and sulfur dioxide) modeled by the European Copernicus Atmosphere Monitoring Service."
          />
          <FaqItem
            question="12. How does the Sun and Moon tracker calculate positions?"
            answer="It uses high-precision astronomical calculations to determine the sun's and moon's positions, sunrise/sunset times, moonrise/moonset times, and the moon phase illumination percentages based on your location's longitude, latitude, and local time offsets."
          />
          <FaqItem
            question="13. Can I export weather forecasts?"
            answer="Yes! The actions bar on the dashboard lets you copy a comprehensive text summary directly to your clipboard, share it on supported devices, or export reports as raw JSON, CSV, or a formatted PDF document."
          />
          <FaqItem
            question="14. Can I install Nimbus on my mobile phone?"
            answer="Yes. Since Nimbus is a Progressive Web App (PWA), you can add it directly to your home screen. On iOS, tap Share > Add to Home Screen in Safari. On Android, tap the Install App badge in Chrome or Edge."
          />
          <FaqItem
            question="15. What does the 'High Contrast' setting do?"
            answer="It simplifies layout borders, sets text color ratios to pure black/white, and enhances focus outlines. This complies with W3C WCAG accessibility standards to assist visually impaired users."
          />
          <FaqItem
            question="16. Can I disable animations if my device runs slowly?"
            answer="Yes! Toggling off 'Animations' in settings disables the interactive HTML5 canvas background particle animations (like rain, snow, and stars) and reduces CSS motion to maximize page rendering speeds."
          />
          <FaqItem
            question="17. Does the app support keyboard shortcuts?"
            answer="Yes! Press Ctrl+K to focus search, Ctrl+R to refresh weather, Ctrl+, to open settings, Arrow Keys (Up/Down) to navigate results, Enter to select, and Escape (Esc) to close dialogs."
          />
          <FaqItem
            question="18. Why does the app open in Dark Mode by default?"
            answer="Dark Mode reduces eye fatigue, enhances contrast for readability, and conserves battery life on OLED/AMOLED screens. You can switch to Light Mode at any time in the settings."
          />
          <FaqItem
            question="19. Does Nimbus store tracking cookies?"
            answer="No, Nimbus does not set any cookies. All application states, favorite lists, and user selections are managed client-side using standard web local storage APIs."
          />
          <FaqItem
            question="20. How can I contribute or report bugs?"
            answer="The project is entirely open-source and hosted on GitHub. You can visit the repository, submit bug reports, request features, or open pull requests to improve the codebase."
          />
        </div>
      </section>
    </div>
  );
}
