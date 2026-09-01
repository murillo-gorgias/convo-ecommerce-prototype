import { useState } from 'react';
import { motion } from 'motion/react';
import { bag, checkout, confirmation, promotion } from '../../../content/journey';
import { moves, pace } from '../../../motion/motion';
import { CheckIcon, ChevronDownIcon, VerifiedIcon } from '../icons';
import { Emphasis, Lines, Said, useAfter } from './parts';
import { THINKING } from '../thinking/variations';
import { less, money } from './money';

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
  /** said → the summary is being spoken · card → the totals have arrived. */
  const [part, setPart] = useState<'said' | 'summary' | 'card'>('said');
  const { subtotal, discount, total } = paid();

  useAfter(pace.afterSaid, part === 'said', () => setPart('summary'));
  useAfter(pace.afterSpeech, part === 'card', onSettled);

  return (
    <motion.div
      ref={innerRef}
      {...moves.session.section}
      className="flex w-full flex-col items-start gap-3"
    >
      <Said>{checkout.command}</Said>

      {/* The assistant takes the beat before replying, and shows it. */}
      {part === 'said' && <THINKING />}

      {/* The summary is said first and the totals follow it. Showing the card
          at the same moment turns the sentence into a caption for it, when the
          sentence is the part that answers the question. */}
      {part !== 'said' && (
        <Emphasis phrases={checkout.summary} start onDone={() => setPart('card')} />
      )}

      {part === 'card' && (
        <>
          <motion.div
            {...moves.session.card}
            className="flex w-full flex-col gap-3 rounded-[var(--card-radius)] bg-[var(--card)] p-4"
          >
            {/* The two pieces sit overlapped rather than listed. At this point
                what is in the bag has already been agreed; this is a receipt,
                not a list to review again. */}
            <Row index={0}>
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
                  {money(subtotal)}
                </span>
                <ChevronDownIcon size={20} />
              </button>
            </div>
            </Row>

            {/* The code the assistant promised, doing what it said it would.
                A discount named but not subtracted reads as a bug. */}
            <Row index={1}>
              <div className="flex w-full items-start justify-between">
                <span className="font-[var(--font-ui)] text-[12px] font-medium leading-[var(--type-said-line)] text-[var(--card-line-label)]">
                  {checkout.lines.discount}
                </span>
                <span className="font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-[var(--positive)]">
                  {less(discount)}
                </span>
              </div>
            </Row>

            <Row index={2}>
              <div className="flex w-full items-start justify-between">
                <span className="font-[var(--font-ui)] text-[12px] font-medium leading-[var(--type-said-line)] text-[var(--card-line-label)]">
                  {checkout.lines.shipping}
                </span>
                <span className="font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-[var(--positive)]">
                  {checkout.lines.shippingValue}
                </span>
              </div>
            </Row>

            <Row index={3}>
              <div className="flex w-full items-start justify-between">
                <span className="font-[var(--font-ui)] text-[length:var(--type-label-size)] font-semibold uppercase leading-[var(--type-said-line)] tracking-[var(--type-label-tracking)] text-black">
                  {checkout.lines.grandTotal}
                </span>
                <span className="font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-black">
                  {money(total)}
                </span>
              </div>
            </Row>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

/**
 * What is actually being paid: the bag, the code the assistant applied on the
 * way in, and what is left. One place, so the receipt after the swipe can
 * never disagree with the summary before it.
 */
function paid() {
  const subtotal = bag.items.reduce((sum, item) => sum + item.price, 0);
  const discount = subtotal * promotion.rate;
  return { subtotal, discount, total: subtotal - discount };
}

/* ==========================================================================
 * AFTER IT IS PAID
 * ========================================================================== */

export function Confirmation({
  innerRef,
}: {
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const [part, setPart] = useState<'thanks' | 'said' | 'card'>('thanks');
  const { total } = paid();

  useAfter(pace.betweenParts, part === 'thanks', () => setPart('said'));

  return (
    <motion.div
      ref={innerRef}
      {...moves.session.section}
      className="flex w-full flex-col items-start gap-3"
    >
      <div className="flex w-full items-center gap-1">
        <motion.span {...moves.session.tick} className="text-black">
          <VerifiedIcon size={24} />
        </motion.span>
        <span className="font-[var(--font-ui)] text-[16px] font-semibold leading-[var(--type-said-line)] text-black">
          {confirmation.thanks}
        </span>
      </div>

      {part !== 'thanks' && (
        <Lines start onDone={() => setPart('card')}>
          {[`${confirmation.lead}${confirmation.email}${confirmation.tail}`]}
        </Lines>
      )}

      {part === 'card' && (
      <motion.div
        {...moves.session.card}
        className="flex w-full flex-col gap-3 rounded-[var(--card-radius)] bg-[var(--card)] p-4"
      >
        {/* The card says its own state before it says what was bought. Green
            and a tick are the two things read without being read. */}
        <span className="flex w-full items-center gap-3 text-[var(--positive)]">
          <CheckIcon size={24} />
          <span className="font-[var(--font-ui)] text-[length:var(--type-label-size)] font-semibold uppercase leading-[var(--type-said-line)] tracking-[var(--type-label-tracking)]">
            {confirmation.order.state}
          </span>
        </span>

        <span className="flex w-full items-center gap-3">
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
        </span>
      </motion.div>
      )}
    </motion.div>
  );
}

/**
 * One row of a card, arriving after the row above it. The same idea as the
 * bag's: a card that fills in from the top reads as being worked out.
 */
function Row({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={moves.session.cardRow.initial}
      animate={moves.session.cardRow.animate}
      transition={{
        ...moves.session.cardRow.transition,
        delay: 0.12 + index * (pace.betweenRows / 1000),
      }}
    >
      {children}
    </motion.div>
  );
}
