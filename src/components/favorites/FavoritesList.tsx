/* ───────────────────────────────────────────────────
 *  FavoritesList — Favorite cities sidebar
 * ─────────────────────────────────────────────────── */

import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Pin, MapPin } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useWeather } from '../../contexts/WeatherContext';
import type { FavoriteCity, GeoLocation } from '../../types/weather';
import './FavoritesList.css';

export default function FavoritesList() {
  const { fetchWeather, location, favorites, isFavorite, addFavorite, removeFavorite, togglePin } = useWeather();

  const selectFavorite = (fav: FavoriteCity) => {
    const loc: GeoLocation = {
      latitude: fav.latitude,
      longitude: fav.longitude,
      name: fav.customName || fav.name,
      country: fav.country,
      countryCode: fav.countryCode,
    };
    fetchWeather(loc);
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.order - b.order;
  });

  return (
    <motion.section
      className="favorites-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      aria-label="Favorite cities"
    >
      <div className="favorites-header">
        <h2 className="section-title">Favorites</h2>
        {location && (
          <button
            className={`fav-add-btn ${isFavorite ? 'fav-added' : ''}`}
            onClick={addFavorite}
            disabled={!!isFavorite}
            aria-label={isFavorite ? 'Already in favorites' : 'Add to favorites'}
          >
            <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? 'Saved' : 'Add Current'}
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <GlassCard className="favorites-empty" hoverable={false}>
          <Star size={32} className="empty-icon" />
          <p>No favorites yet</p>
          <p className="empty-hint">Search for a city and add it to your favorites</p>
        </GlassCard>
      ) : (
        <div className="favorites-list">
          <AnimatePresence>
            {sortedFavorites.map(fav => (
              <motion.div
                key={fav.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard className="fav-card" onClick={() => selectFavorite(fav)}>
                  <MapPin size={14} className="fav-pin-icon" />
                  <div className="fav-info">
                    <span className="fav-name">{fav.customName || fav.name}</span>
                    <span className="fav-country">{fav.country}</span>
                  </div>
                  {fav.pinned && <Pin size={12} className="fav-pinned" />}
                  <div className="fav-actions">
                    <button onClick={(e) => { e.stopPropagation(); togglePin(fav.id); }} aria-label="Pin city" title="Pin">
                      <Pin size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); removeFavorite(fav.id); }} aria-label="Remove from favorites" title="Remove">
                      <X size={14} />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}
