import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { assistantCopy } from '../../content/assistant';
import { moves } from '../../motion/motion';
import { CloseIcon, ExpandIcon, MicIcon, SubmitIcon, Waveform } from './icons';
import { THINKING } from './thinking/variations';
import { SignIn } from './SignIn';
import { Session } from './session/Session';

/**
 * ============================================================================
 * THE ASSISTANT
 * ============================================================================
 *
 * One element that changes shape. It is never unmounted and remounted — the
 * same container morphs through every stage of the journey, which is what
 * makes it read as a single object rather than a run of screens:
 *
 *     BAR  ──scroll down──▶  PILL  ──tap──▶  CONSOLE
 *      ▲                       │                 │
 *      └───── scroll up ───────┘            ask a question
 *                                                │
 *                                             SIGN IN
 *                                                │
 *                                        continue as yourself
 *                                                │
 *                                            SESSION  (full screen)
 *
 * The morph itself is `moves.assistant.shapeChange` in the motion file. Every
 * stage is a size and a position; nothing else about the transition changes.
 */

type Shape = 'bar' | 'pill' | 'console' | 'signin' | 'session';

/** How far the store must scroll before the bar collapses into the pill. */
const COLLAPSE_AFTER = 120;

/** How long the assistant appears to think before it answers. */
const THINKING_TIME = 2200;

/** How long the account takes to open, once accepted. */
const UNLOCK_TIME = 1900;

