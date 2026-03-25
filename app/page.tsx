"use client";

import { useState } from "react";
import GeneratorForm, { FormValues } from "@/components/GeneratorForm";
import DialogueOutput from "@/components/DialogueOutput";

type Status = "writing" | "blanks" | "reblanking" | null;

const FLOATING_EMOJIS = [
  { emoji: "🇪🇸", top: "8%",  left: "4%",   rotate: -15, size: "2.5rem", delay: "0s"    },
  { emoji: "✏️",  top: "24%", left: "2%",   rotate: 8,   size: "2rem",   delay: "1.2s"  },
  { emoji: "💬",  top: "44%", left: "6%",   rotate: -8,  size: "3rem",   delay: "0.4s"  },
  { emoji: "📝",  top: "62%", left: "3%",   rotate: 12,  size: "2rem",   delay: "2s"    },
  { emoji: "⭐",  top: "78%", left: "8%",   rotate: -5,  size: "2.2rem", delay: "0.8s"  },
  { emoji: "🎓",  top: "90%", left: "5%",   rotate: 20,  size: "1.8rem", delay: "1.6s"  },
  { emoji: "🌟",  top: "15%", left: "14%",  rotate: -10, size: "1.6rem", delay: "2.4s"  },
  { emoji: "🎵",  top: "55%", left: "14%",  rotate: 6,   size: "1.6rem", delay: "0.6s"  },
  { emoji: "📖",  top: "10%", right: "5%",  rotate: 12,  size: "2.2rem", delay: "1.8s"  },
  { emoji: "🌮",  top: "26%", right: "3%",  rotate: -10, size: "2rem",   delay: "0.3s"  },
  { emoji: "🎉",  top: "45%", right: "7%",  rotate: 6,   size: "2.8rem", delay: "1s"    },
  { emoji: "💡",  top: "62%", right: "4%",  rotate: -18, size: "2rem",   delay: "2.2s"  },
  { emoji: "🗣️", top: "76%", right: "9%",  rotate: 9,   size: "2.5rem", delay: "0.5s"  },
  { emoji: "🌎",  top: "88%", right: "6%",  rotate: -6,  size: "2rem",   delay: "1.4s"  },
  { emoji: "🍕",  top: "18%", right: "14%", rotate: 15,  size: "1.8rem", delay: "0.9s"  },
  { emoji: "☀️",  top: "6%",  right: "22%", rotate: 5,   size: "1.8rem", delay: "1.7s"  },
  { emoji: "🍦",  top: "93%", right: "20%", rotate: -12, size: "1.8rem", delay: "2.6s"  },
  { emoji: "🎈",  top: "4%",  left: "22%",  rotate: -5,  size: "1.8rem", delay: "0.2s"  },
];

