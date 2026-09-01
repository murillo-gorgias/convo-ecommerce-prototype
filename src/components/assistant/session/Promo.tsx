import { useState } from 'react';
import { motion } from 'motion/react';
import { promo } from '../../../content/journey';
import { moves, pace } from '../../../motion/motion';
import { BagCard } from './Bag';
import { Lines, Said, useAfter } from './parts';
import { THINKING } from '../thinking/variations';

/**
 * ============================================================================
 * THE PROMOTION
 * ============================================================================
 *
 * Asked out loud with the bag already made up, which is where anybody actually
 * asks it. The answer names the code and says where it lands, instead of
 * pointing at a field to go and find.
 *
 * The bag comes back inside the answer. The offer is about a total, and a
 * total the shopper has to scroll back up for is a total they will not check —
 * so it is put in front of them, and the question that follows it is asked
 * with the number still on screen.
 */

/** How far through the answer we are. */
type Part = 'said' | 'lead' | 'card' | 'close';

export function Promo({
  folded,
  onCheckOut,
  onSettled,
}: {
  /** True once the conversation has moved past this answer. */
  folded?: boolean;
  onCheckOut: () => void;
  onSettled: () => void;
}) {
  const [part, setPart] = useState<Part>('said');

  /* The question lands, and the assistant takes the beat a person would take
     before answering it. */
  useAfter(pace.afterSaid, part === 'said', () => setPart('lead'));

  /* The bag is read before it is asked about. */
  useAfter(pace.betweenParts, part === 'card', () => setPart('close'));

  return (
    <motion.div
      {...moves.session.section}
      className="flex w-full flex-col items-start gap-4"
    >
      <Said>{promo.question}</Said>

      {/* The assistant takes the beat before replying, and shows it. */}
      {part === 'said' && <THINKING />}

      {part !== 'said' && (
        <Lines start onDone={() => setPart('card')}>
          {[promo.lead]}
        </Lines>
      )}

      {(part === 'card' || part === 'close') && (
        <BagCard folded={folded} onCheckOut={onCheckOut} />
      )}

      {part === 'close' && (
        <Lines start onDone={onSettled}>
          {[promo.close]}
        </Lines>
      )}
    </motion.div>
  );
}
