"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEVELS, DIALECTS } from "@/lib/options";

const RANDOM_SITUATIONS = [
  "Two college friends reuniting at a café after one spent a semester abroad in Madrid",
  "A job interview at a tech startup in Mexico City",
  "Neighbors chatting while doing laundry in an apartment building",
  "Two coworkers venting about their boss during a lunch break",
  "A first date at a rooftop restaurant that goes surprisingly well",
  "A parent helping their teenager pick a university major",
  "Two friends debating whether to adopt a dog or a cat",
  "A patient explaining symptoms to their doctor at a clinic",
  "Roommates arguing (kindly) over whose turn it is to clean the apartment",
  "Two tourists getting completely lost in a city and asking locals for help",
  "A chef teaching their younger sibling how to cook their grandmother's recipe",
  "Two friends planning a last-minute road trip with very little budget",
  "A customer returning a broken item at a store and negotiating a refund",
  "Two old friends catching up at a wedding reception after years without seeing each other",
  "A personal trainer pushing a reluctant client through their first workout",
];

export interface FormValues {
  situation: string;
  grammarTopic: string;
  level: string;
  dialect: string;
}

interface Props {
  onGenerate: (values: FormValues) => void;
  loading: boolean;
  variant?: "centered" | "sidebar";
  initialValues?: Partial<FormValues>;
}

export default function GeneratorForm({
  onGenerate,
  loading,
  variant = "centered",
  initialValues,
}: Props) {
  const [situation, setSituation] = useState(initialValues?.situation ?? "");
  const [grammarTopic, setGrammarTopic] = useState(initialValues?.grammarTopic ?? "");
  const [level, setLevel] = useState(initialValues?.level ?? "");
  const [dialect, setDialect] = useState(initialValues?.dialect ?? "");

  const canSubmit = situation.trim() && grammarTopic.trim() && level && dialect && !loading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onGenerate({ situation, grammarTopic, level, dialect });
  }

  if (variant === "sidebar") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Situation</label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="e.g. At a coffee shop…"
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grammar Topic</label>
          <input
            type="text"
            value={grammarTopic}
            onChange={(e) => setGrammarTopic(e.target.value)}
            placeholder="e.g. Preterite vs. Imperfect"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level</label>
            <Select value={level} onValueChange={(v) => v && setLevel(v)}>
              <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 text-sm h-9 text-slate-700">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dialect</label>
            <Select value={dialect} onValueChange={(v) => v && setDialect(v)}>
              <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 text-sm h-9 text-slate-700">
                <SelectValue placeholder="Dialect" />
              </SelectTrigger>
              <SelectContent>
                {DIALECTS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Generating…" : "Generate ✦"}
        </button>
      </form>
    );
  }

  // ── Centered (initial) variant ─────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Situation */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700">🗺️ What&apos;s the situation?</label>
          <button
            type="button"
            onClick={() => setSituation(RANDOM_SITUATIONS[Math.floor(Math.random() * RANDOM_SITUATIONS.length)])}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
          >
            🎲 Surprise me
          </button>
        </div>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="e.g. Two friends catching up at a coffee shop after one of them came back from a long trip…"
          rows={3}
          className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
        />
      </div>

      {/* Grammar topic */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">📚 Grammar topic</label>
        <input
          type="text"
          value={grammarTopic}
          onChange={(e) => setGrammarTopic(e.target.value)}
          placeholder="e.g. Preterite vs. Imperfect, ser vs. estar, por vs. para…"
          className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
        />
      </div>

      {/* Level + Dialect dropdowns side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">🎯 Level</label>
          <Select value={level} onValueChange={(v) => v && setLevel(v)}>
            <SelectTrigger className="rounded-2xl border-2 border-slate-200 bg-slate-50/80 h-[46px] px-4 text-sm text-slate-700 focus:border-blue-400 focus:ring-0 data-[placeholder]:text-slate-300">
              <SelectValue placeholder="Choose…" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">🌎 Dialect</label>
          <Select value={dialect} onValueChange={(v) => v && setDialect(v)}>
            <SelectTrigger className="rounded-2xl border-2 border-slate-200 bg-slate-50/80 h-[46px] px-4 text-sm text-slate-700 focus:border-blue-400 focus:ring-0 data-[placeholder]:text-slate-300">
              <SelectValue placeholder="Choose…" />
            </SelectTrigger>
            <SelectContent>
              {DIALECTS.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Generate */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white text-base font-bold py-4 transition-all shadow-lg shadow-blue-300/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
      >
        {loading ? "Generating…" : (
          <>
            Generate
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
