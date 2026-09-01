import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  answers,
  reviewAnswers,
  bag,
  chips,
  checkout,
  confirmation,
  opening,
  perfectFit,
  productDetail,
  promo,
  sizing,
  styleCheck,
  vibeCheck,
} from '../../../content/journey';
import { moves, pace, prefersReducedMotion } from '../../../motion/motion';
import { Dock, SessionGround, SessionHeader, type Suggestion } from './Chrome';
import { AlreadyHappened, Line, Said, useAfter } from './parts';
import { VibeCheck } from './VibeCheck';
import { PickOne } from './PickOne';
import { PerfectFit } from './PerfectFit';
import { Answer } from './Answer';
import { Bag } from './Bag';
import { Promo } from './Promo';
import { Checkout, Confirmation } from './Checkout';
import { SwipeToPay } from './SwipeToPay';
import { LengthIcon, NecklineIcon } from '../icons';

/**
 * ============================================================================
 * THE SESSION
 * ============================================================================
 *
 * One scrolling conversation, not a run of screens. Every question the
 * assistant asks stacks below the last, and once answered it folds into a
 * single line the shopper can scroll back to. Nothing is thrown away, so the
 * shopper can always see how they got here.
 *
 * The order is deliberate: taste, then what it has to work against, then how
 * it should sit — and only then, pieces. Recommending first would mean
 * guessing. Recommending last means being right. After the pieces the same
 * thread carries on through asking about one, bagging it, and paying.
 *
 * WHY THE SECTIONS ARE SEPARATE
 * Each section owns one question and reports one answer. Adding a budget
 * question, a delivery question or a gift-wrap question means adding its copy
 * to `content/journey.ts` and rendering one more section here. Nothing else
 * needs to change, and any section can be removed the same way.
 *
 * HOW IT IS PACED
 * Only one thing happens at a time. A section is not shown because the last
 * one was answered — it is shown because the last one went quiet. Each section
 * reports itself SETTLED when it has nothing left to say, and the next one
 * waits `pace.betweenSections` after that before it appears. Every wait in the
 * session is a number in `pace`, in the motion file.
 *
 * WHAT THE SHOPPER DRIVES
 * The first half is questions, so the assistant leads. From the pieces onward
 * the shopper leads: which piece to open, what to ask about it, when to bag it
 * and when to pay. Those are all taps on the suggestions above the input, and
 * each one appends a turn rather than replacing the view.
 */

/** A section is open, folding itself away, or closed. */
type Phase = 'open' | 'folding' | 'closed';

/** How far the conversation has got. Sections stay once they have appeared. */
type Stage =
  | 'greeting'
  | 'vibe'
  | 'style'
  | 'size'
  | 'pieces'
  | 'bag'
  | 'checkout'
  | 'confirmed';

