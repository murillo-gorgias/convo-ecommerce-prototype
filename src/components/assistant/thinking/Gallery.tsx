import { thinkingVariations } from './variations';

/**
 * A side-by-side comparison of the thinking animations, so they can be judged
 * against each other rather than one at a time. Reached at /#thinking
 *
 * This is a review surface, not part of the prototype journey.
 */
export function ThinkingGallery() {
  return (
    <div className="min-h-dvh bg-[#e9e6e1] px-8 py-14">
      <div className="mx-auto max-w-[900px]">
        <h1 className="font-[var(--font-display)] text-[28px] font-[500] uppercase tracking-[1.4px] text-[var(--ink)]">
          Thinking animations
        </h1>
        <p className="mt-2 max-w-[520px] font-[var(--font-ui)] text-[14px] leading-[22px] text-[var(--ink-muted)]">
          Five variations on a morphing line. In each one the line itself changes
          shape while light travels through it — never a static track. Drawn in ink
          at the size it appears in the console.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {thinkingVariations.map(({ id, name, note, Component }) => (
            <Card key={id} name={name} note={note}>
              <Component />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({
  name,
  note,
  children,
}: {
  name: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-console)] bg-[var(--assistant-surface-solid)] p-6 shadow-[var(--assistant-shadow)]">
      <div className="flex items-baseline justify-between">
        <h2 className="font-[var(--font-display)] text-[15px] font-[500] uppercase tracking-[0.8px] text-[var(--ink)]">
          {name}
        </h2>
      </div>
      <p className="mt-1 font-[var(--font-ui)] text-[13px] leading-[19px] text-[var(--ink-muted)]">
        {note}
      </p>

      {/* Shown on the console's own surface, at the size it will appear. */}
      <div className="mt-5 grid h-[120px] place-items-center rounded-[var(--radius-control)] bg-[var(--paper-warm)]">
        {children}
      </div>
    </div>
  );
}
