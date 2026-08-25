import { motion } from 'motion/react';
import { assistantCopy } from '../../content/assistant';
import { brand } from '../../content/store';
import { recommendations, type Product } from '../../content/products';
import { moves, stagger } from '../../motion/motion';
import { CloseIcon, MicIcon } from './icons';

/**
 * ============================================================================
 * SHOP THE LOOK
 * ============================================================================
 *
 * The assistant's answer, taking over the whole screen. The console grows into
 * this — same element, same surface, just given the room to show what it found.
 *
 * Three things arrive in order, which is the whole point of the moment:
 *   1. the surface opens
 *   2. the pieces settle in, one after another
 *   3. the assistant speaks, once there is something to speak about
 */

export function ShopTheLook({
  message,
  onCollapse,
  onClose,
}: {
  message: string;
  onCollapse: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#fafafa] to-[#f4efe7]">
      {/* Top bar */}
      <motion.div
        className="absolute inset-x-4 top-6 z-20 flex items-center justify-between"
        {...moves.shopTheLook.chrome}
      >
        <GlassButton onClick={onCollapse} label={assistantCopy.labels.collapse}>
          <CollapseIcon />
        </GlassButton>

        <svg
          viewBox={brand.wordmark.viewBox}
          className="h-[15px] w-auto"
          role="img"
          aria-label={brand.name}
        >
          <path d={brand.wordmark.path} fill="var(--ink)" />
        </svg>

        <GlassButton onClick={onClose} label={assistantCopy.labels.close} solid>
          <CloseIcon />
        </GlassButton>
      </motion.div>

      {/* The pieces */}
      <div className="flex-1 overflow-y-auto px-4 pb-[190px] pt-[86px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="grid grid-cols-2 gap-x-4 gap-y-[14px]">
          {recommendations.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>

      {/* What the assistant says, and where you answer */}
      <motion.div
        className="absolute inset-x-0 bottom-0 rounded-t-[var(--space-md)] border-t-[0.5px] border-white/50 bg-white/75 px-4 pb-7 pt-4 shadow-[0_-4px_6px_rgba(0,0,0,0.06)] backdrop-blur-[10px]"
        {...moves.shopTheLook.speech}
      >
        <p className="font-[var(--font-ui)] text-[14px] leading-[21px] text-black">
          {message}
        </p>

        <div className="mt-4 flex h-10 items-center justify-between rounded-[40px] border border-[rgba(211,211,211,0.5)] bg-white/50 px-4 shadow-[0_4px_4px_rgba(0,0,0,0.04)]">
          <span className="font-[var(--font-ui)] text-[12px] text-black/50">
            {assistantCopy.consolePlaceholder}
          </span>
          <span className="text-[var(--ink-soft)]">
            <MicIcon size={16} />
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/* ==========================================================================
 * A single piece
 * ========================================================================== */

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.article
      className="flex flex-col gap-1"
      initial={moves.shopTheLook.productCard.initial}
      animate={moves.shopTheLook.productCard.animate}
      transition={{
        ...moves.shopTheLook.productCard.transition,
        delay: 0.18 + index * stagger.base,
      }}
    >
      <div className="relative h-[243px] overflow-hidden rounded-[20px] border border-black/[0.04] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.03)]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />

        <motion.button
          whileTap={moves.assistant.press}
          aria-label={`Save ${product.name}`}
          className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-[24px] text-white shadow-[0_4px_4px_rgba(0,0,0,0.15)]"
          style={{ background: 'rgba(43,43,43,0.9)' }}
        >
          <HeartIcon />
        </motion.button>
      </div>

      <div className="flex items-baseline justify-between gap-2 pt-1">
        <h3 className="truncate font-[var(--font-ui)] text-[13px] leading-[18px] text-[var(--ink)]">
          {product.name}
        </h3>
        <span className="shrink-0 font-[var(--font-ui)] text-[13px] leading-[18px] text-[var(--ink)]">
          ${product.price}
        </span>
      </div>

      <div className="flex items-center gap-[6px]">
        {product.swatches.map((colour) => (
          <span
            key={colour}
            className="h-[9px] w-[9px] rounded-full ring-[0.5px] ring-black/15"
            style={{ background: colour }}
          />
        ))}
        {product.moreColours && (
          <span className="font-[var(--font-ui)] text-[10px] text-[var(--ink-muted)]">
            +{product.moreColours}
          </span>
        )}
        <span className="ml-1 truncate font-[var(--font-ui)] text-[11px] text-[var(--ink-muted)]">
          {product.material}
        </span>
      </div>
    </motion.article>
  );
}

/* ==========================================================================
 * Chrome
 * ========================================================================== */

function GlassButton({
  children,
  onClick,
  label,
  solid,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  solid?: boolean;
}) {
  return (
    <motion.button
      whileTap={moves.assistant.press}
      onClick={onClick}
      aria-label={label}
      className={`grid h-12 w-12 place-items-center rounded-[24px] text-[var(--ink)] shadow-[0_2px_3px_rgba(0,0,0,0.1)] backdrop-blur-md ${
        solid ? 'bg-white/50' : 'bg-white/20'
      }`}
    >
      {children}
    </motion.button>
  );
}

function CollapseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 3.5l5.5 5.5M8.5 3.5v5.5H3M17 16.5L11.5 11M11.5 16.5V11H17"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 16.5S3 12.4 3 7.9A3.9 3.9 0 0 1 10 5.6a3.9 3.9 0 0 1 7 2.3c0 4.5-7 8.6-7 8.6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
