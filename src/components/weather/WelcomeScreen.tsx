/* ───────────────────────────────────────────────────
 *  WelcomeScreen — Shown when no city selected
 * ─────────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import { Search, MapPin, Star, CloudSun } from 'lucide-react';
import './WelcomeScreen.css';

export default function WelcomeScreen() {
  return (
    <motion.div
      className="welcome-screen"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="welcome-icon-float"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <CloudSun size={80} strokeWidth={1.2} />
      </motion.div>

      <h2 className="welcome-title">Welcome to Nimbus</h2>
      <p className="welcome-subtitle">Your premium weather companion</p>

      <div className="welcome-features">
        <div className="welcome-feature">
          <Search size={20} />
          <div>
            <strong>Search any city</strong>
            <p>Type in the search bar above or press <kbd>Ctrl</kbd>+<kbd>K</kbd></p>
          </div>
        </div>
        <div className="welcome-feature">
          <MapPin size={20} />
          <div>
            <strong>Use your location</strong>
            <p>Click the location button to auto-detect</p>
          </div>
        </div>
        <div className="welcome-feature">
          <Star size={20} />
          <div>
            <strong>Save favorites</strong>
            <p>Bookmark cities for quick access</p>
          </div>
        </div>
      </div>

      <p className="welcome-hint">
        ⌨️ Keyboard shortcuts: <kbd>Ctrl+K</kbd> Search &middot; <kbd>Ctrl+,</kbd> Settings &middot; <kbd>Ctrl+R</kbd> Refresh
      </p>
    </motion.div>
  );
}
