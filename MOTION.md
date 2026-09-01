# Animation map

Every animation in the prototype, what it does, and the exact name to change it by.
All of them live in one file: **`src/motion/motion.ts`**.

Nothing animates using a number written inside a component. If you want something to move
differently, you change it here and it changes everywhere it is used.

---

## The four dials

Before the named animations, four sets of values that everything else is built from.
Changing one of these changes the feel of the whole prototype at once.

### `duration` — how long something takes

| Name | Seconds | Used for |
|---|---|---|
| `instant` | 0.15 | A colour shift you should barely register |
| `quick` | 0.25 | Small state changes — a tap response, an icon swap |
| `base` | 0.4 | **The standard.** Most things use this |
| `considered` | 0.6 | Larger surfaces arriving — the console opening |
| `unhurried` | 1.0 | **The conversation's own pace.** Anything arriving in the thread |
| `cinematic` | 0.9 | First-impression moments only |

### `easing` — the character of the movement

This matters more than duration for how expensive something feels.

| Name | Character | Used for |
|---|---|---|
| `refined` | Leaves quickly, settles slowly and completely | **The house curve.** The default for everything |
| `even` | Symmetrical and calm | Crossfades, colour changes, slow drifts |
| `exit` | Starts gently, accelerates away | Things leaving the screen |
| `enter` | Arrives fast, decelerates into place | Things entering |

### `spring` — physics instead of a fixed time

Anything that changes **shape** uses a spring. It is what makes the morph read as one object
moving rather than two objects swapping.

| Name | Feel | Used for |
|---|---|---|
| `morph` | Firm, settles with no visible bounce | **The bar → pill → console morph** |
| `surface` | Softer, slower | Large surfaces settling |
| `control` | Crisp, immediate | Small controls responding to a press |

Each has three numbers: **stiffness** (higher is faster), **damping** (higher is less wobble),
**mass** (higher is heavier).

### `stagger` — the gap between items animating in sequence

| Name | Seconds | Feel |
|---|---|---|
| `tight` | 0.04 | Barely sequential |
| `base` | 0.08 | **The standard** — clearly sequential, not slow |
| `slow` | 0.14 | Deliberate, for something you want read |
| `deliberate` | 0.26 | One at a time. Each item lands before the next begins |

---

## The storefront

Grouped under `moves.store`.

| Name | What you see | Notes |
|---|---|---|
| `sectionReveal` | A section fades and lifts 24px as you scroll to it | Also used by the brand statement |
| `headlineWord` | Headline words rise into place one after another | "THE ESSENTIALS" sets word by word. Gap between words is `stagger.base` |
| `imageDrift` | Campaign photography slowly scales from 106% to 100% over 14 seconds | Deliberately too slow to notice. Set the transition duration higher to slow it, or delete the block to stop it |
| `announcementSwap` | The black strip rotates between messages | Messages themselves are in `src/content/store.ts` |

---

## The assistant

Grouped under `moves.assistant`. This is the part worth tuning most.

**The three shapes and how it moves between them:**

```
    BAR  ──scroll down──▶  PILL  ──tap──▶  CONSOLE
     ▲                       │                 │
     └──── scroll up ────────┘                 │
     └───────────── close ─────────────────────┘
```

| Name | What you see | Notes |
|---|---|---|
| `shapeChange` | **The morph.** The wide bar becoming the circle, and the circle becoming the console | The single most important transition. It is `spring.morph` — change that spring to change the whole feel |
| `firstAppearance` | The assistant rises into view half a second after the page loads | Change `delay` to make it arrive sooner or later |
| `contentSwap` | Text and icons crossfading as the shape changes | Deliberately faster than the morph so the contents never lag the container |
| `consoleContent` | The console's contents arriving after the container has opened | Has a 0.12s delay so the container finishes opening first |
| `scrim` | The soft dark wash over the store while the console is open | |
| `press` | Everything shrinks slightly when pressed | Uses `spring.control` |
| `pillPulse` | The slow breathing halo on the collapsed circle | Signals the assistant is awake. 2.8s cycle. Delete this to remove it entirely |

**One number outside this file:** how far you scroll before the bar collapses is
`COLLAPSE_AFTER` at the top of `src/components/assistant/Assistant.tsx`. It is currently
120 pixels.

---

## Pace — how long the assistant waits

Everything else in this file is about how things *move*. This is about the silence between
them, and it is the difference between a conversation and a page loading. All of it lives in
`pace`, in `src/motion/motion.ts`, in **milliseconds**.

