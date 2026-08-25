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
