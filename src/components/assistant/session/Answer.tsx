import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  offerCopy,
  reviewCopy,
  type Answer as AnswerContent,
  type Offer,
  type Review,
} from '../../../content/journey';
import { moves, pace } from '../../../motion/motion';
import { ChevronDownIcon, HeartIcon, StarIcon, VerifiedIcon } from '../icons';
import { Lines, Said, useAfter } from './parts';

/**
 * ============================================================================
 * AN ANSWER
 * ============================================================================
 *
 * What happens when the shopper asks something about a piece. It is a turn in
 * the conversation, not a panel: the question sits on the right in their own
 * words, and the answer runs full width underneath it. Neither one covers the
 * piece it is about.
 *
 * An answer can carry two things beyond words.
 *
 * A REVIEW. Where the honest answer is "it depends on how you wear it", a
 * summary alone is a claim the assistant is making about itself. Quoting one
 * buyer, by name, with what they actually did, is evidence. The summary above
 * says what it means; the card below shows where it came from.
 *
 * AN OFFER. Where the answer implies something — a care kit, after a question
 * about tarnishing — the piece is offered inside the answer, at the moment the
 * shopper is thinking about it. This is the difference between an upsell that
 * was earned by the conversation and a row of things other people bought.
 */

export function Answer({
  answer,
  innerRef,
  onSettled,
}: {
  answer: AnswerContent;
  innerRef?: React.Ref<HTMLDivElement>;
  /** Called once the whole answer has been given and shown. */
  onSettled?: () => void;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [said, setSaid] = useState(false);
  const held = useRef<HTMLDivElement>(null);

  /* The question lands, and the assistant takes the same beat a person would
     take before answering it. */
  useAfter(pace.afterSaid, true, () => setSpeaking(true));

  /* The thread follows the question up, so the answer types out where the
     shopper is already looking rather than below the fold. */
  useEffect(() => {
    const timer = window.setTimeout(
      () => held.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      160,
    );
    return () => window.clearTimeout(timer);
  }, []);

  /* Everything the answer shows has arrived; the turn is over. */
  useAfter(pace.afterSpeech, said, () => onSettled?.());

  return (
    <motion.div
      ref={(node) => {
        held.current = node;
        if (typeof innerRef === 'function') innerRef(node);
        else if (innerRef) (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      layout
      {...moves.session.section}
      className="flex w-full scroll-mt-[100px] flex-col items-start gap-4"
    >
      <Said>{answer.question}</Said>

      <Lines start={speaking} onDone={() => setSaid(true)}>
        {answer.lines}
      </Lines>

      {said && answer.review && <ReviewCard review={answer.review} />}

      {said && answer.closing && (
        <motion.p
          {...moves.session.line}
          className="w-full font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-black"
        >
          {answer.closing}
        </motion.p>
      )}

      {said && answer.offer && <OfferRow offer={answer.offer} />}
    </motion.div>
  );
}

/* ==========================================================================
 * A QUOTED REVIEW
 * ========================================================================== */

export function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      {...moves.session.review}
      className="flex w-full flex-col gap-2 rounded-[var(--card-radius)] bg-[var(--card)] p-4"
    >
      <div className="flex w-full items-center gap-2">
        <span className="font-[var(--font-ui)] text-[16px] font-medium leading-[20px] text-[var(--ink-soft)]">
          {review.author}
        </span>

        <span className="flex items-center gap-[2px] text-[var(--card-meta)]">
          <VerifiedIcon size={16} />
          <span className="font-[var(--font-ui)] text-[12px] font-medium leading-[20px]">
            {reviewCopy.verified}
          </span>
        </span>

        <span className="ml-auto flex items-center gap-[2px] text-black">
          <StarIcon size={14} />
          <span className="font-[var(--font-ui)] text-[14px] leading-[21px] text-[var(--card-meta)]">
            {review.rating}
          </span>
        </span>
      </div>

      {/* Clamped rather than cut in the copy, so the words stay true and the
          card stays the same height whatever review is quoted. */}
      <p className="line-clamp-3 w-full font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-[var(--card-body)]">
        {review.body}
      </p>

      <button className="flex items-center gap-[2px] text-[var(--link-warm)]">
        <span className="font-[var(--font-ui)] text-[12px] leading-[var(--type-said-line)]">
          {reviewCopy.more}
        </span>
        <ChevronDownIcon size={20} />
      </button>
    </motion.div>
  );
}

/* ==========================================================================
 * A PIECE OFFERED INSIDE AN ANSWER
 *
 * Deliberately small. It is a suggestion made in passing, and it should read
 * as one — not as the conversation stopping to sell something.
 * ========================================================================== */

export function OfferRow({ offer }: { offer: Offer }) {
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <motion.div {...moves.session.offer} className="flex w-full items-center gap-3">
      <img
        src={offer.image}
        alt=""
        className="h-24 w-[93px] shrink-0 rounded-[12px] border border-[var(--photo-border)] object-cover shadow-[var(--card-shadow)]"
      />

      <div className="flex flex-1 flex-col gap-[10px]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-[var(--font-ui)] text-[12px] font-medium leading-[var(--type-said-line)] text-black">
            <span>{offer.name}</span>
            <span>${offer.price}</span>
          </div>
          {offer.note && (
            <span className="font-[var(--font-ui)] text-[12px] leading-[var(--type-said-line)] text-[var(--ink-muted)]">
              {offer.note}
            </span>
          )}
        </div>

        <div className="flex items-center gap-[10px]">
          <motion.button
            whileTap={moves.assistant.press}
            onClick={() => setAdded(true)}
            className="rounded-[32px] border border-[var(--control-border)] bg-[var(--control-dark)] px-4 py-2 font-[var(--font-ui)] text-[10px] font-medium text-white"
          >
            {added ? offerCopy.added : offerCopy.add}
          </motion.button>

          <motion.button
            whileTap={moves.assistant.press}
            onClick={() => setSaved((was) => !was)}
            aria-pressed={saved}
            className="text-[var(--ink-soft)]"
          >
            <motion.span
              key={saved ? 'on' : 'off'}
              animate={saved ? moves.session.heartBeat.animate : undefined}
              transition={moves.session.heartBeat.transition}
              className="block"
            >
              <HeartIcon size={24} filled={saved} />
            </motion.span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
