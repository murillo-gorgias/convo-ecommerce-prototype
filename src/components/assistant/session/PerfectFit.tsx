import { AnimatePresence, motion } from 'motion/react';
import { perfectFit, productDetail, type Recommendation } from '../../../content/journey';
import { moves, stagger } from '../../../motion/motion';
import { CartIcon, CheckIcon, ChevronDownIcon, StarIcon } from '../icons';
import { Body, Label, Line, Section, useSectionReveal } from './parts';

/**
 * ============================================================================
 * THE PERFECT FIT
 * ============================================================================
 *
 * The answer, arriving last — after taste, neckline and length are all known.
 *
 * WHY A GRID AND NOT A CAROUSEL
 * The pieces used to sit in a swipeable carousel, one filling the screen with
 * all its details and the next peeking at the edge. That gave the same gesture
 * two meanings: swiping sideways inside a piece moved through its photographs,
 * and swiping sideways outside it moved to the next piece. There was no way to
 * tell which one you were doing.
 *
 * So the pieces are shown flat and quiet — photograph, name, price, and one
 * line saying why this one. Tapping opens a piece to the full width of the
 * conversation, in place. Nothing covers anything.
 *
 * WHAT AN OPENED PIECE SHOWS
 * The photograph, the name, the price, the rating, the material and the bag.
 * That is the whole list. Everything a product page would stack up below the
 * fold — what it is made of, whether it tarnishes, how to care for it, what
 * people said — is asked for in the conversation instead. Scrolling to find
 * an answer is the thing this session exists to replace.
 */

