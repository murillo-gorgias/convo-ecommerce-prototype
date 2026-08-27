import { motion } from 'motion/react';
import { bag, styleWith } from '../../../content/journey';
import { moves, stagger } from '../../../motion/motion';
import { GripIcon } from '../icons';
import { OfferRow } from './Answer';
import { Label, Line, Section, useSectionReveal } from './parts';
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
 * Below it, one piece that goes with what is already in there. It earns its
 * place by naming the piece it pairs with, which is something only a bag that
 * knows the conversation can do.
 */

export function Bag({
  innerRef,
  onCheckOut,
  onSettled,
}: {
  innerRef?: React.Ref<HTMLDivElement>;
  onCheckOut: () => void;
  onSettled: () => void;
}) {
  const subtotal = bag.items.reduce((sum, item) => sum + item.price, 0);

  return (
    <motion.div
      ref={innerRef}
      layout
      {...moves.session.section}
      className="flex w-full scroll-mt-[100px] flex-col items-start gap-6"
    >
      {/* What landed, named. The two pieces are set in bold because they are
          the only part of the sentence worth checking. */}
      <motion.p
        {...moves.session.line}
        className="w-full font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-black"
      >
        <strong className="font-semibold">{bag.confirmation.first}</strong>
        {bag.confirmation.join}
        <strong className="font-semibold">{bag.confirmation.second}</strong>
        {bag.confirmation.tail}
      </motion.p>

      <motion.div
        {...moves.session.card}
        className="flex w-full flex-col gap-3 rounded-[var(--card-radius)] bg-[var(--card)] p-4"
      >
        <span className="flex justify-center text-black">
          <GripIcon />
        </span>

        {bag.items.map((item, index) => (
          <motion.div
            key={item.id}
            {...moves.session.cardRow}
            transition={{ ...moves.session.cardRow.transition, delay: 0.1 + index * stagger.base }}
            className="flex items-center gap-3"
          >
            <img src={item.image} alt="" className="h-16 w-16 rounded-[12px] object-cover" />
            <span className="flex-1 font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-black">
              {item.name}
            </span>
            <span className="font-[var(--font-ui)] text-[14px] leading-[var(--type-said-line)] text-[var(--card-line-label)]">
              {money(item.price)}
            </span>
          </motion.div>
        ))}

        <span className="mt-1 h-px w-full bg-black/[0.06]" />

        <CardLine label={bag.lines.subtotal} value={money(subtotal)} />
        <CardLine label={bag.lines.shipping} value={bag.lines.shippingValue} />
        <CardLine label={bag.lines.total} value={money(subtotal)} strong />

        <motion.button
          whileTap={moves.assistant.press}
          onClick={onCheckOut}
          className="mt-1 w-full rounded-[32px] border border-[var(--control-border)] bg-[var(--control-dark)] px-4 py-2 font-[var(--font-ui)] text-[10px] font-medium text-white"
        >
          {bag.checkOut}
        </motion.button>
      </motion.div>

      <StyleWith onSettled={onSettled} />
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

  return (
    <Section>
      <Label>{styleWith.label}</Label>
      <Line
        start={speaking}
        onDone={() => {
          onSpoken();
          onSettled();
        }}
      >
        {styleWith.prompt}
      </Line>
      {ready && <OfferRow offer={styleWith.piece} />}
    </Section>
  );
}