Only one thing happens at a time. A section is not shown because the last one was answered —
it is shown because the last one **went quiet**.

| Name | ms | The wait it buys |
|---|---|---|
| `afterSaid` | 620 | The shopper's words land, before the assistant replies |
| `beforeSpeech` | 340 | A section appears, before it starts speaking |
| `afterSpeech` | 460 | A question finishes, before what it asks for arrives |
| `afterFold` | 700 | A section folds shut, before anything is said about it |
| `betweenParts` | 620 | Between the parts of one answer, or one block |
| `betweenRows` | 180 | Between the rows inside a card |
| `betweenSections` | 950 | A section goes quiet, before the next one appears |
| `beforeOpening` | 380 | A piece is tapped, before it opens out |
| `beforeCollapsing` | 900 | An answer finishes, before the piece it was about folds away |
| `speaking` | 1600 | A spoken command sits in the input, before it takes effect |
| `adding` | 1100 | The bag appears to work, before it says what it holds |
| `beforeExpanding` | 1500 | The account visibly opens, before the session takes the screen |

`beforeExpanding` is the longest wait in the prototype on purpose. It is the only moment the
shopper is asked to wait for something real, and the expansion that follows is the biggest
movement in the journey. Landing them on top of each other wastes both.

### Typing

The assistant types rather than pasting. A line that appears whole reads as a database
lookup; a line that arrives reads as a reply.

The speed per character is worked out **from the length of the line**, so a short line and a
long one take about the same time to say — `pace.typing.target` (1500ms), clamped between
`min` (9ms) and `max` (30ms) per character. Without that, the sizing prompt would hold the
shopper for five seconds while the vibe prompt flashed past.

The full line is rendered underneath at zero opacity, so a paragraph holds its final height
from the first character. Otherwise the whole conversation below would shunt down every time
a line wrapped onto a new row.

**Want the whole thing quicker for a demo?** Lower `pace.typing.target` and
`pace.betweenSections`. Those two carry most of the running time.

### Nothing composite arrives whole

The rule that matters most, and the one that keeps getting broken by accident:
**a block made of several things arrives one thing at a time.**

A full answer is often four things. It arrives like this:

    summary types ──▶ beat ──▶ review card ──▶ beat ──▶ closing types ──▶ beat ──▶ the piece offered

A card is several rows. It arrives like this:

    the line that introduces it types ──▶ card ──▶ row ──▶ row ──▶ row ──▶ button

Every gap between parts is `pace.betweenParts`; every gap between rows of a card is
`pace.betweenRows`. Both the bag and the checkout totals build themselves this way, and so
does the order confirmation.

Rendering a block whole reads as a page that was fetched. Building it reads as someone
working it out, which is the only thing separating this from a search result.

### The order a section arrives in

    label ──▶ beat ──▶ question types itself ──▶ beat ──▶ what it asks for
                                                            (tiles, carousel)

And on the way out:

    answered ──▶ unchosen clear ──▶ fold ──▶ beat ──▶ the assistant reacts ──▶ beat ──▶ next section

Anyone who has asked their system for less movement gets every line at once, with no typing.

## The guided session — the assistant's questions

Grouped under `moves.session`. The session is one scrolling conversation. Its movement
follows a single rule: a section **arrives** softly and **leaves by folding** into the one
line that records the answer. Nothing is ever thrown away on screen.

### The second fold — a piece giving way to the conversation about it

The pieces section folds like every other one, but it folds twice. Tapping a piece in the
grid grows **that exact photograph** to the full width of the conversation — `layoutId`
again, the same trick as the thumbnails. Then once an answer has been given, the piece stops
being the subject and folds to a single line with `Open details` on it, and tapping that
grows the same photograph back.

This is why the recommendation is a grid and not a carousel. In the carousel, swiping
sideways inside a piece moved through its photographs and swiping sideways outside it moved
to the next piece — the same gesture, two meanings, no way to tell them apart. A tap has
only one.

### The fold — the moment worth protecting

When a section is answered, the images the shopper chose do not fade out here and fade in
there. They **travel**, because Motion matches the same image across the change by its
`layoutId`. That is why the photograph the shopper picked is still the photograph sitting in
the record of the answer.

The fold happens in two beats, so it reads as deliberate rather than abrupt:

1. **Clear** — everything that was *not* chosen scales down and blurs away (`tileDiscard`).
2. **Fold** — the section collapses to a 72px row and the chosen images travel into it.

The gap between the two beats is `CLEAR_TIME` in `src/components/assistant/session/Session.tsx`,
currently 280 milliseconds.

| Name | What you see | Notes |
|---|---|---|
| `glow` | Two warm glows drifting behind the sheet | Very slow, 22–28s. Stops the surface reading flat |
| `said` | The shopper's own words settling in on the right | |
| `line` | A line the assistant speaks, rising slightly | |
| `label` | A section's small caps heading, letters settling inward | Starts wide-tracked and closes up |
| `section` | A whole new section arriving | |
| `tile` | One image tile settling in | Gap between them is `stagger.tight` |
| `tilePress` | The tile you are pressing | |
| `tileChoice` | A chosen image eases back very slightly | Makes room for the ring around it |
| `tileRing` | The ring marking a chosen tile | |
| `heartBeat` | The heart, at the moment it fills | A single beat, no bounce after |
| `tileDiscard` | An unchosen image clearing out as the section folds | Beat one of the fold |
| `fold` | The confirmed line taking the section's place | Beat two of the fold |
| `thumbTravel` | An image travelling into the confirmed line | The shared-layout transition |
| `tick` | The tick landing on a confirmed section | |
| `chip` | The suggestions above the input, arriving and leaving | |
| `piece` | A recommended piece arriving in the grid | Gap between them is `stagger.base` |
| `shimmer` | Light travelling across text while the account opens | |
| `unlockMark` | A shape that opens, turns and closes again beside it | Door, to circle, to door |
| `open` | A piece growing from its square in the grid to full width | The spring the photograph rides |
| `openDetail` | Name, price, rating and controls fading in around it | Deliberately behind the photograph |
| `collapsedPiece` | The piece folded back to one line with a way in | |
| `review` | A quoted review arriving under the answer | |
| `offer` | A piece offered inside an answer — the care kit, the pairing | |
| `working` | A ring turning while the bag is being worked out | |
| `card` | A white card: the bag, the totals, the order | |
| `cardRow` | One line inside a card, arriving after it | Delay applied where used |
| `badge` | The count landing on the bag button | |
| `swipeReturn` | The pay knob returning when the swipe was not carried through | |
| `swipeLabel` | The label dimming as the knob passes over it | |
| `swipeTrack` | The track turning from black to glass under the finger | Driven by how far the knob went, not a state flag |
| `chipRow` | The suggestion row fading in and out | Height is carried by the dock's own layout |
| `galleryFrame` | One photograph of an opened piece crossing to the next | |
| `galleryDot` | A pagination dot taking or losing the mark | |

**Three numbers outside this file**, all at the top of `Session.tsx`:

- `CLEAR_TIME` — how long unchosen images take to clear before the fold. 280ms.
- `ACKNOWLEDGE_TIME` — how long a one-answer section stays open after being tapped, so the
  tap is seen before the section closes over it. 460ms.
- `HEADER_CLEARANCE` — the room the floating header needs at the top of the thread. 104px.
  The column reserves it and the scroll lands on it, so it cannot be two numbers.

### Where the thread sits

`useFollowBottom` in `Session.tsx` is the only thing that scrolls. It watches the
conversation column and moves to the end whenever it grows. No section scrolls itself:
several sections each calling `scrollIntoView` is what buried arriving cards under the dock.

Two exceptions, both earned:

**A section too tall to fit is held by its top, not its bottom.** Holding the bottom works
only because a section fits on screen — hold the bottom and the question is still visible.
The vibe check is 1106px against a 945px viewport, so holding its bottom put the label 325px
above the top edge and opened it on the middle of a grid of photographs. Anything taller than
the viewport now rests with its top at `HEADER_CLEARANCE`, and is read from its question
down. It is the only section this applies to today.

**The first position is taken, not travelled to.** A checkpoint opens with its whole history
in place, and gliding two thousand pixels down through it is a journey nobody asked to watch.
Every scroll after the first one glides.

## Shapes morph. Text never does.

The rule that governs every transition in the session, and the one worth protecting hardest.

A layout animation works by measuring a box before and after, then scaling away the
difference. That is exactly right for a container changing shape — a card opening out, a
section folding to a line, the dock growing as suggestions arrive. It is exactly wrong for
anything inside it, because the scale lands on the contents too: words stretch and squash,
and icons sitting with words stretch with them.

