# Conversational Commerce Prototype

A working prototype of a shopping assistant that helps people discover jewelry through
contextual, visual and conversational guidance — closer to the help of an in-store associate
than to a chat window.

This is a **design concept built for demonstration**. It is not affiliated with, endorsed by,
or connected to any retailer. It uses no real customer data and makes no network calls. All
product information and imagery in this repository are illustrative.

## Running it

```
npm install
npm run dev
```

## What is built

- **Storefront** — announcement strip, header, navigation, a video hero and two campaign
  sections. Scrolls on its own and knows nothing about the assistant.
- **The assistant** — one element that morphs through every stage of the journey without ever
  being unmounted: a wide bar at rest, a circular button once you scroll, an open console when
  tapped, a sign-in sheet, and finally the full screen.
- **Voice** — plays a spoken query back as a live transcript, then shows the assistant thinking.
- **Signing in** — the assistant offers a trade rather than a demand: sign in and the answer
  gets personal. Declining costs nothing. Accepting plays the account opening.
- **The guided session** — one scrolling conversation that narrows before it recommends:

  | Section | Asks | How it is answered |
  |---|---|---|
  | Vibe check | What are you drawn to? | Eight photographs of people wearing things. Tap any number, then confirm |
  | Style check | What are you wearing? | Four necklines. One tap |
  | Sizing | Where should it sit? | Three lengths, each shown worn. One tap |
  | The perfect fit | — | Two pieces in a carousel, with price, rating, material and the bag |

  Once answered, a section folds into a single line and the images you chose travel into it, so
  you can always scroll back and see how you got here.

### Adding or removing a section

Every section owns one question and reports one answer. A new one — budget, delivery, gift
wrap — means adding its copy and images to `src/content/journey.ts` and rendering one more
section in `src/components/assistant/session/Session.tsx`. Nothing else changes, and removing
one works the same way.

## How it is organised

| Folder | Holds |
|---|---|
| `src/brand/` | Every colour, typeface and measurement |
| `src/content/` | Every word, image and section — the storefront in `store.ts`, the assistant's questions in `journey.ts` |
| `src/motion/` | Every animation — see [MOTION.md](MOTION.md) |
| `src/components/` | The components, which contain none of the above |

Swapping in a different brand means changing `src/brand/` and `src/content/`. The experience
itself does not change.
