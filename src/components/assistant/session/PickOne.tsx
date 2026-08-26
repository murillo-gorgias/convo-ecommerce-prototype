import { motion } from 'motion/react';
import type { Tile } from '../../../content/journey';
import { moves } from '../../../motion/motion';
import { Confirmed, ImageTile, Label, Line, Section } from './parts';

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
 */

export function PickOne({
  section,
  tiles,
  picked,
  phase,
  onPick,
  columns,
  sharedId,
  innerRef,
}: {
  section: { label: string; prompt: string; confirmedLabel: string };
  tiles: readonly Tile[];
  picked?: string;
  phase: 'open' | 'folding' | 'closed';
  onPick: (id: string) => void;
  /** Two for the neckline question, three for length. */
  columns: 2 | 3;
  /** Namespaces this section's shared images, e.g. `style` or `size`. */
  sharedId: (id: string) => string;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const chosen = tiles.find((tile) => tile.id === picked);

  return (
    <Section innerRef={innerRef}>
      <Label>{section.label}</Label>
      <Line>{section.prompt}</Line>

      {phase === 'closed' && chosen ? (
        <Confirmed
          label={section.confirmedLabel}
          answer={chosen.caption}
          thumbs={[{ id: sharedId(chosen.id), image: chosen.image }]}
        />
      ) : (
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
      )}
    </Section>
  );
}
