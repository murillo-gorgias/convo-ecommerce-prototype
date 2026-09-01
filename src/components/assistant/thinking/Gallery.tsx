import { THINKING, thinkingVariations } from './variations';

/**
 * Six timings of the thinking bubble, side by side, so they can be judged
 * against each other rather than one at a time. Reached at /#thinking
 *
 * They run together and unsynchronised, which is the point: an animation that
 * only reads well when you are waiting for it does not read well.
 *
 * This is a review surface, not part of the prototype journey.
 */
export function ThinkingGallery() {
  return (
    <div className="min-h-dvh bg-[#e9e6e1] px-8 py-14">
      <div className="mx-auto max-w-[900px]">
        <h1 className="[font-family:var(--font-serif)] text-[32px] font-[400] leading-[38px] text-[var(--ink)]">
          Thinking
        </h1>
        <p className="mt-2 max-w-[540px] font-[var(--font-ui)] text-[14px] leading-[22px] text-[var(--ink-muted)]">
          One bubble, six schedules. Three dots take turns, hand over to a short
          sentence with a light running through it, and take it back, while a
          black segment travels around the outline. The design is settled — what
          is being chosen here is pace.
        </p>

        {/* The one the console is wired to, so the sample cannot drift from
            whatever `THINKING` currently names. */}
        <div className="mt-8 flex items-center gap-5 rounded-[var(--radius-console)] bg-[var(--assistant-surface-solid)] px-6 py-5 shadow-[var(--assistant-shadow)]">
          <THINKING />
          <span className="font-[var(--font-ui)] text-[13px] leading-[19px] text-[var(--ink-muted)]">
            At the size it runs in the console.
          </span>
        </div>

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
      <h2 className="[font-family:var(--font-serif)] text-[20px] font-[400] leading-[26px] text-[var(--ink)]">
        {name}
      </h2>
      <p className="mt-1 font-[var(--font-ui)] text-[13px] leading-[19px] text-[var(--ink-muted)]">
        {note}
      </p>

      {/* On the sheet the session actually runs on, left-aligned the way a
          reply arrives — a bubble centred in a box reads differently. */}
      <div className="mt-5 flex h-[110px] items-center rounded-[var(--radius-control)] bg-gradient-to-b from-[var(--sheet-top)] to-[var(--sheet-bottom)] px-5">
        {children}
      </div>
    </div>
  );
}
