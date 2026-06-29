/* ───────────────────────────────────────────────────
 *  SearchBar — Smart autocomplete city search
 *  - Geo-biased results (prefers your region)
 *  - Runs Open-Meteo + Nominatim in parallel
 *  - Voice search, recent history, keyboard nav
 * ─────────────────────────────────────────────────── */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, Mic, Clock, Loader2, Navigation } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { searchCities, searchResultToLocation } from '../../api/geocoding';
import { useWeather } from '../../contexts/WeatherContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import type { SearchResult, GeoLocation } from '../../types/weather';
import { MAX_SEARCH_HISTORY } from '../../constants/api';
import './SearchBar.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [searchHistory, setSearchHistory] = useLocalStorage<GeoLocation[]>('nimbus_search_history', []);
  const [locateAttempted, setLocateAttempted] = useState(false);

  // Store the user's best-known position for geo-bias
  const [userLat, setUserLat] = useLocalStorage<number | null>('nimbus_user_lat', null);
  const [userLon, setUserLon] = useLocalStorage<number | null>('nimbus_user_lon', null);

  const debouncedQuery = useDebounce(query, 280);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { fetchWeather, fetchWeatherByCoords, weatherData } = useWeather();
  const { latitude, longitude, requestLocation, loading: geoLoading, error: geoError } = useGeolocation();

  // When browser gives us GPS coords, store them for bias
  useEffect(() => {
    if (latitude != null && longitude != null) {
      setUserLat(latitude);
      setUserLon(longitude);
      fetchWeatherByCoords(latitude, longitude);
      setIsOpen(false);
      setQuery('');
    }
  }, [latitude, longitude, fetchWeatherByCoords, setUserLat, setUserLon]);

  // If we already have weather loaded, keep user position updated
  useEffect(() => {
    if (weatherData?.location && userLat == null) {
      setUserLat(weatherData.location.latitude);
      setUserLon(weatherData.location.longitude);
    }
  }, [weatherData, userLat, setUserLat, setUserLon]);

  // Search cities on debounced query change — with geo-bias
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    searchCities(
      debouncedQuery,
      userLat ?? undefined,
      userLon ?? undefined,
    ).then(r => {
      if (!cancelled) {
        setResults(r);
        setIsSearching(false);
        setSelectedIdx(-1);
      }
    });
    return () => { cancelled = true; };
  }, [debouncedQuery, userLat, userLon]);

  const selectCity = useCallback((result: SearchResult) => {
    const loc = searchResultToLocation(result);
    fetchWeather(loc);
    setSearchHistory(prev => {
      const filtered = prev.filter(h => !(
        Math.abs(h.latitude - loc.latitude) < 0.01 && Math.abs(h.longitude - loc.longitude) < 0.01
      ));
      return [loc, ...filtered].slice(0, MAX_SEARCH_HISTORY);
    });
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }, [fetchWeather, setSearchHistory]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIdx >= 0 && results[selectedIdx]) {
      e.preventDefault();
      selectCity(results[selectedIdx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }, [results, selectedIdx, selectCity]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Voice search
  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)();
    recognition.lang = 'en-US';
    recognition.onstart = () => { /* mic active */ };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const text = event.results?.[0]?.[0]?.transcript;
      if (text) { setQuery(text); setIsOpen(true); }
    };
    recognition.start();
  }, []);

  const showDropdown = isOpen && (results.length > 0 || searchHistory.length > 0 || isSearching || (debouncedQuery.length >= 2 && !isSearching));

  // Country flag emoji from country code
  const countryFlag = (code: string) => {
    if (!code || code.length !== 2) return '';
    const offset = 0x1F1E6;
    const chars = code.toUpperCase().split('').map(c => String.fromCodePoint(offset + c.charCodeAt(0) - 65));
    return chars.join('');
  };

  return (
    <div className="search-container" ref={containerRef}>
      <div className={`search-input-wrapper ${isOpen ? 'search-focused' : ''}`}>
        {isSearching
          ? <Loader2 size={18} className="search-icon animate-spin" />
          : <Search size={18} className="search-icon" />
        }
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search any city, region or area..."
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search for a city"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="search-results"
          role="combobox"
          id="city-search"
          autoComplete="off"
          spellCheck={false}
        />
        {!query && (
          <span className="search-shortcut-badge" aria-hidden="true">Ctrl + K</span>
        )}
        {query && (
          <button className="search-clear" onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }} aria-label="Clear search">
            <X size={15} />
          </button>
        )}
        <div className="search-divider" />
        <button className="search-voice" onClick={startVoiceSearch} aria-label="Voice search" title="Voice search">
          <Mic size={15} />
        </button>
        <button
          className={`search-locate ${geoLoading ? 'search-locate-loading' : ''}`}
          onClick={() => { setLocateAttempted(true); requestLocation(); }}
          disabled={geoLoading}
          aria-label="Use my location"
          title="Use my location"
        >
          {geoLoading ? <Loader2 size={15} className="animate-spin" /> : <Navigation size={15} />}
        </button>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="search-dropdown"
            id="search-results"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {/* Active search results */}
            {results.length > 0 && (
              <div className="search-group">
                <div className="search-group-label">
                  <Search size={11} /> Results
                </div>
                {results.map((r, i) => (
                  <button
                    key={`${r.source}-${r.id}`}
                    className={`search-result ${i === selectedIdx ? 'search-result-selected' : ''}`}
                    onClick={() => selectCity(r)}
                    role="option"
                    aria-selected={i === selectedIdx}
                  >
                    <span className="search-result-flag">{countryFlag(r.countryCode)}</span>
                    <div className="search-result-info">
                      <span className="search-result-name">{r.name}</span>
                      <span className="search-result-meta">
                        {[r.admin1, r.country].filter(Boolean).join(', ')}
                        {r.elevation != null && r.elevation > 0 && (
                          <span className="search-result-elev"> · {Math.round(r.elevation)}m</span>
                        )}
                      </span>
                    </div>
                    {r.population != null && r.population > 0 && (
                      <span className="search-result-pop">
                        {r.population >= 1000000
                          ? `${(r.population / 1000000).toFixed(1)}M`
                          : r.population >= 1000
                          ? `${Math.round(r.population / 1000)}K`
                          : r.population}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {!isSearching && results.length === 0 && debouncedQuery.length >= 2 && (
              <div className="search-empty">
                <MapPin size={20} />
                <div>
                  <p>No places found for "<strong>{query}</strong>"</p>
                  <p className="search-empty-hint">Try a broader name or use the location button</p>
                </div>
              </div>
            )}

            {/* Recent history (shown when no query) */}
            {results.length === 0 && !debouncedQuery && searchHistory.length > 0 && (
              <div className="search-group">
                <div className="search-group-label">
                  <Clock size={11} /> Recent
                </div>
                {searchHistory.slice(0, 6).map((h, i) => (
                  <button
                    key={`${h.latitude}-${h.longitude}-${i}`}
                    className="search-result"
                    onClick={() => { fetchWeather(h); setIsOpen(false); }}
                    role="option"
                  >
                    <span className="search-result-flag">{countryFlag(h.countryCode)}</span>
                    <div className="search-result-info">
                      <span className="search-result-name">{h.name}</span>
                      <span className="search-result-meta">{[h.admin1, h.country].filter(Boolean).join(', ')}</span>
                    </div>
                    <Clock size={12} className="search-result-clock" />
                  </button>
                ))}
              </div>
            )}

            {/* Geo error — only shown after user explicitly clicks locate */}
            {geoError && locateAttempted && (
              <div className="search-geo-error">
                ⚠️ GPS access denied — type a city name to search, or your IP location will be used for suggestions
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
