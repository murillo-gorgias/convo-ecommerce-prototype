import { useState } from 'react';
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
import { Bullets, Label, Lines, Said, useAfter } from './parts';

/**
 * ============================================================================
 * AN ANSWER
 * ============================================================================
 *
 * What happens when the shopper asks something about a piece. It is a turn in
 * the conversation, not a panel: the question sits on the right in their own
 * words, and the answer runs full width underneath it.
 *
 * AN ANSWER ARRIVES IN PARTS, NEVER AT ONCE
 * A full answer here can be four things — a summary, a review that backs it
 * up, a line that turns it into a next step, and the piece that step points
 * at. Rendering those together produces a wall: it reads as a page that was
 * fetched, and there is no order to follow through it.
 *
 * So they are staged. The summary types itself out. A beat. The review card
 * settles in under it. A beat. The closing line types. A beat. The piece it
 * offers arrives last. Every gap is `pace.betweenParts`, and the whole thing
 * only reports itself settled once the last part has landed.
 *
 * WHY A REVIEW IS THERE AT ALL
 * Where the honest answer is "it depends on how you wear it", a summary alone
 * is a claim the assistant is making about itself. Quoting one buyer, by name,
 * with what they actually did, is evidence. The summary says what it means;
 * the card shows where it came from.
 *
 * AND WHY AN OFFER IS
 * Where the answer implies something — a care kit, after a question about
 * tarnishing — the piece is offered at the moment the shopper is thinking
 * about it. That is an upsell the conversation earned, rather than a row of
 * things other people bought.
 */

/** How far through an answer we are. Each part waits for the one before it. */
type Part = 'question' | 'summary' | 'points' | 'review' | 'closing' | 'offer' | 'done';

const PARTS: Part[] = ['question', 'summary', 'points', 'review', 'closing', 'offer', 'done'];

export function Answer({
  answer,
  innerRef,
  onSettled,
}: {
  answer: AnswerContent;
  innerRef?: React.Ref<HTMLDivElement>;
  /** Called once every part of the answer has been given and shown. */
  onSettled?: () => void;
}) {
  const [part, setPart] = useState<Part>('question');

  /* The question lands, and the assistant takes the same beat a person would
     take before answering it. */
  useAfter(pace.afterSaid, part === 'question', () => setPart('summary'));

  /* The parts that follow the summary, each after the one before it. Anything
     this answer does not have is stepped straight past. */
  useAfter(pace.betweenParts, part === 'points' && !answer.reviewSummary, () => setPart('review'));
  useAfter(pace.betweenParts, part === 'review' && !answer.review, () => setPart('closing'));
  useAfter(pace.betweenParts, part === 'closing' && !answer.closing, () => setPart('offer'));
  useAfter(pace.betweenParts, part === 'offer' && !answer.offer, () => setPart('done'));

  /* And the ones it does have, held long enough to be taken in. */
  useAfter(pace.betweenParts, part === 'review' && Boolean(answer.review), () =>
    setPart('closing'),
  );
  useAfter(pace.betweenParts, part === 'offer' && Boolean(answer.offer), () => setPart('done'));

  useAfter(pace.afterSpeech, part === 'done', () => onSettled?.());

  const reached = (at: Part) => PARTS.indexOf(part) >= PARTS.indexOf(at);

  return (
    <motion.div
      ref={innerRef}
      {...moves.session.section}
      className="flex w-full flex-col items-start gap-4"
    >
      <Said>{answer.question}</Said>

      <Lines start={reached('summary')} onDone={() => setPart('points')}>
        {answer.lines}
      </Lines>

      {/* What the reviews say, labelled and read back as points. The label
          belongs to these points, not to the card below them — the points are
          the assistant's reading of the reviews, and the card is one buyer
          speaking for themselves. */}
      {reached('points') && answer.reviewSummary && (
        <div className="flex w-full flex-col gap-2">
          <Label>{reviewCopy.summary}</Label>
          <Bullets start onDone={() => setPart('review')}>
            {answer.reviewSummary}
          </Bullets>
        </div>
      )}

      {reached('review') && answer.review && <ReviewCard review={answer.review} />}

      {reached('closing') && answer.closing && (
        <Lines start onDone={() => setPart('offer')}>
          {[answer.closing]}
        </Lines>
      )}

      {reached('offer') && answer.offer && <OfferRow offer={answer.offer} />}
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
        draggable={false}
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
