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

export function Session({
  onCollapse,
  onClose,
}: {
  onCollapse: () => void;
  onClose: () => void;
}) {
  /* --- How far the conversation has got ---------------------------------- */
  const [stage, setStage] = useState<Stage>('greeting');
  const [greeted, setGreeted] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  /* --- What the shopper has answered so far ------------------------------ */
  const [vibePicks, setVibePicks] = useState<string[]>([]);
  const [vibePhase, setVibePhase] = useState<Phase>('open');

  const [stylePick, setStylePick] = useState<string>();
  const [stylePhase, setStylePhase] = useState<Phase>('open');

  const [sizePick, setSizePick] = useState<string>();
  const [sizePhase, setSizePhase] = useState<Phase>('open');

  /* --- The second half: one piece, and the conversation about it ---------- */

  /** Which piece is open. Undefined means the grid is showing. */
  const [opened, setOpened] = useState<string>();

  /** True once the grid has finished arriving, so it can offer suggestions. */
  const [gridReady, setGridReady] = useState(false);

  /** Which questions have been asked, in the order they were asked. */
  const [asked, setAsked] = useState<string[]>([]);

  /** True once the last answer has finished, so the next chips can appear. */
  const [answered, setAnswered] = useState(true);

  /** The piece folds back to a line once it stops being the subject. */
  const [pieceFolded, setPieceFolded] = useState(false);

  /* --- The bag ------------------------------------------------------------ */
  const [bagCount, setBagCount] = useState(0);
  const [adding, setAdding] = useState(false);
  const [bagSettled, setBagSettled] = useState(false);
  const [checkoutSettled, setCheckoutSettled] = useState(false);
  const [paid, setPaid] = useState(false);

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
  useAfter(pace.afterSaid, true, () => setSpeaking(true));

  /* The greeting finishes, and the first question is still not rushed. */
  useAfter(pace.betweenSections, greeted, () => setStage('vibe'));

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

  /** Tapping a piece in the grid. The photograph grows in place. */
  const openPiece = (id: string) => {
    window.setTimeout(() => {
      setOpened(id);
      setPieceFolded(false);
    }, pace.beforeOpening);
  };

  /** Asking one of the questions the piece has raised. */
  const ask = (id: string) => {
    if (asked.includes(id)) return;
    setAnswered(false);
    setAsked((current) => [...current, id]);
  };

  /**
   * An answer has been given. The piece stops being the subject at that
   * point, so it folds back to a line — but only after the answer has had
   * long enough to be read.
   */
  const onAnswered = () => {
    setAnswered(true);
    window.setTimeout(() => setPieceFolded(true), pace.beforeCollapsing);
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
          onSelect: chip.id === 'checkout' ? goToCheckout : focusAsk,
        }),
      );
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
          onSelect: () => {
            if (chip.id === 'add-both') addToBag();
            else if (answers.some((a) => a.id === chip.id)) ask(chip.id);
            else focusAsk();
          },
        }),
      );
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
        <motion.div layout className="flex flex-col items-start gap-8 px-4 pb-[280px] pt-[104px]">
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

          {/* Putting both things in, said out loud and then worked on. */}
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
        </motion.div>
      </div>

      <Dock
        suggestions={suggestions}
        inputRef={askRef}
        bagCount={bagCount}
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
