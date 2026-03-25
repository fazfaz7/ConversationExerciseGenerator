import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildPrompt } from "@/lib/prompt";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { situation, grammarTopic, level, dialect, speakerA, speakerB } = await req.json();

    if (!situation || !grammarTopic || !level || !dialect) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const nativeSpeakerSystem = dialect === "Neutral"
      ? `You are a native Spanish speaker who grew up speaking Spanish at home. You write dialogue exactly the way real people talk — the words they actually choose, the contractions they use, the way they shorten things in real conversation. You never default to textbook-safe vocabulary when a more natural word exists. For example, you would never write "fue" when "estuvo" is what a native speaker would actually say in context. You think in Spanish first, not in English translated to Spanish.`
      : `You are a native ${dialect} Spanish speaker who grew up speaking Spanish at home. You write dialogue exactly the way real ${dialect} Spanish speakers talk — the words they actually choose, the expressions specific to ${dialect} Spanish, the way they shorten things in real conversation. You never default to textbook-safe vocabulary when a more natural word exists. For example, you would never write "fue" when "estuvo" is what a native speaker would actually say in context. You think in Spanish first, not in English translated to Spanish.`;

    const prompt = buildPrompt({ situation, grammarTopic, level, dialect, speakerA, speakerB });

    const first = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: nativeSpeakerSystem },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });
    const draft = first.choices[0]?.message?.content ?? "";

    // Parse the two speaker names from the generated dialogue
    const nameMatches = [...draft.matchAll(/^([A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+):/gm)];
    const uniqueNames = [...new Set(nameMatches.map((m) => m[1]))];
    const resolvedA = uniqueNames[0] ?? speakerA ?? "A";
    const resolvedB = uniqueNames[1] ?? speakerB ?? "B";

    return NextResponse.json({ draft, speakerA: resolvedA, speakerB: resolvedB });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