export function Assistant({
  scrollRef,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [shape, setShape] = useState<Shape>('bar');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  /* --- Scroll decides between BAR and PILL, and nothing beyond that ------ */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setShape((current) => (current === 'bar' || current === 'pill'
        ? el.scrollTop > COLLAPSE_AFTER ? 'pill' : 'bar'
        : current));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollRef]);

  const openConsole = () => setShape('console');

  const closeAll = () => {
    setListening(false);
    setTranscript('');
    setSubmitted(false);
    setUnlocking(false);
    const scrolled = (scrollRef.current?.scrollTop ?? 0) > COLLAPSE_AFTER;
    setShape(scrolled ? 'pill' : 'bar');
  };

  /* --- Voice: types the demo query out as though it were spoken ---------- */
  const startListening = () => {
    setListening(true);
    setTranscript('');
    setSubmitted(false);
    if (shape !== 'console') setShape('console');
  };

  useEffect(() => {
    if (!listening) return;
    const full = assistantCopy.demoQuery;
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setTranscript(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(timer);
        setTimeout(() => {
          setListening(false);
          setSubmitted(true);
        }, 500);
      }
    }, 55);
    return () => clearInterval(timer);
  }, [listening]);

  /* --- Thinking finishes, and the assistant asks who it is talking to ---- */
  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => setShape('signin'), THINKING_TIME);
    return () => clearTimeout(timer);
  }, [submitted]);

  /* --- The account opens, and the session takes the screen --------------- */
  const acceptAccount = () => {
    setUnlocking(true);
    setTimeout(() => setShape('session'), UNLOCK_TIME);
  };

  /* Declining keeps the journey moving. The unsigned path — where the
     assistant works without knowing who this is — is not designed yet. */
  const declineAccount = () => setShape('session');

  return (
    <>
      {/* The wash over the store while the assistant is open. */}
      <AnimatePresence>
        {shape !== 'bar' && shape !== 'pill' && (
          <motion.button
            {...moves.assistant.scrim}
            onClick={closeAll}
            aria-label={assistantCopy.labels.close}
            className="absolute inset-0 z-40 bg-[var(--scrim)] backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* The assistant itself. */}
      <motion.div
        layout
        transition={moves.assistant.shapeChange}
        initial={moves.assistant.firstAppearance.initial}
        animate={moves.assistant.firstAppearance.animate}
        className={`absolute z-50 ${containerClass(shape)}`}
      >
        <AnimatePresence initial={false}>
          {shape === 'bar' && (
            <BarContents key="bar" onOpen={openConsole} onVoice={startListening} />
          )}
          {shape === 'pill' && <PillContents key="pill" onOpen={openConsole} />}
          {shape === 'console' && (
            <ConsoleContents
              key="console"
              listening={listening}
              transcript={transcript}
              submitted={submitted}
              onClose={closeAll}
              onVoice={startListening}
            />
          )}
          {shape === 'signin' && (
            <SignIn
              key="signin"
              opened={unlocking}
              onContinue={acceptAccount}
              onDecline={declineAccount}
              onCollapse={() => setShape('console')}
              onClose={closeAll}
            />
          )}
          {shape === 'session' && (
            <Session key="session" onCollapse={() => setShape('signin')} onClose={closeAll} />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

/* ==========================================================================
 * SHAPES
 * The container's size, position and radius at each stage. Everything else
 * about the morph is handled by the shared layout animation.
 * ========================================================================== */

function containerClass(shape: Shape) {
  const base =
    'overflow-hidden border border-[var(--assistant-border)] bg-[var(--assistant-surface)] backdrop-blur-xl';

  if (shape === 'bar') {
    return `${base} bottom-6 left-2 right-2 h-12 rounded-[var(--radius-pill)] shadow-[var(--assistant-shadow)]`;
  }
  if (shape === 'pill') {
    return `${base} bottom-6 left-1/2 h-[60px] w-[60px] -translate-x-1/2 rounded-full shadow-[var(--assistant-shadow)]`;
  }
  if (shape === 'console' || shape === 'signin') {
    // The sign-in sheet is the console, given the room the question needs.
    return `${base} bottom-0 left-0 right-0 rounded-t-[var(--radius-console)] bg-[var(--assistant-surface-solid)] shadow-[var(--assistant-shadow-lifted)]`;
  }
  // The session: the same element, given the whole frame.
  return 'overflow-hidden border-0 inset-0 rounded-none bg-transparent';
}

/* ==========================================================================
 * BAR — the resting state
 * ========================================================================== */

function BarContents({ onOpen, onVoice }: { onOpen: () => void; onVoice: () => void }) {
  return (
    <motion.div
      {...moves.assistant.contentSwap}
      className="absolute inset-0 flex h-12 items-center justify-between pl-4 pr-1"
    >
      <button
        onClick={onOpen}
        className="flex-1 whitespace-nowrap text-left font-[var(--font-ui)] text-[length:var(--type-body-size)] leading-[var(--type-body-line)] text-[var(--ink-muted)]"
      >
        {assistantCopy.placeholder}
      </button>
      <motion.button
        whileTap={moves.assistant.press}
        onClick={onVoice}
        aria-label={assistantCopy.labels.voice}
        className="grid h-10 w-10 place-items-center rounded-full text-[var(--ink-soft)]"
      >
        <MicIcon />
      </motion.button>
    </motion.div>
  );
}

/* ==========================================================================
 * PILL — collapsed while the shopper is browsing
 * ========================================================================== */

function PillContents({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.button
      {...moves.assistant.contentSwap}
      whileTap={moves.assistant.press}
      onClick={onOpen}
      aria-label={assistantCopy.labels.open}
      className="absolute inset-0 grid place-items-center text-[var(--ink-soft)]"
    >
      {/* The breathing halo — signals the assistant is awake. */}
      <motion.span
        className="absolute inset-0 rounded-full border border-[var(--ink-soft)]/25"
        {...moves.assistant.pillPulse}
      />
      <MicIcon size={20} />
    </motion.button>
  );
}

/* ==========================================================================
 * CONSOLE — opened, ready for typing or voice
 * ========================================================================== */

function ConsoleContents({
  listening,
  transcript,
  submitted,
  onClose,
  onVoice,
}: {
  listening: boolean;
  transcript: string;
  submitted: boolean;
  onClose: () => void;
  onVoice: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!listening && !submitted) inputRef.current?.focus();
  }, [listening, submitted]);

  return (
    <motion.div {...moves.assistant.consoleContent} className="flex flex-col p-4 pb-7">
      {/* Controls */}
      <div className="flex items-center justify-between text-[var(--ink-soft)]">
        <motion.button whileTap={moves.assistant.press} aria-label={assistantCopy.labels.expand}>
          <ExpandIcon />
        </motion.button>
        <motion.button
          whileTap={moves.assistant.press}
          onClick={onClose}
          aria-label={assistantCopy.labels.close}
        >
          <CloseIcon />
        </motion.button>
      </div>

      {/* Conversation area */}
      <div className="flex min-h-[120px] flex-col justify-center py-4">
        <AnimatePresence mode="wait">
          {(listening || submitted) && transcript && (
            <motion.div key="transcript" {...moves.voice.transcript} className="mb-4 flex justify-end">
              <span className="max-w-[280px] rounded-[var(--radius-control)] bg-[var(--paper-warm)] px-3 py-2 text-right font-[var(--font-ui)] text-[length:var(--type-body-size)] leading-[var(--type-body-line)] text-[var(--ink-soft)]">
                {transcript}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {submitted && (
            <motion.div key="thinking" {...moves.assistant.contentSwap} className="flex justify-center">
              <THINKING />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--assistant-border)] bg-[var(--paper-warm)] pl-4 pr-1">
        <input
          ref={inputRef}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={listening ? '' : assistantCopy.consolePlaceholder}
          className="h-10 flex-1 bg-transparent font-[var(--font-ui)] text-[length:var(--type-body-size)] leading-[var(--type-body-line)] text-[var(--ink-soft)] outline-none placeholder:text-[var(--ink-muted)]"
        />

        {listening ? (
          <span className="grid h-8 w-8 place-items-center text-[var(--ink-soft)]">
            <Waveform />
          </span>
        ) : typed ? (
          <motion.button
            whileTap={moves.assistant.press}
            aria-label={assistantCopy.labels.submit}
            className="grid h-8 w-8 place-items-center rounded-full bg-[var(--ink)] text-white"
          >
            <SubmitIcon />
          </motion.button>
        ) : (
          <motion.button
            whileTap={moves.assistant.press}
            onClick={onVoice}
            aria-label={assistantCopy.labels.voice}
            className="grid h-8 w-8 place-items-center rounded-full text-[var(--ink-soft)]"
          >
            <MicIcon size={16} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