export default function Home() {
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    level: string;
    dialect: string;
    speakerA: string;
    speakerB: string;
    grammarTopic: string;
    title: string;
  } | null>(null);
  const [lastValues, setLastValues] = useState<FormValues | null>(null);
  const [generationKey, setGenerationKey] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);

  const hasStarted = dialogue !== null || status !== null || error !== null;
  const loading = status === "writing" || status === "blanks";

  async function runBlanks(currentDraft: string, grammarTopic: string): Promise<{ dialogue: string; title: string }> {
    const res = await fetch("/api/blanks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft: currentDraft, grammarTopic }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Something went wrong");
    return { dialogue: data.dialogue, title: data.title ?? "" };
  }

  function extractNamesFromSituation(situation: string): [string, string] | null {
    const m = situation.match(/\b([A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+)\s+(?:and|y)\s+([A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+)\b/);
    if (m) return [m[1], m[2]];
    return null;
  }

  async function handleGenerate(values: FormValues) {
    setLastValues(values);

    if (!hasStarted) {
      setIsLeaving(true);
      await new Promise((r) => setTimeout(r, 270));
    }

    setStatus("writing");
    setIsLeaving(false);
    setError(null);
    setDialogue(null);
    setDraft(null);

    const extracted = extractNamesFromSituation(values.situation);
    const [extractedA, extractedB] = extracted ?? ["", ""];

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: values.situation,
          grammarTopic: values.grammarTopic,
          level: values.level,
          dialect: values.dialect,
          speakerA: extractedA,
          speakerB: extractedB,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      const newDraft = data.draft;
      const speakerA = data.speakerA;
      const speakerB = data.speakerB;
      setDraft(newDraft);

      setStatus("blanks");
      const { dialogue: finalDialogue, title } = await runBlanks(newDraft, values.grammarTopic);
      setDialogue(finalDialogue);
      setMeta({ level: values.level, dialect: values.dialect, speakerA, speakerB, grammarTopic: values.grammarTopic, title });
      setGenerationKey((k) => k + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setStatus(null);
    }
  }

  async function handleRegenerateBlanks() {
    if (!draft || !meta) return;
    setStatus("reblanking");
    setError(null);
    try {
      const { dialogue: finalDialogue, title } = await runBlanks(draft, meta.grammarTopic);
      setDialogue(finalDialogue);
      setMeta((prev) => prev ? { ...prev, title } : prev);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setStatus(null);
    }
  }

  // ── Initial centered view ──────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-140px] left-[-120px] w-[600px] h-[600px] rounded-full bg-blue-300/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-80px] w-[480px] h-[480px] rounded-full bg-indigo-300/25 blur-3xl pointer-events-none" />
        <div className="absolute top-[35%] right-[6%] w-[220px] h-[220px] rounded-full bg-blue-200/40 blur-2xl pointer-events-none" />

        {/* Floating emojis */}
        <style>{`@keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }`}</style>
        {FLOATING_EMOJIS.map(({ emoji, top, left, right, rotate, size, delay }) => (
          <span
            key={emoji + top}
            className="absolute pointer-events-none select-none opacity-50"
            style={{ top, left, right, fontSize: size, rotate: `${rotate}deg`, animation: `floaty 3.5s ease-in-out infinite`, animationDelay: delay }}
          >
            {emoji}
          </span>
        ))}

        {/* Logo + heading */}
        <div className={`flex flex-col items-center mb-7 relative transition-opacity duration-200 ${isLeaving ? "opacity-0" : "opacity-100"}`}>
          <div className="mb-5 relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-300/60">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="9" y1="10" x2="15" y2="10" />
                <line x1="9" y1="13.5" x2="12" y2="13.5" />
              </svg>
            </div>
            <span className="absolute -top-1.5 -right-1.5 text-xl select-none">✨</span>
          </div>

          <h1 className="text-5xl font-black tracking-tight mb-2">
            <span className="text-slate-800">Blan</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ky</span>
          </h1>
          <p className="text-slate-500 text-[15px] text-center max-w-[300px] leading-relaxed">
            Personalized Spanish exercises for your students — generated in seconds
          </p>
        </div>

        {/* Form card */}
        <div className={`w-full max-w-xl bg-white rounded-3xl shadow-2xl shadow-blue-200/40 overflow-hidden border border-blue-100/60 relative ${isLeaving ? "animate-card-exit" : ""}`}>
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="p-8">
            <GeneratorForm onGenerate={handleGenerate} loading={false} variant="centered" />
          </div>
        </div>

        <p className={`text-xs text-slate-400 mt-7 relative transition-opacity duration-150 flex items-center gap-2 ${isLeaving ? "opacity-0" : "opacity-100"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          by Adrián Faz · Powered by GPT-4o
        </p>
      </div>
    );
  }

  // ── Split view ─────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen">
      {/* Left sidebar */}
      <aside className="animate-split-enter w-96 shrink-0 sticky top-0 h-screen overflow-y-auto bg-white border-r border-slate-100 flex flex-col p-8 gap-7 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-200">
            B
          </div>
          <div>
            <span className="text-base font-bold text-slate-800 tracking-tight">Blanky</span>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Spanish exercise generator</p>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Sidebar form */}
        <GeneratorForm
          key={generationKey}
          onGenerate={handleGenerate}
          loading={loading}
          variant="sidebar"
          initialValues={lastValues ?? undefined}
        />

        {/* Currently practicing */}
        {meta && (
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 space-y-1.5">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Practicing</p>
            <p className="text-sm font-semibold text-blue-800 leading-snug">{meta.grammarTopic}</p>
            <p className="text-xs text-blue-400">{meta.speakerA} &amp; {meta.speakerB}</p>
          </div>
        )}


        <div className="mt-auto flex items-center justify-center gap-1.5 text-[10px] text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Powered by GPT-4o
        </div>
      </aside>

      {/* Right main panel */}
      <main
        className="animate-split-enter flex-1 overflow-y-auto bg-[#F4F6FF] bg-dot-grid p-8 flex flex-col"
        style={{ animationDelay: "80ms" }}
      >
        {loading && (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-xl">✏️</div>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <span className={`flex items-center gap-1.5 ${status === "writing" ? "text-slate-800" : "text-slate-300"}`}>
                {status === "writing" && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                Writing conversation
              </span>
              <span className="text-slate-200">→</span>
              <span className={`flex items-center gap-1.5 ${status === "blanks" ? "text-slate-800" : "text-slate-300"}`}>
                {status === "blanks" && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                Adding blanks
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-3">Usually takes 10–15 seconds</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-5 text-center max-w-md mx-auto">
            <p className="text-red-500 font-semibold text-sm">Something went wrong</p>
            <p className="text-red-400 text-xs mt-1">{error}</p>
          </div>
        )}

        {dialogue && meta && !loading && (
          <div className="max-w-3xl w-full mx-auto space-y-3">
            {meta.title && (
              <h2 className="text-lg font-bold text-slate-700 px-1 tracking-tight">
                {meta.title}
              </h2>
            )}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-6 border border-slate-100/80">
              <DialogueOutput
                raw={dialogue}
                level={meta.level}
                dialect={meta.dialect}
                speakerA={meta.speakerA}
                speakerB={meta.speakerB}
                title={meta.title}
                topic={meta.grammarTopic}
                autoReveal
              />
            </div>

            {/* Open student view */}
            <button
              onClick={() => {
                const key = `cc_${Date.now()}`;
                localStorage.setItem(key, JSON.stringify({
                  raw: dialogue,
                  level: meta.level,
                  dialect: meta.dialect,
                  speakerA: meta.speakerA,
                  speakerB: meta.speakerB,
                }));
                window.open(`/student?key=${key}`, "_blank");
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold py-4 transition-all shadow-lg shadow-blue-200/60"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open Student View
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
