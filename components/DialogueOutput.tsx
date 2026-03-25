"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  raw: string;
  level: string;
  dialect: string;
  speakerA: string;
  speakerB: string;
  title?: string;
  topic?: string;
  autoReveal?: boolean;
}

interface BlankAnswer {
  number: number;
  answer: string;
  note: string;
}

const SPEAKER_A_AVATAR = "linear-gradient(135deg, #60a5fa, #2563eb)";
const SPEAKER_B_AVATAR = "linear-gradient(135deg, #818cf8, #4f46e5)";

function buildPrintHTML(dialogue: string, answerKey: string, dialect: string, speakerA: string, speakerB: string, title?: string, topic?: string): string {
  const lines = dialogue.split("\n").filter((l) => l.trim());

  const formatBlanks = (text: string) =>
    text.replace(
      /____\[(\d+)\](?:\s*\(([^)]+)\))?/g,
      (_, n, hint) =>
        `<span class="blank"><span class="blank-line"></span>${hint ? `<em class="blank-hint">(${hint})</em>` : ""}</span>`
    );

  const dialogueHTML = lines
    .map((line) => {
      const m = line.match(/^(.+?):\s*(.*)$/);
      if (!m) return "";
      const name = m[1].trim();
      const isA = name.toLowerCase() === speakerA.toLowerCase();
      return `
        <div class="turn ${isA ? "turn-a" : "turn-b"}">
          <span class="speaker-name">${name}</span>
          <p class="line">${formatBlanks(m[2])}</p>
        </div>`;
    })
    .join("\n");

  const akLines = answerKey
    .split("\n")
    .map((line) => {
      const m = line.match(/\[(\d+)\]\s*(.+?)(?:\s*[—–-]\s*(.+))?$/);
      if (!m) return "";
      return `<div class="ak-row"><span class="ak-num">${m[1]}.</span><span class="ak-ans">${m[2].trim()}</span>${m[3] ? `<span class="ak-note"> — ${m[3].trim()}</span>` : ""}</div>`;
    })
    .join("\n");

  const displayTitle = title || "Spanish Fill-in-the-Blank Exercise";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title> </title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      color: #1f2937;
      background: #fff;
      padding: 0 52px 52px;
      max-width: 720px;
      margin: 0 auto;
    }

    /* Top accent bar */
    .top-bar {
      height: 5px;
      background: linear-gradient(to right, #3b82f6, #6366f1);
      margin: 0 -52px 36px;
    }

    /* Header */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1.5px solid #f3f4f6;
    }
    .header-left { flex: 1; }
    .branding {
      font-size: 10px;
      font-weight: 600;
      color: #6366f1;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      color: #111827;
      letter-spacing: -0.5px;
      line-height: 1.2;
      margin-bottom: 5px;
    }
    .topic {
      font-size: 13px;
      font-weight: 500;
      color: #6b7280;
      margin-top: 4px;
    }
    .meta-fields { text-align: right; flex-shrink: 0; }
    .meta-field {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 14px;
      white-space: nowrap;
    }
    .meta-field span {
      display: inline-block;
      border-bottom: 1px solid #d1d5db;
      min-width: 140px;
      margin-left: 6px;
    }

    /* Instructions */
    .instructions {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 28px;
      padding: 10px 14px;
      background: #f9fafb;
      border-radius: 6px;
      border-left: 3px solid #6366f1;
      line-height: 1.6;
    }
    .instructions strong { color: #374151; }

    /* Dialogue */
    .dialogue { display: flex; flex-direction: column; gap: 16px; }
    .turn { display: flex; flex-direction: column; gap: 3px; }
    .speaker-name {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .turn-a .speaker-name { color: #2563eb; }
    .turn-b .speaker-name { color: #4f46e5; }
    .line {
      font-size: 13px;
      line-height: 1.75;
      color: #1f2937;
      padding-left: 12px;
      border-left: 2px solid #e5e7eb;
    }
    .turn-a .line { border-left-color: #bfdbfe; }
    .turn-b .line { border-left-color: #c7d2fe; }

    /* Blanks */
    .blank {
      display: inline-flex;
      align-items: baseline;
      gap: 2px;
      margin: 0 2px;
    }
    .blank-line {
      display: inline-block;
      border-bottom: 1.5px solid #3b82f6;
      min-width: 80px;
    }
    .blank-hint {
      font-style: italic;
      font-size: 9.5px;
      color: #6b7280;
      margin-left: 2px;
    }

    /* Answer key */
    .ak-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1.5px solid #f3f4f6;
    }
    .ak-title {
      font-size: 10px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 14px;
    }
    .ak-row {
      display: flex;
      gap: 10px;
      font-size: 12px;
      margin-bottom: 7px;
      align-items: baseline;
    }
    .ak-num { width: 20px; flex-shrink: 0; font-weight: 700; color: #9ca3af; }
    .ak-ans { font-weight: 600; color: #1f2937; }
    .ak-note { color: #9ca3af; font-style: italic; font-size: 11px; }

    .footer {
      margin-top: 48px;
      text-align: center;
      font-size: 9.5px;
      color: #d1d5db;
      letter-spacing: 0.04em;
      padding-bottom: 8px;
    }
    .print-tip {
      margin-top: 24px;
      padding: 10px 14px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      font-size: 11px;
      color: #92400e;
      line-height: 1.5;
    }
    @page { margin: 40px 0; }
    @media print {
      body { padding: 0 52px 48px; }
      .print-tip { display: none; }
    }
  </style>
</head>
<body>
  <div class="top-bar"></div>
  <div class="header">
    <div class="header-left">
      <div class="branding">Blanky · Spanish Exercise</div>
      <div class="title">${displayTitle}</div>
      ${topic ? `<div class="topic">${topic}</div>` : ""}
    </div>
    <div class="meta-fields">
      <div class="meta-field">Name <span></span></div>
      <div class="meta-field">Date <span></span></div>
    </div>
  </div>

  <div class="instructions">
    <strong>Instructions:</strong> Fill in each blank with the correct word or phrase. Use the number and the verb hint (if any) as a guide.
  </div>

  <div class="dialogue">
    ${dialogueHTML}
  </div>

  <div class="footer">Material de Adrián Faz</div>

  <div class="print-tip">
    💡 Para ocultar la fecha y números de página: en el diálogo de impresión, desmarca <strong>"Encabezados y pies de página"</strong> (o "Headers and footers").
  </div>

  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 400); };
  </script>
</body>
</html>`;
}

function parseOutput(raw: string): { dialogue: string; answerKey: string } {
  const parts = raw.split(/ANSWER KEY\s*[:：]?\s*/i);
  if (parts.length >= 2) {
    return { dialogue: parts[0].trim(), answerKey: parts.slice(1).join("").trim() };
  }
  return { dialogue: raw.trim(), answerKey: "" };
}

function parseAnswerKey(text: string): BlankAnswer[] {
  return text
    .split("\n")
    .map((line) => {
      const m = line.match(/\[(\d+)\]\s*(.+?)(?:\s*[—–-]\s*(.+))?$/);
      return m ? { number: parseInt(m[1]), answer: m[2].trim(), note: m[3]?.trim() ?? "" } : null;
    })
    .filter((a): a is BlankAnswer => a !== null && a.number > 0);
}

function renderLineWithBlanks(
  text: string,
  userAnswers: Record<number, string>,
  checked: boolean,
  answers: BlankAnswer[],
  onChange: (n: number, val: string) => void
) {
  const parts = text.split(/(____\[\d+\](?:\s*\([^)]+\))?)/g);
  return parts.map((part, i) => {
    const m = part.match(/____\[(\d+)\](?:\s*\(([^)]+)\))?/);
    if (!m) return <span key={i}>{part}</span>;
    const num = parseInt(m[1]);
    const hint = m[2] ?? null;
    const correct = answers.find((a) => a.number === num);
    const userVal = userAnswers[num] ?? "";
    const normalize = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isCorrect = checked && normalize(userVal) === normalize(correct?.answer ?? "");
    const isWrong = checked && !isCorrect;
    return (
      <span key={i} className="inline-flex items-baseline gap-1 flex-wrap">
        <input
          type="text"
          value={userVal}
          readOnly={checked}
          onChange={(e) => onChange(num, e.target.value)}
          className={`min-w-[80px] border-b-2 bg-transparent px-1 py-0.5 text-center text-sm font-semibold outline-none transition-colors
            ${checked
              ? isCorrect
                ? "border-emerald-500 text-emerald-700"
                : "border-red-400 text-red-500"
              : "border-blue-400 text-slate-800 focus:border-blue-600"
            }`}
        />
        {hint && !checked && (
          <span className="text-[10px] text-slate-400 italic">({hint})</span>
        )}
        {checked && isWrong && correct && (
          <span className="text-xs font-semibold text-emerald-600">→ {correct.answer}</span>
        )}
      </span>
    );
  });
}

export default function DialogueOutput({ raw, level, dialect, speakerA, speakerB, title, topic, autoReveal = false }: Props) {
  const { dialogue, answerKey } = parseOutput(raw);
  const answers = parseAnswerKey(answerKey);
  const dialogueLines = dialogue.split("\n").filter((l) => l.trim());

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [revealedCount, setRevealedCount] = useState(() => autoReveal ? dialogueLines.length : 1);

  const allRevealed = autoReveal || revealedCount >= dialogueLines.length;

  useEffect(() => {
    setUserAnswers({});
    setChecked(false);
    setShowKey(false);
    setRevealed(false);
    setRevealedCount(autoReveal ? dialogueLines.length : 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const handleNext = () => {
    setRevealedCount((prev) => Math.min(prev + 1, dialogueLines.length));
  };

  const handleChange = (num: number, val: string) => {
    if (checked) return;
    setUserAnswers((prev) => ({ ...prev, [num]: val }));
  };

  const handleRevealAll = () => {
    const all: Record<number, string> = {};
    answers.forEach((a) => { all[a.number] = a.answer; });
    setUserAnswers(all);
    setChecked(true);
    setRevealed(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(dialogue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const html = buildPrintHTML(dialogue, answerKey, dialect, speakerA, speakerB, title, topic);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  };

  const totalBlanks = answers.length;
  const filledBlanks = Object.values(userAnswers).filter((v) => v.trim()).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Speakers header */}
      <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: SPEAKER_A_AVATAR }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          </div>
          <span className="text-sm font-bold text-blue-600">{speakerA}</span>
        </div>
        <span className="text-slate-200 font-light text-lg">·</span>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: SPEAKER_B_AVATAR }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          </div>
          <span className="text-sm font-bold text-indigo-600">{speakerB}</span>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <Badge className="rounded-full bg-blue-100 text-blue-700 font-semibold text-xs hover:bg-blue-100 px-3 py-1">
            {level}
          </Badge>
          <Badge className="rounded-full bg-sky-100 text-sky-700 font-semibold text-xs hover:bg-sky-100 px-3 py-1">
            {dialect}
          </Badge>
          {totalBlanks > 0 && (
            <Badge className="rounded-full bg-slate-100 text-slate-500 font-medium text-xs hover:bg-slate-100 px-3 py-1">
              {totalBlanks} blanks
            </Badge>
          )}
        </div>
      </div>

      {/* Dialogue bubbles */}
      <div className="space-y-5">
        {dialogueLines.slice(0, revealedCount).map((line, i) => {
          const isLastRevealed = !autoReveal && i === revealedCount - 1;
          const m = line.match(/^(.+?):\s*(.*)$/);
          if (!m) {
            return (
              <p key={i} className={`text-xs text-slate-300 italic text-center py-1 ${isLastRevealed ? "animate-reveal" : ""}`}>
                {line}
              </p>
            );
          }

          const name = m[1].trim();
          const isA = name.toLowerCase() === speakerA.toLowerCase();

          return (
            <div key={i} className={`flex gap-3 ${isA ? "" : "flex-row-reverse"} ${isLastRevealed ? "animate-reveal" : ""}`}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: isA ? SPEAKER_A_AVATAR : SPEAKER_B_AVATAR }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="white" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
                <span className={`text-[10px] font-semibold ${isA ? "text-blue-500" : "text-indigo-500"}`}>
                  {name}
                </span>
              </div>

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed text-slate-700 border shadow-sm ${
                  isA
                    ? "bg-blue-50 border-blue-100 rounded-tl-sm"
                    : "bg-indigo-50 border-indigo-100 rounded-tr-sm"
                }`}
              >
                {renderLineWithBlanks(m[2], userAnswers, checked, answers, handleChange)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Next turn button — only in step-by-step mode */}
      {!autoReveal && !allRevealed && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300 tabular-nums">{revealedCount} / {dialogueLines.length}</span>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-5 py-2 shadow-sm transition-all"
          >
            Siguiente
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Exercise controls */}
      {totalBlanks > 0 && (
        <div className="flex items-center gap-2.5 flex-wrap pt-1">
          <span className="text-xs text-slate-400 tabular-nums">
            {filledBlanks} / {totalBlanks} filled
          </span>
          {!checked ? (
            <Button
              size="sm"
              className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs px-4"
              onClick={() => setChecked(true)}
              disabled={filledBlanks === 0}
            >
              Check Answers
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs px-4"
              onClick={() => { setChecked(false); setRevealed(false); setUserAnswers({}); }}
            >
              Reset
            </Button>
          )}
          {!revealed && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs px-4"
              onClick={handleRevealAll}
            >
              Reveal All
            </Button>
          )}
        </div>
      )}

      {/* Action buttons — always visible */}
      <div className="border-t border-slate-100 pt-4 flex gap-2.5 flex-wrap">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="rounded-xl border-slate-200 text-xs font-semibold px-4"
        >
          {copied ? "✓ Copied!" : "Copy Dialogue"}
        </Button>
        <Button
          onClick={handleDownloadPDF}
          className="rounded-xl bg-slate-800 text-white hover:bg-slate-900 text-xs font-semibold px-4"
        >
          Download PDF
        </Button>
        {answerKey && (
          <Button
            variant="ghost"
            className="rounded-xl text-xs text-slate-400 px-4"
            onClick={() => setShowKey((s) => !s)}
          >
            {showKey ? "Hide Answer Key ↑" : "Show Answer Key ↓"}
          </Button>
        )}
      </div>

      {/* Answer Key panel */}
      {showKey && answerKey && (
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Answer Key
          </h3>
          {answers.length > 0 ? (
            <div className="space-y-2">
              {answers.map((a) => (
                <div key={a.number} className="flex gap-3 text-sm items-baseline">
                  <span className="w-8 flex-shrink-0 text-xs font-bold text-slate-400">[{a.number}]</span>
                  <span className="font-semibold text-slate-800">{a.answer}</span>
                  {a.note && <span className="text-xs text-slate-400 italic">— {a.note}</span>}
                </div>
              ))}
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-slate-600">{answerKey}</pre>
          )}
        </div>
      )}
    </div>
  );
}
