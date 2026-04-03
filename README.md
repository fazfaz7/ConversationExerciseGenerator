# Blanky

A Spanish fill-in-the-blank exercise generator for language tutors. Paste in a situation and grammar topic, and Blanky produces a natural dialogue with strategically placed blanks and an answer key — ready to share with students.

## Features

- Two-pass GPT-4o pipeline: first generates a natural conversation, then places blanks on words that demonstrate the target grammar
- Supports 5 dialects: Neutral, Mexican, Spain, Argentine, Colombian
- Levels: Beginner, Intermediate, Advanced, Expert
- Optional custom character names (falls back to random Spanish names)
- Accent-insensitive answer checking
- Student view at `/student` — shareable via localStorage handoff
- PDF export of the exercise

## Stack

- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS v4 + shadcn/ui
- OpenAI GPT-4o via the official SDK

## Getting Started

### Prerequisites

- Node.js 18+
- An OpenAI API key

### Setup

```bash
npm install
```

Create a `.env.local` file in the project root:

```
OPENAI_API_KEY=your_key_here
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. Fill in the situation, grammar topic, level, dialect, and optional character names
2. Blanky calls `/api/generate` to write a complete natural dialogue
3. Then calls `/api/blanks` to select 4–6 words that clearly demonstrate the grammar topic and replace them with numbered blanks (`____[1]`, `____[2]`, etc.)
4. Conjugation topics include an infinitive hint: `____[1] (estar)`
5. An answer key is generated with grammar notes for each blank

## Project Structure

```
app/
  page.tsx              # Main UI (centered → split layout after generation)
  student/page.tsx      # Student-facing exercise view
  api/
    generate/route.ts   # Pass 1 — natural dialogue generation
    blanks/route.ts     # Pass 2 — blank placement
components/
  GeneratorForm.tsx     # Form (centered and sidebar variants)
  DialogueOutput.tsx    # Interactive exercise renderer
lib/
  prompt.ts             # Builds the Pass 1 user prompt
  options.ts            # Level and dialect dropdown data
  names.ts              # Spanish name pool + pickTwoNames()
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```
