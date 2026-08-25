import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { moves, stagger } from '../../motion/motion';
import { sections } from '../../content/store';

type StoreSection = (typeof sections)[number];

/**
 * A full-bleed storefront section — either the video hero or a campaign image.
 * The headline sets word by word as the section is scrolled into view, and the
 * image behind it drifts slowly for as long as it is on screen.
 */
export function Section({ section }: { section: StoreSection }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const words = section.headline.split(' ');
  /** Pale imagery takes ink type; photography takes white type over a wash. */
  const light = section.tone === 'light';

  return (
    <section
      ref={ref}
      className={`relative w-full overflow-hidden bg-[var(--paper-warm)] ${
        // The hero fills the frame beneath the header. `h-full` resolves against
        // the scroll container's content box, which already excludes the header.
        section.kind === 'hero' ? 'h-full min-h-[520px]' : 'h-[560px]'
      }`}
    >
      {/* Campaign media */}
      <motion.div
        className="absolute inset-0"
        initial={moves.store.imageDrift.initial}
        animate={inView ? moves.store.imageDrift.animate : undefined}
        transition={moves.store.imageDrift.transition}
      >
        {'video' in section ? (
          <video
            src={section.video}
            poster={section.poster}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={section.image}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </motion.div>

      {/* Legibility wash — only under white type. Pale imagery takes ink type
          instead and needs no wash. */}
      {light && (
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
      )}

      {/* Headline and link */}
      {/* The hero carries extra bottom padding so its link clears the
          assistant, which rests over this section at the top of the scroll. */}
      <div
        className={`absolute inset-x-0 bottom-0 p-4 ${
          section.kind === 'hero' ? 'pb-[104px]' : 'pb-8'
        }`}
      >
        <h2
          className="flex flex-wrap gap-x-[0.28em] overflow-hidden font-[var(--font-display)] text-[length:var(--type-section-size)] font-[var(--type-section-weight)] uppercase leading-[var(--type-section-line)] tracking-[var(--type-section-tracking)]"
          style={{ color: light ? 'var(--on-image)' : 'var(--ink)' }}
        >
          {words.map((word, i) => (
            <span key={word + i} className="overflow-hidden">
              <motion.span
                className="inline-block"
                initial={moves.store.headlineWord.initial}
                animate={inView ? moves.store.headlineWord.animate : undefined}
                transition={{
                  ...moves.store.headlineWord.transition,
                  delay: i * stagger.base,
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h2>

        {section.caption && (
          <motion.p
            className="mt-2 max-w-[300px] font-[var(--font-ui)] text-[length:var(--type-body-size)] leading-[var(--type-body-line)]"
            style={{ color: light ? 'rgba(255,255,255,0.85)' : 'var(--ink-muted)' }}
            initial={moves.store.sectionReveal.initial}
            animate={inView ? moves.store.sectionReveal.animate : undefined}
            transition={{
              ...moves.store.sectionReveal.transition,
              delay: words.length * stagger.base,
            }}
          >
            {section.caption}
          </motion.p>
        )}

        <motion.a
          href="#"
          className="mt-3 inline-block border-b pb-[2px] font-[var(--font-display)] text-[length:var(--type-cta-size)] font-[var(--type-cta-weight)] uppercase leading-[var(--type-cta-line)] tracking-[var(--type-nav-tracking)]"
          style={{
            color: light ? 'var(--on-image)' : 'var(--ink)',
            borderColor: light ? 'rgba(255,255,255,0.7)' : 'var(--ink)',
          }}
          initial={moves.store.sectionReveal.initial}
          animate={inView ? moves.store.sectionReveal.animate : undefined}
          transition={{
            ...moves.store.sectionReveal.transition,
            delay: words.length * stagger.base + stagger.slow,
          }}
        >
          {section.cta}
        </motion.a>
      </div>
    </section>
  );
}
