import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { duration, moves, pace, prefersReducedMotion, stagger, typingSpeed } from '../../../motion/motion';
import type { Phrase, Tile } from '../../../content/journey';
import { HeartIcon, StackIcon } from '../icons';

/**
 * ============================================================================
 * THE PIECES EVERY SECTION IS MADE OF
 * ============================================================================
 *
 * Each section of the session asks its question the same way, so the shopper
 * learns the pattern once:
 *
 *   LABEL      a small caps heading naming the section
 *   PROMPT     the assistant's question, typed out in its own voice
 *   BODY       the images to tap, arriving once the question has been asked
 *   CONFIRMED  the single line the section folds into once answered
 *
 * Two things here are worth understanding before changing anything.
 *
 * THE TYPING. The assistant types rather than pasting. A line that appears
 * whole reads as a database lookup; a line that arrives reads as a reply. The
 * speed is worked out from the length of the line so every line takes about
 * the same time to say — see `pace.typing` in the motion file.
 *
 * THE FOLD. When a section is answered, the images the shopper chose do not
 * disappear and reappear as thumbnails somewhere else — they travel there.
 * Motion matches them by `layoutId`, which is why the same photograph carries
 * the answer from the question to the record of it.
 */

/* ==========================================================================
 * WHAT IS ALLOWED TO MORPH
 *
 * SHAPES MORPH. TEXT NEVER DOES.
 *
 * A layout animation works by measuring a box before and after, then scaling
 * the difference away. That is exactly right for a container changing shape —
 * a card opening out, a section folding to a line — and exactly wrong for
 * anything inside it, because the scale is applied to the contents too. Words
 * stretch and squash, and icons that sit with words stretch with them. It is
 * the single thing that makes an otherwise good transition look cheap.
 *
 * So every run of text, and every icon that belongs to text, is wrapped in
 * `Steady`. It moves with its container and is never scaled by it.
 *
 * Use it for anything with words in it that lives inside a `layout` element.
 * ========================================================================== */

export function Steady({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div layout="position" className={className}>
      {children}
    </motion.div>
  );
}

/* ==========================================================================
 * TYPING
 * ========================================================================== */

/**
 * Reveals a line one character at a time. Anyone who has asked their system
 * for less movement gets the whole line at once.
 */
function useTypewriter(text: string, start: boolean, onDone?: () => void) {
  const [count, setCount] = useState(0);
  const finished = useRef(onDone);
  finished.current = onDone;

  useEffect(() => {
    if (!start) return;

    if (prefersReducedMotion()) {
      setCount(text.length);
      finished.current?.();
      return;
    }

    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) {
        window.clearInterval(timer);
        finished.current?.();
      }
    }, typingSpeed(text.length));

    return () => window.clearInterval(timer);
  }, [start, text]);

  return { shown: text.slice(0, count), typing: start && count < text.length };
}

/* ==========================================================================
 * WHAT WAS SAID
 * ========================================================================== */

/** The shopper's own words, shown back to them on the right. */
export function Said({ children }: { children: string }) {
  return (
    <div className="flex w-full justify-end">
      <motion.span
        {...moves.session.said}
        className="flex h-10 items-center rounded-[40px] bg-[var(--query-bubble)] px-3 font-[var(--font-ui)] text-[14px] font-medium leading-[20px] text-[var(--on-image)]"
      >
        {children}
      </motion.span>
    </div>
  );
}

/**
 * A line the assistant speaks, typed out.
 *
 * The full line is rendered underneath at zero opacity so the paragraph holds
 * its final height from the very first character. Without that, the whole
 * conversation below would shunt down every time a line wrapped onto a new row.
 */
export function Line({
  children,
  start = true,
  onDone,
}: {
  children: string;
  /** Held false until it is this line's turn to be said. */
  start?: boolean;
  onDone?: () => void;
}) {
  const { shown, typing } = useTypewriter(children, start, onDone);

  return (
    <motion.p
      {...moves.session.line}
      className="relative w-full font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-black"
    >
      <span aria-hidden className="invisible">
        {children}
      </span>
      <span className="absolute inset-0">
        {shown}
        {typing && (
          <motion.span
            {...moves.session.caret}
            className="ml-[1px] inline-block h-[13px] w-[1.5px] translate-y-[2px] bg-black/70"
          />
        )}
      </span>
    </motion.p>
  );
}

