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
 * 5. PACE
 * How long the assistant WAITS. Everything above is about how things move;
 * this is about the silence between them.
 *
 * The session is a conversation, and a conversation has turns. If a section
 * folds, the assistant replies, and the next question appears all in the same
 * half second, none of it is read — it looks like a page loading rather than
 * someone thinking. Every number here buys a beat of that silence.
 *
 * All values are in MILLISECONDS, because they are waits, not animations.
 * ========================================================================== */

export const pace = {
  /** After the shopper's own words appear, before the assistant replies. */
  afterSaid: 620,

  /** After a section appears, before it starts speaking. */
  beforeSpeech: 340,

  /** After a line finishes typing, before what it asks for arrives. */
  afterSpeech: 460,

  /** After a section folds shut, before the assistant says anything about it. */
  afterFold: 700,

  /** After a section is completely settled, before the next one appears. */
  betweenSections: 950,

  /**
   * After the account has visibly opened, before the session takes the screen.
   * This one is the longest wait in the prototype on purpose: it is the only
   * moment the shopper is asked to wait for something real, and the expansion
   * that follows is the biggest movement in the journey. Landing them on top
   * of each other wastes both.
   */
  beforeExpanding: 1500,

  /**
   * TYPING. The assistant types rather than pasting, because a line that
   * appears whole reads as a lookup and a line that arrives reads as a reply.
   *
   * The speed per character is worked out from the length of the line, so a
   * short line and a long one take roughly the same time to say. Without that,
   * a two-sentence prompt would hold the shopper for five seconds.
   */
  typing: {
    /** How long a line should take to say, whatever its length. */
    target: 1500,
    /** Never faster than this per character. */
    min: 9,
    /** Never slower than this per character. */
    max: 30,
  },
} as const;

/** The per-character delay for one line, given how long it is. */
export const typingSpeed = (length: number) =>
  Math.min(pace.typing.max, Math.max(pace.typing.min, pace.typing.target / Math.max(length, 1)));

/* ==========================================================================
 * 6. MOVES
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
   * THE GUIDED SESSION — the assistant's questions, one after another
   *
   * The session is a single scrolling conversation. Its movement follows one
   * rule: a section ARRIVES softly and LEAVES by folding into the one line
   * that records the answer. Nothing is ever thrown away on screen.
   *
   * The fold is the moment worth protecting. The two chosen images do not
   * fade out and fade back in somewhere else — they travel, because Motion
   * matches them by `layoutId` across the change.
   * ------------------------------------------------------------------ */
  session: {
    /** The two warm glows behind the sheet, drifting so it never reads flat. */
    glow: (index: number) => ({
      animate: {
        x: index === 0 ? [0, 26, 0] : [0, -22, 0],
        y: index === 0 ? [0, -18, 0] : [0, 20, 0],
        scale: [1, 1.08, 1],
      },
      transition: {
        duration: 22 + index * 6,
        ease: easing.even,
        repeat: Infinity,
        delay: index * 2,
      },
    }),

    /** The header: back button, wordmark and close, fading down into place. */
    chrome: {
      initial: { opacity: 0, y: -8 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: duration.base, ease: easing.refined, delay: 0.1 },
    },

    /** What the shopper said, shown back to them. */
    said: {
      initial: { opacity: 0, y: 8, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: spring.control,
    },

    /** A line the assistant speaks. Rises a little as it arrives. */
    line: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: duration.considered, ease: easing.refined },
    },

    /** The caret blinking at the end of a line still being typed. */
    caret: {
      animate: { opacity: [1, 1, 0, 0] },
      transition: { duration: 0.9, ease: 'linear' as const, repeat: Infinity, times: [0, 0.45, 0.5, 1] },
    },

    /** What a question asks for — the tiles, the carousel — arriving after
     *  the question has finished being asked. */
    body: {
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: duration.considered, ease: easing.refined },
    },

    /** The small caps label that opens a section. Letters settle inward. */
    label: {
      initial: { opacity: 0, letterSpacing: '3px' },
      animate: { opacity: 1, letterSpacing: 'var(--type-label-tracking)' },
      transition: { duration: duration.considered, ease: easing.refined },
    },

    /** A whole section arriving. */
    section: {
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: duration.considered, ease: easing.refined },
    },

    /** One image tile settling in. Delay is applied where they are rendered. */
    tile: {
      initial: { opacity: 0, y: 20, scale: 0.94 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: duration.considered, ease: easing.refined },
    },

    /** The tile the shopper is pressing. */
    tilePress: { scale: 0.97, transition: spring.control },

    /** Chosen and unchosen, as a tile is tapped. The image eases back very
     *  slightly so the ring around it has somewhere to sit. */
    tileChoice: {
      chosen: { scale: 0.965 },
      open: { scale: 1 },
      transition: spring.control,
    },

    /** The ring that marks a chosen tile. */
    tileRing: {
      initial: { opacity: 0, scale: 1.02 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.02 },
      transition: spring.control,
    },

    /** The heart, at the moment it is filled. A single beat, no bounce after. */
    heartBeat: {
      animate: { scale: [1, 1.3, 1] },
      transition: { duration: duration.base, ease: easing.refined },
    },

    /** THE FOLD. The confirmed line taking the place of the open section. */
    fold: spring.surface,

    /** A tile that was not chosen, leaving as the section folds. */
    tileDiscard: {
      opacity: 0,
      scale: 0.9,
      filter: 'blur(4px)',
      transition: { duration: duration.quick, ease: easing.exit },
    },

    /** A thumbnail travelling into the confirmed line. */
    thumbTravel: spring.surface,

    /** The suggestion chips above the input, arriving and leaving. */
    chip: {
      initial: { opacity: 0, y: 8, scale: 0.94 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 4, scale: 0.94 },
      transition: spring.control,
    },

    /** A recommended piece arriving in the carousel. */
    piece: {
      initial: { opacity: 0, y: 24, scale: 0.97 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: duration.considered, ease: easing.refined },
    },

    /** Light travelling across text while the account is being opened. */
    shimmer: {
      animate: { backgroundPosition: ['200% 0', '-200% 0'] },
      transition: { duration: 1.6, ease: 'linear' as const, repeat: Infinity },
    },

    /** The mark beside the sign-in line: a shape that opens, turns and closes
     *  again. Door, to circle, to door. */
    unlockMark: {
      animate: { rotate: [0, 180, 360], borderRadius: ['4px', '50%', '4px'] },
      transition: { duration: 1.8, ease: easing.refined, repeat: Infinity },
    },

    /** The tick that lands when a section is confirmed. */
    tick: {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { ...spring.control, delay: 0.08 },
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
