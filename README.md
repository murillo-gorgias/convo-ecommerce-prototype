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
- **The assistant** — one element that morphs between three shapes: a wide bar at rest, a
  circular button once you scroll, and an open console when tapped. Voice input plays back a
  spoken query as a live transcript, then shows the assistant thinking.

## How it is organised

| Folder | Holds |
|---|---|
| `src/brand/` | Every colour, typeface and measurement |
| `src/content/` | Every word, image and section of the storefront |
| `src/motion/` | Every animation — see [MOTION.md](MOTION.md) |
| `src/components/` | The components, which contain none of the above |

Swapping in a different brand means changing `src/brand/` and `src/content/`. The experience
itself does not change.