const ORDER: Stage[] = [
  'greeting',
  'vibe',
  'style',
  'size',
  'pieces',
  'bag',
  'checkout',
  'confirmed',
];
const reached = (stage: Stage, at: Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(at);

/**
 * Every turn the shopper can end up with, on the path or asked for.
 *
 * `answers` are passed through on the way to the bag. `reviewAnswers` are only
 * reached by asking the reviews about something, so a checkpoint never fills
 * one in — landing at the reviews leaves the filters untouched.
 */
const ALL_ANSWERS = [...answers, ...reviewAnswers];
const answerFor = (id: string) => ALL_ANSWERS.find((answer) => answer.id === id);

/**
 * The room the header needs at the top of the thread.
 *
 * The header floats over the conversation rather than sitting above it, so the
 * column reserves this much before its first word. The scroll maths uses the
 * same number, which is why it is a constant and not a class on its own.
 */
const HEADER_CLEARANCE = 104;

/** How long the unchosen images take to clear before the fold begins. */
const CLEAR_TIME = 280;

/** How long a single-answer section stays open after being tapped, so the
 *  tap is seen before the section closes over it. */
const ACKNOWLEDGE_TIME = 460;

/**
 * CHECKPOINTS
 *
 * The session is long, and most work on it is work on one part of it. Starting
 * at a checkpoint fills in every answer before that point as though it had
 * been given, so the thread reads correctly from the top and the part being
 * worked on behaves exactly as it does in a full run.
 *
 * They are for review only. A real shopper always starts at `greeting`.
 */
export type Checkpoint = 'greeting' | 'vibe' | 'product' | 'reviews' | 'cart' | 'checkout';

const CHECKPOINT_STAGE: Record<Checkpoint, Stage> = {
  greeting: 'greeting',
  vibe: 'vibe',
  product: 'pieces',
  reviews: 'pieces',
  cart: 'bag',
  checkout: 'checkout',
};

/** What has already been answered by the time a checkpoint begins. */
const answeredBefore = (checkpoint: Checkpoint) => {
  const questionsDone =
    checkpoint === 'product' ||
    checkpoint === 'reviews' ||
    checkpoint === 'cart' ||
    checkpoint === 'checkout';
  const bagged = checkpoint === 'cart' || checkpoint === 'checkout';

  /* The reviews are inside the answer about tarnishing, so reaching them means
     the piece is open and the question before it has been asked. That earlier
     answer arrives finished; the one holding the reviews plays. */
  const atReviews = checkpoint === 'reviews';
  const asked = bagged || atReviews ? answers.map((answer) => answer.id) : [];

  return {
    questionsDone,
    bagged,
    /* By checkout the promotion has been asked about and answered, so the
       thread reads the way it would after a full run. */
    promoDone: checkpoint === 'checkout',
    /* At the bag and beyond, a piece has been opened and asked about, so it
       sits folded with the conversation about it above the bag. */
    asked,
    /* A piece is open from the reviews onward. */
    pieceOpen: bagged || atReviews,
    /**
     * The one answer that plays rather than arriving finished. At the reviews
     * checkpoint that is the answer holding them, because it is the part being
     * worked on; everything before it is history.
     */
    playing: atReviews ? answers[answers.length - 1].id : undefined,
  };
};

/**
 * Whether a section had already finished before the checkpoint began.
 *
 * The section a checkpoint lands on is the one being worked on, so it plays at
 * its own pace. Everything above it is history: it arrives finished, in one
 * frame. Without this, landing on the bag sets four sections typing themselves
 * out at once, each one growing the thread under the part being looked at, and
 * the conversation shifts about for six seconds while none of it can be read.
 */
const alreadyHappened = (start: Checkpoint, at: Stage) =>
  ORDER.indexOf(at) < ORDER.indexOf(CHECKPOINT_STAGE[start]);

/**
 * Wraps a section the checkpoint skipped past, so it arrives finished.
 *
 * Declared out here on purpose. A component declared inside `Session` would be
 * a new type on every render, and React would throw away and rebuild every
 * section under it each time a single piece of state moved.
 */
function Before({ done, children }: { done: boolean; children: React.ReactNode }) {
  return done ? <AlreadyHappened>{children}</AlreadyHappened> : <>{children}</>;
}

/** Which sections were over before this checkpoint began. */
const historyOf = (start: Checkpoint) => ({
  greeting: alreadyHappened(start, 'greeting'),
  vibe: alreadyHappened(start, 'vibe'),
  style: alreadyHappened(start, 'style'),
  size: alreadyHappened(start, 'size'),
  /* At the reviews checkpoint the part being worked on is the answer, not the
     grid that led to it, so the pieces count as history too. Without this the
     folded product card asks its question at the same moment the answer above
     the reviews is typing itself out. */
  pieces: start === 'reviews' || alreadyHappened(start, 'pieces'),
  bag: alreadyHappened(start, 'bag'),
});

export function Session({
  onCollapse,
  onClose,
  start = 'greeting',
}: {
  onCollapse: () => void;
  onClose: () => void;
  /** Where to begin. Anything but `greeting` is a review shortcut. */
  start?: Checkpoint;
}) {
  const from = answeredBefore(start);
  const over = historyOf(start);

  /* The questions filled in by the checkpoint. Only these arrive finished — a
     question the shopper asks after landing here is happening now, and gets
     the pacing every answer gets. */
  const prefilled = useRef(
    new Set(from.asked.filter((id) => id !== from.playing)),
  ).current;

  /* --- How far the conversation has got ---------------------------------- */
  const [stage, setStage] = useState<Stage>(CHECKPOINT_STAGE[start]);
  const [greeted, setGreeted] = useState(start !== 'greeting');
  const [speaking, setSpeaking] = useState(start !== 'greeting');

  /* --- What the shopper has answered so far ------------------------------ */
  const [vibePicks, setVibePicks] = useState<string[]>(
    from.questionsDone ? [vibeCheck.tiles[0].id, vibeCheck.tiles[3].id] : [],
  );
  const [vibePhase, setVibePhase] = useState<Phase>(from.questionsDone ? 'closed' : 'open');

  const [stylePick, setStylePick] = useState<string | undefined>(
    from.questionsDone ? styleCheck.tiles[0].id : undefined,
  );
  const [stylePhase, setStylePhase] = useState<Phase>(from.questionsDone ? 'closed' : 'open');

  const [sizePick, setSizePick] = useState<string | undefined>(
    from.questionsDone ? sizing.tiles[1].id : undefined,
  );
  const [sizePhase, setSizePhase] = useState<Phase>(from.questionsDone ? 'closed' : 'open');

  /* --- The second half: one piece, and the conversation about it ---------- */

  /** The piece that has just been tapped, while the other three clear away. */
  const [choosing, setChoosing] = useState<string>();

  /** Which piece is open. Undefined means the grid is showing. */
  const [opened, setOpened] = useState<string | undefined>(
    from.pieceOpen ? perfectFit.pieces[0].id : undefined,
  );

  /** True once the grid has finished arriving, so it can offer suggestions. */
  const [gridReady, setGridReady] = useState(false);

  /** Which questions have been asked, in the order they were asked. */
  const [asked, setAsked] = useState<string[]>(from.asked);

  /** True once the last answer has finished, so the next chips can appear. */
  const [answered, setAnswered] = useState(true);

  /** The piece folds back to a line once it stops being the subject. */
  const [pieceFolded, setPieceFolded] = useState(from.pieceOpen);

  /* --- The bag ------------------------------------------------------------ */
  const [bagCount, setBagCount] = useState(from.bagged ? bag.items.length : 0);
  const [adding, setAdding] = useState(false);
  const [bagSettled, setBagSettled] = useState(false);

  /** The promotion: whether it has been asked about, and whether the answer
   *  has finished. Checking out is not offered to the microphone until it has. */
  const [promoAsked, setPromoAsked] = useState(from.promoDone);
  const [promoSettled, setPromoSettled] = useState(from.promoDone);

  const [checkoutSettled, setCheckoutSettled] = useState(false);

  /** What is currently being said out loud into the input, if anything. */
  const [saying, setSaying] = useState<string>();

  /* --- The thread, and the two things that decide where it sits ----------- */
  const thread = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const askRef = useRef<HTMLInputElement>(null);

  /** How tall the dock is right now. The thread reserves exactly this much
   *  below the conversation, so nothing can ever land behind it. */
  const clearance = useDockClearance(dockRef);

  /* The thread stays at its own bottom as it grows, which is the only scroll
     rule in the session. Sections used to scroll themselves to the top as
     they arrived, and a part landing a beat later — a card, a review, a
     confirmation — ended up under the dock with nothing to bring it back. */
  useFollowBottom(thread, column, clearance);

  /* --- The opening ------------------------------------------------------- */

  /* The shopper's words land, and the assistant takes a moment before it
     replies — the same moment a person would take. */
  useAfter(pace.afterSaid, start === 'greeting', () => setSpeaking(true));

  /* The greeting finishes, and the first question is still not rushed. */
  useAfter(pace.betweenSections, greeted && start === 'greeting', () =>
    setStage((at) => (reached(at, 'vibe') ? at : 'vibe')),
  );

  /* --- One section settles, the next takes its turn ----------------------- */
  const advance = (to: Stage) => () =>
    window.setTimeout(() => setStage((at) => (reached(at, to) ? at : to)), pace.betweenSections);

  /* --- Answering the questions -------------------------------------------- */

  const toggleVibe = (id: string) =>
    setVibePicks((current) =>
      current.includes(id) ? current.filter((pick) => pick !== id) : [...current, id],
    );

  /** Two beats: clear what was not chosen, then fold what was. */
  const fold = (set: (phase: Phase) => void) => {
    set('folding');
    window.setTimeout(() => set('closed'), CLEAR_TIME);
  };

  const pickStyle = (id: string) => {
    if (stylePhase !== 'open') return;
    setStylePick(id);
    window.setTimeout(() => fold(setStylePhase), ACKNOWLEDGE_TIME);
  };

  const pickSize = (id: string) => {
    if (sizePhase !== 'open') return;
    setSizePick(id);
    window.setTimeout(() => fold(setSizePhase), ACKNOWLEDGE_TIME);
  };

  /* --- Opening a piece and asking about it -------------------------------- */

  /**
   * Tapping a piece in the grid, in two beats.
   *
   * First the three that were not chosen clear away, leaving the tapped one
   * exactly where it was. Only then does it open out, and because it is the
   * same photograph it grows in place rather than being replaced.
   *
   * Opening in one beat is what made this feel disjointed: the expanded piece
   * appeared below the grid, shoved the conversation down, and then the grid
   * vanished from underneath it.
   */
  const openPiece = (id: string) => {
    if (choosing || opened) return;
    setChoosing(id);
    window.setTimeout(() => {
      setOpened(id);
      setChoosing(undefined);
      setPieceFolded(false);
    }, pace.beforeOpening);
  };

  /**
   * Asking one of the questions the piece has raised.
   *
   * The piece folds FIRST, and the answer follows it. Asking a question is the
   * moment the conversation takes over from the photograph, so the photograph
   * gets out of the way before the words arrive — not after them. Doing it the
   * other way round meant the answer typed itself out and the piece then
   * collapsed underneath it, which moved everything the shopper was reading.
   */
  const ask = (id: string) => {
    if (asked.includes(id)) return;
    setAnswered(false);

    const append = () => setAsked((current) => [...current, id]);

    if (opened && !pieceFolded) {
      setPieceFolded(true);
      window.setTimeout(append, pace.afterFold);
    } else {
      append();
    }
  };

  /** An answer has been given, so the next thing can be offered. */
  const onAnswered = () => setAnswered(true);

  /**
   * Says something out loud, then does it.
   *
   * The two moments that move the session on from here — putting both pieces
   * in the bag, and checking out — are spoken in the design, not pressed. The
   * command appears in the input as a live transcript first, and only then
   * takes effect, so the shopper sees what was heard before anything happens.
   */
  const speak = (words: string, then: () => void) => {
    if (saying) return;
    setSaying(words);
    window.setTimeout(() => {
      setSaying(undefined);
      then();
    }, pace.speaking);
  };

  /* --- Into the bag -------------------------------------------------------- */

  /**
   * Both pieces at once, because that is what was asked for. The wait is not
   * a network call — it is the beat that makes the bag read as having done
   * something rather than having been there all along.
   */
  const addToBag = () => {
    if (adding || bagCount > 0) return;
    setAdding(true);
    window.setTimeout(() => {
      setAdding(false);
      setBagCount(bag.items.length);
      setStage((at) => (reached(at, 'bag') ? at : 'bag'));
    }, pace.adding);
  };

  const goToCheckout = () =>
    setStage((at) => (reached(at, 'checkout') ? at : 'checkout'));

  const onPaid = () => {
    window.setTimeout(
      () => setStage((at) => (reached(at, 'confirmed') ? at : 'confirmed')),
      pace.afterSaid,
    );
  };

  /** The shopper wants to say something of their own. */
  function focusAsk() {
    askRef.current?.focus();
  }

  /**
   * What the microphone does right now, if anything.
   *
   * Only ever one thing at a time, because only one step of the session is
   * spoken at any point. It is filled in as the suggestions are worked out
   * below: a suggestion marked `spoken` hands its action here instead of
   * taking a tap of its own.
   */
  let onSpeak: (() => void) | undefined;

  /* --- What the open section offers above the input -----------------------
   *
   * Only ever the suggestions of whatever the conversation is currently on.
   * They are the shopper's way forward from here, so exactly one of them is
   * dark — the one that moves the session on.
   * ---------------------------------------------------------------------- */
  const suggestions: Suggestion[] = [];

  if (reached(stage, 'vibe') && vibePhase === 'open') {
    if (vibePicks.length >= vibeCheck.minimum) {
      suggestions.push({ id: 'confirm', label: chips.confirm, onSelect: () => fold(setVibePhase) });
    }
    suggestions.push({ id: 'ask', label: chips.ask, onSelect: focusAsk });
    suggestions.push({ id: 'skip', label: chips.skip, onSelect: () => fold(setVibePhase) });
  } else if (stage === 'confirmed') {
    confirmation.chips.forEach((chip) =>
      suggestions.push({ id: chip.id, label: chip.label, onSelect: focusAsk }),
    );
  } else if (reached(stage, 'checkout')) {
    /* Nothing to suggest. The only thing left is the swipe. */
  } else if (reached(stage, 'bag')) {
    if (bagSettled) {
      bag.chips.forEach((chip) =>
        suggestions.push({
          id: chip.id,
          label: chip.label,
          primary: chip.primary,
          spoken: chip.voice,
          onSelect: focusAsk,
        }),
      );
      /* Two things are said here, in order. First the question about a
         promotion, and only once it has been answered, checking out. Both go
         to the microphone rather than to a chip, because both are spoken. */
      if (!promoAsked) onSpeak = () => speak(promo.question, () => setPromoAsked(true));
      else if (promoSettled) onSpeak = () => speak(checkout.command, goToCheckout);
    }
  } else if (reached(stage, 'pieces') && answered) {
    if (!opened && gridReady) {
      perfectFit.chips.forEach((chip) =>
        suggestions.push({ id: chip.id, label: chip.label, onSelect: focusAsk }),
      );
    } else if (opened) {
      /* The questions offered are those raised by the last answer given, or
         the piece's own opening set if nothing has been asked yet. */
      const last = asked.length ? answerFor(asked[asked.length - 1]) : undefined;
      const offered = (last ? last.chips : productDetail.chips).filter(
        (chip) => !asked.includes(chip.id),
      );

      /* The elongated prompt pairs with the first question, leaving the three
         shorter actions together on the dock's second reserved row. */
      if (!pieceFolded) {
        suggestions.push({
          id: 'more-like-this',
          label: productDetail.moreLikeThis,
          moreLikeThis: true,
          onSelect: focusAsk,
        });
      }

      offered.forEach((chip) =>
        suggestions.push({
          id: chip.id,
          label: chip.label,
          primary: chip.primary,
          spoken: chip.voice,
          onSelect: () => {
            if (answerFor(chip.id)) ask(chip.id);
            else focusAsk();
          },
        }),
      );

      /* Whichever of the offered steps is spoken becomes what the microphone
         does. There is never more than one: asking about the metal is spoken
         and asking about tarnishing is tapped, and once both are answered the
         only spoken step left is putting it all in the bag. */
      const said = offered.find((chip) => chip.voice);
      if (said?.id === 'add-both') onSpeak = () => speak(bag.command, addToBag);
      else if (said && answerFor(said.id)) {
        onSpeak = () => speak(answerFor(said.id)!.question, () => ask(said.id));
      }
    }
  }

  return (
    <div className="relative flex h-full flex-col">
      <SessionGround />
      <SessionHeader onCollapse={onCollapse} onClose={onClose} />

      <div
        ref={thread}
        className="relative z-10 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* No `layout` on the thread itself. Every section already animates
            its own arrival, and a layout animation here re-measured the whole
            column on every keystroke — which is what made everything above a
            line being typed drift about. */}
        <div
          ref={column}
          className="flex flex-col items-start gap-8 px-4"
          style={{ paddingTop: HEADER_CLEARANCE, paddingBottom: clearance + 24 }}
        >
          <Said>{opening.query}</Said>
          <Before done={over.greeting}>
            <Line start={speaking} onDone={() => setGreeted(true)}>
              {opening.greeting}
            </Line>
          </Before>

          {reached(stage, 'vibe') && (
            <Before done={over.vibe}>
              <VibeCheck
                picks={vibePicks}
                phase={vibePhase}
                onToggle={toggleVibe}
                onSettled={advance('style')}
              />
            </Before>
          )}

          {reached(stage, 'style') && (
            <Before done={over.style}>
            <PickOne
              section={styleCheck}
              tiles={styleCheck.tiles}
              picked={stylePick}
              phase={stylePhase}
              onPick={pickStyle}
              onSettled={advance('size')}
              columns={2}
              sharedId={(id) => `style-${id}`}
              confirmationIcon={<NecklineIcon />}
            />
            </Before>
          )}

          {reached(stage, 'size') && (
            <Before done={over.size}>
            <PickOne
              section={sizing}
              tiles={sizing.tiles}
              picked={sizePick}
              phase={sizePhase}
              onPick={pickSize}
              onSettled={advance('pieces')}
              columns={3}
              sharedId={(id) => `size-${id}`}
              confirmationIcon={<LengthIcon />}
            />
            </Before>
          )}

          {reached(stage, 'pieces') && (
            <Before done={over.pieces}>
            <PerfectFit
              opened={opened}
              choosing={choosing}
              folded={pieceFolded}
              onOpen={openPiece}
              onReopen={() => setPieceFolded(false)}
              inBag={bagCount > 0}
              onAddToBag={addToBag}
              onSettled={() => setGridReady(true)}
            />
            </Before>
          )}

          {/* Everything the shopper asked about it, in the order they asked.
              The ones the checkpoint filled in are history; one asked after
              landing here is happening now, and is paced like any other. */}
          {asked.map((id, index) => {
            const answer = answerFor(id);
            if (!answer) return null;
            return (
              <Before key={answer.id} done={prefilled.has(answer.id)}>
                <Answer
                  answer={answer}
                  onSettled={index === asked.length - 1 ? onAnswered : undefined}
                  onAsk={ask}
                />
              </Before>
            );
          })}

          {/* What was said out loud, kept in the thread once it has been said.
              While it is still being spoken it lives in the input instead. */}
          {(adding || bagCount > 0) && <Said>{bag.command}</Said>}

          {adding && (
            <motion.span
              aria-label="Adding"
              animate={moves.session.working.animate}
              transition={moves.session.working.transition}
              className="mx-auto block h-10 w-10 shrink-0 rounded-full border-2 border-black/10 border-t-black/40"
            />
          )}

          {reached(stage, 'bag') && (
            <Before done={over.bag}>
              <Bag
                folded={promoAsked}
                onCheckOut={goToCheckout}
                onSettled={() => setBagSettled(true)}
              />
            </Before>
          )}

          {/* The promotion, asked with the bag in front of them. */}
          {promoAsked && (
            <Before done={over.bag}>
              <Promo
                folded={reached(stage, 'checkout')}
                onCheckOut={goToCheckout}
                onSettled={() => setPromoSettled(true)}
              />
            </Before>
          )}

          {reached(stage, 'checkout') && (
            <Checkout onSettled={() => setCheckoutSettled(true)} />
          )}

          {reached(stage, 'confirmed') && <Confirmation />}
        </div>
      </div>

      {/* The bag empties when the order is placed. A count still sitting there
          says the pieces are waiting to be bought, and they have been. */}
      <Dock
        innerRef={dockRef}
        suggestions={suggestions}
        inputRef={askRef}
        bagCount={stage === 'confirmed' ? 0 : bagCount}
        speaking={saying}
        onSpeak={saying ? undefined : onSpeak}
        pay={
          checkoutSettled && stage !== 'confirmed' ? (
            <SwipeToPay label={checkout.pay} onPaid={onPaid} />
          ) : undefined
        }
      />
    </div>
  );
}

