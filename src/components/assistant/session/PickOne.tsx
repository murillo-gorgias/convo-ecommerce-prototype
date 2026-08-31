import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import type { Tile } from '../../../content/journey';
import { moves, pace } from '../../../motion/motion';
import { Body, Confirmed, ImageTile, Label, Line, Section, useAfter, useSectionReveal } from './parts';

/**
 * ============================================================================
 * PICK ONE
 * ============================================================================
 *
 * The shape used by every section that takes a single answer — the neckline
 * question and the length question both run through here. One tap answers it,
 * so there is no confirm step: the section folds on its own a beat later, and
 * that beat is what makes the tap feel acknowledged rather than swallowed.
 *
 * Adding another single-answer section (budget, delivery, gift wrap) means
 * adding its copy and images to the journey file and rendering this again.
 *
 * HOW IT PACES ITSELF
 * Label, then the question types, then the tiles arrive. After the fold it
 * holds — it has nothing to say about the answer — and then reports itself
 * settled so the next section can begin.
 */

export function PickOne({
  section,
  tiles,
  picked,
  phase,
  onPick,
  onSettled,
  columns,
  sharedId,
  confirmationIcon,
  innerRef,
}: {
  section: { label: string; prompt: string };
  tiles: readonly Tile[];
  picked?: string;
  phase: 'open' | 'folding' | 'closed';
  onPick: (id: string) => void;
  /** Fired once the fold has had time to land. */
  onSettled: () => void;
  /** Two for the neckline question, three for length. */
  columns: 2 | 3;
  /** Namespaces this section's shared images, e.g. `style` or `size`. */
  sharedId: (id: string) => string;
  confirmationIcon: ReactNode;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const { speaking, ready, onSpoken } = useSectionReveal();
  const chosen = tiles.find((tile) => tile.id === picked);

  /* Let the fold finish and be seen before anything else happens. */
  useAfter(pace.afterFold, phase === 'closed', onSettled);

  return (
    <Section innerRef={innerRef}>
      <Label>{section.label}</Label>
      <Line start={speaking} onDone={onSpoken}>
        {section.prompt}
      </Line>

      {phase === 'closed' && chosen ? (
        <Confirmed
          label={chosen.caption ?? ''}
          icon={confirmationIcon}
          thumbs={[{ id: sharedId(chosen.id), image: chosen.image }]}
        />
      ) : (
        <Body show={ready}>
          <motion.div
            layout
            transition={moves.session.fold}
            className={`grid w-full gap-1 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
          >
            {tiles.map((tile, index) => (
              <ImageTile
                key={tile.id}
                tile={tile}
                variant="choice"
                index={index}
                chosen={tile.id === picked}
                discarded={phase === 'folding' && tile.id !== picked}
                sharedId={sharedId(tile.id)}
                onChoose={() => onPick(tile.id)}
              />
            ))}
          </motion.div>
        </Body>
      )}
    </Section>
  );
}
