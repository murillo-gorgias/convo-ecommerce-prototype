import { motion } from 'motion/react';
import { easing } from '../../../motion/motion';

/**
 * ============================================================================
 * THINKING ANIMATIONS — five variations on a morphing line
 * ============================================================================
 *
 * What the assistant shows while it works.
 *
 * All five share one idea: **the line itself changes shape.** It is never a
 * static track with something travelling along it. A straight line bends into
 * a curve, turns, and straightens again — while light runs through it. The
 * shape change and the travel happen at the same time.
 *
 * Each is drawn in ink at the size it appears in the console.
 * Compare them side by side at  /#thinking
 * Pick one by changing `THINKING` at the bottom of this file.
 *
 * The house rule applies to all of them: nothing snaps, nothing bounces,
 * nothing demands attention. This runs for a second or two and then leaves.
 */

const BOX = 'relative flex h-12 w-[110px] items-center justify-center text-[var(--ink-soft)]';

/** The travelling light: one short dash chasing its way along the path. */
const DASH = '14 150';

/* ==========================================================================
 * 1. ARC
 * A straight line bows into a half circle, flattens, then bows the other
 * way. The most literal reading of the direction.
 * ========================================================================== */

export function Arc() {
  const flat = 'M8 24 C32 24 44 24 55 24 C66 24 78 24 102 24';
  const over = 'M8 24 C8 2 32 2 55 2 C78 2 102 2 102 24';
  const under = 'M8 24 C8 46 32 46 55 46 C78 46 102 46 102 24';

  return (
    <div className={BOX}>
      <svg width="110" height="48" viewBox="0 0 110 48" fill="none">
        <motion.path
          d={flat}
          initial={{ d: flat }}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.18"
          animate={{ d: [flat, over, flat, under, flat] }}
          transition={{ duration: 4.4, ease: easing.refined, repeat: Infinity }}
        />
        <motion.path
          d={flat}
          initial={{ d: flat }}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={DASH}
          animate={{
            d: [flat, over, flat, under, flat],
            strokeDashoffset: [164, 0, -164, -328, -492],
          }}
          transition={{ duration: 4.4, ease: easing.even, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}

/* ==========================================================================
 * 2. CLASP
 * The line closes into a ring, holds for a beat, then opens back out. Light
 * runs the whole time, so it reads as a chain finding its clasp.
 * ========================================================================== */

export function Clasp() {
  const open = 'M12 24 C26 24 40 24 55 24 C70 24 84 24 98 24';
  const ring = 'M55 5 C68 5 79 13 79 24 C79 35 68 43 55 43 C42 43 31 35 31 24 C31 13 42 5 55 5';

  return (
    <div className={BOX}>
      <svg width="110" height="48" viewBox="0 0 110 48" fill="none">
        <motion.path
          d={open}
          initial={{ d: open }}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.18"
          animate={{ d: [open, ring, ring, open, open] }}
          transition={{
            duration: 4.6,
            ease: easing.refined,
            times: [0, 0.3, 0.6, 0.88, 1],
            repeat: Infinity,
          }}
        />
        <motion.path
          d={open}
          initial={{ d: open }}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray={DASH}
          animate={{
            d: [open, ring, ring, open, open],
            strokeDashoffset: [164, 0, -164, -328, -492],
          }}
          transition={{
            duration: 4.6,
            ease: easing.even,
            times: [0, 0.3, 0.6, 0.88, 1],
            repeat: Infinity,
          }}
        />
      </svg>
    </div>
  );
}

/* ==========================================================================
 * 3. RIBBON
 * The line runs flat, gathers into a wave, and settles flat again — tilting
 * as it goes, so it reads as a length of chain drawn through a hand.
 * ========================================================================== */

export function Ribbon() {
  const flat = 'M8 24 C26 24 40 24 55 24 C70 24 84 24 102 24';
  const wave = 'M8 24 C26 4 40 44 55 24 C70 4 84 44 102 24';
  const deep = 'M8 24 C26 44 40 4 55 24 C70 44 84 4 102 24';

  return (
    <div className={BOX}>
      <motion.svg
        width="110"
        height="48"
        viewBox="0 0 110 48"
        fill="none"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 5.2, ease: easing.even, repeat: Infinity }}
      >
        <motion.path
          d={flat}
          initial={{ d: flat }}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.16"
          animate={{ d: [flat, wave, deep, wave, flat] }}
          transition={{ duration: 3.6, ease: easing.even, repeat: Infinity }}
        />
        <motion.path
          d={flat}
          initial={{ d: flat }}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={DASH}
          animate={{
            d: [flat, wave, deep, wave, flat],
            strokeDashoffset: [164, 0, -164, -328, -492],
          }}
          transition={{ duration: 3.6, ease: easing.even, repeat: Infinity }}
        />
      </motion.svg>
    </div>
  );
}

/* ==========================================================================
 * 4. PENDULUM
 * A short arc swinging on its centre while its curve deepens and eases.
 * The most restrained — nothing crosses the screen, it only turns.
 * ========================================================================== */

export function Pendulum() {
  const shallow = 'M26 30 C40 20 70 20 84 30';
  const deep = 'M26 36 C40 6 70 6 84 36';

  return (
    <div className={BOX}>
      <motion.svg
        width="110"
        height="48"
        viewBox="0 0 110 48"
        fill="none"
        style={{ originX: '55px', originY: '24px' }}
        animate={{ rotate: [-36, 36, -36] }}
        transition={{ duration: 3.4, ease: easing.refined, repeat: Infinity }}
      >
        <motion.path
          d={shallow}
          initial={{ d: shallow }}
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeOpacity="0.2"
          animate={{ d: [shallow, deep, shallow] }}
          transition={{ duration: 1.7, ease: easing.even, repeat: Infinity }}
        />
        <motion.path
          d={shallow}
          initial={{ d: shallow }}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="12 90"
          animate={{ d: [shallow, deep, shallow], strokeDashoffset: [102, 0] }}
          transition={{ duration: 1.7, ease: easing.even, repeat: Infinity }}
        />
      </motion.svg>
    </div>
  );
}

/* ==========================================================================
 * 5. LOOP
 * The line folds over itself into a knot, turns, then unfolds. The most
 * sculptural, and the closest to the brand's own interlocking forms.
 * ========================================================================== */

export function Loop() {
  const straight = 'M10 24 C30 24 44 24 55 24 C66 24 80 24 100 24';
  const knot = 'M10 24 C34 24 33 7 55 7 C77 7 76 41 55 41 C34 41 33 24 100 24';

  return (
    <div className={BOX}>
      <motion.svg
        width="110"
        height="48"
        viewBox="0 0 110 48"
        fill="none"
        animate={{ rotate: [0, 180, 360] }}
        transition={{ duration: 6.4, ease: easing.refined, repeat: Infinity }}
      >
        <motion.path
          d={straight}
          initial={{ d: straight }}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.16"
          animate={{ d: [straight, knot, knot, straight] }}
          transition={{
            duration: 4.2,
            ease: easing.refined,
            times: [0, 0.35, 0.65, 1],
            repeat: Infinity,
          }}
        />
        <motion.path
          d={straight}
          initial={{ d: straight }}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={DASH}
          animate={{
            d: [straight, knot, knot, straight],
            strokeDashoffset: [200, 0, -200, -400],
          }}
          transition={{
            duration: 4.2,
            ease: easing.even,
            times: [0, 0.35, 0.65, 1],
            repeat: Infinity,
          }}
        />
      </motion.svg>
    </div>
  );
}

/* ==========================================================================
 * THE SET
 * ========================================================================== */

export const thinkingVariations = [
  {
    id: 'arc',
    name: 'Arc',
    note: 'A straight line bows into a half circle, flattens, then bows the other way.',
    Component: Arc,
  },
  {
    id: 'clasp',
    name: 'Clasp',
    note: 'The line closes into a ring, holds a beat, then opens back out.',
    Component: Clasp,
  },
  {
    id: 'ribbon',
    name: 'Ribbon',
    note: 'A length of chain gathering into a wave and settling flat, tilting as it goes.',
    Component: Ribbon,
  },
  {
    id: 'pendulum',
    name: 'Pendulum',
    note: 'A short arc swinging on its centre while its curve deepens and eases.',
    Component: Pendulum,
  },
  {
    id: 'loop',
    name: 'Loop',
    note: 'The line folds into a knot, turns, then unfolds.',
    Component: Loop,
  },
] as const;

/** The variation the console currently uses. */
export const THINKING = Clasp;
