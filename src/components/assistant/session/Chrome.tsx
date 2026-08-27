import { AnimatePresence, motion } from 'motion/react';
import { brand } from '../../../content/store';
import { assistantCopy } from '../../../content/assistant';
import { dock } from '../../../content/journey';
import { moves } from '../../../motion/motion';
import { CartIcon, ChevronLeftIcon, CloseIcon, MicIcon, Waveform } from '../icons';

/**
 * ============================================================================
 * THE FIXED PARTS
 * ============================================================================
 *
 * Two strips that never move while the conversation scrolls between them: the
 * brand at the top, and the way to speak at the bottom. Both are glass, so the
 * photographs passing underneath stay visible and the session keeps feeling
 * like it is happening on top of the shop rather than instead of it.
 */

/* ==========================================================================
 * HEADER
 * ========================================================================== */

export function SessionHeader({
  onCollapse,
  onClose,
}: {
  onCollapse: () => void;
  onClose: () => void;
}) {
  return (
    <motion.header
      {...moves.session.chrome}
      className="absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-white/50 from-60% to-transparent p-5 backdrop-blur-[8px]"
    >
      <GlassButton onClick={onCollapse} label={assistantCopy.labels.collapse}>
        <ChevronLeftIcon size={24} />
      </GlassButton>

      <svg
        viewBox={brand.wordmark.viewBox}
        className="h-[15px] w-auto"
        role="img"
        aria-label={brand.name}
      >
        <path d={brand.wordmark.path} fill="var(--ink)" />
      </svg>

      <GlassButton onClick={onClose} label={assistantCopy.labels.close} solid>
        <CloseIcon />
      </GlassButton>
    </motion.header>
  );
}

function GlassButton({
  children,
  onClick,
  label,
  solid,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  solid?: boolean;
}) {
  return (
    <motion.button
      whileTap={moves.assistant.press}
      onClick={onClick}
      aria-label={label}
      className={`grid h-12 w-12 place-items-center rounded-[24px] text-[var(--ink)] shadow-[0_2px_3px_rgba(0,0,0,0.1)] backdrop-blur-md ${
        solid ? 'bg-white/50' : 'bg-white/20'
      }`}
    >
      {children}
    </motion.button>
  );
}

/* ==========================================================================
 * THE DOCK
 *
 * The input is permanent — typing or speaking is always available, and never
 * required. Above it sit the suggestions the open section has raised. They
 * come and go with the section, which is why they animate rather than appear.
 * ========================================================================== */

export type Suggestion = {
  id: string;
  label: string;
  onSelect: () => void;
  /** The one suggestion that moves the session on. Dark, so it reads as the
   *  next step rather than another option. */
  primary?: boolean;
  /**
   * This one is SAID, not pressed. It stays on screen as a prompt — it is
   * still what you could ask — but the microphone is what asks it. Tapping it
   * does nothing on purpose: a chip that silently performed a spoken command
   * would make the voice interaction a decoration.
   */
  spoken?: boolean;
};

