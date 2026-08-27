import { useState } from 'react';
import { motion } from 'motion/react';
import { bag, checkout, confirmation } from '../../../content/journey';
import { moves, pace } from '../../../motion/motion';
import { ChevronDownIcon, VerifiedIcon } from '../icons';
import { Said, useAfter } from './parts';
import { money } from './money';

/**
 * ============================================================================
 * CHECKOUT
 * ============================================================================
 *
 * The shopper signed in at the start, so the address, the card and the
 * delivery date are all already known. A form here would be asking for
 * something the session already has.
 *
 * So nothing is asked. The assistant states the three facts worth checking —
 * where it is going, when it lands, what pays for it — and the only thing left
 * is the one action that cannot be undone.
 */

export function Checkout({
  innerRef,
  onSettled,
}: {
  innerRef?: React.Ref<HTMLDivElement>;
  /** Called once the summary has been said, so the dock can offer the swipe. */
  onSettled: () => void;
}) {
  const [speaking, setSpeaking] = useState(false);
  const total = bag.items.reduce((sum, item) => sum + item.price, 0);

  useAfter(pace.afterSaid, true, () => setSpeaking(true));
  useAfter(pace.afterSpeech, speaking, onSettled);

  return (
    <motion.div
      ref={innerRef}
      layout
      {...moves.session.section}
      className="flex w-full scroll-mt-[100px] flex-col items-start gap-3"
    >
      <Said>{checkout.command}</Said>

      {speaking && (
        <>
          <motion.p
            {...moves.session.line}
            className="w-full font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-black"
          >
            {checkout.summary.lead}
            <strong className="font-semibold">{checkout.summary.place}</strong>
            {checkout.summary.middle}
            <strong className="font-semibold">{checkout.summary.card}</strong>
            {checkout.summary.tail}
          </motion.p>

          <motion.div
            {...moves.session.card}
            className="flex w-full flex-col gap-3 rounded-[var(--card-radius)] bg-[var(--card)] p-4"
          >
            {/* The two pieces sit overlapped rather than listed. At this point
                what is in the bag has already been agreed; this is a receipt,
                not a list to review again. */}
            <div className="flex items-center gap-3">
              <span className="relative h-16 w-[73px] shrink-0">
                <img
                  src={bag.items[1].image}
                  alt=""
                  className="absolute left-0 top-0 h-16 w-16 rounded-[12px] object-cover"
                />
                <img
                  src={bag.items[0].image}
                  alt=""
                  className="absolute left-[9px] top-[10px] h-16 w-16 rounded-[12px] object-cover"
                />
              </span>

              <span className="flex flex-1 flex-col">
                <span className="font-[var(--font-ui)] text-[14px] font-semibold leading-[var(--type-said-line)] text-black">
                  {checkout.lines.total}
                </span>
                <span className="font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-[var(--card-quiet)]">
                  {checkout.lines.items}
                </span>
              </span>

              <button className="flex items-center gap-[2px] text-black">
                <span className="font-[var(--font-ui)] text-[16px] font-semibold leading-[var(--type-said-line)]">
                  {money(total)}
                </span>
                <ChevronDownIcon size={20} />
              </button>
            </div>

            <div className="flex w-full items-start justify-between">
              <span className="font-[var(--font-ui)] text-[12px] font-medium leading-[var(--type-said-line)] text-[var(--card-line-label)]">
                {checkout.lines.shipping}
              </span>
              <span className="font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-[var(--positive)]">
                {checkout.lines.shippingValue}
              </span>
            </div>

            <div className="flex w-full items-start justify-between">
              <span className="font-[var(--font-ui)] text-[length:var(--type-label-size)] font-semibold uppercase leading-[var(--type-said-line)] tracking-[var(--type-label-tracking)] text-black">
                {checkout.lines.grandTotal}
              </span>
              <span className="font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-black">
                {money(total)}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

/* ==========================================================================
 * AFTER IT IS PAID
 * ========================================================================== */

export function Confirmation({
  innerRef,
}: {
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const total = bag.items.reduce((sum, item) => sum + item.price, 0);

  return (
    <motion.div
      ref={innerRef}
      layout
      {...moves.session.section}
      className="flex w-full scroll-mt-[100px] flex-col items-start gap-3"
    >
      <div className="flex w-full items-center gap-1">
        <motion.span {...moves.session.tick} className="text-black">
          <VerifiedIcon size={24} />
        </motion.span>
        <span className="font-[var(--font-ui)] text-[16px] font-semibold leading-[var(--type-said-line)] text-black">
          {confirmation.thanks}
        </span>
      </div>

      <motion.p
        {...moves.session.line}
        className="w-full font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-black"
      >
        {confirmation.lead}
        <strong className="font-semibold">{confirmation.email}</strong>
        {confirmation.tail}
      </motion.p>

      <motion.div
        {...moves.session.card}
        className="flex w-full items-center gap-3 rounded-[var(--card-radius)] bg-[var(--card)] p-4"
      >
        <span className="flex flex-1 flex-col">
          <span className="font-[var(--font-ui)] text-[14px] font-semibold leading-[var(--type-said-line)] text-black">
            {confirmation.order.number}
          </span>
          <span className="font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-[var(--card-quiet)]">
            {confirmation.order.arriving}
          </span>
        </span>
        <span className="font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-black">
          {money(total)}
        </span>
      </motion.div>
    </motion.div>
  );
}
