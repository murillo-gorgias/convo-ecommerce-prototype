import { useState } from 'react';
import { motion } from 'motion/react';
import { vibeCheck } from '../../../content/journey';
import { moves, pace } from '../../../motion/motion';
import { Body, Confirmed, ImageTile, Label, Line, Section, useAfter, useSectionReveal } from './parts';

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
 *
 * HOW IT PACES ITSELF
 * Label, then the question types, then the grid arrives. Once confirmed, the
 * section folds — and then holds, before the assistant says what it made of
 * the answer. Only when that line has finished does it report itself settled,
 * which is what lets the next section wait its turn.
 */

/** Ties a tile to the thumbnail it becomes once the section folds. */
const vibeShared = (id: string) => `vibe-${id}`;

export function VibeCheck({
  picks,
  phase,
  onToggle,
  onSettled,
  innerRef,
}: {
  picks: string[];
  phase: 'open' | 'folding' | 'closed';
  onToggle: (id: string) => void;
  /** Fired once this section has nothing left to say. */
  onSettled: () => void;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const { speaking, ready, onSpoken } = useSectionReveal();
  const [reacting, setReacting] = useState(false);

  const chosen = vibeCheck.tiles.filter((tile) => picks.includes(tile.id));
  const kept = chosen.slice(0, 2);

  /* The fold lands, and the assistant holds before reacting to it. */
  useAfter(pace.afterFold, phase === 'closed', () => setReacting(true));

  return (
    <Section innerRef={innerRef}>
      <Label>{vibeCheck.label}</Label>
      <Line start={speaking} onDone={onSpoken}>
        {vibeCheck.prompt}
      </Line>

      {phase === 'closed' ? (
        <>
          {picks.length > 0 && (
            <Confirmed
              label={vibeCheck.confirmedLabel}
              count={picks.length}
              /* Two carry the answer; the rest were already folded away. */
              thumbs={kept.map((tile) => ({ id: vibeShared(tile.id), image: tile.image }))}
            />
          )}
          {reacting && <Line onDone={onSettled}>{vibeCheck.response}</Line>}
        </>
      ) : (
        <Body show={ready}>
          <motion.div
            layout
            transition={moves.session.fold}
            className="grid w-full grid-cols-2 gap-x-4 gap-y-[14px]"
          >
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
                  discarded={phase === 'folding' && !kept.includes(tile)}
                  sharedId={vibeShared(tile.id)}
                  onChoose={() => onToggle(tile.id)}
                />
              );
            })}
          </motion.div>
        </Body>
      )}
    </Section>
  );
}
