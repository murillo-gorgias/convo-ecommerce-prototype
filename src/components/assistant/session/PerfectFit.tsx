import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { perfectFit, productDetail, type Recommendation } from '../../../content/journey';
import { moves, stagger } from '../../../motion/motion';
import { CartIcon, CheckIcon, ChevronDownIcon, StarIcon } from '../icons';
import { Body, Label, Line, Section, Steady, useSectionReveal } from './parts';

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
 * line saying why this one. They arrive one at a time. Tapping opens a piece to
 * the full width of the conversation, in place, and only THEN does a sideways
 * swipe mean something: it moves through that piece's photographs, and it is
 * the only swipe on screen.
 *
 * WHAT AN OPENED PIECE SHOWS
 * The photographs, the name, the price, the rating, the material and the bag.
 * That is the whole list. Everything a product page would stack up below the
 * fold — what it is made of, whether it tarnishes, how to care for it, what
 * people said — is asked for in the conversation instead. Scrolling to find
 * an answer is the thing this session exists to replace.
 */

export function PerfectFit({
  innerRef,
  opened,
  choosing,
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
  /** The piece that has just been tapped, while the others are clearing. */
  choosing?: string;
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
        {/* NO AnimatePresence here, deliberately.
            All three states share one photograph, matched by `layoutId`, and
            that is what carries the change. Keeping an outgoing state alive
            alongside the incoming one put two blocks in the flow at once,
            which is what shoved the conversation down and then snapped it back
            as the old one left.

            Opening is staged instead: the three pieces that were not chosen
            clear first, and only then does the one that was left morph out. By
            the time the grid is replaced there is nothing visible in it except
            the photograph that is travelling anyway. */}
        {piece && folded ? (
          <CollapsedPiece piece={piece} onReopen={onReopen} />
        ) : piece ? (
          <OpenPiece piece={piece} inBag={inBag} onAddToBag={onAddToBag} />
        ) : (
          <div className="grid w-full grid-cols-2 gap-x-3 gap-y-5">
            {perfectFit.pieces.map((candidate, index) => (
              <GridPiece
                key={candidate.id}
                piece={candidate}
                index={index}
                discarded={Boolean(choosing) && candidate.id !== choosing}
                onOpen={() => onOpen(candidate.id)}
              />
            ))}
          </div>
        )}
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
  discarded,
  onOpen,
}: {
  piece: Recommendation;
  index: number;
  /** True while another piece is being opened and this one is clearing away. */
  discarded: boolean;
  onOpen: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={moves.session.piece.initial}
      animate={discarded ? moves.session.tileDiscard : moves.session.piece.animate}
      transition={
        discarded
          ? moves.session.tileDiscard.transition
          : { ...moves.session.piece.transition, delay: index * stagger.deliberate }
      }
      whileTap={moves.session.tilePress}
      className="flex w-full flex-col items-stretch text-left"
      aria-label={`${piece.name}, $${piece.price}`}
    >
      <Photograph piece={piece} className="h-[236px] w-full rounded-[12px]" />

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

/**
 * The photograph that travels between the grid, the opened piece and the
 * folded line — the same element throughout, matched by `layoutId`.
 *
 * The image is scaled very slightly inside a clipping frame. The exported
 * photographs carry their own rounded corners with a hairline of transparency
 * around them, which showed as a pale edge against the warm sheet. Cropping a
 * couple of percent removes it without anything else changing.
 */
function Photograph({
  piece,
  className,
}: {
  piece: Recommendation;
  className: string;
}) {
  return (
    <motion.span
      layoutId={`piece-${piece.id}`}
      transition={moves.session.open}
      className={`relative block overflow-hidden bg-[var(--paper-warm)] ${className}`}
    >
      <img
        src={piece.image}
        alt=""
        draggable={false}
        className="h-full w-full scale-[1.03] object-cover"
      />
    </motion.span>
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
    <motion.article
      layout
      transition={moves.session.open}
      className="-mx-4 w-[calc(100%+32px)]"
    >
      <Gallery piece={piece} />

      <Steady>
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
            {/* The button's box may change as the label does; the label itself
                crossfades and is never stretched into the new one. */}
            <AnimatePresence mode="wait" initial={false}>
              {inBag ? (
                <motion.span
                  key="added"
                  layout="position"
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
                  layout="position"
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
      </Steady>
    </motion.article>
  );
}

/* ==========================================================================
 * THE GALLERY
 *
 * The photographs of one piece, swiped through. This is the only place in the
 * session where a sideways swipe means anything, which is the whole reason
 * the recommendation stopped being a carousel.
 *
 * It is a real scroller with snap points rather than a drag-and-count, so it
 * carries the momentum and rubber-banding the platform already does well, and
 * the dots simply report where the scroll ended up.
 * ========================================================================== */

function Gallery({ piece }: { piece: Recommendation }) {
  const rail = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const drag = useRef<{ from: number; at: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const onScroll = () => {
    const node = rail.current;
    if (!node) return;
    setFrame(Math.round(node.scrollLeft / node.clientWidth));
  };

  /**
   * DRAGGING WITH A MOUSE.
   *
   * On a phone this scroller is already swipeable. On a laptop it was not — a
   * horizontal scroller only responds to a horizontal wheel, which on most
   * machines means holding shift. Nobody demoing this is going to do that.
   *
   * So a press-and-drag moves the rail directly, and letting go hands it back
   * to the browser's own snapping. Snapping is turned off mid-drag, because
   * snap points fight a scrollLeft that is being set every frame.
   */
  const startDrag = (event: React.PointerEvent) => {
    const node = rail.current;
    if (!node) return;
    drag.current = { from: event.clientX, at: node.scrollLeft };
    setDragging(true);
    node.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent) => {
    const node = rail.current;
    if (!node || !drag.current) return;
    node.scrollLeft = drag.current.at - (event.clientX - drag.current.from);
  };

  const endDrag = (event: React.PointerEvent) => {
    const node = rail.current;
    if (!node || !drag.current) return;
    drag.current = null;
    setDragging(false);
    node.releasePointerCapture(event.pointerId);
    /* Land on the nearest frame ourselves. Re-enabling snap alone does not
       move an already-settled scroll position. */
    node.scrollTo({
      left: Math.round(node.scrollLeft / node.clientWidth) * node.clientWidth,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      <div
        ref={rail}
        onScroll={onScroll}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        data-gallery
        className={`flex w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          dragging ? 'cursor-grabbing select-none' : 'cursor-grab snap-x snap-mandatory'
        }`}
      >
        {piece.gallery.map((shot, index) =>
          index === 0 ? (
            /* The first frame is the one that travelled here from the grid, so
               it keeps the shared identity. The rest are ordinary images. */
            <motion.span
              key={shot}
              layoutId={`piece-${piece.id}`}
              transition={moves.session.open}
              className="relative block h-[452px] w-full min-w-full shrink-0 snap-center overflow-hidden bg-[var(--paper-warm)]"
            >
              <img src={shot} alt={piece.name} draggable={false}
        className="h-full w-full scale-[1.03] object-cover" />
            </motion.span>
          ) : (
            <span
              key={shot}
              className="relative block h-[452px] w-full min-w-full shrink-0 snap-center overflow-hidden bg-[var(--paper-warm)]"
            >
              <img src={shot} alt="" draggable={false}
        className="h-full w-full scale-[1.03] object-cover" />
            </span>
          ),
        )}
      </div>

      <Pagination count={piece.gallery.length} at={frame} />
    </div>
  );
}

/**
 * The dots under the photographs. The one you are on is solid; the rest fade
 * and shrink with distance, so the row reads as "there is more this way"
 * rather than as a count to keep track of.
 */
function Pagination({ count, at }: { count: number; at: number }) {
  return (
    <div className="pointer-events-none absolute bottom-[10px] left-1/2 flex -translate-x-1/2 items-center gap-1">
      {Array.from({ length: count }, (_, index) => {
        const distance = Math.abs(index - at);
        return (
          <motion.span
            key={index}
            animate={{
              width: distance === 0 ? 6 : Math.max(2, 6 - distance),
              height: distance === 0 ? 6 : Math.max(2, 6 - distance),
              opacity: distance === 0 ? 1 : Math.max(0.25, 0.55 - distance * 0.12),
            }}
            transition={moves.session.galleryDot.transition}
            className="rounded-full bg-[var(--ink-soft)]"
          />
        );
      })}
    </div>
  );
}

/* ==========================================================================
 * THE PIECE, FOLDED BACK
 *
 * Once an answer has been given the piece stops being the subject, so it
 * folds to a single line — the same move every answered section makes. The
 * photograph is not swapped for a thumbnail; it shrinks into one, because it
 * is the same element. It keeps a way back in, because the conversation above
 * is meant to stay live rather than becoming a transcript.
 * ========================================================================== */

export function CollapsedPiece({
  piece,
  onReopen,
}: {
  piece: Recommendation;
  onReopen: () => void;
}) {
  return (
    /* Built to exactly the same rule as every other folded line: one bordered
       row, the words on the left, the evidence inset on the right by
       `--stack-inset` with a concentric corner. It used to be two shapes
       butted together with different radii and no gap, which is what made the
       collapsed cards read as misaligned. */
    <motion.div
      layout
      transition={moves.session.open}
      className="flex w-full items-center gap-4 overflow-hidden rounded-[var(--fold-radius)] border border-[var(--confirmed-border)] bg-[var(--confirmed-bg)] p-1 pl-5"
    >
      <Steady className="flex min-w-0 flex-1 flex-col items-start gap-3 py-3">
        <motion.span
          {...moves.session.collapsedPiece}
          className="truncate font-[var(--font-ui)] text-[14px] font-medium leading-[20px] text-[var(--ink-soft)]"
        >
          {piece.name}
        </motion.span>
        <motion.button
          {...moves.session.collapsedPiece}
          whileTap={moves.assistant.press}
          onClick={onReopen}
          className="w-fit rounded-[32px] border border-[var(--control-border)] bg-black px-3 py-2 font-[var(--font-ui)] text-[10px] font-medium text-white"
        >
          {productDetail.reopen}
        </motion.button>
      </Steady>

      <motion.span
        layoutId={`piece-${piece.id}`}
        transition={moves.session.open}
        className="relative block h-[96px] w-[104px] shrink-0 overflow-hidden rounded-[var(--fold-inner-radius)] bg-[var(--paper-warm)]"
      >
        <img
          src={piece.gallery[0]}
          alt=""
          draggable={false}
          className="h-full w-full scale-[1.03] object-cover"
        />
      </motion.span>
    </motion.div>
  );
}
