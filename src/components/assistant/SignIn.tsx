import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { opening, shopper } from '../../content/journey';
import { assistantCopy } from '../../content/assistant';
import { moves, pace } from '../../motion/motion';
import { CloseIcon, ExpandIcon, UserCheckIcon } from './icons';
import { Body, Line, Said, useAfter } from './session/parts';

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
 * Two beats live here. The offer, and then the moment the account opens: the
 * card holding the shopper's name collapses into a single line, light travels
 * across the words, and a small mark opens, turns and closes again beside it.
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

      <Body show={offering}>
        <AnimatePresence mode="wait" initial={false}>
          {opened ? (
            <Opening key="opening" />
          ) : (
            <Offer key="offer" onContinue={onContinue} onDecline={onDecline} />
          )}
        </AnimatePresence>
      </Body>
    </motion.div>
  );
}

/* ==========================================================================
 * THE OFFER
 * ========================================================================== */

function Offer({ onContinue, onDecline }: { onContinue: () => void; onDecline: () => void }) {
  return (
    <motion.div layout {...moves.assistant.contentSwap} className="flex flex-col gap-4">
      {/* Who the store thinks this is */}
      <motion.div
        layout
        transition={moves.session.fold}
        className="flex items-center gap-5 rounded-[24px] border border-[var(--tile-border)] bg-white/40 p-5"
      >
        <motion.img
          layoutId="shopper-avatar"
          transition={moves.session.thumbTravel}
          src={shopper.avatar}
          alt=""
          className="h-[57px] w-[57px] shrink-0 rounded-[16px] object-cover"
        />
        <div className="flex flex-col gap-[9px]">
          <p className="font-[var(--font-ui)] text-[14px] font-semibold leading-[17px] text-black">
            {shopper.fullName}
          </p>
          <motion.button
            whileTap={moves.assistant.press}
            onClick={onContinue}
            className="flex h-[31px] items-center gap-[8px] self-start rounded-[999px] bg-[var(--ink)] pl-4 pr-5 text-white"
          >
            <UserCheckIcon size={12} />
            <span className="font-[var(--font-ui)] text-[12px] font-medium leading-[15px]">
              {opening.actions.continueAs}
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Both ways out */}
      <div className="flex items-center justify-end gap-1">
        {[opening.actions.otherAccount, opening.actions.decline].map((label) => (
          <motion.button
            key={label}
            {...moves.session.chip}
            whileTap={moves.assistant.press}
            onClick={onDecline}
            className="rounded-[32px] border border-[var(--chip-border)] bg-[var(--chip)] px-3 py-3 font-[var(--font-ui)] text-[12px] font-medium leading-[15px] text-black"
          >
            {label}
          </motion.button>
        ))}
      </div>
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
      {/* A mark that opens, turns and closes again. */}
      <motion.span
        {...moves.session.unlockMark}
        className="h-6 w-6 shrink-0 border-[1.5px] border-[var(--ink-soft)]"
      />

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
