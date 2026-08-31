import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { bag, styleWith } from '../../../content/journey';
import { moves, pace } from '../../../motion/motion';
import { ChevronDownIcon, GripIcon } from '../icons';
import { OfferRow } from './Answer';
import { Emphasis, Label, Line, Section, useAfter, useSectionReveal } from './parts';
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
 *
 * The card itself is separate from all of that, because the bag is shown more
 * than once. It comes back inside the answer about promotions, where the whole
 * point is the total the offer applies to.
 *
 * A card folds once the conversation has moved past it. What is in the bag is
 * settled by then, and leaving the pieces open pushes the thing being said now
 * off the screen — so the card keeps its totals and gives back the rest.
 */

/** How far through the bag we are. */
type Part = 'said' | 'card' | 'pairing';

export function Bag({
  innerRef,
  folded,
  onCheckOut,
  onSettled,
}: {
  innerRef?: React.Ref<HTMLDivElement>;
  /** True once the conversation has moved on from the bag. */
  folded?: boolean;
  onCheckOut: () => void;
  onSettled: () => void;
}) {
  const [part, setPart] = useState<Part>('said');

  /* The card holds for a beat before the pairing is raised, so the bag is read
     as a bag rather than as the top half of an upsell. */
  useAfter(pace.betweenParts, part === 'card', () => setPart('pairing'));

  return (
    <motion.div
      ref={innerRef}
      {...moves.session.section}
      className="flex w-full flex-col items-start gap-6"
    >
      {/* What landed, named. */}
      <Emphasis phrases={bag.confirmation} start onDone={() => setPart('card')} />

      {part !== 'said' && <BagCard folded={folded} onCheckOut={onCheckOut} />}

      {part === 'pairing' && <StyleWith onSettled={onSettled} />}
    </motion.div>
  );
}

/* ==========================================================================
 * THE CARD
 * ========================================================================== */

export function BagCard({
  folded,
  onCheckOut,
}: {
  folded?: boolean;
  onCheckOut: () => void;
}) {
  /** Set when the shopper opens a folded card back up by hand. */
  const [reopened, setReopened] = useState(false);
  const open = !folded || reopened;
  const subtotal = bag.items.reduce((sum, item) => sum + item.price, 0);

  return (
    <motion.div
      {...moves.session.card}
      className="flex w-full flex-col gap-3 rounded-[var(--card-radius)] bg-[var(--card)] p-4"
    >
      <Row index={0}>
        <motion.button
          whileTap={moves.assistant.press}
          onClick={() => setReopened((was) => !was)}
          aria-label={bag.lines.subtotal}
          className="flex w-full justify-center text-black"
        >
          {open ? <GripIcon /> : <span className="block rotate-180"><ChevronDownIcon /></span>}
        </motion.button>
      </Row>

      {/* The pieces give back their room rather than fading in place. Height
          is what is animated, never scale — a card that scales its way shut
          drags every word in it with it. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="pieces"
            initial={{ height: 'auto' }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={moves.session.fold}
            className="flex flex-col gap-3 overflow-hidden"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

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