/**
 * How tall the dock is, watched rather than assumed.
 *
 * It changes height on its own — suggestions come and go, and the pay control
 * replaces the input — so a fixed number underneath the conversation is wrong
 * most of the time. This is measured, and the thread reserves it.
 */
function useDockClearance(dock: React.RefObject<HTMLDivElement | null>) {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = dock.current;
    if (!el) return;

    /* `offsetHeight`, not a bounding rect. The dock animates its own height
       change with a transform, and a rect measured mid-animation reports the
       height it is passing through rather than the one it is settling on. */
    const measure = () => setHeight(el.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [dock]);

  return height;
}

/**
 * Keeps the thread at its own bottom, so whatever just arrived is what is on
 * screen.
 *
 * Everything in this session arrives in parts — a line, then a card, then the
 * rows inside it — and each part makes the conversation taller. Watching the
 * column's height rather than any one section means every one of those
 * moments brings the scroll with it, including the ones that used to land
 * quietly underneath the dock.
 *
 * The scroll is always smooth and always retargeted rather than restarted, so
 * a run of parts arriving close together reads as one continuous movement.
 */
function useFollowBottom(
  thread: React.RefObject<HTMLDivElement | null>,
  column: React.RefObject<HTMLDivElement | null>,
  clearance: number,
) {
  /* Held out here rather than inside the effect. The effect re-runs whenever
     the dock changes height, and a flag declared inside it would call every
     one of those a fresh landing and jump instead of glide. */
  const landed = useRef(false);

  useEffect(() => {
    const view = thread.current;
    const content = column.current;
    if (!view || !content) return;

    let frame = 0;

    /**
     * Where the thread should sit.
     *
     * Normally at its own bottom, which is where the newest thing is. That
     * works because a section fits on screen, so holding its bottom holds its
     * question too.
     *
     * The vibe check does not fit — eight tiles against a shorter phone — and
     * for anything that cannot fit, the bottom is the wrong end to hold. It
     * puts the shopper in the middle of a grid of photographs with the question
     * scrolled off above them. So a section taller than the viewport is held by
     * its top instead, level with where the conversation starts, and is read
     * from its question down.
     */
    const restingPlace = () => {
      const last = content.lastElementChild;
      if (!last) return view.scrollHeight;

      const box = last.getBoundingClientRect();
      if (box.height <= view.clientHeight) return view.scrollHeight;

      const top = box.top - view.getBoundingClientRect().top + view.scrollTop;
      return Math.max(0, top - HEADER_CLEARANCE);
    };

    const follow = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        /* The first position is taken, not travelled to. A checkpoint opens
           with its whole history already in place, and gliding two thousand
           pixels down through it is a journey nobody asked to watch. */
        view.scrollTo({
          top: restingPlace(),
          behavior: !landed.current || prefersReducedMotion() ? 'auto' : 'smooth',
        });
        landed.current = true;
      });
    };

    follow();
    const observer = new ResizeObserver(follow);
    observer.observe(content);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [thread, column, clearance]);
}
