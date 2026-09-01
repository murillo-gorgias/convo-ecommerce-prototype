import { Fragment, useEffect, useRef, useState } from 'react';
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
  '#cart': 'cart',
  '#checkout': 'checkout',
};

export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hash, setHash] = useState(window.location.hash);

  /* Bumped when a checkpoint is picked while already on it, so the section
     mounts again and plays from the top. */
  const [run, setRun] = useState(0);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const rail = <Checkpoints hash={hash} onReplay={() => setRun((at) => at + 1)} />;

  // A review surface for comparing thinking animations, not part of the journey.
  if (hash === '#thinking') {
    return (
      <>
        {rail}
        <ThinkingGallery key={run} />
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
            <Session
              key={`${hash}-${run}`}
              start={checkpoint}
              onCollapse={() => undefined}
              onClose={() => undefined}
            />
          ) : (
            <Fragment key={run}>
              <Storefront scrollRef={scrollRef} />
              <Assistant scrollRef={scrollRef} />
            </Fragment>
          )}
        </div>
      </div>
    </>
  );
}
