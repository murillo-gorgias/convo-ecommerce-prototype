import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Header } from './Header';
import { Section } from './Section';
import { sections, statement } from '../../content/store';
import { moves } from '../../motion/motion';

/**
 * The storefront. This is the shop the assistant sits on top of — it scrolls
 * on its own and knows nothing about the assistant.
 */
export function Storefront({
  scrollRef,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="relative h-full w-full bg-[var(--paper)]">
      <Header />

      <div
        ref={scrollRef}
        className="h-full overflow-y-auto overflow-x-hidden pt-[139px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Section section={sections[0]} />
        <Statement />
        <Section section={sections[1]} />
        <Section section={sections[2]} />

        {/* Breathing room beneath the last section so the assistant never
            covers content at the very bottom of the scroll. */}
        <div className="h-[140px] bg-[var(--paper)]" />
      </div>
    </div>
  );
}

/** The brand statement between the hero and the campaign sections. */
function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <motion.div
      ref={ref}
      className="bg-[var(--paper)] px-6 py-14 text-center"
      initial={moves.store.sectionReveal.initial}
      animate={inView ? moves.store.sectionReveal.animate : undefined}
      transition={moves.store.sectionReveal.transition}
    >
      <h3 className="font-[var(--font-display)] text-[22px] font-[500] lowercase tracking-[0.5px] text-[var(--ink)]">
        {statement.heading}
      </h3>
      {statement.body.map((line) => (
        <p
          key={line}
          className="mx-auto mt-3 max-w-[320px] font-[var(--font-ui)] text-[length:var(--type-body-size)] leading-[22px] text-[var(--ink-muted)]"
        >
          {line}
        </p>
      ))}
    </motion.div>
  );
}
