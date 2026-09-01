import { useCallback, useEffect, useRef, useState } from 'react';
import { Storefront } from './components/store/Storefront';
import { Assistant } from './components/assistant/Assistant';
import { ThinkingGallery } from './components/assistant/thinking/Gallery';
import { Session, type Checkpoint } from './components/assistant/session/Session';
import { Checkpoints } from './components/Checkpoints';

/**
 * The prototype is presented inside a phone-sized frame so it reads correctly
 * on a laptop or a projector. The frame is presentation dressing only — the
 * storefront and the assistant inside it are the prototype.
 */
/**
 * Where each review route drops you into the session. `#session` is the whole
 * thing from the greeting; the rest start with everything before them already
 * answered.
 */
const CHECKPOINTS: Record<string, Checkpoint> = {
  '#session': 'greeting',
  '#vibe': 'vibe',
  '#product': 'product',
  '#reviews': 'reviews',
  '#cart': 'cart',
  '#checkout': 'checkout',
};

export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hash, setHash] = useState(window.location.hash);

  /* Bumped when a session checkpoint is picked while already on it, so the
     section mounts again and plays from the top. */
  const [run, setRun] = useState(0);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  /**
   * What picking a stop on the rail does.
   *
   * Somewhere else: go there, and start that section from the beginning.
   *
   * The same session checkpoint again: run it again. A section is paced, and
   * watching it once is rarely enough.
   *
   * The storefront again: nothing. The storefront is the live journey, not a
   * paced section — remounting it throws away wherever the shopper had got to
   * and restarts the assistant, which is what made the sign-in spinner come
   * round again every time the rail was touched.
   */
  const pick = useCallback(
    (next: string) => {
      if (next === hash) {
        if (CHECKPOINTS[next]) setRun((at) => at + 1);
        return;
      }

      setRun(0);

      if (next) {
        window.location.hash = next;
        return;
      }

      /* Back to the storefront. Clearing the hash by assignment leaves a bare
         "#" behind and fires nothing, so the URL is rewritten and the state
         is set here instead. */
      window.history.replaceState(null, '', window.location.pathname);
      setHash('');
    },
    [hash],
  );

  const rail = <Checkpoints hash={hash} onPick={pick} />;

  // A review surface for comparing thinking animations, not part of the journey.
  if (hash === '#thinking') {
    return (
      <>
        {rail}
        <ThinkingGallery />
      </>
    );
  }

  // Checkpoints into the guided session, for review. The journey normally
  // reaches the session through the storefront and signing in; these skip
  // straight to one part of it, with everything before that point already
  // answered, so a single section can be watched without replaying the rest.
  const checkpoint = CHECKPOINTS[hash];

  return (
    <>
      {rail}
      <div className="grid min-h-dvh place-items-center bg-[#e9e6e1] p-6">
        <div
          className="relative overflow-hidden rounded-[44px] bg-[var(--paper)] shadow-[0_30px_90px_rgba(0,0,0,0.22)] ring-1 ring-black/10"
          style={{
            width: 'var(--viewport-width)',
            height: 'min(var(--viewport-height), calc(100dvh - 48px))',
          }}
        >
          {checkpoint ? (
            /* Keyed so that arriving at a checkpoint, or asking for the same
               one again, builds a fresh session rather than editing the one
               already on screen. */
            <Session
              key={`${hash}-${run}`}
              start={checkpoint}
              onCollapse={() => undefined}
              onClose={() => undefined}
            />
          ) : (
            <>
              <Storefront scrollRef={scrollRef} />
              <Assistant scrollRef={scrollRef} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
