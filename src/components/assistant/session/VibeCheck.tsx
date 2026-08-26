import { motion } from 'motion/react';
import { vibeCheck } from '../../../content/journey';
import { moves } from '../../../motion/motion';
import { Confirmed, ImageTile, Label, Line, Section } from './parts';

/**
 * ============================================================================
 * VIBE CHECK
 * ============================================================================
 *
 * Taste, learned before a single product is shown. Eight photographs of people
 * wearing things, and the shopper taps whatever feels like them. There is no
 * right answer and nothing is named — that is the point. A grid of products
 * would ask them to shop; a grid of people asks them to react.
 *
 * The shopper decides when they are done, which is why this section waits for
 * `Confirm selection` rather than closing itself.
 */

/** Ties a tile to the thumbnail it becomes once the section folds. */
const vibeShared = (id: string) => `vibe-${id}`;

export function VibeCheck({
  picks,
  phase,
  onToggle,
  innerRef,
}: {
  picks: string[];
  phase: 'open' | 'folding' | 'closed';
  onToggle: (id: string) => void;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const chosen = vibeCheck.tiles.filter((tile) => picks.includes(tile.id));

  return (
    <Section innerRef={innerRef}>
      <Label>{vibeCheck.label}</Label>
      <Line>{vibeCheck.prompt}</Line>

      {phase === 'closed' ? (
        <>
          {picks.length > 0 && (
          <Confirmed
            label={vibeCheck.confirmedLabel}
            count={picks.length}
            /* Two carry the answer; the rest were already folded away. */
            thumbs={chosen.slice(0, 2).map((tile) => ({
              id: vibeShared(tile.id),
              image: tile.image,
            }))}
          />
          )}
          <Line delay={0.25}>{vibeCheck.response}</Line>
        </>
      ) : (
        <motion.div layout transition={moves.session.fold} className="grid w-full grid-cols-2 gap-x-4 gap-y-[14px]">
          {vibeCheck.tiles.map((tile, index) => {
            const isChosen = picks.includes(tile.id);
            return (
              <ImageTile
                key={tile.id}
                tile={tile}
                variant="vibe"
                index={index}
                chosen={isChosen}
                /* While folding, everything that was not chosen clears out
                   first, so the two that remain have room to travel. */
                discarded={phase === 'folding' && !(isChosen && chosen.slice(0, 2).includes(tile))}
                sharedId={vibeShared(tile.id)}
                onChoose={() => onToggle(tile.id)}
              />
            );
          })}
        </motion.div>
      )}
    </Section>
  );
}
