import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { dock, opening, shopper } from '../../content/journey';
import { assistantCopy } from '../../content/assistant';
import { moves, pace } from '../../motion/motion';
import { NO_WORDS, Working } from './thinking/variations';
import { CloseIcon, ExpandIcon, MicIcon } from './icons';
import { Line, Said, useAfter } from './session/parts';

/**
 * ============================================================================
 * SIGNING IN
 * ============================================================================
 *
 * The assistant does not answer the question yet. It offers a trade first:
 * sign in and the answer gets personal. The trade is stated as a benefit and
 * both ways out are one tap away — declining costs the shopper nothing except
 * the personalisation.
 *
 * The offer is made where every other next step in this product is made: the
 * row of suggestions above the input. Continuing as yourself is the dark one,
 * and it carries your own face so it is you being offered, not an account.
 *
 * Two beats live here. The offer, and then the moment the account opens: the
 * row of suggestions gives way to a single line, light travels across the
 * words, and two offset rings turn beside it.
 * That second beat is the only place in the session where the assistant makes
 * the shopper wait, so it is the one place worth decorating — and it is held
 * for `pace.beforeExpanding` before the session takes the screen, so the
 * confirmation is read rather than glimpsed on the way past.
 */

export function SignIn({
  opened,
  onContinue,
  onDecline,
  onCollapse,
  onClose,
}: {
  /** True once the account has been accepted and is being opened. */
  opened: boolean;
  onContinue: () => void;
  onDecline: () => void;
  onCollapse: () => void;
  onClose: () => void;
}) {
  const [invited, setInvited] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  /* The query lands, and the assistant takes a moment before it replies. */
  useAfter(pace.afterSaid, true, () => setSpeaking(true));

  /* The offer itself waits until the offer has been made in words. */
  const [offering, setOffering] = useState(false);
  useAfter(pace.afterSpeech, invited, () => setOffering(true));

  return (
    <motion.div {...moves.assistant.consoleContent} className="flex flex-col gap-4 p-4">
      {/* Controls */}
      <div className="flex items-center justify-between text-[var(--ink-soft)]">
        <motion.button
          whileTap={moves.assistant.press}
          onClick={onCollapse}
          aria-label={assistantCopy.labels.collapse}
        >
          <ExpandIcon />
        </motion.button>
        <motion.button
          whileTap={moves.assistant.press}
          onClick={onClose}
          aria-label={assistantCopy.labels.close}
        >
          <CloseIcon />
        </motion.button>
      </div>

      <Said>{opening.query}</Said>

      <Line start={speaking} onDone={() => setInvited(true)}>
        {opening.invitation}
      </Line>

      <motion.div
        animate={{ opacity: offering ? 1 : 0 }}
        transition={moves.assistant.offerReveal}
        className={`grid h-[84px] items-end [&>*]:w-full ${offering ? '' : 'pointer-events-none'}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {opened ? (
            <Opening key="opening" />
          ) : (
            <Offer key="offer" onContinue={onContinue} onDecline={onDecline} />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Asking something instead is always available and never required, so
          the field stays under the offer rather than replacing it. */}
      <motion.div
        layout
        className="flex h-10 w-full items-center justify-between gap-3 rounded-[40px] border border-[var(--field-border)] bg-[var(--field-bg)] px-4 shadow-[0_4px_4px_rgba(0,0,0,0.04)]"
      >
        <input
          placeholder={dock.placeholder}
          className="h-full min-w-0 flex-1 bg-transparent font-[var(--font-ui)] text-[12px] text-black outline-none placeholder:text-black/60"
        />
        <span className="shrink-0 text-[var(--ink-soft)]">
          <MicIcon size={16} />
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ==========================================================================
 * THE OFFER
 * ========================================================================== */

function Offer({ onContinue, onDecline }: { onContinue: () => void; onDecline: () => void }) {
  return (
    <motion.div
      layout
      {...moves.assistant.contentSwap}
      className="flex flex-wrap items-center justify-end gap-1"
    >
      {/* Continuing as yourself is the one that moves this on, so it is the
          dark one — the same rule the session's suggestions follow. */}
      <motion.button
        {...moves.session.chip}
        whileTap={moves.assistant.press}
        onClick={onContinue}
        className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[32px] bg-[var(--control-dark)] px-4 py-3 text-white"
      >
        <motion.img
          layoutId="shopper-avatar"
          transition={moves.session.thumbTravel}
          src={shopper.avatar}
          alt=""
          className="h-[15px] w-[15px] shrink-0 rounded-full object-cover"
        />
        <span className="font-[var(--font-ui)] text-[12px] font-medium leading-[15px]">
          {opening.actions.continueAs}
        </span>
      </motion.button>

      {/* Both ways out, weighted the same as each other. */}
      {[opening.actions.otherAccount, opening.actions.decline].map((label) => (
        <motion.button
          key={label}
          {...moves.session.chip}
          whileTap={moves.assistant.press}
          onClick={onDecline}
          className="shrink-0 whitespace-nowrap rounded-[32px] border border-[var(--chip-border)] bg-[var(--chip)] px-3 py-3 font-[var(--font-ui)] text-[12px] font-medium leading-[15px] text-black"
        >
          {label}
        </motion.button>
      ))}
    </motion.div>
  );
}

/* ==========================================================================
 * THE ACCOUNT OPENING
 * ========================================================================== */

function Opening() {
  return (
    <motion.div
      layout
      {...moves.assistant.contentSwap}
      className="flex h-16 items-center gap-4 rounded-[24px] border border-[var(--confirmed-border)] bg-[var(--confirmed-bg)] px-5"
    >
      {/* Dots and the trace, no words. The card already says what is
          happening, and the wait is too short to read anything twice. */}
      <Working words={NO_WORDS} />

      {/* Light travelling across the words while the account opens. */}
      <motion.span
        {...moves.session.shimmer}
        className="bg-clip-text font-[var(--font-ui)] text-[14px] leading-[21px] text-transparent"
        style={{
          backgroundImage:
            'linear-gradient(90deg, var(--ink-soft) 20%, rgba(255,255,255,0.95) 50%, var(--ink-soft) 80%)',
          backgroundSize: '200% 100%',
        }}
      >
        {opening.unlocked}
      </motion.span>
    </motion.div>
  );
}
