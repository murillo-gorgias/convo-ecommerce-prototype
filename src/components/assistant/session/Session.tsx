import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { chips, opening, sizing, styleCheck, vibeCheck } from '../../../content/journey';
import { pace } from '../../../motion/motion';
import { Dock, SessionGround, SessionHeader, type Suggestion } from './Chrome';
import { Line, Said, useAfter } from './parts';
import { VibeCheck } from './VibeCheck';
import { PickOne } from './PickOne';
import { PerfectFit } from './PerfectFit';

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
 * guessing. Recommending last means being right.
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
 */

/** A section is open, folding itself away, or closed. */
type Phase = 'open' | 'folding' | 'closed';

/** How far the conversation has got. Sections stay once they have appeared. */
type Stage = 'greeting' | 'vibe' | 'style' | 'size' | 'pieces';

const ORDER: Stage[] = ['greeting', 'vibe', 'style', 'size', 'pieces'];
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

  /* --- Where each section sits, so a new one can be scrolled to ----------- */
  const thread = useRef<HTMLDivElement>(null);
  const vibeRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const piecesRef = useRef<HTMLDivElement>(null);
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

  /* --- Answering ---------------------------------------------------------- */

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

  /** The shopper wants to say something of their own. */
  function focusAsk() {
    askRef.current?.focus();
  }

  /* --- What the open section offers above the input ----------------------- */
  const suggestions: Suggestion[] = [];
  if (reached(stage, 'vibe') && vibePhase === 'open') {
    if (vibePicks.length >= vibeCheck.minimum) {
      suggestions.push({ id: 'confirm', label: chips.confirm, onSelect: () => fold(setVibePhase) });
    }
    suggestions.push({ id: 'ask', label: chips.ask, onSelect: focusAsk });
    suggestions.push({ id: 'skip', label: chips.skip, onSelect: () => fold(setVibePhase) });
  }

  return (
    <div className="relative flex h-full flex-col">
      <SessionGround />
      <SessionHeader onCollapse={onCollapse} onClose={onClose} />

      <div
        ref={thread}
        className="relative z-10 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <motion.div layout className="flex flex-col items-start gap-8 px-4 pb-[220px] pt-[104px]">
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

          {reached(stage, 'pieces') && <PerfectFit innerRef={piecesRef} />}
        </motion.div>
      </div>

      <Dock suggestions={suggestions} inputRef={askRef} />
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
