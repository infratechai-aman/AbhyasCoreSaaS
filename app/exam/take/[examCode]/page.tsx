"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  difficulty?: string;
  chapterSource?: string;
  inferredSubject?: string;
}

type QStatus = "not-visited" | "answered" | "not-answered" | "marked";

/* ── Status color map (4 distinct colors) ── */
const STATUS_COLORS = {
  answered:       { bg: "bg-emerald-500",  text: "text-white",     label: "Completed", dot: "bg-emerald-500"  },
  "not-answered": { bg: "bg-red-400",      text: "text-white",     label: "Not Answered", dot: "bg-red-400"  },
  "not-visited":  { bg: "bg-slate-200",    text: "text-slate-400", label: "Not Visited",  dot: "bg-slate-300"  },
  marked:         { bg: "bg-amber-400",    text: "text-white",     label: "Marked",       dot: "bg-amber-400"  },
} as const;

/* ── Subject color map ── */
const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; badge: string; icon: string }> = {
  Physics:     { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-l-blue-500",    badge: "bg-blue-100 text-blue-700 border-blue-200",    icon: "⚡" },
  Chemistry:   { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-l-emerald-500", badge: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "🧪" },
  Mathematics: { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-l-violet-500",  badge: "bg-violet-100 text-violet-700 border-violet-200",  icon: "📐" },
  Biology:     { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-l-rose-500",    badge: "bg-rose-100 text-rose-700 border-rose-200",    icon: "🧬" },
};

export default function ExamTakePage() {
  const router = useRouter();
  const params = useParams();
  const examCode = params.examCode as string;

  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, QStatus>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarSubjectFilter, setSidebarSubjectFilter] = useState<string | null>(null);

  // Anti-cheating state
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const MAX_TAB_SWITCHES = 3;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const endTimeRef = useRef<number>(0);
  const submitRef = useRef<(auto?: boolean) => void>(() => {});

  // Load session from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const cached = sessionStorage.getItem("institute_exam_session");
      if (!cached) {
        router.push(`/exam/join/${examCode}`);
        return;
      }
      const parsed = JSON.parse(cached);
      setSession(parsed);
      setQuestions(parsed.questions || []);

      const durationMs = (parsed.duration || 60) * 60 * 1000;
      // Check if we have a saved end time (persists across page switches)
      const savedEndTime = sessionStorage.getItem("institute_exam_endtime");
      if (savedEndTime) {
        endTimeRef.current = parseInt(savedEndTime, 10);
      } else {
        endTimeRef.current = Date.now() + durationMs;
        sessionStorage.setItem("institute_exam_endtime", String(endTimeRef.current));
      }

      const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      startTimeRef.current = Date.now();

      const initialStatuses: Record<string, QStatus> = {};
      (parsed.questions || []).forEach((q: Question) => {
        initialStatuses[q.id] = "not-visited";
      });
      if (parsed.questions?.length > 0) {
        initialStatuses[parsed.questions[0].id] = "not-answered";
      }
      setStatuses(initialStatuses);
      setSessionLoaded(true);
    } catch {
      router.push(`/exam/join/${examCode}`);
    }
  }, [examCode, router]);

  // Timer — uses absolute end time so it survives tab switches
  useEffect(() => {
    if (!sessionLoaded || submitted) return;
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        submitRef.current(true);
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionLoaded, submitted]);

  // ── Anti-Cheating: Tab Switch Detection ──
  useEffect(() => {
    if (!sessionLoaded || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= MAX_TAB_SWITCHES) {
            // Auto-submit after 3rd switch
            setTimeout(() => submitRef.current(true), 500);
          } else {
            setShowTabWarning(true);
          }
          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [sessionLoaded, submitted]);

  // ── Anti-Cheating: Copy, Right-click, Screenshot Prevention ──
  useEffect(() => {
    if (!sessionLoaded || submitted) return;

    const preventCopy = (e: ClipboardEvent) => { e.preventDefault(); };
    const preventContextMenu = (e: MouseEvent) => { e.preventDefault(); };
    const preventSelect = (e: Event) => { e.preventDefault(); };
    const preventKeyShortcuts = (e: KeyboardEvent) => {
      // Block: PrintScreen, Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P, Ctrl+Shift+I (DevTools)
      if (e.key === "PrintScreen") {
        e.preventDefault();
        navigator.clipboard.writeText("").catch(() => {});
      }
      if (e.ctrlKey && ["c", "a", "s", "p", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key === "F12") {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", preventCopy);
    document.addEventListener("cut", preventCopy as any);
    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("selectstart", preventSelect);
    document.addEventListener("keydown", preventKeyShortcuts);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("cut", preventCopy as any);
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("selectstart", preventSelect);
      document.removeEventListener("keydown", preventKeyShortcuts);
    };
  }, [sessionLoaded, submitted]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const selectAnswer = (qId: string, optionId: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
    setStatuses((prev) => ({ ...prev, [qId]: "answered" }));
  };

  const clearAnswer = () => {
    if (submitted) return;
    const qId = questions[currentQ]?.id;
    if (!qId) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
    setStatuses((prev) => ({ ...prev, [qId]: "not-answered" }));
  };

  const navigateQ = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    const curId = questions[currentQ]?.id;
    if (curId && !answers[curId] && statuses[curId] !== "marked") {
      setStatuses((prev) => ({ ...prev, [curId]: "not-answered" }));
    }
    const targetId = questions[index]?.id;
    if (targetId && statuses[targetId] === "not-visited") {
      setStatuses((prev) => ({ ...prev, [targetId]: "not-answered" }));
    }
    setCurrentQ(index);
  };

  const markForReview = () => {
    const qId = questions[currentQ]?.id;
    if (!qId) return;
    setStatuses((prev) => ({
      ...prev,
      [qId]: prev[qId] === "marked" ? (answers[qId] ? "answered" : "not-answered") : "marked",
    }));
  };

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (submitted || submitting) return;
      setSubmitting(true);
      setShowConfirm(false);
      if (timerRef.current) clearInterval(timerRef.current);

      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);

      try {
        const res = await fetch("/api/institute/submit-attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examSessionToken: session?.examSessionToken,
            answers,
            timeTaken,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Failed to submit. Please try again.");
          setSubmitting(false);
          return;
        }

        setResult(data);
        setSubmitted(true);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("institute_exam_session");
          sessionStorage.removeItem("institute_exam_endtime");
        }
      } catch (e) {
        alert("Network error. Please check your connection and try again.");
        setSubmitting(false);
      }
    },
    [session, answers, submitted, submitting]
  );

  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  // ── Loading Screen ──
  if (!session || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8edf5] to-[#dce4f0] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading exam...</p>
        </div>
      </div>
    );
  }

  // ─── RESULT SCREEN ───
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8edf5] to-[#dce4f0] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style jsx>{`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
          .anim-fade-in { animation: fadeInUp 0.6s ease-out both; }
          .anim-scale { animation: scaleIn 0.5s 0.2s ease-out both; }
        `}</style>

        <div className="h-[60px] bg-white/70 backdrop-blur-xl border-b border-white/40 flex items-center justify-between px-6 sticky top-0 z-50 shadow-[0_1px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="AbhyasCore" width={100} height={63} className="h-7 w-auto object-contain" />
            <span className="w-px h-5 bg-slate-200/60" />
            <span className="text-[13px] font-semibold text-slate-500">{session.examTitle}</span>
          </div>
          <div className="text-[12px] font-semibold text-slate-500">
            {session.studentName} • Roll No: {session.rollNo}
          </div>
        </div>

        <div className="max-w-[860px] mx-auto w-full px-6 py-8">
          {/* Show full results only when resultAvailable is true */}
          {result.resultAvailable ? (
            <>
              <div className="anim-fade-in rounded-[24px] bg-gradient-to-br from-[#0f0a2e] via-[#1e1252] to-[#2d1b69] p-10 text-center mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(124,58,237,0.35),transparent)] pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: "repeat" }} />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.25em] mb-3">{session.examTitle}</p>
                  <div className="anim-scale">
                    <span className="text-[64px] font-extrabold text-white leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {result.score}
                    </span>
                    <span className="text-[24px] text-white/30 font-bold">/{result.maxScore}</span>
                  </div>
                  <p className="text-[11px] text-white/30 mt-2 mb-8">+4 correct / −1 wrong marking</p>
                  <div className="flex justify-center gap-10">
                    {[
                      { value: result.correctCount, label: "Correct", color: "text-emerald-400" },
                      { value: result.wrongCount, label: "Wrong", color: "text-red-400" },
                      { value: result.skippedCount, label: "Skipped", color: "text-amber-400" },
                      { value: `${result.percentage}%`, label: "Score", color: "text-blue-400" },
                    ].map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className={`text-[26px] font-extrabold ${stat.color} leading-none`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/25 mt-1.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {result.gradedQuestions && (
                <div className="anim-fade-in bg-white/70 backdrop-blur-xl border border-white/50 rounded-[20px] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
                  <div className="px-6 py-4 border-b border-slate-100/60">
                    <h3 className="text-[15px] font-extrabold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Question-wise Review</h3>
                  </div>
                  <div>
                    {result.gradedQuestions.map((gq: any, i: number) => {
                      const q = questions.find((qq) => qq.id === gq.id);
                      return (
                        <div key={gq.id} className="flex gap-4 px-6 py-4 border-b border-slate-50/60 last:border-b-0 hover:bg-white/40 transition-colors">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${
                            gq.isCorrect ? "bg-emerald-100 text-emerald-600" : gq.userAnswer ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-400"
                          }`}>
                            {gq.isCorrect ? "✓" : gq.userAnswer ? "✗" : "—"}
                          </span>
                          <div className="flex-1">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-1">Question {i + 1}</p>
                            <p className="text-[13px] font-medium text-slate-900 leading-relaxed mb-2">{q?.text || `Q${i + 1}`}</p>
                            <p className="text-[12px] font-semibold">
                              {gq.userAnswer ? (
                                <span className={gq.isCorrect ? "text-emerald-600" : "text-red-600"}>
                                  Your answer: {gq.userAnswer} {gq.isCorrect ? "✓" : `✗ (Correct: ${gq.correctAnswer})`}
                                </span>
                              ) : (
                                <span className="text-amber-600">Skipped — Correct: {gq.correctAnswer}</span>
                              )}
                            </p>
                            {gq.explanation && (
                              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed bg-indigo-50/50 rounded-lg px-3 py-2">💡 {gq.explanation}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results hidden (manual / after_exam_ends) — only show confirmation */
            <div className="anim-fade-in rounded-[24px] bg-white/70 backdrop-blur-xl border border-white/50 p-12 text-center shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-[24px] font-extrabold text-slate-900 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Exam Submitted Successfully!
              </h2>
              <p className="text-[14px] text-slate-500 mb-6 max-w-[400px] mx-auto">
                Your answers have been recorded. Results will be released by your institute when they are ready.
              </p>
              <div className="inline-flex items-center gap-2 bg-indigo-50 rounded-xl px-5 py-3 text-[13px] font-semibold text-indigo-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Results are pending release
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── EXAM UI ───
  const currentQuestion = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const notAnsweredCount = Object.values(statuses).filter(s => s === "not-answered").length;
  const notVisitedCount = Object.values(statuses).filter(s => s === "not-visited").length;
  const markedCount = Object.values(statuses).filter(s => s === "marked").length;
  const isTimeWarning = timeLeft < 300;
  const isTimeCritical = timeLeft < 60;
  const totalDuration = session?.duration ? session.duration * 60 : 3600;

  // Group questions by subject for sidebar display
  const subjectGroups = useMemo(() => {
    const groups: { subject: string; questions: { q: Question; index: number }[] }[] = [];
    const subjectMap = new Map<string, { q: Question; index: number }[]>();
    
    questions.forEach((q, i) => {
      const sub = q.inferredSubject || "General";
      if (!subjectMap.has(sub)) subjectMap.set(sub, []);
      subjectMap.get(sub)!.push({ q, index: i });
    });
    
    // Maintain order: Physics → Chemistry → Mathematics → Biology → others
    const order = ["Physics", "Chemistry", "Mathematics", "Biology"];
    const orderedKeys = [...order.filter(s => subjectMap.has(s)), ...Array.from(subjectMap.keys()).filter(s => !order.includes(s))];
    
    for (const sub of orderedKeys) {
      groups.push({ subject: sub, questions: subjectMap.get(sub)! });
    }
    return groups;
  }, [questions]);

  const hasMultipleSubjects = subjectGroups.length > 1;
  // Timer ring: shows remaining time (ring shrinks as time passes)
  const ringRadius = 44;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const timerFraction = totalDuration > 0 ? timeLeft / totalDuration : 1;
  const ringDashoffset = ringCircumference * (1 - timerFraction);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8edf5] via-[#dfe6f0] to-[#d5dcea] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style jsx>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse-gentle { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .anim-fade-in { animation: fadeInUp 0.4s ease-out both; }
        .anim-slide-in { animation: slideInRight 0.3s ease-out both; }
        .anim-pulse-gentle { animation: pulse-gentle 1.5s ease-in-out infinite; }
        .anim-float { animation: float 4s ease-in-out infinite; }
        .anim-shake { animation: shake 0.4s ease-in-out; }
        .timer-ring { transition: stroke-dashoffset 0.9s cubic-bezier(0.4, 0, 0.2, 1); }
        .glass { background: rgba(255,255,255,0.55); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.6); }
        .glass-strong { background: rgba(255,255,255,0.72); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.7); }
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        /* Anti-cheating styles */
        * { -webkit-user-select: none !important; -moz-user-select: none !important; -ms-user-select: none !important; user-select: none !important; }
        img { -webkit-user-drag: none !important; user-drag: none !important; pointer-events: none; }
        @media print { body { display: none !important; } }
      `}</style>

      {/* ═══ TOP HEADER BAR ═══ */}
      <div className="glass-strong shadow-[0_2px_16px_rgba(0,0,0,0.05)] sticky top-0 z-50 flex-shrink-0">
        <div className="h-[56px] flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="AbhyasCore" width={140} height={88} className="h-9 w-auto object-contain" />
            <span className="w-px h-4 bg-slate-300/50 hidden sm:block" />
            <span className="text-[13px] font-bold text-slate-700 hidden sm:block truncate max-w-[200px]">{session.examTitle}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Student Info */}
            <div className="hidden sm:flex items-center gap-2 glass rounded-full px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold">
                {session.studentName?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <span className="text-[12px] font-semibold text-slate-700">
                {session.studentName} <span className="text-slate-400">({session.rollNo})</span>
              </span>
            </div>
            {/* Mobile sidebar toggle */}
            <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-[12px] font-bold shadow-[0_4px_14px_rgba(239,68,68,0.25)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.35)] hover:-translate-y-px transition-all active:translate-y-0"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* ═══ TIMER BAR (Horizontal — inspired by reference design) ═══ */}
      <div className="px-3 md:px-5 pt-2 pb-1 flex-shrink-0">
        <div className="glass-strong rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] px-4 py-2.5 md:px-5 md:py-3 flex items-center gap-3 md:gap-5 flex-wrap">
          {/* Circular Timer */}
          <div className="relative w-[56px] h-[56px] md:w-[64px] md:h-[64px] flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={ringRadius} fill="none" stroke="#e2e8f0" strokeWidth="5" opacity="0.3" />
              <circle
                cx="50" cy="50" r={ringRadius}
                fill="none"
                stroke={isTimeCritical ? "#ef4444" : isTimeWarning ? "#f97316" : "#4f46e5"}
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringDashoffset}
                className="timer-ring"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <svg className={`w-4 h-4 md:w-5 md:h-5 ${isTimeCritical ? "text-red-500" : isTimeWarning ? "text-orange-500" : "text-indigo-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Time Display */}
          <div className="flex-shrink-0">
            <div className={`text-[26px] md:text-[32px] font-extrabold tabular-nums tracking-wide leading-none ${isTimeCritical ? "text-red-600 anim-pulse-gentle" : isTimeWarning ? "text-orange-600" : "text-slate-900"}`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {formatTimer(timeLeft)}
            </div>
            <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mt-0.5">
              <span className="hidden sm:inline">Minutes:Seconds • </span>TIME REMAINING
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-slate-200/60 hidden md:block" />

          {/* Question Progress */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="glass rounded-xl px-4 py-2 flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Question {currentQ + 1} of {questions.length}</span>
              <div className="w-px h-4 bg-slate-200/50" />
              <span className="text-[13px] font-extrabold text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {answeredCount}/{questions.length}
              </span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Legend pills (desktop) */}
          <div className="hidden xl:flex items-center gap-2">
            {([
              { status: "answered" as const, count: answeredCount },
              { status: "not-answered" as const, count: notAnsweredCount },
              { status: "marked" as const, count: markedCount },
            ]).map((item) => {
              const colors = STATUS_COLORS[item.status];
              return (
                <div key={item.status} className="flex items-center gap-1.5 glass rounded-lg px-2.5 py-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <span className="text-[10px] font-bold text-slate-600">{colors.label}</span>
                  <span className="text-[10px] font-extrabold text-slate-900">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ MAIN BODY ═══ */}
      <div className="flex-1 flex min-h-0 relative">
        {/* ── Question Area ── */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5">
          {/* Question Header Tags */}
          <div className="anim-fade-in flex items-center gap-2.5 mb-2">
            {currentQuestion?.difficulty && (
              <span className={`inline-flex items-center h-7 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                currentQuestion.difficulty === "easy"   ? "bg-emerald-100/80 text-emerald-700 border border-emerald-200/50" :
                currentQuestion.difficulty === "hard"   ? "bg-red-100/80 text-red-600 border border-red-200/50" :
                "bg-amber-100/80 text-amber-700 border border-amber-200/50"
              }`}>
                {currentQuestion.difficulty}
              </span>
            )}
            {currentQuestion?.inferredSubject && (() => {
              const subColors = SUBJECT_COLORS[currentQuestion.inferredSubject] || { badge: "bg-slate-100 text-slate-700 border-slate-200", icon: "📝" };
              return (
                <span className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-bold border ${subColors.badge}`}>
                  <span className="text-[12px]">{subColors.icon}</span>
                  {currentQuestion.inferredSubject}
                </span>
              );
            })()}
          </div>

          {/* Question Card — Glassmorphic */}
          <div className="glass-strong rounded-[18px] md:rounded-[20px] shadow-[0_6px_30px_rgba(0,0,0,0.04)] p-4 md:p-6 mb-3">
            {/* Question Text */}
            <div className="mb-1">
              <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Question {currentQ + 1}
              </span>
            </div>
            <p className="text-[14px] md:text-[16px] font-semibold text-slate-900 leading-relaxed mb-5">
              {currentQuestion?.text}
            </p>

            {/* Options — Radio button style, centered layout */}
            <div className="flex flex-col gap-2 md:gap-2.5 max-w-[600px]">
              {currentQuestion?.options.map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectAnswer(currentQuestion.id, opt.id)}
                    className={`group flex items-center gap-3 md:gap-4 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-3.5 cursor-pointer transition-all duration-200 text-left w-full ${
                      isSelected
                        ? "glass-strong shadow-[0_4px_20px_rgba(79,70,229,0.12)] ring-2 ring-indigo-400/50"
                        : "glass hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                    }`}
                  >
                    {/* Radio circle */}
                    <span className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 border-2 ${
                      isSelected
                        ? "bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] border-indigo-400 shadow-[0_2px_10px_rgba(124,58,237,0.3)]"
                        : "bg-white/60 border-slate-300/60 group-hover:border-indigo-300"
                    }`}>
                      {isSelected ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-[12px] font-bold text-slate-400 group-hover:text-indigo-400">{opt.id}</span>
                      )}
                    </span>
                    <span className={`text-[13px] md:text-[14px] transition-colors ${
                      isSelected ? "font-semibold text-slate-900" : "font-medium text-slate-600 group-hover:text-slate-800"
                    }`}>
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-2 md:gap-2.5 flex-wrap">
            <button
              onClick={() => navigateQ(currentQ - 1)}
              disabled={currentQ === 0}
              className="h-9 md:h-10 px-3 md:px-4 rounded-xl flex items-center gap-1.5 md:gap-2 text-[11px] md:text-[12px] font-bold glass text-slate-600 hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              onClick={clearAnswer}
              className="h-9 md:h-10 px-3 md:px-4 rounded-xl flex items-center gap-1.5 md:gap-2 text-[11px] md:text-[12px] font-bold glass text-slate-600 hover:shadow-md transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
            <button
              onClick={markForReview}
              className={`h-9 md:h-10 px-3 md:px-4 rounded-xl flex items-center gap-1.5 md:gap-2 text-[11px] md:text-[12px] font-bold transition-all ${
                statuses[currentQuestion?.id] === "marked"
                  ? "bg-amber-400 text-white shadow-[0_2px_12px_rgba(245,158,11,0.3)]"
                  : "glass text-slate-600 hover:shadow-md"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill={statuses[currentQuestion?.id] === "marked" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {statuses[currentQuestion?.id] === "marked" ? "Marked" : "Mark"}
            </button>
            <div className="flex-1" />
            <button
              onClick={() => navigateQ(currentQ + 1)}
              disabled={currentQ === questions.length - 1}
              className="h-9 md:h-10 px-4 md:px-5 rounded-xl flex items-center gap-1.5 md:gap-2 text-[11px] md:text-[12px] font-bold bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white shadow-[0_4px_14px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)] hover:-translate-y-px transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Next
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── SIDEBAR (Question Palette) ── */}
        {showSidebar && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setShowSidebar(false)} />
        )}
        <div className={`${showSidebar ? "translate-x-0" : "translate-x-full"} lg:translate-x-0 fixed lg:static right-0 top-0 bottom-0 lg:top-auto w-[270px] lg:w-[260px] glass-strong lg:bg-transparent lg:backdrop-blur-none lg:border-0 flex flex-col z-50 lg:z-auto transition-transform duration-300 ease-out shadow-[-8px_0_30px_rgba(0,0,0,0.08)] lg:shadow-none`}>
          <div className="flex-1 overflow-y-auto p-4 sidebar-scroll">
            {/* Mobile header */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <span className="text-[13px] font-bold text-slate-800">Question Palette</span>
              <button onClick={() => setShowSidebar(false)} className="w-7 h-7 rounded-lg glass flex items-center justify-center text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Question Palette Grid — Grouped by Subject */}
            {hasMultipleSubjects ? (
              <>
                {/* Subject filter tabs */}
                <div className="glass rounded-xl p-1.5 mb-3 flex gap-1">
                  <button
                    onClick={() => setSidebarSubjectFilter(null)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      sidebarSubjectFilter === null ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    All
                  </button>
                  {subjectGroups.map(({ subject }) => {
                    const colors = SUBJECT_COLORS[subject];
                    return (
                      <button
                        key={subject}
                        onClick={() => setSidebarSubjectFilter(sidebarSubjectFilter === subject ? null : subject)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          sidebarSubjectFilter === subject ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {subject.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>

                {/* Subject-grouped question palette */}
                {subjectGroups
                  .filter(({ subject }) => !sidebarSubjectFilter || subject === sidebarSubjectFilter)
                  .map(({ subject, questions: subjectQs }) => {
                    const colors = SUBJECT_COLORS[subject] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-l-slate-400", icon: "📝" };
                    const subjectAnswered = subjectQs.filter(({ q }) => answers[q.id]).length;
                    return (
                      <div key={subject} className={`glass-strong rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] mb-3 overflow-hidden border-l-[3px] ${colors.border}`}>
                        {/* Subject header */}
                        <div className={`px-3.5 py-2.5 ${colors.bg} flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px]">{colors.icon}</span>
                            <span className={`text-[11px] font-bold ${colors.text}`}>{subject}</span>
                          </div>
                          <span className={`text-[10px] font-bold ${colors.text} opacity-70`}>
                            {subjectAnswered}/{subjectQs.length}
                          </span>
                        </div>
                        {/* Question grid */}
                        <div className="p-3">
                          <div className="grid grid-cols-6 gap-[5px]">
                            {subjectQs.map(({ q, index: i }) => {
                              const status = statuses[q.id] || "not-visited";
                              const isCurrent = i === currentQ;
                              const statusColors = STATUS_COLORS[status];
                              return (
                                <button
                                  key={q.id}
                                  onClick={() => { navigateQ(i); setShowSidebar(false); }}
                                  className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all duration-150 hover:scale-105 ${statusColors.bg} ${statusColors.text} ${
                                    isCurrent ? "ring-[2.5px] ring-indigo-500 ring-offset-[2px] ring-offset-white scale-110 shadow-md" : ""
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </>
            ) : (
              /* Single subject — flat grid (original layout) */
              <div className="glass-strong rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] mb-4">
                <div className="grid grid-cols-6 gap-[6px]">
                  {questions.map((q, i) => {
                    const status = statuses[q.id] || "not-visited";
                    const isCurrent = i === currentQ;
                    const colors = STATUS_COLORS[status];
                    return (
                      <button
                        key={q.id}
                        onClick={() => { navigateQ(i); setShowSidebar(false); }}
                        className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold cursor-pointer transition-all duration-150 hover:scale-105 ${colors.bg} ${colors.text} ${
                          isCurrent ? "ring-[2.5px] ring-indigo-500 ring-offset-[2px] ring-offset-white scale-110 shadow-md" : ""
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="glass rounded-xl p-3.5 mb-4">
              {([
                { status: "answered" as const, count: answeredCount },
                { status: "not-answered" as const, count: notAnsweredCount },
                { status: "not-visited" as const, count: notVisitedCount },
                { status: "marked" as const, count: markedCount },
              ]).map((item) => {
                const colors = STATUS_COLORS[item.status];
                return (
                  <div key={item.status} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3.5 h-3.5 rounded-[4px] ${colors.dot} flex-shrink-0`} />
                      <span className="text-[11px] font-semibold text-slate-600">{colors.label}</span>
                    </div>
                    <span className="text-[12px] font-bold text-slate-800">{item.count}</span>
                  </div>
                );
              })}
            </div>

            {/* Student Info */}
            <div className="glass rounded-xl p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[14px] font-bold shadow-md shadow-indigo-500/20">
                  {session.studentName?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-900">{session.studentName}</div>
                  <div className="text-[11px] text-slate-500">Roll No: {session.rollNo}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SUBMIT CONFIRMATION MODAL ═══ */}
      {showConfirm && (
        <div className="fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="anim-fade-in glass-strong rounded-[24px] p-8 w-full max-w-[420px] shadow-[0_24px_60px_rgba(0,0,0,0.15)]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-[20px] font-extrabold text-slate-900 text-center mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Submit Exam?
            </h3>
            <p className="text-[13px] text-slate-500 leading-relaxed text-center mb-6">
              You have answered <strong className="text-slate-900">{answeredCount}</strong> out of{" "}
              <strong className="text-slate-900">{questions.length}</strong> questions.
              {questions.length - answeredCount > 0 && (
                <span className="text-amber-600 font-semibold"> {questions.length - answeredCount} questions are unanswered.</span>
              )}
            </p>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { label: "Answered", count: answeredCount, color: "bg-emerald-500" },
                { label: "Unanswered", count: notAnsweredCount, color: "bg-red-400" },
                { label: "Unvisited", count: notVisitedCount, color: "bg-slate-300" },
                { label: "Marked", count: markedCount, color: "bg-amber-400" },
              ].map((item) => (
                <div key={item.label} className="glass rounded-xl p-3 text-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color} mx-auto mb-2`} />
                  <div className="text-[15px] font-extrabold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{item.count}</div>
                  <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-12 rounded-xl glass text-slate-600 text-[13px] font-bold cursor-pointer hover:bg-white/70 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white text-[13px] font-bold cursor-pointer shadow-[0_4px_14px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB SWITCH WARNING MODAL ═══ */}
      {showTabWarning && (
        <div className="fixed inset-0 bg-[rgba(127,29,29,0.6)] backdrop-blur-md z-[1100] flex items-center justify-center p-4">
          <div className="anim-shake glass-strong rounded-[24px] p-8 w-full max-w-[420px] shadow-[0_24px_60px_rgba(0,0,0,0.25)] border-2 border-red-300/50">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-[22px] font-extrabold text-red-700 text-center mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ⚠️ Tab Switch Detected!
            </h3>
            <p className="text-[13px] text-slate-600 leading-relaxed text-center mb-4">
              Switching tabs during the exam is <strong className="text-red-700">not allowed</strong>. 
              This activity has been recorded.
            </p>

            {/* Warning counter */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {Array.from({ length: MAX_TAB_SWITCHES }).map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-extrabold transition-all ${
                    i < tabSwitchCount
                      ? "bg-red-500 text-white shadow-[0_2px_10px_rgba(239,68,68,0.4)]"
                      : "bg-slate-100 text-slate-300"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center mb-6">
              <span className="text-[12px] font-bold text-red-700">
                Warning {tabSwitchCount} of {MAX_TAB_SWITCHES}
              </span>
              <span className="text-[11px] text-red-500 block mt-0.5">
                Your exam will be auto-submitted after {MAX_TAB_SWITCHES} violations.
              </span>
            </div>

            <button
              onClick={() => setShowTabWarning(false)}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-[14px] font-bold cursor-pointer shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] transition-all"
            >
              I Understand — Return to Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
