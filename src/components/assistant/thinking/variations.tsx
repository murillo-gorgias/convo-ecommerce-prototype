import { motion } from 'motion/react';
import { easing } from '../../../motion/motion';

/**
 * ============================================================================
 * THINKING ANIMATIONS — five variations
 * ============================================================================
 *
 * What the assistant shows while it works. Five different directions, all
 * drawn in ink on the console's own surface, all sized to the same 90×48 box.
 *
 * Pick one by changing `THINKING` at the bottom of this file.
 * Compare them side by side at  /#thinking
 *
 * The house rule applies to all of them: nothing snaps, nothing bounces,
 * nothing demands attention. This runs for a second or two and then leaves.
 */

const BOX = 'relative flex h-12 w-[90px] items-center justify-center text-[var(--ink-soft)]';

/** A fine curb chain, drawn as one continuous line. */
const CHAIN = 'M3 15c5-11 11 11 16 0s11 11 16 0 11 11 16 0 11 11 16 0';

/* ==========================================================================
 * 1. THREAD
 * A fine chain drawing itself, holding, then releasing. The most literal
 * jewelry reference of the five, and the quietest.
 * ========================================================================== */

export function Thread() {
  return (
    <div className={BOX}>
      <svg width="76" height="30" viewBox="0 0 76 30" fill="none">
        {/* The chain it draws over, held faint */}
        <path d={CHAIN} stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.12" strokeLinecap="round" />
        <motion.path
          d={CHAIN}
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeDasharray="120"
          animate={{ strokeDashoffset: [120, 0, 0, -120] }}
          transition={{
            duration: 2.8,
            ease: easing.even,
            times: [0, 0.45, 0.62, 1],
            repeat: Infinity,
          }}
        />
      </svg>
    </div>
  );
}

/* ==========================================================================
 * 2. FACET
 * A cut stone turning slowly, with light moving across its face. The most
 * "fine jewelry" of the five and the most expensive-feeling.
 * ========================================================================== */

export function Facet() {
  return (
    <div className={BOX}>
      <motion.svg
        width="42"
        height="36"
        viewBox="0 0 42 36"
        fill="none"
        style={{ transformPerspective: 420, rotateX: 8 }}
        animate={{ rotateY: [-52, 52, -52] }}
        transition={{ duration: 4.2, ease: easing.even, repeat: Infinity }}
      >
        <defs>
          <linearGradient id="facet-light" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
            <motion.stop
              offset="50%"
              stopColor="currentColor"
              stopOpacity="0.35"
              animate={{ offset: ['0%', '100%'] }}
              transition={{ duration: 2.2, ease: easing.even, repeat: Infinity }}
            />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* A brilliant cut seen from the side: table, crown, girdle, pavilion */}
        <path
          d="M13 2h16l9 10-17 22L4 12Z"
          fill="url(#facet-light)"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        <path
          d="M4 12h34M13 2l4 10M29 2l-4 10M17 12l4 22M25 12l-4 22"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeOpacity="0.4"
        />
      </motion.svg>
    </div>
  );
}

/* ==========================================================================
 * 3. ORBIT
 * Three small stones circling a still centre, each on its own path at its
 * own speed. The most restrained of the five.
 * ========================================================================== */

export function Orbit() {
  const rings = [
    { r: 9, duration: 2.6, size: 2.6, opacity: 1, from: 0 },
    { r: 15, duration: 4.0, size: 2.2, opacity: 0.65, from: 140 },
    { r: 21, duration: 5.8, size: 1.8, opacity: 0.4, from: 260 },
  ];

  return (
    <div className={BOX}>
      <svg width="52" height="52" viewBox="-26 -26 52 52" fill="none">
        <circle r="1.8" fill="currentColor" />
        {rings.map((ring, i) => (
          <g key={i}>
            <circle r={ring.r} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.14" />
            <motion.g
              animate={{ rotate: [ring.from, ring.from + 360] }}
              transition={{ duration: ring.duration, ease: 'linear', repeat: Infinity }}
              style={{ originX: 0, originY: 0 }}
            >
              <circle cx={ring.r} cy={0} r={ring.size} fill="currentColor" fillOpacity={ring.opacity} />
            </motion.g>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ==========================================================================
 * 4. SHEEN
 * Light travelling along a polished edge. Nothing moves except the
 * highlight — the most minimal option, and the one that reads best small.
 * ========================================================================== */

export function Sheen() {
  return (
    <div className={BOX}>
      <div className="relative h-[3px] w-[76px] overflow-hidden rounded-full bg-current opacity-15" />
      <motion.div
        className="absolute h-[3px] w-[26px] rounded-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--ink-soft) 45%, var(--ink-soft) 55%, transparent)',
        }}
        animate={{ x: [-44, 44] }}
        transition={{ duration: 1.9, ease: easing.even, repeat: Infinity, repeatDelay: 0.25 }}
      />
    </div>
  );
}

/* ==========================================================================
 * 5. BLOOM
 * Rings opening outward from a single point and fading. The warmest and
 * most ambient of the five — closer to an aura than a loading indicator.
 * ========================================================================== */

export function Bloom() {
  return (
    <div className={BOX}>
      <span className="absolute h-[5px] w-[5px] rounded-full bg-current" />
      {[0, 0.7, 1.4].map((delay) => (
        <motion.span
          key={delay}
          className="absolute rounded-full border-[1.2px] border-current"
          style={{ width: 14, height: 14 }}
          animate={{ scale: [0.8, 3.4], opacity: [0.75, 0] }}
          transition={{ duration: 2.1, ease: easing.refined, repeat: Infinity, delay }}
        />
      ))}
    </div>
  );
}

/* ==========================================================================
 * THE ONE IN USE
 * Change this to switch what the console shows while the assistant works.
 * ========================================================================== */

export const thinkingVariations = [
  {
    id: 'thread',
    name: 'Thread',
    note: 'A fine chain drawing itself, holding, then releasing.',
    Component: Thread,
  },
  {
    id: 'facet',
    name: 'Facet',
    note: 'A cut stone turning slowly, light moving across its face.',
    Component: Facet,
  },
  {
    id: 'orbit',
    name: 'Orbit',
    note: 'Three small stones circling a still centre, each at its own speed.',
    Component: Orbit,
  },
  {
    id: 'sheen',
    name: 'Sheen',
    note: 'Light travelling along a polished edge. Nothing else moves.',
    Component: Sheen,
  },
  {
    id: 'bloom',
    name: 'Bloom',
    note: 'Rings opening outward from a point and fading, like an aura.',
    Component: Bloom,
  },
] as const;

/** The variation the console currently uses. */
export const THINKING = Facet;