export function PerfectFit({
  innerRef,
  opened,
  folded,
  onOpen,
  onReopen,
  inBag,
  onAddToBag,
  onSettled,
}: {
  innerRef?: React.Ref<HTMLDivElement>;
  /** The piece currently open, if any. */
  opened?: string;
  /** True once the piece has stopped being the subject of the conversation. */
  folded?: boolean;
  onOpen: (id: string) => void;
  onReopen: () => void;
  inBag: boolean;
  onAddToBag: () => void;
  /** Called once the grid has finished arriving and is waiting on a tap. */
  onSettled: () => void;
}) {
  const { speaking, ready, onSpoken } = useSectionReveal();
  const piece = perfectFit.pieces.find((candidate) => candidate.id === opened);

  return (
    <Section innerRef={innerRef}>
      <Label>{perfectFit.label}</Label>
      <Line start={speaking} onDone={onSpoken}>
        {perfectFit.prompt}
      </Line>

      <Body show={ready} onSettled={onSettled}>
        <AnimatePresence mode="wait" initial={false}>
          {piece && folded ? (
            <CollapsedPiece key="folded" piece={piece} onReopen={onReopen} />
          ) : piece ? (
            <OpenPiece
              key="open"
              piece={piece}
              inBag={inBag}
              onAddToBag={onAddToBag}
            />
          ) : (
            <motion.div
              key="grid"
              layout
              className="grid w-full grid-cols-2 gap-x-3 gap-y-5"
            >
              {perfectFit.pieces.map((candidate, index) => (
                <GridPiece
                  key={candidate.id}
                  piece={candidate}
                  index={index}
                  onOpen={() => onOpen(candidate.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Body>
    </Section>
  );
}

/* ==========================================================================
 * ONE PIECE IN THE GRID
 *
 * A photograph, and underneath it the least that lets someone choose: what it
 * is, what it costs, and why it is here. The reason is the only editorial line
 * in the grid, and it is what makes four options readable at a glance instead
 * of four things to compare.
 * ========================================================================== */

function GridPiece({
  piece,
  index,
  onOpen,
}: {
  piece: Recommendation;
  index: number;
  onOpen: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={moves.session.piece.initial}
      animate={moves.session.piece.animate}
      transition={{ ...moves.session.piece.transition, delay: index * stagger.base }}
      whileTap={moves.session.tilePress}
      className="flex w-full flex-col items-stretch text-left"
      aria-label={`${piece.name}, $${piece.price}`}
    >
      {/* The photograph carries its own identity across the open, so tapping
          grows this exact image rather than swapping it for another. */}
      <motion.img
        layoutId={`piece-${piece.id}`}
        transition={moves.session.open}
        src={piece.image}
        alt=""
        className="h-[236px] w-full rounded-[12px] object-cover"
      />

      <div className="mt-2 flex items-baseline gap-2">
        <span className="min-w-0 flex-1 truncate font-[var(--font-ui)] text-[14px] leading-[21px] text-black">
          {piece.name}
        </span>
        <span className="shrink-0 font-[var(--font-ui)] text-[14px] leading-[21px] text-black">
          ${piece.price}
        </span>
      </div>

      <span className="font-[var(--font-ui)] text-[12px] italic leading-[18px] text-[var(--card-meta)]">
        {piece.reason}
      </span>
    </motion.button>
  );
}

/* ==========================================================================
 * ONE PIECE, OPENED
 * ========================================================================== */

function OpenPiece({
  piece,
  inBag,
  onAddToBag,
}: {
  piece: Recommendation;
  inBag: boolean;
  onAddToBag: () => void;
}) {
  return (
    <motion.article layout transition={moves.session.open} className="-mx-4 w-[calc(100%+32px)]">
      {/* The photograph, run to the edges of the sheet. Once a piece is the
          subject it stops being a card and becomes the view. */}
      <div className="relative w-full overflow-hidden">
        <motion.img
          layoutId={`piece-${piece.id}`}
          transition={moves.session.open}
          src={piece.open}
          alt={piece.name}
          className="h-[452px] w-full object-cover"
        />
        <Pagination />
      </div>

      <motion.div {...moves.session.openDetail} className="px-4">
        <div className="mt-4 flex items-baseline justify-between gap-3">
          <h3 className="font-[var(--font-ui)] text-[14px] leading-[21px] text-black">
            {piece.name}
          </h3>
          <span className="shrink-0 font-[var(--font-ui)] text-[14px] leading-[21px] text-black">
            ${piece.price}
          </span>
        </div>

        <div className="mt-[2px] flex items-center gap-1 text-black">
          <StarIcon size={14} />
          <span className="font-[var(--font-ui)] text-[14px] leading-[21px]">{piece.rating}</span>
        </div>

        {/* Material is the only choice left inside the piece, because it is
            the price lever — the same design in solid gold is two to three
            times this. Everything else is a question, not a control. */}
        <p className="mt-5 font-[var(--font-ui)] text-[12px] leading-[16px] text-black">
          {productDetail.materialLabel}
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
            onClick={onAddToBag}
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
                    {productDetail.added}
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
                    {productDetail.addToBag}
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
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

/* ==========================================================================
 * THE PIECE, FOLDED BACK
 *
 * Once an answer has been given the piece stops being the subject, so it
 * folds to a single line — the same move every answered section makes. It
 * keeps a way back in, because the conversation above is meant to stay live
 * rather than becoming a transcript.
 * ========================================================================== */

export function CollapsedPiece({
  piece,
  onReopen,
}: {
  piece: Recommendation;
  onReopen: () => void;
}) {
  return (
    <motion.div
      {...moves.session.collapsedPiece}
      layout
      className="flex w-full items-stretch"
    >
      <div className="flex flex-1 flex-col justify-center gap-4 rounded-l-[24px] border-y border-l border-[var(--confirmed-border)] bg-[var(--confirmed-bg)] p-5">
        <span className="font-[var(--font-ui)] text-[14px] font-medium leading-[20px] text-[var(--ink-soft)]">
          {piece.name}
        </span>
        <motion.button
          whileTap={moves.assistant.press}
          onClick={onReopen}
          className="w-fit rounded-[32px] border border-[var(--control-border)] bg-black px-3 py-2 font-[var(--font-ui)] text-[10px] font-medium text-white"
        >
          {productDetail.reopen}
        </motion.button>
      </div>

      <img
        src={piece.open}
        alt=""
        className="w-[112px] shrink-0 rounded-r-[12px] object-cover"
      />
    </motion.div>
  );
}