/**
 * A line with the facts worth checking set in bold, typed out as one sentence.
 *
 * The whole line types at one speed regardless of where the bold falls — the
 * emphasis is in the weight, never in the pacing. Underneath sits the finished
 * sentence at zero opacity, so the block holds its height from the first
 * character exactly as a plain line does.
 */
export function Emphasis({
  phrases,
  start = true,
  onDone,
}: {
  phrases: readonly Phrase[];
  start?: boolean;
  onDone?: () => void;
}) {
  const full = phrases.map((phrase) => phrase.text).join('');
  const { shown, typing } = useTypewriter(full, start, onDone);

  /* Where each phrase begins in the finished sentence, so the words typed so
     far can be handed back to the phrase they belong to. */
  let at = 0;
  const spans = phrases.map((phrase) => {
    const from = at;
    at += phrase.text.length;
    return { ...phrase, said: shown.slice(from, at) };
  });

  return (
    <motion.p
      {...moves.session.line}
      className="relative w-full font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-black"
    >
      <span aria-hidden className="invisible">
        {phrases.map((phrase, index) => (
          <span key={index} className={phrase.strong ? 'font-semibold' : undefined}>
            {phrase.text}
          </span>
        ))}
      </span>
      <span className="absolute inset-0">
        {spans.map((phrase, index) => (
          <span key={index} className={phrase.strong ? 'font-semibold' : undefined}>
            {phrase.said}
          </span>
        ))}
        {typing && (
          <motion.span
            {...moves.session.caret}
            className="ml-[1px] inline-block h-[13px] w-[1.5px] translate-y-[2px] bg-black/70"
          />
        )}
      </span>
    </motion.p>
  );
}

/**
 * Several paragraphs, said one after another.
 *
 * The assistant does not deliver a whole answer at once. Each paragraph types
 * itself out, and the next one does not begin until the last has finished —
 * which is the difference between being answered and being handed a page.
 */
export function Lines({
  children,
  start = true,
  onDone,
}: {
  children: readonly string[];
  start?: boolean;
  onDone?: () => void;
}) {
  const [said, setSaid] = useState(0);

  /**
   * EVERY paragraph is rendered from the first frame, even the ones that have
   * not been said yet. Each one holds its own final height through the
   * invisible copy inside `Line`, so the block reserves all of its space up
   * front and nothing above it moves while the assistant types.
   *
   * Adding paragraphs to the DOM as they were spoken is what made the
   * conversation twitch: every new one grew the thread, and everything already
   * on screen slid to make room, several times per answer.
   */
  return (
    <div className="flex w-full flex-col gap-3">
      {children.map((text, index) => (
        <Line
          key={index}
          start={start && index <= said}
          onDone={() => {
            if (index < children.length - 1) {
              window.setTimeout(() => setSaid(index + 1), pace.beforeSpeech);
            } else {
              onDone?.();
            }
          }}
        >
          {text}
        </Line>
      ))}
    </div>
  );
}

/**
 * Points, read out one after another.
 *
 * Same pacing as `Lines` — a point is not begun until the one above it has
 * been made. Points are for a set of separate findings; a paragraph is for
 * one thought. Reporting what several buyers said is the first kind.
 */
export function Bullets({
  children,
  start = true,
  onDone,
}: {
  children: readonly string[];
  start?: boolean;
  onDone?: () => void;
}) {
  const [said, setSaid] = useState(0);

  return (
    <ul className="flex w-full list-disc flex-col gap-2 pl-5 marker:text-black">
      {children.map((text, index) => (
        <li key={index} className="w-full">
          <Line
            start={start && index <= said}
            onDone={() => {
              if (index < children.length - 1) {
                window.setTimeout(() => setSaid(index + 1), pace.beforeSpeech);
              } else {
                onDone?.();
              }
            }}
          >
            {text}
          </Line>
        </li>
      ))}
    </ul>
  );
}

