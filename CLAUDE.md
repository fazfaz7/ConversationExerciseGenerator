@AGENTS.md

# Blanky — Project Guide

## What this is
A Next.js app for Adrian Faz, a Preply Spanish tutor. Generates fill-in-the-blank Spanish dialogue exercises using a two-pass GPT-4o pipeline. Tutors configure a situation, grammar topic, level, dialect, and optional character names — the app produces a ready-to-use exercise with blanks and an answer key.

## Stack
- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS v4 + shadcn/ui components
- OpenAI GPT-4o via the official SDK
- No database — stateless, localStorage only for student view handoff

## Architecture

### Two-pass generation pipeline
1. **Pass 1** — `POST /api/generate` — builds a natural, complete Spanish conversation with no blanks (temp 0.8). Uses a dialect-aware native-speaker system prompt.
2. **Pass 2** — `POST /api/blanks` — takes the draft and places 4–6 blanks on words that clearly demonstrate the grammar topic (temp 0.1).

The frontend calls them sequentially, updating a `status` state between calls to show live progress ("Writing conversation → Adding blanks").

### Key files
| File | Role |
|---|---|
| `app/page.tsx` | Main UI — centered initial view, split view after generation |
| `app/student/page.tsx` | Student-facing exercise view (reads from localStorage) |
| `app/api/generate/route.ts` | Pass 1 — natural dialogue generation |
| `app/api/blanks/route.ts` | Pass 2 — blank placement |
| `components/GeneratorForm.tsx` | Form with two variants: `centered` (initial) and `sidebar` (split view) |
| `components/DialogueOutput.tsx` | Interactive exercise renderer — blanks, checking, reveal, PDF export |
| `lib/prompt.ts` | Builds the Pass 1 user prompt |
| `lib/options.ts` | Level and dialect dropdown data |
| `lib/names.ts` | Pool of Spanish names + `pickTwoNames()` |

### Layout flow
- **No generation yet** → full-screen centered form (gradient background, animated card exit on submit)
- **After generation** → split layout: sidebar (w-96) with form + actions on the left, dialogue card on the right with dot-grid background
- **Student view** → `/student?key=cc_...` reads dialogue from localStorage (deleted after read), shows a fun gradient header with "¡A practicar!"

## Form fields
- Situation (textarea)
- Grammar topic (text input)
- Characters — optional; if both filled, used as speaker names; otherwise two random Spanish names are picked
- Level: Beginner / Intermediate / Advanced / Expert
- Dialect: Neutral / Mexican / Spain / Argentine / Colombian

## Conventions
- Blank format in output: `____[1]`, `____[2]` etc. Conjugation topics get an infinitive hint: `____[1] (estar)`
- Answer key format: `[1] answer — brief grammar note`
- Accent-insensitive answer checking (NFD normalize + strip diacritics)
- App name: **Blanky** — logo mark is "B" with a blue-to-indigo gradient
