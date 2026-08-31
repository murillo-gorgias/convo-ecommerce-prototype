import { motion } from 'motion/react';
import { moves } from '../../motion/motion';

export function MicIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 10 13" fill="none" aria-hidden>
      <rect x="2.6" y="0.6" width="4.8" height="7.4" rx="2.4" stroke="currentColor" strokeWidth="1.1" />
      <path d="M0.6 6.4a4.4 4.4 0 0 0 8.8 0M5 10.8v1.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

/** The live waveform shown while the assistant is listening. */
export function Waveform({ bars = 4 }: { bars?: number }) {
  return (
    <div className="flex h-4 items-center gap-[3px]" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        const move = moves.voice.waveformBar(i);
        return (
          <motion.span
            key={i}
            className="block w-[2.5px] rounded-full bg-current"
            style={{ height: '100%', originY: 0.5 }}
            animate={move.animate}
            transition={move.transition}
          />
        );
      })}
    </div>
  );
}

export function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function ExpandIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M8.5 3.5h-5v5M11.5 16.5h5v-5M3.5 3.5l6 6M16.5 16.5l-6-6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SubmitIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The assistant's mark — a four-point star that rotates and breathes while the
 * assistant is thinking. Sits in the design file as the sparkle asterisk.
 */
export function ThinkingMark() {
  const star = 'M12 0c.6 6 5.4 10.8 11.4 11.4C17.4 12 12.6 16.8 12 22.8 11.4 16.8 6.6 12 .6 11.4 6.6 10.8 11.4 6 12 0Z';
  return (
    <div className="relative flex h-12 w-24 items-center justify-center text-[var(--ink-soft)]">
      <motion.svg
        width="30" height="30" viewBox="0 0 24 24"
        animate={{ rotate: 360, scale: [1, 1.12, 1] }}
        transition={{
          rotate: { duration: 7, ease: 'linear', repeat: Infinity },
          scale: { duration: 2.2, ease: [0.4, 0, 0.2, 1], repeat: Infinity },
        }}
      >
        <path d={star} fill="currentColor" />
      </motion.svg>

      {[
        { x: -30, y: -8, s: 10, d: 0 },
        { x: 28, y: -10, s: 8, d: 0.5 },
        { x: -16, y: 12, s: 6, d: 1 },
      ].map((p, i) => (
        <motion.svg
          key={i}
          width={p.s} height={p.s} viewBox="0 0 24 24"
          className="absolute"
          style={{ x: p.x, y: p.y }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 2.4, ease: [0.4, 0, 0.2, 1], repeat: Infinity, delay: p.d }}
        >
          <path d={star} fill="currentColor" />
        </motion.svg>
      ))}
    </div>
  );
}

/* ==========================================================================
 * THE GUIDED SESSION
 * Icons used by the assistant's questions. All drawn rather than imported, so
 * they inherit colour and stay sharp at any size.
 * ========================================================================== */

export function ChevronLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14.5 5.5 8 12l6.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="m5.5 8 4.5 4.5L14.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M9 3.5v11M3.5 9h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Outline until it is chosen, then filled. */
export function HeartIcon({ size = 20, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 16.6S3 12.5 3 8A3.9 3.9 0 0 1 10 5.7 3.9 3.9 0 0 1 17 8c0 4.5-7 8.6-7 8.6Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <path d="M7 1.2 8.8 5l4.1.5-3 2.8.8 4L7 10.4 3.3 12.3l.8-4-3-2.8L5.2 5 7 1.2Z" />
    </svg>
  );
}

export function MoreLikeThisIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.95} viewBox="0 0 20 19" fill="none" aria-hidden>
      <path
        d="M15.3408 5.0083C14.9775 6.09821 14.1221 6.95359 13.0322 7.31689L12.5547 7.47607 13.0322 7.63525C14.1221 7.99856 14.9775 8.85394 15.3408 9.94385L15.5 10.4214 15.6592 9.94385C16.0225 8.85394 16.8779 7.99856 17.9678 7.63525L18.4453 7.47607 17.9678 7.31689C16.8779 6.95359 16.0225 6.09821 15.6592 5.0083L15.5 4.53076 15.3408 5.0083Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M5.5 8.00049C5.12984 8.89468 4.41947 9.6057 3.52539 9.97607 4.4192 10.3463 5.12974 11.0569 5.5 11.9507 5.87038 11.0566 6.58139 10.3462 7.47559 9.97607 6.58111 9.6058 5.87028 8.89496 5.5 8.00049Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M9.04883 1.48096C8.71215 2.14608 8.17186 2.68709 7.50684 3.02393 8.17161 3.36063 8.71212 3.90115 9.04883 4.56592 9.38567 3.90089 9.92667 3.36061 10.5918 3.02393 9.92641 2.68711 9.38564 2.14634 9.04883 1.48096Z"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <path
        d="M12.5 10.4761 5 17.9761"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M1.5 2h1.7l1.6 7.4h6.9l1.4-5.2H4.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="13" r="1.1" fill="currentColor" />
      <circle cx="11" cy="13" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function CheckIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A simple dress outline for the neckline choice. */
export function NecklineIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 3.5c.2 1.6 1.4 2.7 3 2.7s2.8-1.1 3-2.7l.8 4.3-1.6 3.4L18.5 21h-13l4.3-9.8-1.6-3.4L9 3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A compact ruler for the necklace-length choice. */
export function LengthIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2.75" y="7.25" width="18.5" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 7.5v4M11 7.5V10M15 7.5v4M19 7.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Marks a section that took more than one answer. A small stack of cards. */
export function StackIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="5.2" y="2.2" width="8.6" height="8.6" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.8 13.8H4.2a2 2 0 0 1-2-2V5.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** The assistant's own mark, used on anything it generated. */
export function SparkIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c.6 6 5.4 10.8 11.4 11.4C17.4 12 12.6 16.8 12 22.8 11.4 16.8 6.6 12 .6 11.4 6.6 10.8 11.4 6 12 0Z" />
    </svg>
  );
}

/** Shown on the button that signs the shopper in as themselves. */
export function UserCheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="5.6" cy="4" r="2.6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.2 12.4c0-2.3 2-3.7 4.4-3.7.7 0 1.3.1 1.9.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="m8.8 10.6 1.5 1.5 2.6-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The tick beside a verified review, and beside a confirmed order. */
export function VerifiedIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M5.4 8.2 7 9.8l3.6-3.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The knob on the swipe-to-pay control. */
export function ArrowRightIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 10h11m0 0-4-4m4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The short handle at the top of the bag card, marking it as draggable. */
export function GripIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={6} viewBox="0 0 24 6" fill="none" aria-hidden>
      <rect x="0" y="1.5" width="24" height="3" rx="1.5" fill="currentColor" opacity="0.14" />
    </svg>
  );
}