So:

- **`layout`** goes on the thing whose shape genuinely changes — the photograph, the folded
  row, the dock, the bag button.
- **`Steady`** (in `parts.tsx`, a `layout="position"` wrapper) goes around every run of text
  and every icon that belongs to text inside one of those. It travels with its container and
  is never scaled by it.
- **Nothing at all** goes on a container that only grows downwards as content arrives — a
  section, an answer, the bag. Each part animates its own entrance, so there is no shape
  change to carry, and `layout` there would scale every word for no gain.

Verified by sampling: during the full collapse of an opened piece the photograph goes from
430×452 to 104×96, and the name beside it holds a transform of exactly `1.000 / 1.000` the
whole way.

## Stacked shapes

Wherever something sits inside something else — a photograph inside the line a section folded
into, the piece inside its collapsed card — three things hold:

- They are **inset** by `--stack-inset` on every side, so they never touch.
- Their corners are **concentric**: `--fold-inner-radius` is `--fold-radius` less the inset.
  Matching the radii exactly makes the inner shape look too round for its size; leaving them
  unrelated makes the pair look like a picture dropped in a box.
- They **align** — same treatment on every folded row, including the collapsed product card,
  which is built to the same rule rather than as its own shape.

All three values are tokens in `src/brand/tokens.css`.

### Four things that silently switch animations off

These caught us once each and are worth knowing before debugging a missing animation.

- **`initial={false}` on an `AnimatePresence`** suppresses the entrance of whatever mounts
  first. It made all four grid pieces appear at once instead of arriving in turn.
- **`mode="wait"` on an `AnimatePresence`** waits for the old child to leave before the new
  one arrives, so a shared `layoutId` has nothing to travel between. It made the opened piece
  snap shut rather than fold.
- **`layout` on a button** interpolates its box and scales the text with it. It is what made
  the suggestion labels squash and stretch. Chips do not use it.
- **`layout` on the thread** re-measures the whole column on every DOM change, so everything
  drifted while a line was being typed. The thread is a plain `div`; sections animate
  themselves.
- **Keeping an outgoing block in the flow** while the incoming one mounts puts both in the
  column at once. Opening a piece shoved the conversation down and then snapped it back. The
  pieces section renders exactly one of its three states and lets the shared `layoutId` carry
  the change.

### Opening a piece, in two beats

    tap ──▶ the other three clear ──▶ the one left morphs to full width

`pace.beforeOpening` is the gap. The tapped piece never moves during the first beat — it is
still exactly where it was — so the morph starts from where the finger landed.

Asking a question folds it the same way round: **the piece folds first, and the answer
follows**. Asking is the moment the conversation takes over from the photograph, so the
photograph gets out of the way before the words arrive rather than after them.

**And one in `SwipeToPay.tsx`:** `COMMIT` (0.72) — how far along the track counts as
carried through. Let go before that and the knob returns.

**And two in `Assistant.tsx`:** `THINKING_TIME` (2200ms) is how long the assistant appears to
think before it answers; `UNLOCK_TIME` (1900ms) is how long the account takes to open.

## Voice

Grouped under `moves.voice`.

| Name | What you see | Notes |
|---|---|---|
| `waveformBar` | The four bars rippling while listening | Each bar is offset from the last so they ripple rather than pump together |
| `transcript` | The spoken words appearing as a chip | |

## Thinking

The five thinking animations live in `src/components/assistant/thinking/variations.tsx`.
Each is a self-contained drawing, because its movement *is* the drawing. Compare them at
`/#thinking`; switch the one in use by changing `THINKING` at the bottom of that file, which
currently names `TwistChain`.

All five share one idea: the line changes shape while light travels through it. Never a
static track with something moving along it.

| Name | What you see |
|---|---|
| `Arc` | A straight line bows into a half circle, flattens, bows the other way |
| `Clasp` | The line closes into a ring, holds a beat, opens back out |
| `Ribbon` | A length of chain gathering into a wave, tilting as it goes |
| `Pendulum` | A short arc swinging on its centre while its curve deepens |
| `Loop` | The line folds into a knot, turns, then unfolds |

---

## Reduced motion

If someone has asked their operating system for less movement, almost all of it stops
automatically. Nothing needs to be done per animation.

---

## The rule of the house

Nothing snaps. Nothing bounces. Nothing overshoots enough to notice. Elegance here means
restraint — movement you feel rather than watch.