/** The editorial serif eyebrow that opens a section. */
export function Label({ children }: { children: string }) {
  return (
    <motion.p
      {...moves.session.label}
      className="w-full [font-family:var(--font-serif)] text-[length:var(--type-eyebrow-size)] font-[var(--type-eyebrow-weight)] lowercase leading-[var(--type-eyebrow-line)] text-black"
    >
      {children}
    </motion.p>
  );
}

/** The vertical rhythm every section sits on. */
export function Section({
  children,
  innerRef,
}: {
  children: React.ReactNode;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  /* No `layout` here. A section only ever grows downwards as its parts arrive,
     and every part animates its own entrance — so there is no shape change
     worth animating, and a layout animation would scale every word in it. */
  return (
    <motion.section
      ref={innerRef}
      {...moves.session.section}
      className="flex w-full flex-col items-start gap-3"
    >
      {children}
    </motion.section>
  );
}

/* ==========================================================================
 * THE ORDER A SECTION ARRIVES IN
 *
 * Label, a beat, the question typing itself out, a beat, and only then the
 * thing it is asking for. Every section follows it, which is what makes the
 * session feel paced rather than rendered.
 * ========================================================================== */

export function useSectionReveal() {
  const [speaking, setSpeaking] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSpeaking(true), pace.beforeSpeech);
    return () => window.clearTimeout(timer);
  }, []);

  /** Called the moment the question has finished being asked. */
  const onSpoken = () => {
    window.setTimeout(() => setReady(true), pace.afterSpeech);
  };

  return { speaking, ready, onSpoken };
}

/**
 * Brings in whatever a question is asking for, once it has been asked.
 *
 * It does not scroll. Nothing in a section does: the thread follows its own
 * bottom as it grows, in one place, so two parts arriving close together
 * cannot fight each other for the scroll position.
 */
