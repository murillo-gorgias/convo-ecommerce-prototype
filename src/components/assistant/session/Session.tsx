import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  answers,
  bag,
  chips,
  checkout,
  confirmation,
  opening,
  perfectFit,
  productDetail,
  sizing,
  styleCheck,
  vibeCheck,
} from '../../../content/journey';
import { moves, pace } from '../../../motion/motion';
import { Dock, SessionGround, SessionHeader, type Suggestion } from './Chrome';
import { Line, Said, useAfter } from './parts';
import { VibeCheck } from './VibeCheck';
import { PickOne } from './PickOne';
import { PerfectFit } from './PerfectFit';
import { Answer } from './Answer';
import { Bag } from './Bag';
import { Checkout, Confirmation } from './Checkout';
import { SwipeToPay } from './SwipeToPay';

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
export type Checkpoint = 'greeting' | 'vibe' | 'product' | 'cart' | 'checkout';

const CHECKPOINT_STAGE: Record<Checkpoint, Stage> = {
  greeting: 'greeting',
  vibe: 'vibe',
  product: 'pieces',
  cart: 'bag',
  checkout: 'checkout',
};

/** What has already been answered by the time a checkpoint begins. */
const answeredBefore = (checkpoint: Checkpoint) => {
  const questionsDone = checkpoint === 'product' || checkpoint === 'cart' || checkpoint === 'checkout';
  const bagged = checkpoint === 'cart' || checkpoint === 'checkout';

  return {
    questionsDone,
    bagged,
    /* At the bag and beyond, a piece has been opened and asked about, so it
       sits folded with the conversation about it above the bag. */
    asked: bagged ? answers.map((answer) => answer.id) : [],
  };
};

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
    from.bagged ? perfectFit.pieces[0].id : undefined,
  );

  /** True once the grid has finished arriving, so it can offer suggestions. */
  const [gridReady, setGridReady] = useState(false);

  /** Which questions have been asked, in the order they were asked. */
  const [asked, setAsked] = useState<string[]>(from.asked);

  /** True once the last answer has finished, so the next chips can appear. */
  const [answered, setAnswered] = useState(true);

  /** The piece folds back to a line once it stops being the subject. */
  const [pieceFolded, setPieceFolded] = useState(from.bagged);

  /* --- The bag ------------------------------------------------------------ */
  const [bagCount, setBagCount] = useState(from.bagged ? bag.items.length : 0);
  const [adding, setAdding] = useState(false);
  const [bagSettled, setBagSettled] = useState(false);
  const [checkoutSettled, setCheckoutSettled] = useState(false);
  const [paid, setPaid] = useState(false);

  /** What is currently being said out loud into the input, if anything. */
  const [saying, setSaying] = useState<string>();

  /* --- Where each section sits, so a new one can be scrolled to ----------- */
  const thread = useRef<HTMLDivElement>(null);
  const vibeRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const piecesRef = useRef<HTMLDivElement>(null);
  const bagRef = useRef<HTMLDivElement>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const askRef = useRef<HTMLInputElement>(null);

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

  /* --- A new section arrives, and the thread follows it -------------------- */
  useScrollTo(vibeRef, reached(stage, 'vibe'));
  useScrollTo(styleRef, reached(stage, 'style'));
  useScrollTo(sizeRef, reached(stage, 'size'));
  useScrollTo(piecesRef, reached(stage, 'pieces'));
  useScrollTo(bagRef, reached(stage, 'bag'));
  useScrollTo(checkoutRef, reached(stage, 'checkout'));
  useScrollTo(confirmRef, reached(stage, 'confirmed'));

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
    setPaid(true);
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
      /* Checking out is said, not pressed. */
      onSpeak = () => speak(checkout.command, goToCheckout);
    }
  } else if (reached(stage, 'pieces') && answered) {
    if (!opened && gridReady) {
      perfectFit.chips.forEach((chip) =>
        suggestions.push({ id: chip.id, label: chip.label, onSelect: focusAsk }),
      );
    } else if (opened) {
      /* The questions offered are those raised by the last answer given, or
         the piece's own opening set if nothing has been asked yet. */
      const last = asked.length ? answers.find((a) => a.id === asked[asked.length - 1]) : undefined;
      const offered = (last ? last.chips : productDetail.chips).filter(
        (chip) => !asked.includes(chip.id),
      );

      offered.forEach((chip) =>
        suggestions.push({
          id: chip.id,
          label: chip.label,
          primary: chip.primary,
          spoken: chip.voice,
          onSelect: () => {
            if (answers.some((a) => a.id === chip.id)) ask(chip.id);
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
      else if (said && answers.some((a) => a.id === said.id)) {
        onSpeak = () => speak(answers.find((a) => a.id === said.id)!.question, () => ask(said.id));
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
        <div className="flex flex-col items-start gap-8 px-4 pb-[300px] pt-[104px]">
          <Said>{opening.query}</Said>
          <Line start={speaking} onDone={() => setGreeted(true)}>
            {opening.greeting}
          </Line>

          {reached(stage, 'vibe') && (
            <VibeCheck
              innerRef={vibeRef}
              picks={vibePicks}
              phase={vibePhase}
              onToggle={toggleVibe}
              onSettled={advance('style')}
            />
          )}

          {reached(stage, 'style') && (
            <PickOne
              innerRef={styleRef}
              section={styleCheck}
              tiles={styleCheck.tiles}
              picked={stylePick}
              phase={stylePhase}
              onPick={pickStyle}
              onSettled={advance('size')}
              columns={2}
              sharedId={(id) => `style-${id}`}
            />
          )}

          {reached(stage, 'size') && (
            <PickOne
              innerRef={sizeRef}
              section={sizing}
              tiles={sizing.tiles}
              picked={sizePick}
              phase={sizePhase}
              onPick={pickSize}
              onSettled={advance('pieces')}
              columns={3}
              sharedId={(id) => `size-${id}`}
            />
          )}

          {reached(stage, 'pieces') && (
            <PerfectFit
              innerRef={piecesRef}
              opened={opened}
              choosing={choosing}
              folded={pieceFolded}
              onOpen={openPiece}
              onReopen={() => setPieceFolded(false)}
              inBag={bagCount > 0}
              onAddToBag={addToBag}
              onSettled={() => setGridReady(true)}
            />
          )}

          {/* Everything the shopper asked about it, in the order they asked. */}
          {asked.map((id, index) => {
            const answer = answers.find((candidate) => candidate.id === id);
            if (!answer) return null;
            return (
              <Answer
                key={answer.id}
                answer={answer}
                onSettled={index === asked.length - 1 ? onAnswered : undefined}
              />
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
              className="mx-auto block h-10 w-10 rounded-full border-2 border-black/10 border-t-black/40"
            />
          )}

          {reached(stage, 'bag') && (
            <Bag
              innerRef={bagRef}
              onCheckOut={goToCheckout}
              onSettled={() => setBagSettled(true)}
            />
          )}

          {reached(stage, 'checkout') && (
            <Checkout innerRef={checkoutRef} onSettled={() => setCheckoutSettled(true)} />
          )}

          {reached(stage, 'confirmed') && <Confirmation innerRef={confirmRef} />}
        </div>
      </div>

      <Dock
        suggestions={suggestions}
        inputRef={askRef}
        bagCount={bagCount}
        speaking={saying}
        onSpeak={saying ? undefined : onSpeak}
        pay={
          checkoutSettled && !paid ? (
            <SwipeToPay label={checkout.pay} onPaid={onPaid} />
          ) : undefined
        }
      />
    </div>
  );
}

/**
 * Brings a section into view once it exists. Waits past the section's own
 * entrance so the scroll lands where the section finishes, not where it
 * started.
 */
function useScrollTo(ref: React.RefObject<HTMLDivElement | null>, visible: boolean) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 260);
    return () => window.clearTimeout(timer);
  }, [ref, visible]);
}
