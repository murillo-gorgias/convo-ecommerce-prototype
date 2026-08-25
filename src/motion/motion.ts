/**
 * ============================================================================
 * MOTION SYSTEM
 * ============================================================================
 *
 * Every animation in this prototype is defined here. Nothing animates using a
 * number written inline in a component — if you want to change how something
 * moves, this is the only file you need to open.
 *
 * HOW IT IS ORGANISED, top to bottom:
 *
 *   1. DURATION   how long something takes
 *   2. EASING     the character of the movement — how it accelerates
 *   3. SPRING     physics-based movement, used for anything that morphs
 *   4. STAGGER    the gap between items when several animate in sequence
 *   5. MOVES      named, ready-to-use animations, grouped by what they belong to
 *
 * The rule of the house: nothing snaps, nothing bounces, nothing overshoots
 * enough to notice. Elegance here means restraint — movement you feel rather
 * than watch.
 */

/* ==========================================================================
 * 1. DURATION
 * How long a movement takes, in seconds.
 * ========================================================================== */

export const duration = {
  /** 0.15s — a colour or opacity shift you should barely register. */
  instant: 0.15,
  /** 0.25s — small state changes. A tap response, an icon swap. */
  quick: 0.25,
  /** 0.4s — the standard. Most things should use this. */
  base: 0.4,
  /** 0.6s — larger surfaces arriving: the console opening, a panel expanding. */
  considered: 0.6,
  /** 0.9s — full-screen or first-impression moments only. Use sparingly. */
  cinematic: 0.9,
} as const;

/* ==========================================================================
 * 2. EASING
 * The character of a movement. This matters more than duration for how
 * expensive something feels.
 * ========================================================================== */

type Curve = [number, number, number, number];

export const easing = {
  /**
   * The house curve. Leaves quickly, settles slowly and completely.
   * If you are unsure which easing to use, it is this one.
   */
  refined: [0.22, 1, 0.36, 1] as Curve,

  /** Symmetrical and calm. For things that move without arriving anywhere — a
   *  crossfade, a colour change, a subtle drift. */
  even: [0.4, 0, 0.2, 1] as Curve,

  /** For things leaving the screen. Starts gently, accelerates away. */
  exit: [0.4, 0, 1, 1] as Curve,

  /** For things entering. Arrives fast, decelerates into place. */
  enter: [0, 0, 0.2, 1] as Curve,
} as const;

/* ==========================================================================
 * 3. SPRING
 * Physics rather than a fixed duration. Anything that changes SHAPE should
 * use a spring — it is what makes a morph feel like one object moving rather
 * than two objects swapping.
 *
 *   stiffness  higher = faster, more urgent
 *   damping    higher = less wobble at the end
 *   mass       higher = heavier, more inertia
 * ========================================================================== */

export const spring = {
  /**
   * THE MORPH SPRING. Used when the search bar becomes the circular button
   * and when the button becomes the console. Tuned to have no visible bounce —
   * it settles rather than springs.
   */
  morph: { type: 'spring' as const, stiffness: 320, damping: 34, mass: 0.9 },

  /** Softer and slower. For large surfaces settling into place. */
  surface: { type: 'spring' as const, stiffness: 220, damping: 30, mass: 1 },

  /** Crisp and immediate. For small controls responding to a press. */
  control: { type: 'spring' as const, stiffness: 500, damping: 32, mass: 0.6 },
} as const;

/* ==========================================================================
 * 4. STAGGER
 * When several items animate in, this is the gap between each one.
 * ========================================================================== */

export const stagger = {
  /** 0.04s — barely sequential. A row of small items. */
  tight: 0.04,
  /** 0.08s — the standard. Clearly sequential without feeling slow. */
  base: 0.08,
  /** 0.14s — deliberate. For a short list you want people to read. */
  slow: 0.14,
} as const;

/* ==========================================================================
 * 5. MOVES
 * Named animations, grouped by the part of the interface they belong to.
 * Each one says what it is for. Drop them straight into a Motion component.
 * ========================================================================== */

export const moves = {
  /* ------------------------------------------------------------------
   * STOREFRONT — the shop behind the assistant
   * ------------------------------------------------------------------ */
  store: {
    /** A section fading and lifting into view as it is scrolled to. */
    sectionReveal: {
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: duration.considered, ease: easing.refined },
    },

    /** Headline words arriving one after another over the campaign imagery. */
    headlineWord: {
      initial: { opacity: 0, y: '55%' },
      animate: { opacity: 1, y: '0%' },
      transition: { duration: duration.considered, ease: easing.refined },
    },

    /** The slow drift on a campaign image. Gives a still photograph life
     *  without anyone noticing it is moving. Set to `false` to stop it. */
    imageDrift: {
      initial: { scale: 1.06 },
      animate: { scale: 1 },
      transition: { duration: 14, ease: 'linear' as const },
    },

    /** The announcement bar rotating between messages. */
    announcementSwap: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration: duration.base, ease: easing.refined },
    },
  },

  /* ------------------------------------------------------------------
   * ASSISTANT — the floating element and its states
   *
   * The assistant has three shapes and moves between them:
   *
   *     BAR  ──scroll down──▶  PILL  ──tap──▶  CONSOLE
   *      ▲                       │                 │
   *      └──── scroll up ────────┘                 │
   *      └───────────── close ─────────────────────┘
   *
   * The shape change itself is handled by a shared layout animation, so the
   * element genuinely morphs rather than cross-fading. `shapeChange` is the
   * transition that morph uses.
   * ------------------------------------------------------------------ */
  assistant: {
    /** THE MORPH. Governs bar → pill → console. The single most important
     *  transition in the prototype. */
    shapeChange: spring.morph,

    /** The assistant's very first appearance, shortly after the page loads. */
    firstAppearance: {
      initial: { opacity: 0, y: 40, scale: 0.94 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: duration.considered, ease: easing.refined, delay: 0.5 },
    },

    /** Placeholder text and icons fading across as the shape changes.
     *  Deliberately faster than the morph so contents never lag the container. */
    contentSwap: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: duration.quick, ease: easing.even },
    },

    /** The console's contents arriving after the container has opened. */
    consoleContent: {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 6 },
      transition: { duration: duration.base, ease: easing.refined, delay: 0.12 },
    },

    /** The soft dark wash over the store while the console is open. */
    scrim: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: duration.base, ease: easing.even },
    },

    /** Press feedback on the pill and on controls. */
    press: { scale: 0.96, transition: spring.control },

    /** The breathing halo on the collapsed pill — signals the assistant is
     *  awake and listening without demanding attention. */
    pillPulse: {
      animate: { scale: [1, 1.14, 1], opacity: [0.5, 0, 0.5] },
      transition: { duration: 2.8, ease: easing.even, repeat: Infinity },
    },
  },

  /* ------------------------------------------------------------------
   * VOICE — the microphone and listening states
   * ------------------------------------------------------------------ */
  voice: {
    /** Each bar of the live waveform while the user is speaking.
     *  `index` offsets each bar so they ripple rather than pump together. */
    waveformBar: (index: number) => ({
      animate: { scaleY: [0.35, 1, 0.55, 0.9, 0.35] },
      transition: {
        duration: 1.1,
        ease: easing.even,
        repeat: Infinity,
        delay: index * 0.09,
      },
    }),

    /** The transcript appearing as the user speaks. */
    transcript: {
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: duration.base, ease: easing.refined },
    },
  },
};

/* ==========================================================================
 * REDUCED MOTION
 * Respected automatically. When someone has asked their system for less
 * movement, durations collapse to near zero and only opacity changes remain.
 * ========================================================================== */

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
