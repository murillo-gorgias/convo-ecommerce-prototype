import { AnimatePresence, motion } from 'motion/react';
import { brand } from '../../../content/store';
import { assistantCopy } from '../../../content/assistant';
import { dock } from '../../../content/journey';
import { moves } from '../../../motion/motion';
import { ChevronLeftIcon, CloseIcon, MicIcon } from '../icons';

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

export type Suggestion = { id: string; label: string; onSelect: () => void };

export function Dock({
  suggestions,
  inputRef,
}: {
  suggestions: Suggestion[];
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <motion.div
      layout
      transition={moves.session.fold}
      className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-4 rounded-t-[16px] border-t-[0.5px] border-[var(--dock-border)] bg-[var(--dock-bg)] px-4 pb-7 pt-4 shadow-[0_-4px_6px_rgba(0,0,0,0.06)] backdrop-blur-[10px]"
    >
      <AnimatePresence initial={false}>
        {suggestions.length > 0 && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 39 }}
            exit={{ opacity: 0, height: 0 }}
            transition={moves.session.fold}
            className="flex w-full items-center justify-end gap-1 overflow-hidden"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {suggestions.map((suggestion) => (
                <motion.button
                  key={suggestion.id}
                  layout
                  {...moves.session.chip}
                  whileTap={moves.assistant.press}
                  onClick={suggestion.onSelect}
                  className="shrink-0 rounded-[32px] border border-[var(--chip-border)] bg-[var(--chip)] px-3 py-3 font-[var(--font-ui)] text-[12px] font-medium leading-[15px] text-black"
                >
                  {suggestion.label}
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-10 w-full items-center justify-between rounded-[40px] border border-[var(--field-border)] bg-[var(--field-bg)] px-4 shadow-[0_4px_4px_rgba(0,0,0,0.04)]">
        <input
          ref={inputRef}
          placeholder={dock.placeholder}
          className="h-full flex-1 bg-transparent font-[var(--font-ui)] text-[12px] text-black outline-none placeholder:text-black/60"
        />
        <motion.span whileTap={moves.assistant.press} className="text-[var(--ink-soft)]">
          <MicIcon size={16} />
        </motion.span>
      </div>
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
