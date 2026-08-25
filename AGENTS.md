# AGENTS.md

Instructions for AI agents working in this repository.

## What this is

A self-contained, high-fidelity working prototype of a conversational and visual shopping
assistant for a jewelry storefront. It exists to be presented to executives, and to be iterated
on heavily until it reaches the right level of polish.

It is a **design concept**, not a production system and not an affiliated product. Nothing here
connects to a real store, real customer data, or a real commerce backend. All product data,
copy and imagery in this repo are for demonstration only.

## What this repo must never contain

This repository is public. Everything committed here is shareable. Never add:

- Personal names, contact details, or identifying information about anyone involved
- Company-internal documents, strategy, meeting notes, or client relationships
- Absolute local filesystem paths, machine names, or usernames
- API keys, tokens, account identifiers, widget IDs, or store IDs of any kind — including any
  discovered by inspecting a live website
- Links to private files, internal wikis, design files, or ticket trackers
- Working notes, memory files, ADRs, or research belonging to the parent project

If a piece of context is needed to do the work but cannot be published, it stays outside this
repo. Reference it by description, never by name or link.

## Build principles

- **High fidelity.** This is shown to executives. Every screen should look finished.
- **Polished interaction.** Macro transitions and micro-interactions are the product here, not
  decoration. Motion should feel considered and intentional.
- **Self-contained.** It runs from this repo alone, with no external services, no network calls,
  and no credentials. Data is local and static.
- **Built for iteration.** Expect constant change. Keep components small and content separated
  from layout and logic, so a copy change or a flow change never requires a rewrite.
- **YAGNI.** Build only what has been asked for. No speculative abstractions, no unused
  configuration, no features nobody requested.

## Working style

The person directing this work is a **product manager, not a developer**. Therefore:

- Report in outcomes, not implementation. "The vibe picker now animates between steps," not a
  description of the state machine behind it.
- Do not surface technical decisions that do not change what they see. Choose sensibly and move.
- When something is genuinely their call, ask in plain language with a recommendation attached.
- When asked to generate content, give the output directly with no preamble or rationale.
- Never require them to run a build step to see a change described as done. Verify it yourself.

## Stack

Vite · React · TypeScript · Tailwind CSS · Motion (for animation).

Chosen because it starts instantly, hot-reloads on every edit, builds to a static folder that
can be opened or hosted anywhere, and has no server requirement.
