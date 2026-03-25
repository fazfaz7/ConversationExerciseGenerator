import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { draft, grammarTopic } = await req.json();

    if (!draft || !grammarTopic) {
      return NextResponse.json(
        { error: "draft and grammarTopic are required." },
        { status: 400 }
      );
    }

    const reviewPrompt = `You are a Spanish teacher creating a fill-in-the-blank exercise from a dialogue.

Grammar topic: "${grammarTopic}"

First, internally determine which category this topic belongs to (do not write this in your output):
- CATEGORY A (verb conjugation): the student must fill in a conjugated verb form. Examples: pretérito indefinido, imperfecto de subjuntivo, presente indicativo, copretérito, condicional, etc.
- CATEGORY B (other grammar): the student must fill in a non-verb word or choose between options. Examples: por vs para, objeto directo (lo/la/los/las/me/te/se), ser vs estar, diminutivos, etc.

Your tasks:
1. Write a short creative title in Spanish (3–6 words). Start with "TITLE:".
2. Replace words in the dialogue that are examples of "${grammarTopic}" with numbered blanks: ____[1], ____[2], etc.

CATEGORY A rules (verb conjugation topics):
- Only blank a verb if it is conjugated in exactly "${grammarTopic}" and no other tense. For each verb, ask: "Is this conjugated specifically in ${grammarTopic}?" If not a clear yes, leave it.
- Never blank infinitives (hablar), past participles (hablado), gerunds (hablando), or verbs in any other tense.
- Never blank an auxiliary verb that is part of a compound form (e.g. "hubiera" in "hubiera gustado", "había" in "había comido"). If a compound form somehow appears, skip the entire thing.
- Always add the infinitive in parentheses after every blank, no exceptions: ____[1] (hablar). If a blank is missing its infinitive hint, the exercise is broken.
- If the verb is reflexive, use the reflexive infinitive: ____[1] (levantarse), ____[2] (ducharse)
- If a pronoun is attached to the verb ("encontrarlo", "decirme"), blank the full word and put the base infinitive in the hint: ____[1] (encontrar). The answer is the full word as written ("encontrarlo").

CATEGORY B rules (non-verb topics):
- Only blank words that are a direct example of "${grammarTopic}". No parentheses.
- If a pronoun is attached to a verb ("encontrarlo", "decirle") and the topic is about pronouns, blank the entire word. The answer is the full word as written.
- Do not blank words inside fixed expressions (por favor, por supuesto, por ejemplo, para nada, para siempre, etc.)

Default for both categories: do NOT blank. Only blank when certain.

3. Write an answer key: [1] answer — brief note

Output format:
TITLE: [title]

[dialogue with blanks]

ANSWER KEY
[1] answer — brief note

---
${draft}`;

    const second = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: reviewPrompt }],
      temperature: 0.1,
      max_tokens: 2000,
    });
    const raw = second.choices[0]?.message?.content ?? draft;

    // Parse title
    const titleMatch = raw.match(/^TITLE:\s*(.+)/m);
    const title = titleMatch?.[1]?.trim() ?? "";
    const dialogue = raw.replace(/^TITLE:\s*.+\n?/m, "").trim();

    return NextResponse.json({ dialogue, title });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