export function Dock({
  suggestions,
  inputRef,
  bagCount = 0,
  pay,
  speaking,
  onSpeak,
}: {
  suggestions: Suggestion[];
  inputRef?: React.Ref<HTMLInputElement>;
  /** How many things are in the bag. The button only exists once it is not empty. */
  bagCount?: number;
  /** The pay control, shown ABOVE the input rather than in place of it. */
  pay?: React.ReactNode;
  /** What the shopper is currently saying out loud, shown as a live transcript. */
  speaking?: string;
  /**
   * Set when the next step is something to say. The microphone takes a slow
   * pulse and this runs when it is pressed.
   */
  onSpeak?: () => void;
}) {
  return (
    <motion.div
      layout
      transition={moves.session.fold}
      className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-4 rounded-t-[16px] border-t-[0.5px] border-[var(--dock-border)] bg-[var(--dock-bg)] px-4 pb-7 pt-4 shadow-[0_-4px_6px_rgba(0,0,0,0.06)] backdrop-blur-[10px]"
    >
      {/* THE SUGGESTIONS.
          Two things here are deliberate and easy to undo by accident.

          No `layout` on a chip. A layout animation interpolates the button's
          box, and the text inside is scaled with it — which is what made the
          labels squash and stretch as the set changed.

          No `overflow-hidden` on the row, and no animated height. The row
          wraps to two lines when the labels are long, and clipping to an
          animating height cut the second line off mid-letter. The dock's own
          `layout` already carries the height change smoothly. */}
      <AnimatePresence initial={false}>
        {suggestions.length > 0 && (
          <motion.div
            layout
            {...moves.session.chipRow}
            className="flex w-full flex-wrap items-center justify-end gap-2"
          >
            {suggestions.map((suggestion) => (
              <motion.button
                key={suggestion.id}
                {...moves.session.chip}
                whileTap={suggestion.spoken ? undefined : moves.assistant.press}
                onClick={suggestion.spoken ? undefined : suggestion.onSelect}
                aria-disabled={suggestion.spoken || undefined}
                className={`shrink-0 whitespace-nowrap rounded-[32px] border border-[var(--chip-border)] px-4 py-[11px] font-[var(--font-ui)] text-[12px] font-medium leading-[15px] ${
                  suggestion.spoken ? 'cursor-default' : ''
                } ${
                  suggestion.primary
                    ? 'bg-[var(--control-dark)] text-white'
                    : 'bg-[var(--chip)] text-black'
                }`}
              >
                {suggestion.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paying sits ABOVE the input, not in place of it. The shopper can still
          ask something with the total in front of them, which is exactly when
          a last question tends to arrive. */}
      <AnimatePresence initial={false}>
        {pay && (
          <motion.div layout {...moves.session.chipRow} className="w-full">
            {pay}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout transition={moves.session.fold} className="flex w-full items-center gap-2">
        <div className="flex h-10 flex-1 items-center justify-between gap-3 rounded-[40px] border border-[var(--field-border)] bg-[var(--field-bg)] px-4 shadow-[0_4px_4px_rgba(0,0,0,0.04)]">
          {/* Speaking replaces the field's contents rather than the field, so
              the bar itself never moves while a command is being said. */}
          {speaking ? (
            <>
              <motion.span
                {...moves.voice.transcript}
                className="min-w-0 flex-1 truncate font-[var(--font-ui)] text-[12px] italic text-black"
              >
                {speaking}
              </motion.span>
              <span className="shrink-0 text-[var(--ink-soft)]">
                <Waveform bars={4} />
              </span>
            </>
          ) : (
            <>
              <input
                ref={inputRef}
                placeholder={dock.placeholder}
                className="h-full min-w-0 flex-1 bg-transparent font-[var(--font-ui)] text-[12px] text-black outline-none placeholder:text-black/60"
              />
              {/* The microphone is a real control whenever the next step is
                  something to say, and inert decoration the rest of the time.
                  The halo behind it is what marks the difference. */}
              <motion.button
                type="button"
                onClick={onSpeak}
                aria-label={onSpeak ? dock.speak : undefined}
                whileTap={onSpeak ? moves.assistant.press : undefined}
                className="relative shrink-0 text-[var(--ink-soft)]"
              >
                {onSpeak && (
                  <motion.span
                    aria-hidden
                    animate={moves.assistant.micCue.animate}
                    transition={moves.assistant.micCue.transition}
                    className="absolute -inset-[7px] rounded-full bg-[var(--chip)]"
                  />
                )}
                <span className="relative block">
                  <MicIcon size={16} />
                </span>
              </motion.button>
            </>
          )}
        </div>

          <AnimatePresence initial={false}>
            {bagCount > 0 && (
              <motion.button
                layout
                {...moves.session.badge}
                whileTap={moves.assistant.press}
                aria-label={`${bagCount} in bag`}
                className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--field-border)] bg-[var(--field-bg)] text-[var(--ink-soft)] shadow-[0_4px_4px_rgba(0,0,0,0.04)]"
              >
                <CartIcon size={18} />
                <motion.span
                  key={bagCount}
                  {...moves.session.badge}
                  className="absolute -right-[2px] -top-[2px] grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[var(--ink-soft)] px-1 font-[var(--font-ui)] text-[10px] font-semibold leading-[14px] text-white"
                >
                  {bagCount}
                </motion.span>
              </motion.button>
            )}
          </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ==========================================================================
 * THE GROUND
 *
 * A warm vertical wash with two slow glows drifting behind it. Nothing here
 * is interactive — it exists so a screen of white cards never reads flat.
 * ========================================================================== */

export function SessionGround() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[var(--sheet-top)] to-[var(--sheet-bottom)]">
      {[0, 1].map((i) => {
        const glow = moves.session.glow(i);
        return (
          <motion.span
            key={i}
            aria-hidden
            animate={glow.animate}
            transition={glow.transition}
            className="absolute h-[560px] w-[560px] rounded-full blur-[80px]"
            style={
              i === 0
                ? { top: -280, left: -220, background: 'var(--glow-warm)' }
                : { bottom: -260, right: -240, background: 'var(--glow-blush)' }
            }
          />
        );
      })}
    </div>
  );
}
