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

/** One suggestion offered above the input. */
export type Chip = {
  id: string;
  label: string;
  /** The one that moves the session on. Drawn dark. */
  primary?: boolean;
  /**
   * Acts by SPEAKING rather than by pressing. Tapping it fills the input with
   * the spoken command as a live transcript, and only then does the thing.
   * The design has both of these as voice moments, and a chip that silently
   * performed them would be a button wearing a conversation's clothes.
   */
  voice?: boolean;
};

/** A piece the assistant ends up recommending. */
export type Recommendation = {
  id: string;
  name: string;
  price: number;
  /** One line under the name saying why this piece, not another. */
  reason: string;
  rating: number;
  material: string;
  /** The dot shown beside the material name. */
  swatch: string;
  /** The square shown in the grid. */
  image: string;
  /**
   * The photographs shown once the piece is opened, swiped through in order.
   * The first is the one the grid square grows into, so it must be the same
   * shot at a larger size.
   */
  gallery: string[];
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
 *
 * Four pieces, shown as photographs with a name, a price and one line saying
 * why this one. Nothing else. Everything a product page would stack up is
 * asked for instead, in the conversation, once a piece is opened.
 */
const gridChips: Chip[] = [
  { id: 'reviews', label: 'What do reviews say?' },
  { id: 'worn', label: 'Show me these worn' },
  { id: 'budget', label: 'Anything under $200?' },
];

export const perfectFit = {
  label: 'The perfect fit',
  prompt: 'Okay, 4 candidates for really good fit for you.',
  pieces: [
    {
      id: 'floating-sapphire',
      name: 'Floating Sapphire Necklace',
      price: 188,
      reason: 'Sits above the neckline',
      rating: 4.5,
      material: '18k Gold Vermeil',
      swatch: '#E0A45E',
      image: asset('/brand/products/worn-floating-sapphire.png'),
      gallery: [
        asset('/brand/products/open-floating-sapphire.png'),
        asset('/brand/products/rec-floating-sapphire.png'),
        asset('/brand/products/floating-sapphire.jpg'),
        asset('/brand/sizing/18-collarbone.png'),
      ],
    },
    {
      id: 'sapphire-cluster',
      name: 'Sapphire Cluster Necklace',
      price: 238,
      reason: 'Same stone, more of it',
      rating: 4.6,
      material: '18k Gold Vermeil',
      swatch: '#E0A45E',
      image: asset('/brand/products/worn-sapphire-cluster.png'),
      gallery: [
        asset('/brand/products/worn-sapphire-cluster.png'),
        asset('/brand/products/sapphire-cluster.jpg'),
        asset('/brand/sizing/16-collar.png'),
      ],
    },
    {
      id: 'jojo-loop',
      name: 'Jojo Loop Pendant',
      price: 198,
      reason: 'One clean shape',
      rating: 4.7,
      material: 'Silver + Vermeil',
      swatch: '#C8C8C8',
      image: asset('/brand/products/worn-jojo-loop.png'),
      gallery: [
        asset('/brand/products/worn-jojo-loop.png'),
        asset('/brand/products/jojo-loop.jpg'),
        asset('/brand/sizing/20-below.png'),
      ],
    },
    {
      id: 'herringbone',
      name: 'Bold Herringbone Chain',
      price: 338,
      reason: 'Flat and liquid',
      rating: 4.8,
      material: '18k Gold Vermeil',
      swatch: '#E0A45E',
      image: asset('/brand/products/worn-herringbone.png'),
      gallery: [
        asset('/brand/products/worn-herringbone.png'),
        asset('/brand/products/herringbone.jpg'),
        asset('/brand/vibe/gold-letter.png'),
      ],
    },
  ] satisfies Recommendation[],

  /** Offered before a piece has been opened. */
  chips: gridChips,
} as const;

/** ------------------------------------------------------- ONE PIECE, OPEN ---
 * What is shown when a piece is tapped: the photograph, the name, the price,
 * the rating, the material and the bag. Deliberately nothing else — the
 * specifications, the care, the returns and the reviews are all things to ask
 * about rather than scroll past.
 */
const pieceChips: Chip[] = [
  { id: 'reviews', label: 'What reviews say?' },
  { id: 'vermeil', label: "What's 18k vermeil?" },
  { id: 'tarnish', label: 'Does it tarnish?' },
  { id: 'care', label: 'How to care for it' },
];

export const productDetail = {
  materialLabel: 'Material',
  addToBag: 'Add to bag',
  added: 'Added',
  reopen: 'Open details',
  /** Offered the moment a piece is opened, before anything has been asked. */
  chips: pieceChips,
} as const;

/* ==========================================================================
 * THE CONVERSATION ABOUT A PIECE
 *
 * Each entry is one thing the shopper can ask and what comes back. An answer
 * is a few lines, and optionally a review to back it up and a piece to offer
 * on the end of it.
 *
 * Adding a question means adding an entry here. Nothing else changes.
 * ========================================================================== */

/** A quoted review, shown whole under the answer that summarised it. */
export type Review = {
  author: string;
  rating: number;
  title: string;
  body: string;
};

/** A single piece offered inside an answer. */
export type Offer = {
  id: string;
  name: string;
  price: number;
  /** Shown under the name where the material is the point. */
  note?: string;
  image: string;
};

export type Answer = {
  id: string;
  /** What the shopper asks, in their own words. */
  question: string;
  /** The answer, one paragraph per line. */
  lines: readonly string[];
  review?: Review;
  /** A last line after the review, turning the answer into a next step. */
  closing?: string;
  offer?: Offer;
  /** What to offer next, once this answer has been given. */
  chips: Chip[];
};

const careKit: Offer = {
  id: 'care-kit',
  name: 'Jewelry Care Kit',
  price: 28,
  image: asset('/brand/products/care-kit.png'),
};

export const answers: Answer[] = [
  {
    id: 'vermeil',
    question: "What's vermeil? Is that real gold?",
    lines: [
      'Yes. Real 18k gold, over solid recycled sterling silver. No brass.',
      "That's five times the plating on most gold-plated jewelry. It won't flake or turn your skin green, and it's safe for sensitive ears and necks.",
    ],
    chips: [
      { id: 'tarnish', label: 'Does it tarnish?' },
      { id: 'reviews', label: 'What reviews say?' },
      { id: 'others', label: 'Show me other products' },
    ],
  },
  {
    id: 'tarnish',
    question: 'Does it tarnish?',
    lines: [
      'Eventually, yes — but wearing it often actually slows that down. Polishing restores it fully.',
      'Reviewer Priya wore hers daily for a year and expected it to go dull. It didn\'t. She takes it off for showers and wipes it with a cloth now and then, and she says it still looks like the day she got it.',
    ],
    review: {
      author: 'Priya K.',
      rating: 4.9,
      title: 'Wore it every day for a year',
      body: "Honestly expected it to go dull by now. It hasn't. I take it off for showers and that's about it — the odd wipe with the cloth it came with. Still looks like the day I got it.",
    },
    closing: 'Want me to add a care kit so it stays that way, or show you this one in solid gold?',
    offer: careKit,
    chips: [
      { id: 'add-both', label: 'Add necklace to bag', primary: true, voice: true },
      { id: 'solid-gold', label: 'Show solid gold' },
      { id: 'more-reviews', label: 'What other reviewers say?' },
    ],
  },
];

/** Marks on a review card. */
export const reviewCopy = {
  verified: 'Verified Buyer',
  more: 'Read More',
} as const;

/** The button on an offered piece. */
export const offerCopy = {
  add: 'Add',
  added: 'Added',
} as const;

/* ==========================================================================
 * THE BAG
 *
 * Adding does not open a drawer over the conversation. The bag arrives as the
 * next thing said, and the conversation carries on underneath it.
 * ========================================================================== */

const bagChips: Chip[] = [
  { id: 'checkout', label: 'Check out', primary: true, voice: true },
  { id: 'browse', label: 'Keep browsing' },
];

export const bag = {
  /** Spoken by the shopper to put both things in at once. */
  command: 'Add necklace and care kit to cart',

  /** Said as they land. The two names are emphasised where they appear. */
  confirmation: {
    lead: '',
    first: 'Floating Sapphire Necklace',
    join: ' and ',
    second: 'Jewelry Care Kit',
    tail: ' added to your bag.',
  },

  lines: {
    subtotal: 'Bag Subtotal',
    shipping: 'Shipping',
    shippingValue: 'Calculated at checkout',
    total: 'Estimated total',
  },

  checkOut: 'Check out',

  /** What is in it. Prices are the real ones. */
  items: [
    {
      id: 'floating-sapphire',
      name: 'Floating Sapphire Necklace',
      price: 188,
      image: asset('/brand/products/open-floating-sapphire.png'),
    },
    {
      id: 'care-kit',
      name: 'Jewelry Care Kit',
      price: 28,
      image: asset('/brand/products/care-kit.png'),
    },
  ],

  chips: bagChips,
} as const;

/** ---------------------------------------------------------- STYLE WITH ---
 * The upsell, earned by what is already in the bag rather than by a rule.
 */
export const styleWith = {
  label: 'Style with',
  prompt: 'The Floating Sapphire goes really well with these. Wanna make it a kit?',
  piece: {
    id: 'tube-huggie-hoops',
    name: 'Tube Huggie Hoops',
    price: 98,
    note: '18k Gold Vermeil',
    image: asset('/brand/products/tube-huggie-hoops.png'),
  } satisfies Offer,
} as const;

/* ==========================================================================
 * CHECKOUT
 *
 * Everything is already known, so nothing is asked. The assistant states the
 * address, the delivery and the card, and the only thing left to do is the
 * one thing that cannot be undone.
 * ========================================================================== */

export const checkout = {
  command: 'Check out to my Brooklyn address',

  /** Said back, with the two facts worth checking set in bold. */
  summary: {
    lead: 'Going to your ',
    place: 'Brooklyn',
    middle: ' address, arriving Thursday with free shipping. Paying with the ',
    card: 'Visa ending 4419',
    tail: '.',
  },

  lines: {
    total: 'Total',
    items: '2 items',
    shipping: 'Shipping',
    shippingValue: 'Free',
    grandTotal: 'Total',
  },

  pay: 'Swipe to pay',
} as const;

/* ==========================================================================
 * AFTER IT IS PAID
 * ========================================================================== */

export const confirmation = {
  thanks: `Thank you, ${shopper.firstName}!`,
  lead: "Your order is confirmed. We've sent a receipt to ",
  email: 'norawhitfield@gmail.com',
  tail: " and you'll get tracking as soon as it ships.",
  order: {
    number: 'Order #48210',
    arriving: 'Arriving Thu, Sep 3',
  },
  chips: [{ id: 'notify', label: 'Text me when it ships' }] as Chip[],
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
