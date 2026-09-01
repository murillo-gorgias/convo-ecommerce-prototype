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
  | The perfect fit | Which one? | Four pieces as photographs, with a name, a price and one line saying why |

  Once answered, a section folds into a single line and the images you chose travel into it, so
  you can always scroll back and see how you got here.

- **One piece, opened** — tapping a piece clears the other three away, then grows that
  photograph to the full width of the conversation. Its photographs are swiped through with
  a finger or dragged with a mouse. It shows the name, the price, the rating, the material and the bag, and
  nothing else. Everything a product page stacks up below the fold — what it is made of,
  whether it tarnishes, what buyers said — is asked for instead, and the answer arrives as a
  reply underneath. An answer arrives in parts — the summary types out, then a quoted review
  settles in as evidence, then a closing line, then the piece that line points at. Nothing
  composite ever appears whole.

- **Speaking** — asking what vermeil is, putting both pieces in the bag and checking out are
  all said rather than pressed. The suggestion stays on screen as a prompt, the microphone
  takes a slow pulse, and pressing it plays the command into the input as a live transcript
  before anything happens.

- **The bag** — no drawer over the conversation. What went in is said, shown as a card, and
  the thread carries on beneath it, with one piece suggested that goes with what is already
  there.

- **Checkout** — the address, the delivery and the card are already known, so nothing is
  asked. The assistant states them, and paying is a swipe: the only deliberate gesture in the
  session, for the only thing that cannot be undone.

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

Review surfaces sit outside the journey. `/#thinking` compares the thinking animations. The
rest are checkpoints into the session, each starting with everything before it already
answered, so one part can be watched without replaying the whole thing:

| Route | Starts at |
|---|---|
| `#session` | The greeting — the whole session |
| `#vibe` | The first question |
| `#product` | The four recommended pieces |
| `#reviews` | The answer that quotes a review, with its filters untouched |
| `#cart` | The bag, with a piece already asked about and added |
| `#checkout` | The total and the swipe |

On a wide enough window a rail beside the phone lists these and jumps between them. It sits
outside the frame because it is presentation dressing, not part of what is being designed.
Picking the checkpoint you are already on runs it again; picking the storefront while on it
does nothing, because the storefront is the live journey rather than a paced section.

Everything above the checkpoint you land on arrives finished rather than replaying, so only
the part being worked on is moving.

Swapping in a different brand means changing `src/brand/` and `src/content/`. The experience
itself does not change.