export function Body({
  show,
  children,
  onSettled,
}: {
  show: boolean;
  children: React.ReactNode;
  /** Called once the body has arrived and the section has nothing left to say. */
  onSettled?: () => void;
}) {
  const settle = useRef(onSettled);
  settle.current = onSettled;

  useEffect(() => {
    if (!show) return;
    const timer = window.setTimeout(() => settle.current?.(), duration.considered * 1000);
    return () => window.clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div layout {...moves.session.body} className="w-full">
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Waits, then does something once. Every pause in the session runs through
 * here, so no component reaches for `setTimeout` on its own.
 */
export function useAfter(delay: number, run: boolean, then: () => void) {
  const act = useRef(then);
  act.current = then;

  useEffect(() => {
    if (!run) return;
    const timer = window.setTimeout(() => act.current(), delay);
    return () => window.clearTimeout(timer);
  }, [delay, run]);
}

/* ==========================================================================
 * AN IMAGE THE SHOPPER CAN TAP
 *
 * Two shapes of the same thing:
 *   'vibe'    a tall wordless tile with a heart in the corner
 *   'choice'  a captioned tile, where the caption is the answer
 * ========================================================================== */

export function ImageTile({
  tile,
  chosen,
  onChoose,
  variant,
  index,
  discarded,
  sharedId,
}: {
  tile: Tile;
  chosen: boolean;
  onChoose: () => void;
  variant: 'vibe' | 'choice';
  index: number;
  /** True while the section folds, for tiles that were not chosen. */
  discarded: boolean;
  /** Ties this image to the thumbnail it becomes once the section folds. */
  sharedId: string;
}) {
  const isVibe = variant === 'vibe';

  return (
    <motion.button
      type="button"
      onClick={onChoose}
      aria-pressed={chosen}
      aria-label={tile.caption ?? tile.alt}
      initial={moves.session.tile.initial}
      animate={
        discarded
          ? moves.session.tileDiscard
          : { ...moves.session.tile.animate, ...moves.session.tileChoice[chosen ? 'chosen' : 'open'] }
      }
      transition={
        discarded
          ? moves.session.tileDiscard.transition
          : { ...moves.session.tile.transition, delay: index * stagger.base }
      }
      whileTap={moves.session.tilePress}
      className={
        isVibe
          ? 'relative h-[243px] w-full overflow-hidden rounded-[12px]'
          : 'relative flex w-full flex-col items-center gap-2 overflow-hidden rounded-[12px] border border-[var(--tile-border)] pb-1'
      }
    >
      <motion.img
        layoutId={sharedId}
        transition={moves.session.thumbTravel}
        src={tile.image}
        alt=""
        className={
          isVibe
            ? 'h-full w-full rounded-[12px] object-cover'
            : 'h-[160px] w-full rounded-t-[12px] object-cover'
        }
      />

      {tile.caption && (
        <Steady className="px-2 py-1 font-[var(--font-ui)] text-[12px] font-medium text-black">
          {tile.caption}
        </Steady>
      )}

      {/* The ring that marks a chosen tile. */}
      <AnimatePresence>
        {chosen && (
          <motion.span
            {...moves.session.tileRing}
            className="pointer-events-none absolute inset-0 rounded-[12px] ring-2 ring-inset ring-[var(--tile-chosen)]"
          />
        )}
      </AnimatePresence>

      {isVibe && (
        <span className="absolute bottom-[6px] right-[6px] grid h-10 w-10 place-items-center">
          <motion.span
            key={chosen ? 'on' : 'off'}
            animate={chosen ? moves.session.heartBeat.animate : undefined}
            transition={moves.session.heartBeat.transition}
            className={
              chosen
                ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]'
                : 'text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]'
            }
          >
            <HeartIcon filled={chosen} />
          </motion.span>
        </span>
      )}
    </motion.button>
  );
}

/* ==========================================================================
 * THE LINE A SECTION FOLDS INTO
 *
 * One row. What was decided on the left, the evidence on the right. A count
 * appears when the answer was more than one thing.
 * ========================================================================== */

export function Confirmed({
  label,
  count,
  icon,
  thumbs,
}: {
  label: string;
  /** Only shown when the shopper chose more than one thing. */
  count?: number;
  /** A mark tailored to the answer when the shopper chose one thing. */
  icon?: ReactNode;
  /** `id` matches the tile the thumbnail travelled from. */
  thumbs: { id: string; image: string }[];
}) {
  return (
    <motion.div
      layout
      transition={moves.session.fold}
      className="flex h-[72px] w-full items-center gap-4 overflow-hidden rounded-[var(--fold-radius)] border border-[var(--confirmed-border)] bg-[var(--confirmed-bg)] py-1 pl-5 pr-1"
    >
      {/* The mark and the words travel with the row and are never scaled by
          it — see the rule at the top of this file. */}
      <Steady className="flex min-w-0 flex-1 items-center gap-4">
        <motion.span {...moves.session.tick} className="shrink-0 text-[var(--ink-soft)]">
          {count ? <StackWithCount count={count} /> : icon}
        </motion.span>

        <motion.span
          {...moves.session.line}
          className="shrink-0 whitespace-nowrap font-[var(--font-ui)] text-[14px] font-medium leading-[20px] text-[var(--ink-soft)]"
        >
          {label}
        </motion.span>

      </Steady>

      {/* The evidence, inset by the same 4px on every side. The row's corner
          and the thumbnail's corner are concentric — the outer radius less the
          inset — which is what makes them read as one object rather than a
          picture dropped into a box. */}
      <span className="flex shrink-0 items-center gap-1">
        {thumbs.map((thumb) => (
          <motion.img
            key={thumb.id}
            layoutId={thumb.id}
            transition={moves.session.thumbTravel}
            src={thumb.image}
            alt=""
            draggable={false}
            className="h-16 w-16 rounded-[var(--fold-inner-radius)] object-cover shadow-[0_4px_4px_rgba(0,0,0,0.03)]"
          />
        ))}
      </span>
    </motion.div>
  );
}

/** The stack mark with the number of things chosen sitting on its shoulder. */
function StackWithCount({ count }: { count: number }) {
  return (
    <span className="relative flex items-center">
      <StackIcon size={16} />
      <span className="-ml-[6px] -mt-[8px] grid h-[13px] min-w-[13px] place-items-center rounded-full bg-[var(--ink-soft)] px-[3px] font-[var(--font-ui)] text-[10px] font-semibold leading-[14px] text-white">
        {count}
      </span>
    </span>
  );
}
