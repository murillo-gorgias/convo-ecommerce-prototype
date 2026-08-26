import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { perfectFit, type Recommendation } from '../../../content/journey';
import { moves, stagger } from '../../../motion/motion';
import { CartIcon, CheckIcon, ChevronDownIcon, PlusIcon, SparkIcon, StarIcon } from '../icons';
import { Body, Label, Line, Section, useSectionReveal } from './parts';

/**
 * ============================================================================
 * THE PERFECT FIT
 * ============================================================================
 *
 * The answer, arriving last — after taste, neckline and length are all known.
 * Two pieces, shown large enough to be judged, side by side in a carousel the
 * shopper swipes.
 *
 * Everything a shopper would leave to find is here: the price, the rating, the
 * material, the bag. The session never hands them off to a product page.
 *
 * It paces itself like every other section: the line is said first, and the
 * pieces only arrive once it has been said. After three questions, the payoff
 * is worth a beat of anticipation.
 */

export function PerfectFit({ innerRef }: { innerRef?: React.Ref<HTMLDivElement> }) {
  const { speaking, ready, onSpoken } = useSectionReveal();

  return (
    <Section innerRef={innerRef}>
      <Label>{perfectFit.label}</Label>
      <Line start={speaking} onDone={onSpoken}>
        {perfectFit.prompt}
      </Line>

      <Body show={ready}>
        {/* The carousel runs past the thread's margins, so a second card is
            always visible at the edge and the swipe is discoverable. */}
        <div className="-mx-4 w-[calc(100%+32px)] overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex snap-x snap-mandatory gap-[14px] px-2">
            {perfectFit.pieces.map((piece, index) => (
              <Piece key={piece.id} piece={piece} index={index} />
            ))}
          </div>
        </div>
      </Body>
    </Section>
  );
}

/* ==========================================================================
 * ONE PIECE
 * ========================================================================== */

function Piece({ piece, index }: { piece: Recommendation; index: number }) {
  const [inBag, setInBag] = useState(false);

  return (
    <motion.article
      initial={moves.session.piece.initial}
      animate={moves.session.piece.animate}
      transition={{ ...moves.session.piece.transition, delay: 0.1 + index * stagger.slow }}
      className="flex w-[374px] shrink-0 snap-center flex-col"
    >
      {/* The photograph */}
      <div className="relative h-[447px] w-full overflow-hidden rounded-[20px] bg-white">
        <img src={piece.image} alt={piece.name} className="h-full w-full object-cover" />

        <Pagination />

        <motion.button
          whileTap={moves.assistant.press}
          className="absolute bottom-[12px] right-[16px] flex h-[37px] items-center gap-2 rounded-[20px] border border-white/50 bg-white/60 px-3 text-[var(--ink-soft)] shadow-[0_2px_3px_rgba(0,0,0,0.08)] backdrop-blur-md"
        >
          <SparkIcon size={12} />
          <span className="font-[var(--font-ui)] text-[12px] font-medium">
            {perfectFit.moreLikeThis}
          </span>
        </motion.button>
      </div>

      {/* Name, price, rating */}
      <div className="mt-8 flex w-full items-baseline justify-between gap-3">
        <h3 className="font-[var(--font-ui)] text-[14px] leading-[21px] text-black">{piece.name}</h3>
        <span className="shrink-0 font-[var(--font-ui)] text-[14px] leading-[21px] text-black">
          ${piece.price}
        </span>
      </div>
      <div className="mt-[2px] flex items-center gap-1 text-black">
        <StarIcon size={14} />
        <span className="font-[var(--font-ui)] text-[14px] leading-[21px]">{piece.rating}</span>
      </div>

      {/* Material, and the bag */}
      <p className="mt-8 font-[var(--font-ui)] text-[12px] leading-[16px] text-black">
        {perfectFit.materialLabel}
      </p>
      <div className="mt-2 flex gap-2">
        <motion.button
          whileTap={moves.assistant.press}
          className="flex h-12 flex-1 items-center gap-2 rounded-[24px] border border-white/60 bg-white/50 pl-4 pr-3 text-left shadow-[0_2px_3px_rgba(0,0,0,0.06)] backdrop-blur-md"
        >
          <span
            className="h-6 w-6 shrink-0 rounded-full ring-1 ring-black/10"
            style={{ background: piece.swatch }}
          />
          <span className="flex-1 truncate font-[var(--font-ui)] text-[14px] leading-[20px] text-[var(--ink-soft)]">
            {piece.material}
          </span>
          <ChevronDownIcon size={20} />
        </motion.button>

        <motion.button
          layout
          whileTap={moves.assistant.press}
          onClick={() => setInBag(true)}
          transition={moves.assistant.shapeChange}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[24px] bg-[var(--ink)] px-4 text-white"
        >
          <AnimatePresence mode="wait" initial={false}>
            {inBag ? (
              <motion.span
                key="added"
                {...moves.assistant.contentSwap}
                className="flex items-center gap-2"
              >
                <CheckIcon size={16} />
                <span className="font-[var(--font-ui)] text-[14px] font-medium leading-[19px]">
                  {perfectFit.added}
                </span>
              </motion.span>
            ) : (
              <motion.span
                key="add"
                {...moves.assistant.contentSwap}
                className="flex items-center gap-2"
              >
                <CartIcon size={16} />
                <span className="font-[var(--font-ui)] text-[14px] font-medium leading-[19px]">
                  {perfectFit.addToBag}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Everything else, folded away until asked for */}
      <button className="mt-8 flex w-full items-center justify-between border-b border-black/10 pb-2 text-black">
        <span className="font-[var(--font-ui)] text-[12px] leading-[16px]">
          {perfectFit.information}
        </span>
        <PlusIcon size={18} />
      </button>
    </motion.article>
  );
}

/**
 * The dots under the photograph. They shrink towards the edge rather than
 * running to a hard stop, which reads as "there is more" without a number.
 */
function Pagination() {
  const dots = [
    { size: 6, opacity: 1 },
    { size: 6, opacity: 0.4 },
    { size: 6, opacity: 0.4 },
    { size: 4, opacity: 0.3 },
    { size: 2, opacity: 0.25 },
  ];

  return (
    <div className="absolute bottom-[10px] left-1/2 flex -translate-x-1/2 items-center gap-1">
      {dots.map((dot, i) => (
        <span
          key={i}
          className="rounded-full bg-[var(--ink-soft)]"
          style={{ width: dot.size, height: dot.size, opacity: dot.opacity }}
        />
      ))}
    </div>
  );
}
