import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { moves } from '../../../motion/motion';
import { ArrowRightIcon } from '../icons';

/**
 * ============================================================================
 * SWIPE TO PAY
 * ============================================================================
 *
 * The only control in the whole session that asks for a deliberate gesture
 * rather than a tap, because paying is the only thing here that cannot be
 * undone. Everything else — opening a piece, adding to the bag, asking a
 * question — can be walked back by scrolling up. This cannot.
 *
 * The knob follows the finger. Let go before the end and it returns; carry it
 * past the end and the track fills, the label goes, and it is done.
 */

/** How far along the track counts as carried through. */
const COMMIT = 0.72;

export function SwipeToPay({ label, onPaid }: { label: string; onPaid: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [paid, setPaid] = useState(false);
  const x = useMotionValue(0);

  /* The label fades as the knob passes over it, so the two never fight. */
  const labelOpacity = useTransform(x, [0, 120], [1, 0]);

  /**
   * How far the knob can travel. Measured after the track is in the document
   * rather than read during render, where its width is still zero and the
   * drag would be constrained to nothing.
   */
  const [travel, setTravel] = useState(0);

  useEffect(() => {
    const measure = () => setTravel(Math.max(0, (track.current?.offsetWidth ?? 0) - 48));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div
      ref={track}
      className="relative flex h-12 w-full items-center overflow-hidden rounded-[32px] bg-[var(--field-bg)]"
    >
      {/* The track filling in behind the knob once the swipe is carried. */}
      <motion.span
        aria-hidden
        initial={moves.session.swipeFill.initial}
        animate={paid ? moves.session.swipeFill.animate : moves.session.swipeFill.initial}
        transition={moves.session.swipeFill.transition}
        className="absolute inset-0 origin-left rounded-[32px] bg-[var(--control-dark)]"
      />

      <motion.span
        style={{ opacity: paid ? 0 : labelOpacity }}
        transition={moves.session.swipeLabel.transition}
        className="pointer-events-none absolute inset-0 grid place-items-center font-[var(--font-ui)] text-[14px] font-medium leading-[20px] text-black"
      >
        {label}
      </motion.span>

      <motion.button
        type="button"
        aria-label={label}
        drag={paid || travel === 0 ? false : 'x'}
        dragConstraints={{ left: 0, right: travel }}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={() => {
          if (travel > 0 && x.get() / travel >= COMMIT) {
            x.set(travel);
            setPaid(true);
            onPaid();
          } else {
            x.set(0);
          }
        }}
        transition={moves.session.swipeReturn}
        className="relative z-10 ml-1 grid h-10 w-10 shrink-0 cursor-grab place-items-center rounded-full bg-[var(--control-dark)] text-white active:cursor-grabbing"
      >
        <ArrowRightIcon size={20} />
      </motion.button>
    </div>
  );
}
