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
 * HOW IT LOOKS, AND WHY IT CHANGES
 * At rest it is a solid black button: the most emphatic thing on the screen,
 * because it is the only thing left to do. As the knob is dragged the track
 * turns to glass under it — the control gives way rather than filling up. A
 * progress bar would say "you are 60% of the way through a task"; this says
 * "the thing you were about to press is opening".
 *
 * The knob follows the finger. Let go before the end and it returns; carry it
 * past the end and it is done.
 */

/** How far along the track counts as carried through. */
const COMMIT = 0.72;

export function SwipeToPay({ label, onPaid }: { label: string; onPaid: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [paid, setPaid] = useState(false);
  const x = useMotionValue(0);

  /**
   * How far the knob can travel. Measured after the track is in the document
   * rather than read during render, where its width is still zero and the
   * drag would be constrained to nothing.
   */
  const [travel, setTravel] = useState(0);

  useEffect(() => {
    const measure = () => setTravel(Math.max(0, (track.current?.offsetWidth ?? 0) - 52));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  /* The track lightens and the label darkens together, both driven by how far
     the knob has actually gone rather than by a state flag. */
  const progress = useTransform(x, [0, Math.max(travel, 1)], [0, 1]);
  const trackBackground = useTransform(
    progress,
    [0, 1],
    ['rgba(29,29,29,1)', 'rgba(243,241,239,0.92)'],
  );
  const labelColour = useTransform(progress, [0, 0.4], ['#ffffff', '#0a0a0a']);

  return (
    <motion.div
      ref={track}
      style={{ background: trackBackground }}
      transition={moves.session.swipeTrack.transition}
      className="relative flex h-12 w-full items-center rounded-[32px] border border-black/5 shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
    >
      <motion.span
        style={{ color: labelColour }}
        className="pointer-events-none absolute inset-0 grid place-items-center font-[var(--font-ui)] text-[16px] font-medium leading-[20px]"
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
        className="relative z-10 ml-[6px] grid h-10 w-10 shrink-0 cursor-grab touch-none place-items-center rounded-full bg-[#1d1d1d] text-white shadow-[0_2px_6px_rgba(0,0,0,0.3)] ring-1 ring-white/10 active:cursor-grabbing"
      >
        <ArrowRightIcon size={20} />
      </motion.button>
    </motion.div>
  );
}
