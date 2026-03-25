"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DialogueOutput from "@/components/DialogueOutput";

interface DialogueData {
  raw: string;
  level: string;
  dialect: string;
  speakerA: string;
  speakerB: string;
}

function StudentContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const [data, setData] = useState<DialogueData | null>(null);

  useEffect(() => {
    if (!key) return;
    const stored = localStorage.getItem(key);
    if (stored) {
      setData(JSON.parse(stored));
      localStorage.removeItem(key);
    }
  }, [key]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <p className="text-slate-400 text-sm">Loading dialogue…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-blue-200/30 blur-3xl pointer-events-none" />

      <main className="relative mx-auto max-w-2xl px-6 py-10 flex flex-col gap-5">

        {/* Fun header card */}
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl p-8 text-center text-white shadow-2xl shadow-blue-300/50 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

          <div className="relative">
            <div className="text-5xl mb-3">✏️</div>
            <h1 className="text-3xl font-bold tracking-tight">¡A practicar!</h1>
            <p className="text-blue-100 text-sm mt-1.5">
              Fill in the blanks and test your Spanish
            </p>

            {/* Speakers */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5">
                <div className="w-5 h-5 rounded-full bg-rose-400 flex items-center justify-center text-[9px] font-bold text-white">
                  {data.speakerA[0]}
                </div>
                <span className="text-sm font-semibold">{data.speakerA}</span>
              </div>
              <span className="text-blue-200 font-light">&amp;</span>
              <div className="flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5">
                <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center text-[9px] font-bold text-white">
                  {data.speakerB[0]}
                </div>
                <span className="text-sm font-semibold">{data.speakerB}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold">
                {data.level}
              </span>
              <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold">
                {data.dialect}
              </span>
            </div>
          </div>
        </div>

        {/* Dialogue card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 p-6 border border-slate-100/80">
          <DialogueOutput
            raw={data.raw}
            level={data.level}
            dialect={data.dialect}
            speakerA={data.speakerA}
            speakerB={data.speakerB}
          />
        </div>

        <p className="text-center text-xs text-slate-400">
          Blanky · Built for Preply tutors
        </p>
      </main>
    </div>
  );
}

export default function StudentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      }
    >
      <StudentContent />
    </Suspense>
  );
}
