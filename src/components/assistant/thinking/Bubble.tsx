import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { prefersReducedMotion } from '../../../motion/motion';
import { thinkingWords } from '../../../content/journey';

/**
 * ============================================================================
 * THE THINKING BUBBLE
 * ============================================================================
 *
 * The pause between the shopper sending a message and the assistant replying.
 *
 * It is a chat bubble with three things happening at once:
 *
 *   INSIDE, THE DOTS. Three of them take turns going dark. That is the part
 *   that says "working", and it is the part a shopper has seen a thousand
 *   times, which is exactly why it is here — it needs no explaining.
 *
 *   INSIDE, THE WORDS. The dots give way to a short sentence saying what is
 *   being done, then hand back. A light travels through the sentence while it
 *   is up. Dots alone say the assistant is busy; the sentence says it is busy
 *   with something, which is the difference between waiting and being told.
 *
 *   OUTSIDE, THE TRACE. The outline is barely there, and one short black
 *   segment travels around its path. It is the only thing on screen making a
 *   full circuit, so it carries the sense of elapsed time that a blinking dot
 *   cannot.
 *
 * WHY ONE COMPONENT AND SIX SETS OF NUMBERS
 * The design is settled; the timing is not. Everything that could reasonably
 * be tuned is a field in `Timing` below, so a variation is a set of numbers
 * rather than another copy of the drawing. Comparing six drawings tells you
 * which drawing you prefer. Comparing six sets of numbers tells you what the
 * animation should do.
 */

export type Timing = {
  /* --- The dots -------------------------------------------------------- */
  /** How long one dot stays lit before the next takes over, in seconds. */
  dotStep: number;
  /**
   * How the dots take turns.
   *   'chase'  one lit at a time, left to right
   *   'wave'   each dot fades up and down, offset from the last
   *   'breathe'  all three together, dark to light and back
   */
  dotStyle: 'chase' | 'wave' | 'breathe';
  /** How far a dot lifts as it lights, in pixels. 0 keeps them on one line. */
  dotLift: number;

  /* --- The words ------------------------------------------------------- */
  /** How long the dots hold before a sentence takes over, in seconds. */
  dotsFor: number;
  /** How long a sentence stays up before the dots come back, in seconds. */
  wordsFor: number;
  /** One pass of the light through the sentence, in seconds. */
  shimmer: number;
  /** How the bubble changes width between the two. */
  morph: { type: 'spring'; stiffness: number; damping: number } | { duration: number };

  /* --- The trace ------------------------------------------------------- */
  /** One full circuit of the outline, in seconds. */
  lap: number;
  /** How much of the outline the travelling segment covers, 0 to 1. */
  traceLength: number;
  /** How many segments are going round. */
  traces: number;
  /** Which way they go. */
  traceDirection: 1 | -1;
};

const HEIGHT = 40;
const DOTS_WIDTH = 56;

/* The dots, at the positions the design puts them: 4px across, 6px apart,
   centred in a 56px pill. */
const DOTS = [22, 28, 34];

