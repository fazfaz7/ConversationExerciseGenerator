export interface PromptParams {
  situation: string;
  grammarTopic: string;
  level: string;
  dialect: string;
  speakerA: string;
  speakerB: string;
}

export function buildPrompt({ situation, grammarTopic, level, dialect, speakerA, speakerB }: PromptParams): string {
  const dialectDescription = dialect === "Neutral"
    ? "neutral, standard (no regional slang — widely understood across all Spanish-speaking countries)"
    : dialect;

  const speakerLine = speakerA && speakerB
    ? `between ${speakerA} and ${speakerB}`
    : `between two people (choose two natural Spanish first names for them)`;

  return `Write a natural conversation in ${dialectDescription} Spanish ${speakerLine} about the following situation: ${situation}.

The conversation must naturally and repeatedly use "${grammarTopic}" — this is the grammar structure the student is practicing, so it should appear throughout the dialogue wherever it genuinely fits. Do not force it, but do not avoid it either. Every word must be written out fully — no blanks, no gaps, no placeholders.

Important: use simple, standalone forms of the grammar topic. Avoid compound verb constructions (haber + participio, like "hubiera gustado", "había comido", "he trabajado") — prefer simple conjugated forms instead.

Level: ${level}. Beginner: simple vocabulary, short sentences. Intermediate: everyday vocabulary with some complex structures. Advanced: rich vocabulary, idiomatic expressions. Expert: sophisticated near-native register.

Format:
- ${speakerA} and ${speakerB} alternate turns (8–12 exchanges total)
- Label each turn "${speakerA}:" or "${speakerB}:"
- Plain dialogue only — no commentary, no preamble

Start directly with "${speakerA}:".`;
}
