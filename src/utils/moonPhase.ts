/* ───────────────────────────────────────────────────
 *  Moon Phase Calculator
 *  Calculates moon phase from date using
 *  Conway's simple lunar algorithm
 * ─────────────────────────────────────────────────── */

export interface MoonPhaseInfo {
  phase: number;
  name: string;
  emoji: string;
  illumination: number;
  nextFullMoon?: string; // e.g. "Jul 10"
}

const MOON_PHASES = [
  { name: 'New Moon',        emoji: '🌑', min: 0,     max: 0.0625 },
  { name: 'Waxing Crescent', emoji: '🌒', min: 0.0625, max: 0.1875 },
  { name: 'First Quarter',   emoji: '🌓', min: 0.1875, max: 0.3125 },
  { name: 'Waxing Gibbous',  emoji: '🌔', min: 0.3125, max: 0.4375 },
  { name: 'Full Moon',       emoji: '🌕', min: 0.4375, max: 0.5625 },
  { name: 'Waning Gibbous',  emoji: '🌖', min: 0.5625, max: 0.6875 },
  { name: 'Last Quarter',    emoji: '🌗', min: 0.6875, max: 0.8125 },
  { name: 'Waning Crescent', emoji: '🌘', min: 0.8125, max: 0.9375 },
  { name: 'New Moon',        emoji: '🌑', min: 0.9375, max: 1.01 },
] as const;

export function getMoonPhase(date: Date = new Date()): number {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const synodicMonth = 29.53058770576;
  const daysSinceKnown = (date.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = ((daysSinceKnown % synodicMonth) / synodicMonth + 1) % 1;
  return phase;
}

export function getMoonPhaseInfo(date: Date = new Date()): MoonPhaseInfo {
  const phase = getMoonPhase(date);

  const phaseInfo = MOON_PHASES.find(p => phase >= p.min && phase < p.max)
    ?? MOON_PHASES[0];

  const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);

  // Calculate next full moon
  const synodicMonth = 29.53058770576;
  const daysToFull = phase < 0.5
    ? (0.5 - phase) * synodicMonth
    : (1.5 - phase) * synodicMonth;
  const nextFull = new Date(date.getTime() + daysToFull * 24 * 60 * 60 * 1000);
  const nextFullMoon = nextFull.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return {
    phase,
    name: phaseInfo.name,
    emoji: phaseInfo.emoji,
    illumination,
    nextFullMoon: phaseInfo.name === 'Full Moon' ? undefined : nextFullMoon,
  };
}

