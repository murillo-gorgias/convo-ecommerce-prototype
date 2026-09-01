import { motion } from 'motion/react';
import { moves } from '../motion/motion';

/**
 * ============================================================================
 * THE CHECKPOINT RAIL
 * ============================================================================
 *
 * A way to jump straight to any part of the journey while working on it. It
 * sits OUTSIDE the phone, in the grey around it, because it is not part of
 * what is being designed — it is the same presentation dressing as the frame.
 *
 * Each stop is a rule and a name. The one you are on is longer and darker;
 * the rest sit back. Picking the stop you are already on runs it again from
 * the beginning, which is the whole point of a rail like this — a section is
 * paced, and watching it once is rarely enough.
 */

export type Stop = { hash: string; label: string };

/**
 * Every part of the journey, in the order it happens. The thinking gallery is
 * not one of them — it is a place to compare marks, not a stop on the way
 * through the flow, and `#thinking` still reaches it.
 */
export const STOPS: Stop[] = [
  { hash: '', label: 'Storefront' },
  { hash: '#session', label: 'Greeting' },
  { hash: '#vibe', label: 'Vibe check' },
  { hash: '#product', label: 'Product' },
  { hash: '#cart', label: 'Bag' },
  { hash: '#checkout', label: 'Checkout' },
];

export function Checkpoints({
  hash,
  onReplay,
}: {
  hash: string;
  /** Called when the stop already showing is picked, so it can run again. */
  onReplay: () => void;
}) {
  const go = (stop: Stop) => {
    if (stop.hash === hash) {
      onReplay();
      return;
    }
    window.location.hash = stop.hash;
  };

  return (
    <nav
      aria-label="Prototype checkpoints"
      className="fixed left-8 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-1 lg:flex"
    >
      {STOPS.map((stop) => {
        const here = stop.hash === hash;
        return (
          <button
            key={stop.hash || 'root'}
            type="button"
            onClick={() => go(stop)}
            aria-current={here || undefined}
            className="group flex items-center gap-3 py-[6px] text-left"
          >
            {/* The rule. It is the state; the name only reads it back. */}
            <motion.span
              layout
              transition={moves.session.fold}
              className={`block h-px shrink-0 ${
                here ? 'w-8 bg-[var(--ink)]' : 'w-4 bg-[var(--ink)]/25 group-hover:bg-[var(--ink)]/50'
              }`}
            />
            <span
              className={`font-[var(--font-ui)] text-[10px] font-medium uppercase leading-[14px] tracking-[var(--type-label-tracking)] ${
                here
                  ? 'text-[var(--ink)]'
                  : 'text-[var(--ink)]/30 group-hover:text-[var(--ink)]/60'
              }`}
            >
              {stop.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
