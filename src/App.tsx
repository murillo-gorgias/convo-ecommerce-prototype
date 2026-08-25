import { useRef } from 'react';
import { Storefront } from './components/store/Storefront';
import { Assistant } from './components/assistant/Assistant';

/**
 * The prototype is presented inside a phone-sized frame so it reads correctly
 * on a laptop or a projector. The frame is presentation dressing only — the
 * storefront and the assistant inside it are the prototype.
 */
export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="grid min-h-dvh place-items-center bg-[#e9e6e1] p-6">
      <div
        className="relative overflow-hidden rounded-[44px] bg-[var(--paper)] shadow-[0_30px_90px_rgba(0,0,0,0.22)] ring-1 ring-black/10"
        style={{
          width: 'var(--viewport-width)',
          height: 'min(var(--viewport-height), calc(100dvh - 48px))',
        }}
      >
        <Storefront scrollRef={scrollRef} />
        <Assistant scrollRef={scrollRef} />
      </div>
    </div>
  );
}
