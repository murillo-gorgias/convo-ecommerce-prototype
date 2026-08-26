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
| `betweenSections` | 950 | A section goes quiet, before the next one appears |
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
| `piece` | A recommended piece arriving in the carousel | Gap between them is `stagger.slow` |
| `shimmer` | Light travelling across text while the account opens | |
| `unlockMark` | A shape that opens, turns and closes again beside it | Door, to circle, to door |

**Two numbers outside this file**, both at the top of `Session.tsx`:

- `CLEAR_TIME` — how long unchosen images take to clear before the fold. 280ms.
- `ACKNOWLEDGE_TIME` — how long a one-answer section stays open after being tapped, so the
  tap is seen before the section closes over it. 460ms.

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