export function ThinkingBubble({ timing }: { timing: Timing }) {
  const still = prefersReducedMotion();

  /** Which sentence is up, or none — in which case the dots have it. */
  const [saying, setSaying] = useState<number>();

  /** The width the bubble is heading for. */
  const [width, setWidth] = useState(DOTS_WIDTH);

  /** The width it is actually at, which during the tween is neither end. */
  const [drawn, setDrawn] = useState(DOTS_WIDTH);

  const shell = useRef<HTMLDivElement>(null);
  const sizer = useRef<HTMLSpanElement>(null);

  /* The two states take turns. Dots for a while, then a sentence, then the
     dots again with the next sentence queued behind them. */
  useEffect(() => {
    if (still) return;
    let at = -1;
    let timer = 0;

    const toWords = () => {
      at = (at + 1) % thinkingWords.length;
      setSaying(at);
      timer = window.setTimeout(toDots, timing.wordsFor * 1000);
    };
    const toDots = () => {
      setSaying(undefined);
      timer = window.setTimeout(toWords, timing.dotsFor * 1000);
    };

    timer = window.setTimeout(toWords, timing.dotsFor * 1000);
    return () => window.clearTimeout(timer);
  }, [still, timing.dotsFor, timing.wordsFor]);

  /* The bubble is only ever as wide as what is inside it. Sentences are
     different lengths, and a fixed width would leave a gap after the short
     ones.

     Measured off a hidden copy rather than off the visible words, because the
     visible ones live inside an `AnimatePresence` that mounts them only after
     the dots have finished leaving — by which time the width is needed. */
  useLayoutEffect(() => {
    if (saying === undefined) {
      setWidth(DOTS_WIDTH);
      return;
    }
    const copy = sizer.current;
    if (copy) setWidth(Math.ceil(copy.getBoundingClientRect().width) + 24);
  }, [saying]);

  /* What the outline is drawn against. The bubble's width is animated, so the
     value in state is where it is going, not where it is; the outline has to
     follow the tween itself or it would snap ahead of the shape it traces. */
  useLayoutEffect(() => {
    const box = shell.current;
    if (!box) return;
    const watch = new ResizeObserver(() => setDrawn(box.getBoundingClientRect().width));
    watch.observe(box);
    return () => watch.disconnect();
  }, []);

  return (
    <motion.div
      ref={shell}
      role="status"
      aria-label="Thinking"
      animate={{ width }}
      initial={false}
      transition={
        still
          ? { duration: 0 }
          : 'type' in timing.morph
            ? timing.morph
            : { duration: timing.morph.duration, ease: [0.4, 0, 0.2, 1] }
      }
      className="relative shrink-0 overflow-hidden"
      style={{ height: HEIGHT, borderRadius: HEIGHT / 2 }}
    >
      <Outline timing={timing} still={still} width={drawn} />

      {/* Never seen. Only measured. */}
      <span
        ref={sizer}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap font-[var(--font-ui)] text-[14px] font-medium leading-[20px]"
      >
        {saying === undefined ? '' : thinkingWords[saying]}
      </span>

      <div className="absolute inset-0 flex items-center justify-center px-3">
        <AnimatePresence mode="wait" initial={false}>
          {saying === undefined ? (
            <motion.span
              key="dots"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="flex items-center"
              style={{ gap: 2 }}
            >
              {DOTS.map((_, index) => (
                <Dot key={index} index={index} timing={timing} still={still} />
              ))}
            </motion.span>
          ) : (
            <motion.span
              key={saying}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="whitespace-nowrap font-[var(--font-ui)] text-[14px] font-medium leading-[20px]"
              style={
                still
                  ? { color: 'var(--thinking-word)' }
                  : {
                      /* The light is a gradient wider than the words, slid
                         across them. Clipped to the glyphs, so it travels
                         through the letters rather than over them. */
                      backgroundImage:
                        'linear-gradient(90deg, var(--thinking-word-far) 0%, var(--thinking-word) 42%, var(--thinking-word-far) 84%)',
                      backgroundSize: '260% 100%',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      animation: `thinking-shimmer ${timing.shimmer}s linear infinite`,
                    }
              }
            >
              {thinkingWords[saying]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ==========================================================================
 * ONE DOT
 * ========================================================================== */

function Dot({ index, timing, still }: { index: number; timing: Timing; still: boolean }) {
  const cycle = timing.dotStep * DOTS.length;

  if (still) {
    return <span className="block size-1 rounded-full" style={{ background: 'var(--thinking-dot)' }} />;
  }

  /* Each style is the same three dots on a different schedule. `chase` hands a
     single light along; `wave` gives every dot the same rise and fall, offset;
     `breathe` moves all three as one. */
  const schedule = {
    chase: {
      color: ['var(--thinking-dot-lit)', 'var(--thinking-dot)', 'var(--thinking-dot)'],
      times: [0, 1 / DOTS.length, 1],
      delay: -index * timing.dotStep,
    },
    wave: {
      color: [
        'var(--thinking-dot)',
        'var(--thinking-dot-lit)',
        'var(--thinking-dot)',
      ],
      times: [0, 0.5, 1],
      delay: -index * timing.dotStep,
    },
    breathe: {
      color: [
        'var(--thinking-dot)',
        'var(--thinking-dot-lit)',
        'var(--thinking-dot)',
      ],
      times: [0, 0.5, 1],
      delay: 0,
    },
  }[timing.dotStyle];

  return (
    <motion.span
      className="block size-1 rounded-full"
      animate={{
        backgroundColor: schedule.color,
        y: timing.dotLift ? [0, -timing.dotLift, 0] : 0,
      }}
      transition={{
        duration: timing.dotStyle === 'breathe' ? timing.dotStep * 2 : cycle,
        times: schedule.times,
        ease: timing.dotStyle === 'chase' ? 'linear' : 'easeInOut',
        repeat: Infinity,
        delay: schedule.delay,
      }}
    />
  );
}

/* ==========================================================================
 * THE OUTLINE, AND THE LINE GOING ROUND IT
 *
 * Drawn as an SVG rounded rectangle rather than a CSS border, because a border
 * cannot have something travel along it. The faint outline and the travelling
 * segment are the same path twice: the second one is mostly gaps, and the gaps
 * are slid around the path.
 *
 * `pathLength={1}` makes the dash maths independent of how wide the bubble is,
 * so a segment covering a fifth of the outline stays a fifth of it as the
 * bubble grows to hold a sentence.
 * ========================================================================== */

function Outline({
  timing,
  still,
  width,
}: {
  timing: Timing;
  still: boolean;
  width: number;
}) {
  const r = HEIGHT / 2;

  /* The dashes are laid out in fractions of the path because `pathLength` is
     1, so a segment covering a fifth of the outline stays a fifth of it as the
     bubble grows. The gaps divide whatever the segments leave. */
  const gap = Math.max(0, (1 - timing.traceLength * timing.traces) / timing.traces);

  /* An SVG rect takes numbers, not `calc()`. Half a stroke is taken off each
     side so the 1px line sits inside the shape rather than half outside it. */
  const w = Math.max(HEIGHT, width) - 1;

  const outline = { x: 0.5, y: 0.5, width: w, height: HEIGHT - 1, rx: r, fill: 'none' };

  return (
    <svg className="absolute inset-0 size-full" aria-hidden>
      <rect {...outline} stroke="var(--thinking-outline)" strokeWidth="1" />

      {!still && (
        <rect
          {...outline}
          stroke="var(--thinking-trace)"
          strokeWidth="1"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${timing.traceLength} ${gap}`}
          style={{
            animation: `thinking-trace ${timing.lap}s linear infinite`,
            animationDirection: timing.traceDirection === 1 ? 'normal' : 'reverse',
          }}
        />
      )}
    </svg>
  );
}
