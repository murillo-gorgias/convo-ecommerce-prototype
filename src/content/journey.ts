/**
 * ============================================================================
 * THE GUIDED SESSION
 * ============================================================================
 *
 * Everything the assistant asks, shows and says while it narrows down what to
 * recommend. The session is a list of SECTIONS. Each section asks one question,
 * takes one answer, and then folds itself away into a single confirmed line so
 * the shopper can keep scrolling.
 *
 * Sections are deliberately independent. Adding a price question, a shipping
 * question or a gift-wrap question later means adding an entry here and a
 * matching component — nothing else in the session needs to know.
 *
 * No component below this file contains a word of copy or a product fact.
 */

import { asset } from './asset';

/* ==========================================================================
 * TYPES
 * ========================================================================== */

/** An image the shopper can tap. Some carry a caption, some do not. */
export type Tile = {
  id: string;
  image: string;
  /** Shown under the image. Left out on the vibe tiles, which are wordless. */
  caption?: string;
  /** Never displayed. Read aloud by screen readers. */
  alt: string;
};

/** A piece the assistant ends up recommending. */
export type Recommendation = {
  id: string;
  name: string;
  price: number;
  rating: number;
  material: string;
  /** The dot shown beside the material name. */
  swatch: string;
  image: string;
};

/* ==========================================================================
 * WHO THE SHOPPER IS
 * The store already knows this person. The session is built on that.
 * ========================================================================== */

export const shopper = {
  firstName: 'Nora',
  fullName: 'Nora Whitfield',
  avatar: asset('/brand/profile/nora.png'),
} as const;

/* ==========================================================================
 * WHAT THE SHOPPER ASKED
 * ========================================================================== */

export const opening = {
  query: 'Necklaces for summer wedding in Italy',

  /** Said before sign-in, offering the trade rather than demanding it. */
  invitation:
    'Welcome back Nora — sign in and I can pick from what fits specially you, we have a fresh summer collection.',

  /** The moment the account unlocks. */
  unlocked: 'Welcome back, Nora!',

  /** The first thing said once the shopper is in. */
  greeting:
    "Nora, you're in. Now the fun part — before I show you a single necklace, show me what you're drawn to.",

  actions: {
    continueAs: `Continue as ${shopper.firstName}`,
    otherAccount: 'Sign in with a different account',
    decline: 'Not now',
  },
} as const;

/* ==========================================================================
 * THE SECTIONS, IN ORDER
 * ========================================================================== */

/** ---------------------------------------------------------------- VIBE ---
 * Taste, learned from images of people wearing things — not from products.
 * Multi-select, and the shopper decides when they are done.
 */
export const vibeCheck = {
  label: 'Vibe check',
  prompt: "Tap everything that feels like you at this wedding. Don't overthink it.",
  /** The fewest tiles that count as an answer. */
  minimum: 1,
  /** Said once the selection is confirmed. */
  response: "Good taste. Warm gold, nothing shouting — I've got a read on you now.",
  confirmedLabel: 'Selection confirmed',
  tiles: [
    { id: 'pearl-drop', image: asset('/brand/vibe/beaded-pearl-drop.png'), alt: 'Pearl and green beaded layers with a stone drop, worn in strong sun' },
    { id: 'turquoise', image: asset('/brand/vibe/turquoise-beach.png'), alt: 'Chunky turquoise beads with a matching bracelet, worn by the sea' },
    { id: 'blue-shell', image: asset('/brand/vibe/blue-shell.png'), alt: 'Cobalt beaded strands with a gold shell pendant' },
    { id: 'gold-coin', image: asset('/brand/vibe/gold-coin.png'), alt: 'Fine chain with small gold coins, worn with a white top' },
    { id: 'red-fish', image: asset('/brand/vibe/red-fish-pendant.png'), alt: 'Beaded strand with a red enamel fish pendant, cliffs behind' },
    { id: 'starfish', image: asset('/brand/vibe/pearl-starfish.png'), alt: 'Pearl and turquoise layers with gold starfish charms' },
    { id: 'layered-gold', image: asset('/brand/vibe/layered-square.png'), alt: 'Three layered gold chains with a square stone pendant' },
    { id: 'gold-letter', image: asset('/brand/vibe/gold-letter.png'), alt: 'Herringbone and curb chains with a small letter charm' },
  ] satisfies Tile[],
} as const;

/** --------------------------------------------------------------- STYLE ---
 * What the necklace has to work against. One answer, taken immediately.
 */
export const styleCheck = {
  label: 'Style check',
  prompt: 'One thing before I pull pieces: what are you wearing?',
  confirmedLabel: 'Selection confirmed',
  tiles: [
    { id: 'strapless', caption: 'Strapless', image: asset('/brand/neckline/strapless.png'), alt: 'Strapless white dress' },
    { id: 'deep-v', caption: 'Deep V', image: asset('/brand/neckline/deep-v.png'), alt: 'Deep V neckline with a fine chain' },
    { id: 'high-neck', caption: 'High neck', image: asset('/brand/neckline/high-neck.png'), alt: 'High neckline with a statement drop' },
    { id: 'halter', caption: 'Halter', image: asset('/brand/neckline/halter.png'), alt: 'Halter dress with an open draped front' },
  ] satisfies Tile[],
} as const;

/** -------------------------------------------------------------- SIZING ---
 * Length, shown on real necks so the number means something.
 */
export const sizing = {
  label: 'Sizing',
  prompt:
    "Length changes everything about how a necklace reads on you. Two inches shorter and it sits at the collar; two longer and it drops past the collarbone. Here's how each one falls. Pick what connects with you.",
  confirmedLabel: 'Sizing confirmed',
  tiles: [
    { id: '16', caption: '16” collar', image: asset('/brand/sizing/16-collar.png'), alt: 'Fine chains sitting high at the collar' },
    { id: '18', caption: '18” collarbone', image: asset('/brand/sizing/18-collarbone.png'), alt: 'Chain resting on the collarbone' },
    { id: '20', caption: '20” just below', image: asset('/brand/sizing/20-below.png'), alt: 'Layered chains falling below the collarbone' },
  ] satisfies Tile[],
} as const;

/** ------------------------------------------------------------ THE PIECES ---
 * The answer, arrived at last — when it can actually be right.
 */
export const perfectFit = {
  label: 'The perfect fit',
  prompt: 'Okay, two of these are really good for you.',
  moreLikeThis: 'More like this',
  materialLabel: 'Material',
  addToBag: 'Add to bag',
  added: 'Added',
  information: 'Product Information',
  pieces: [
    {
      id: 'floating-sapphire',
      name: 'Floating Sapphire Necklace',
      price: 188,
      rating: 4.5,
      material: '18k Gold Ver...',
      swatch: '#E0A45E',
      image: asset('/brand/products/rec-floating-sapphire.png'),
    },
    {
      id: 'carmen-beaded',
      name: 'Carmen Beaded Necklace',
      price: 178,
      rating: 4.5,
      material: '18k Gold Ver...',
      swatch: '#E0A45E',
      image: asset('/brand/products/rec-carmen-beaded.png'),
    },
  ] satisfies Recommendation[],
} as const;

/* ==========================================================================
 * THE SUGGESTIONS ABOVE THE INPUT
 * Raised by the section that is currently open, never on a schedule.
 * ========================================================================== */

export const chips = {
  confirm: 'Confirm selection',
  ask: 'Ask a question',
  skip: 'Skip',
} as const;

/** The permanent field along the bottom. */
export const dock = {
  placeholder: 'Ask anything',
} as const;
