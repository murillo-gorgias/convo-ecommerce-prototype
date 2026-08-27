import { useState } from 'react';
import { motion } from 'motion/react';
import { bag, styleWith } from '../../../content/journey';
import { moves, pace } from '../../../motion/motion';
import { GripIcon } from '../icons';
import { OfferRow } from './Answer';
import { Label, Line, Lines, Section, useAfter, useSectionReveal } from './parts';
import { money } from './money';

/**
 * ============================================================================
 * THE BAG
 * ============================================================================
 *
 * Adding something does not open a drawer over the conversation. A drawer is
 * the exact thing this session exists to avoid — it hides what you were
 * looking at at the moment you most want to compare it with what you just
 * chose. So the bag arrives as the next thing said, and the conversation
 * carries on underneath it.
 *
 * It arrives in parts, like every other block here: the line that says what
 * landed is typed first, then the card, then the rows inside the card in
 * order, then the button. Below all of it, one piece that goes with what is
 * already in there — which earns its place by naming the piece it pairs with,
 * something only a bag that knows the conversation can do.
 */

/** How far through the bag we are. */
type Part = 'said' | 'card' | 'pairing';

export function Bag({
  innerRef,
  onCheckOut,
  onSettled,
}: {
  innerRef?: React.Ref<HTMLDivElement>;
  onCheckOut: () => void;
  onSettled: () => void;
}) {
  const [part, setPart] = useState<Part>('said');
  const subtotal = bag.items.reduce((sum, item) => sum + item.price, 0);

  /* The card holds for a beat before the pairing is raised, so the bag is read
     as a bag rather than as the top half of an upsell. */
  useAfter(pace.betweenParts, part === 'card', () => setPart('pairing'));

  return (
    <motion.div
      ref={innerRef}
      layout
      {...moves.session.section}
      className="flex w-full scroll-mt-[100px] flex-col items-start gap-6"
    >
      {/* What landed, named. The two pieces are set in bold because they are
          the only part of the sentence worth checking. */}
      <Lines start onDone={() => setPart('card')}>
        {[`${bag.confirmation.first} and ${bag.confirmation.second}${bag.confirmation.tail}`]}
      </Lines>

      {part !== 'said' && (
        <motion.div
          {...moves.session.card}
          className="flex w-full flex-col gap-3 rounded-[var(--card-radius)] bg-[var(--card)] p-4"
        >
          <Row index={0}>
            <span className="flex w-full justify-center text-black">
              <GripIcon />
            </span>
          </Row>

          {bag.items.map((item, index) => (
            <Row key={item.id} index={index + 1}>
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt=""
                  draggable={false}
                  className="h-16 w-16 rounded-[12px] object-cover"
                />
                <span className="flex-1 font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-black">
                  {item.name}
                </span>
                <span className="font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-[var(--card-line-label)]">
                  {money(item.price)}
                </span>
              </div>
            </Row>
          ))}

          <Row index={3}>
            <span className="block h-px w-full bg-black/[0.06]" />
          </Row>
          <Row index={4}>
            <CardLine label={bag.lines.subtotal} value={money(subtotal)} />
          </Row>
          <Row index={5}>
            <CardLine label={bag.lines.shipping} value={bag.lines.shippingValue} />
          </Row>
          <Row index={6}>
            <CardLine label={bag.lines.total} value={money(subtotal)} strong />
          </Row>
          <Row index={7}>
            <motion.button
              whileTap={moves.assistant.press}
              onClick={onCheckOut}
              className="w-full rounded-[32px] border border-[var(--control-border)] bg-[var(--control-dark)] px-4 py-2 font-[var(--font-ui)] text-[10px] font-medium text-white"
            >
              {bag.checkOut}
            </motion.button>
          </Row>
        </motion.div>
      )}

      {part === 'pairing' && <StyleWith onSettled={onSettled} />}
    </motion.div>
  );
}

/**
 * One row of a card, arriving after the row above it.
 *
 * A card whose contents all appear together reads as a receipt that was
 * printed. Filling it in from the top reads as it being worked out, which is
 * what the assistant is doing.
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

/** One label-and-value row inside a card. */
function CardLine({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  /** The total, which is the one line anybody actually reads. */
  strong?: boolean;
}) {
  return (
    <div className="flex w-full items-start justify-between">
      <span
        className={
          strong
            ? 'font-[var(--font-ui)] text-[length:var(--type-label-size)] font-semibold uppercase leading-[var(--type-said-line)] tracking-[var(--type-label-tracking)] text-black'
            : 'font-[var(--font-ui)] text-[12px] font-medium leading-[var(--type-said-line)] text-[var(--card-line-label)]'
        }
      >
        {label}
      </span>
      <span
        className={`font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] ${
          strong ? 'text-black' : 'text-[var(--card-line-label)]'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ==========================================================================
 * WHAT GOES WITH IT
 * ========================================================================== */

function StyleWith({ onSettled }: { onSettled: () => void }) {
  const { speaking, ready, onSpoken } = useSectionReveal();
  const [offered, setOffered] = useState(false);

  /* The piece follows the line that introduces it, rather than arriving with
     it — the same rule every other block here follows. */
  useAfter(pace.betweenParts, ready, () => {
    setOffered(true);
    onSettled();
  });

  return (
    <Section>
      <Label>{styleWith.label}</Label>
      <Line start={speaking} onDone={onSpoken}>
        {styleWith.prompt}
      </Line>
      {offered && <OfferRow offer={styleWith.piece} />}
    </Section>
  );
}
