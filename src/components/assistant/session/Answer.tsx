import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  offerCopy,
  reviewCopy,
  type Answer as AnswerContent,
  type Offer,
  type Review,
  type ReviewFilter,
} from '../../../content/journey';
import { moves, pace } from '../../../motion/motion';
import { ChevronDownIcon, HeartIcon, SparkIcon, StarIcon, VerifiedIcon } from '../icons';
import { Bullets, Emphasis, Label, Lines, Said, useAfter } from './parts';

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
type Part =
  | 'question'
  | 'summary'
  | 'points'
  | 'review'
  | 'filters'
  | 'closing'
  | 'offer'
  | 'done';

const PARTS: Part[] = [
  'question',
  'summary',
  'points',
  'review',
  'filters',
  'closing',
  'offer',
  'done',
];

export function Answer({
  answer,
  innerRef,
  onSettled,
  onAsk,
}: {
  answer: AnswerContent;
  innerRef?: React.Ref<HTMLDivElement>;
  /** Called once every part of the answer has been given and shown. */
  onSettled?: () => void;
  /** Asks the question a review filter stands for. The turn it opens is added
   *  to the thread by the session, exactly as a tapped suggestion would be. */
  onAsk?: (id: string) => void;
}) {
  const [part, setPart] = useState<Part>('question');

  /** The filter the shopper picked, if it was one that asks something. */
  const [picked, setPicked] = useState<ReviewFilter>();

  /**
   * Once the shopper has asked the reviews a question, this answer stops
   * selling.
   *
   * The closing line only exists to offer the care kit, so the two go together
   * — a question about a kit that is no longer on screen reads as a mistake.
   * The conversation carries on in the turn the filter opened.
   */
  const stoppedSelling = Boolean(picked?.asks);

  const hasFilters = Boolean(answer.reviewFilters?.length);

  const pick = (filter: ReviewFilter) => {
    if (!filter.asks || picked) return;
    setPicked(filter);
    onAsk?.(filter.asks);
  };

  /* The question lands, and the assistant takes the same beat a person would
     take before answering it. */
  useAfter(pace.afterSaid, part === 'question', () => setPart('summary'));

  /* The parts that follow the summary, each after the one before it. Anything
     this answer does not have is stepped straight past. */
  useAfter(pace.betweenParts, part === 'points' && !answer.reviewSummary, () => setPart('review'));
  useAfter(pace.betweenParts, part === 'review' && !answer.review, () => setPart('filters'));
  useAfter(pace.betweenParts, part === 'filters' && !hasFilters, () => setPart('closing'));
  useAfter(pace.betweenParts, part === 'closing' && !answer.closing, () => setPart('offer'));
  useAfter(pace.betweenParts, part === 'offer' && !answer.offer, () => setPart('done'));

  /* And the ones it does have, held long enough to be taken in. */
  useAfter(pace.betweenParts, part === 'review' && Boolean(answer.review), () =>
    setPart('filters'),
  );
  useAfter(pace.betweenParts, part === 'filters' && hasFilters, () => setPart('closing'));
  useAfter(pace.betweenParts, part === 'offer' && Boolean(answer.offer), () => setPart('done'));

  useAfter(pace.afterSpeech, part === 'done', () => onSettled?.());

  /* Picking a filter that has a review jumps straight to the end of the
     answer: the second review is the last thing it has to say. */
  useAfter(pace.betweenParts, stoppedSelling, () => setPart('done'));

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

      {/* Asking the reviews about one thing. What comes back is a whole turn
          further down the thread, not another card bolted onto this one. */}
      {reached('filters') && answer.reviewFilters && (
        <ReviewFilters
          filters={answer.reviewFilters}
          picked={picked?.id}
          onPick={pick}
        />
      )}

      {/* The closing line and what it offers leave together once the shopper
          has gone to the reviews. Faded out rather than cut, because something
          vanishing between two frames reads as a fault. */}
      <AnimatePresence>
        {reached('closing') && answer.closing && !stoppedSelling && (
          <motion.div key="closing" {...moves.session.leaving} className="w-full">
            {typeof answer.closing === 'string' ? (
              <Lines start onDone={() => setPart('offer')}>
                {[answer.closing]}
              </Lines>
            ) : (
              <Emphasis phrases={answer.closing} start onDone={() => setPart('offer')} />
            )}
          </motion.div>
        )}

        {reached('offer') && answer.offer && !stoppedSelling && (
          <motion.div key="offer" {...moves.session.leaving} className="w-full">
            <OfferRow offer={answer.offer} />
          </motion.div>
        )}
      </AnimatePresence>
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
          {/* Always one decimal. A flawless review reads "5.0" beside a
              "4.9", where a bare "5" reads as a different kind of number. */}
          <span className="font-[var(--font-ui)] text-[14px] leading-[21px] text-[var(--card-meta)]">
            {review.rating.toFixed(1)}
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

      {/* What the buyer photographed. Square, small, and their own — a review
          of how something wears is worth more with the picture than without. */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex items-start gap-2">
          {review.photos.map((photo) => (
            <img
              key={photo}
              src={photo}
              alt=""
              draggable={false}
              className="size-16 shrink-0 rounded-[12px] object-cover shadow-[var(--card-shadow)]"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ==========================================================================
 * ASKING THE REVIEWS ABOUT ONE THING
 *
 * A row of small chips under the quoted review. They sit to the right, where
 * everything the shopper can tap sits, so the row reads as a choice rather
 * than as more of the card above it.
 *
 * The row travels: once a filter has brought a second review up, it moves
 * below that one, because it is the control for what comes next and what
 * comes next is always at the bottom.
 * ========================================================================== */

function ReviewFilters({
  filters,
  picked,
  onPick,
}: {
  filters: readonly ReviewFilter[];
  picked?: string;
  onPick: (filter: ReviewFilter) => void;
}) {
  return (
    <motion.div
      {...moves.session.review}
      className="flex w-full flex-wrap items-center justify-end gap-2"
    >
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          whileTap={moves.assistant.press}
          onClick={() => onPick(filter)}
          aria-pressed={picked === filter.id}
          className={`flex items-center gap-1 rounded-[32px] border border-[var(--chip-border)] px-3 py-2 font-[var(--font-ui)] text-[10px] font-medium text-black ${
            picked === filter.id ? 'bg-[var(--control-dark)] text-white' : 'bg-[var(--chip)]'
          }`}
        >
          <SparkIcon size={12} />
          {filter.label}
        </motion.button>
      ))}
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
