import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { announcements, brand, navigation } from '../../content/store';
import { moves } from '../../motion/motion';

/** The announcement strip and the storefront header. Fixed to the top. */
export function Header() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % announcements.length),
      4200,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      {/* Announcement strip */}
      <div className="relative flex h-[42px] items-center justify-center overflow-hidden bg-[var(--ink)] px-10">
        <button className="absolute left-3 text-white/70" aria-label="Previous">
          <Chevron direction="left" />
        </button>

        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            {...moves.store.announcementSwap}
            className="text-center font-[var(--font-ui)] text-[length:var(--type-announce-size)] tracking-[var(--type-announce-tracking)] text-white"
          >
            {announcements[index]}
          </motion.p>
        </AnimatePresence>

        <button className="absolute right-3 text-white/70" aria-label="Next">
          <Chevron direction="right" />
        </button>
      </div>

      {/* Header bar */}
      <div className="flex h-[57px] items-center justify-between bg-[var(--paper)] px-4">
        <button aria-label="Menu" className="p-1">
          <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden>
            {[0, 6, 12].map((y) => (
              <rect key={y} y={y} width="22" height="1.6" fill="var(--ink)" />
            ))}
          </svg>
        </button>

        <svg
          viewBox={brand.wordmark.viewBox}
          className="h-[15px] w-auto"
          role="img"
          aria-label={brand.name}
        >
          <path d={brand.wordmark.path} fill="var(--ink)" />
        </svg>

        <div className="flex items-center gap-4">
          <IconStore />
          <IconSearch />
          <IconBag />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex h-10 items-center gap-5 overflow-x-auto border-b border-[var(--line)] bg-[var(--paper)] px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navigation.map((item) => (
          <span
            key={item}
            className="shrink-0 whitespace-nowrap font-[var(--font-display)] text-[length:var(--type-nav-size)] font-[var(--type-nav-weight)] uppercase tracking-[var(--type-nav-tracking)] text-[var(--ink)]"
          >
            {item}
          </span>
        ))}
      </nav>
    </header>
  );
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden>
      <path
        d={direction === 'left' ? 'M6 1L1 6l5 5' : 'M1 1l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function IconStore() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M2 6h14v10H2V6Z" stroke="var(--ink)" strokeWidth="1.3" />
      <path d="M2 6l1.4-4h11.2L16 6" stroke="var(--ink)" strokeWidth="1.3" />
      <path d="M9 6v10" stroke="var(--ink)" strokeWidth="1.3" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="var(--ink)" strokeWidth="1.3" />
      <path d="m12.5 12.5 4 4" stroke="var(--ink)" strokeWidth="1.3" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 5h12l-1 11H4L3 5Z" stroke="var(--ink)" strokeWidth="1.3" />
      <path d="M6.5 7V4.5a2.5 2.5 0 0 1 5 0V7" stroke="var(--ink)" strokeWidth="1.3" />
    </svg>
  );
}
