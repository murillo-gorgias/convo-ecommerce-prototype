import { ThinkingBubble, type Timing } from './Bubble';

/**
 * ============================================================================
 * SIX WAYS TO TIME THE SAME BUBBLE
 * ============================================================================
 *
 * One drawing, six schedules. The design is settled — a pill, three dots, a
 * sentence, a line going round — so what is being chosen here is pace, not
 * shape. Each entry below changes only numbers.
 *
 * They are ordered from calmest to busiest, so scanning the page top to bottom
 * is itself the comparison.
 */

/** The design's own values, before any of them are pushed around. */
const base: Timing = {
  dotStep: 0.24,
  dotStyle: 'chase',
  dotLift: 0,
  dotsFor: 2.2,
  wordsFor: 2.6,
  shimmer: 2.2,
  morph: { type: 'spring', stiffness: 220, damping: 30 },
  lap: 3.2,
  traceLength: 0.18,
  traces: 1,
  traceDirection: 1,
};

const timings: Record<string, Timing> = {
  /* Everything slow. One lap of the outline takes four seconds, the dots hand
     off lazily, and a sentence sits long enough to be read twice. */
  patient: {
    ...base,
    dotStep: 0.34,
    dotsFor: 2.8,
    wordsFor: 3.4,
    shimmer: 3,
    lap: 4.4,
    traceLength: 0.16,
  },

  /* The design as drawn. A steady chase inside, one segment outside. */
  measured: base,

  /* The dots breathe as one instead of taking turns, and the trace is longer
     and slower — the whole thing reads as one object pulsing rather than
     several parts working. */
  breathing: {
    ...base,
    dotStyle: 'breathe',
    dotStep: 0.62,
    lap: 4,
    traceLength: 0.3,
    shimmer: 2.6,
  },

  /* Each dot rises as it lights, so the row ripples. The sentence comes round
     sooner, and the light through it is quicker. */
  lifted: {
    ...base,
    dotStyle: 'wave',
    dotStep: 0.2,
    dotLift: 2,
    dotsFor: 1.8,
    wordsFor: 2.4,
    shimmer: 1.7,
    lap: 3,
  },

  /* Two segments on opposite sides of the outline, going round together. Twice
     as much happening on the edge, with the inside left alone. */
  twin: {
    ...base,
    traces: 2,
    traceLength: 0.14,
    lap: 3.8,
    dotsFor: 2.4,
    wordsFor: 2.8,
  },

  /* Quick everywhere, and the trace runs the other way. The bubble snaps
     between widths rather than settling into them. */
  brisk: {
    ...base,
    dotStep: 0.16,
    dotsFor: 1.4,
    wordsFor: 2,
    shimmer: 1.3,
    morph: { duration: 0.26 },
    lap: 1.9,
    traceLength: 0.22,
    traceDirection: -1,
  },
};

/* ==========================================================================
 * THE ROSTER
 * ========================================================================== */

export const thinkingVariations = [
  {
    id: 'patient',
    name: 'Patient',
    note: 'Everything slower. A four-second lap, an unhurried hand-off between dots, and a sentence that sits long enough to read twice.',
    Component: () => <ThinkingBubble timing={timings.patient} />,
  },
  {
    id: 'measured',
    name: 'Measured',
    note: 'The design as drawn. One dot lit at a time, one segment going round, a three-second lap.',
    Component: () => <ThinkingBubble timing={timings.measured} />,
  },
  {
    id: 'breathing',
    name: 'Breathing',
    note: 'The three dots move as one rather than taking turns, against a longer, slower trace. Reads as a single thing pulsing.',
    Component: () => <ThinkingBubble timing={timings.breathing} />,
  },
  {
    id: 'lifted',
    name: 'Lifted',
    note: 'Each dot rises as it lights, so the row ripples. Sentences come round sooner and the light through them is quicker.',
    Component: () => <ThinkingBubble timing={timings.lifted} />,
  },
  {
    id: 'twin',
    name: 'Twin trace',
    note: 'Two segments on opposite sides of the outline. Twice as much happening on the edge, the inside unchanged.',
    Component: () => <ThinkingBubble timing={timings.twin} />,
  },
  {
    id: 'brisk',
    name: 'Brisk',
    note: 'Quick everywhere, trace running the other way, and the bubble snapping between widths instead of settling.',
    Component: () => <ThinkingBubble timing={timings.brisk} />,
  },
] as const;

/**
 * THE CHOSEN TIMING
 *
 * `Measured` — the design's own numbers. Picked on 2026-09-01 from the six at
 * `/#thinking`, which stay there for the next round of tuning.
 *
 * Every wait in the prototype runs on this, so changing it here changes all of
 * them at once.
 */
export const thinkingTiming = timings.measured;

/** The assistant composing a reply: the full roster of sentences. */
export const THINKING = () => <ThinkingBubble timing={thinkingTiming} />;

/** For a wait with nothing worth saying: dots and the trace, no sentences. */
export const NO_WORDS: readonly string[] = [];

/**
 * A wait that is about one thing, so it says that thing instead of working
 * through the roster. Pass `NO_WORDS` and it is dots and the trace alone.
 */
export function Working({ words }: { words?: readonly string[] }) {
  return <ThinkingBubble timing={thinkingTiming} words={words} />;
}
