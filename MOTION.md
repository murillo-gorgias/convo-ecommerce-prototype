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

## Shop the look — the answer

Grouped under `moves.shopTheLook`. Three things arrive in order, and the order is the point.

| Name | What you see | Notes |
|---|---|---|
| *(the container's own morph)* | The console grows to fill the screen | Same `shapeChange` spring as every other shape change |
| `chrome` | Back button, wordmark and close fade down into place | 0.1s delay |
| `productCard` | Each piece rises and settles, one after another | Gap between them is `stagger.base`, applied where the cards render |
| `speech` | The assistant's line rises from the bottom | 0.55s delay, so it lands after the pieces have arrived |

**One number outside this file:** how long the assistant appears to think before the answer
arrives is `THINKING_TIME` at the top of `src/components/assistant/Assistant.tsx`. It is
currently 2200 milliseconds.

## Voice

Grouped under `moves.voice`.

| Name | What you see | Notes |
|---|---|---|
| `waveformBar` | The four bars rippling while listening | Each bar is offset from the last so they ripple rather than pump together |
| `transcript` | The spoken words appearing as a chip | |

## Thinking

The five thinking animations live in `src/components/assistant/thinking/variations.tsx`.
Each is a self-contained drawing, because its movement *is* the drawing. Compare them at
`/#thinking`; switch the one in use by changing `THINKING` at the bottom of that file.

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
