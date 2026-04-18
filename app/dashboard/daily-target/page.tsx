"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Target, Clock, Flame, RotateCcw, Play, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function DailyTargetPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const exam = userData?.targetExam === "NEET" ? "NEET" : "JEE";

  const [loading, setLoading]       = useState(true);
  const [launching, setLaunching]   = useState(false);
  const [questions, setQuestions]   = useState<any[]>([]);
  const [date, setDate]             = useState("");
  const [countdown, setCountdown]   = useState(0);
  const [error, setError]           = useState("");

  // Fetch today's questions
  useEffect(() => {
    if (!user) return;
    const uid = user.uid || "anon";
    fetch(`/api/exam/daily-target?exam=${exam}&uid=${uid}&q=10`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setQuestions(data.questions || []);
        setDate(data.date || "");
        setCountdown(data.secondsUntilReset || 0);
      })
      .catch(() => setError("Failed to load today's questions."))
      .finally(() => setLoading(false));
  }, [user, exam]);

  // Live countdown ticker
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // Encode questions and launch inline test
  function handleStart() {
    if (!questions.length) return;
    setLaunching(true);
    sessionStorage.setItem("daily_target_questions", JSON.stringify(questions));
    sessionStorage.setItem("daily_target_exam",      exam);
    sessionStorage.setItem("daily_target_date",      date);
    router.push("/dashboard/daily-target/exam");
  }

  return (
    <DashboardShell>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <Target className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-[28px] font-display font-bold text-slate-900">Daily Target Drills</h1>
            <p className="text-slate-500">10 curated {exam} questions — fresh every day at midnight IST.</p>
          </div>
        </div>

        {/* Reset Timer */}
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100">
          <RotateCcw className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-[13px] text-slate-500">
            Resets in&nbsp;
            <span className="font-mono font-bold text-slate-800">{formatCountdown(countdown)}</span>
            &nbsp;— at midnight IST
          </span>
          <Clock className="w-4 h-4 text-slate-300 ml-auto" />
        </div>

        {/* Date badge */}
        {date && (
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-[13px] font-semibold text-slate-700">
              Today&apos;s drill — {new Date(date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-slate-500">Loading today&apos;s questions…</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[14px]">{error}</div>
        ) : (
          <div className="space-y-4">
            {/* Question preview pills */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => (
                <div key={i} className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-3 gap-1">
                  <span className="text-[11px] font-bold text-slate-500">Q{i + 1}</span>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                    q.difficulty === "hard"   ? "bg-red-100 text-red-600"    :
                    q.difficulty === "medium" ? "bg-amber-100 text-amber-600" :
                                               "bg-emerald-100 text-emerald-600"
                  }`}>{q.difficulty}</span>
                </div>
              ))}
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              disabled={launching}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-[15px] hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {launching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {launching ? "Launching…" : `Start Today's ${exam} Drill`}
            </button>

            <p className="text-center text-[12px] text-slate-400">
              20 minutes · 10 questions · Resets at midnight IST
            </p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
