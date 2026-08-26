import { AnimatePresence, motion } from 'motion/react';
import { moves, stagger } from '../../../motion/motion';
import type { Tile } from '../../../content/journey';
import { CheckIcon, HeartIcon, StackIcon } from '../icons';

/**
 * ============================================================================
 * THE PIECES EVERY SECTION IS MADE OF
 * ============================================================================
 *
 * Each section of the session asks its question the same way, so the shopper
 * learns the pattern once:
 *
 *   LABEL      a small caps heading naming the section
 *   PROMPT     the assistant's question, in its own voice
 *   TILES      images to tap
 *   CONFIRMED  the single line the section folds into once answered
 *
 * The fold is the important one. When a section is answered, the images the
 * shopper chose do not disappear and reappear as thumbnails somewhere else —
 * they travel there. Motion matches them by `layoutId`, which is why the same
 * photograph carries the answer from the question to the record of it.
 */

/* ==========================================================================
 * WHAT WAS SAID
 * ========================================================================== */

/** The shopper's own words, shown back to them on the right. */
export function Said({ children }: { children: string }) {
  return (
    <div className="flex w-full justify-end">
      <motion.span
        {...moves.session.said}
        className="flex h-10 items-center rounded-[40px] bg-[var(--query-bubble)] px-3 font-[var(--font-ui)] text-[14px] font-medium leading-[20px] text-[var(--ink-soft)]"
      >
        {children}
      </motion.span>
    </div>
  );
}

/** A line the assistant speaks. */
export function Line({ children, delay = 0 }: { children: string; delay?: number }) {
  return (
    <motion.p
      initial={moves.session.line.initial}
      animate={moves.session.line.animate}
      transition={{ ...moves.session.line.transition, delay }}
      className="w-full font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-black"
    >
      {children}
    </motion.p>
  );
}

/** The small caps heading that opens a section. */
export function Label({ children }: { children: string }) {
  return (
    <motion.p
      {...moves.session.label}
      className="w-full font-[var(--font-ui)] text-[length:var(--type-label-size)] font-semibold uppercase leading-[var(--type-said-line)] text-black"
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
  return (
    <motion.section
      ref={innerRef}
      layout
      {...moves.session.section}
      className="flex w-full scroll-mt-[100px] flex-col items-start gap-3"
    >
      {children}
    </motion.section>
  );
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
          : { ...moves.session.tile.transition, delay: index * stagger.tight }
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
        <span className="px-2 py-1 font-[var(--font-ui)] text-[12px] font-medium text-black">
          {tile.caption}
        </span>
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
            className={chosen ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]' : 'text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]'}
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
  answer,
  thumbs,
}: {
  label: string;
  /** Only shown when the shopper chose more than one thing. */
  count?: number;
  /** The chosen option, written out. Used where the answer has a name. */
  answer?: string;
  /** `id` matches the tile the thumbnail travelled from. */
  thumbs: { id: string; image: string }[];
}) {
  return (
    <motion.div
      layout
      transition={moves.session.fold}
      className={`flex h-[72px] w-full items-center gap-4 overflow-hidden rounded-[24px] border border-[var(--confirmed-border)] bg-[var(--confirmed-bg)] pl-5 ${
        thumbs.length > 1 ? 'pr-5' : ''
      }`}
    >
      <motion.span
        {...moves.session.tick}
        className="shrink-0 text-[var(--ink-soft)]"
      >
        {count ? <StackWithCount count={count} /> : <CheckIcon size={24} />}
      </motion.span>

      <motion.span
        {...moves.session.line}
        className="shrink-0 whitespace-nowrap font-[var(--font-ui)] text-[14px] font-medium leading-[20px] text-[var(--ink-soft)]"
      >
        {label}
      </motion.span>

      {answer && (
        <motion.span
          {...moves.session.line}
          className="shrink-0 whitespace-nowrap font-[var(--font-ui)] text-[14px] leading-[20px] text-[var(--ink-soft)]"
        >
          {answer}
        </motion.span>
      )}

      {/* The evidence. A single answer pushes its one thumbnail to the edge;
          several sit together right after the label. */}
      <span className={`flex shrink-0 items-center gap-1 ${thumbs.length > 1 ? '' : 'ml-auto'}`}>
        {thumbs.map((thumb) => (
          <motion.img
            key={thumb.id}
            layoutId={thumb.id}
            transition={moves.session.thumbTravel}
            src={thumb.image}
            alt=""
            className="h-16 w-16 rounded-[12px] object-cover shadow-[0_4px_4px_rgba(0,0,0,0.03)]"
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
