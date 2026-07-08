"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  answered:     { bg: "bg-emerald-500",  text: "text-white",    border: "border-emerald-500",  ring: "ring-emerald-200", label: "Answered",     dot: "bg-emerald-500"  },
  "not-answered": { bg: "bg-red-500",    text: "text-white",    border: "border-red-500",      ring: "ring-red-200",     label: "Not Answered", dot: "bg-red-500"      },
  "not-visited":  { bg: "bg-slate-200",  text: "text-slate-500",border: "border-slate-200",    ring: "ring-slate-100",   label: "Not Visited",  dot: "bg-slate-300"    },
  marked:       { bg: "bg-amber-400",    text: "text-white",    border: "border-amber-400",    ring: "ring-amber-200",   label: "Marked",       dot: "bg-amber-400"    },
} as const;

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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
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
      setTimeLeft((parsed.duration || 60) * 60); // Convert minutes to seconds
      startTimeRef.current = Date.now();

      // Initialize all questions as "not-visited"
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

  // Timer — guarded by sessionLoaded so it only starts once session data is ready
  useEffect(() => {
    if (!sessionLoaded || submitted || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit on timeout via ref (avoids stale closure)
          submitRef.current(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionLoaded, submitted]);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeLeft < 60) return { text: "text-red-500", bg: "from-red-500/20 to-red-600/10", stroke: "#ef4444" };
    if (timeLeft < 300) return { text: "text-orange-500", bg: "from-orange-500/20 to-orange-600/10", stroke: "#f97316" };
    return { text: "text-emerald-500", bg: "from-indigo-500/10 to-violet-500/10", stroke: "#4f46e5" };
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
    // Mark current question as "not-answered" if not answered
    const curId = questions[currentQ]?.id;
    if (curId && !answers[curId] && statuses[curId] !== "marked") {
      setStatuses((prev) => ({ ...prev, [curId]: "not-answered" }));
    }
    // Mark target as visited
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
        // Clear session
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("institute_exam_session");
        }
      } catch (e) {
        alert("Network error. Please check your connection and try again.");
        setSubmitting(false);
      }
    },
    [session, answers, submitted, submitting]
  );

  // Keep submitRef in sync so timer auto-submit always has latest answers
  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  // ── Loading Screen ──
  if (!session || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
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
      <div className="min-h-screen bg-[#fafafc] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style jsx>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.8); }
            to   { opacity: 1; transform: scale(1); }
          }
          .anim-fade-in { animation: fadeInUp 0.6s ease-out both; }
          .anim-scale   { animation: scaleIn 0.5s 0.2s ease-out both; }
        `}</style>

        {/* Header */}
        <div className="h-[60px] bg-white border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="AbhyasCore" width={100} height={63} className="h-7 w-auto object-contain" />
            <span className="w-px h-5 bg-slate-200" />
            <span className="text-[13px] font-semibold text-slate-500">{session.examTitle}</span>
          </div>
          <div className="text-[12px] font-semibold text-slate-500">
            {session.studentName} • Roll No: {session.rollNo}
          </div>
        </div>

        <div className="max-w-[860px] mx-auto w-full px-6 py-8">
          {/* Score Hero */}
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
                    <div className={`text-[26px] font-extrabold ${stat.color} leading-none`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {stat.value}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/25 mt-1.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Graded Questions */}
          {result.resultAvailable && result.gradedQuestions && (
            <div className="anim-fade-in bg-white border border-slate-200/60 rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-[15px] font-extrabold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Question-wise Review
                </h3>
              </div>
              <div>
                {result.gradedQuestions.map((gq: any, i: number) => {
                  const q = questions.find((qq) => qq.id === gq.id);
                  return (
                    <div key={gq.id} className="flex gap-4 px-6 py-4 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${
                        gq.isCorrect ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : gq.userAnswer ? "bg-red-50 border border-red-200 text-red-600" : "bg-slate-50 border border-slate-200 text-slate-400"
                      }`}>
                        {gq.isCorrect ? "✓" : gq.userAnswer ? "✗" : "—"}
                      </span>
                      <div className="flex-1">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-1">
                          Question {i + 1}
                        </p>
                        <p className="text-[13px] font-medium text-slate-900 leading-relaxed mb-2">
                          {q?.text || `Q${i + 1}`}
                        </p>
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
                          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed bg-indigo-50/50 border border-indigo-100/50 rounded-lg px-3 py-2">
                            💡 {gq.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!result.resultAvailable && (
            <div className="bg-white border border-slate-200/60 rounded-[20px] p-10 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-[15px] font-bold text-slate-900 mb-1">Results will be released by your institute</p>
              <p className="text-[13px] text-slate-500">Your answers have been recorded. Check back later.</p>
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
  const timerColors = getTimerColor();
  const isTimeWarning = timeLeft < 300;
  const totalDuration = session?.duration ? session.duration * 60 : 3600;
  const timerProgress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-gentle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .anim-fade-in   { animation: fadeInUp 0.4s ease-out both; }
        .anim-slide-in  { animation: slideInRight 0.3s ease-out both; }
        .anim-pulse-gentle { animation: pulse-gentle 1.5s ease-in-out infinite; }

        /* Timer ring animation */
        .timer-ring {
          transition: stroke-dashoffset 1s linear;
        }

        /* Custom scrollbar */
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div className="h-[60px] bg-white border-b border-slate-200/60 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="AbhyasCore" width={100} height={63} className="h-7 w-auto object-contain" />
          <span className="w-px h-5 bg-slate-200 hidden sm:block" />
          <span className="text-[13px] font-semibold text-slate-500 hidden sm:block truncate max-w-[200px]">{session.examTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile timer */}
          <div className={`flex md:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg ${isTimeWarning ? "bg-red-50 border border-red-100" : "bg-slate-50 border border-slate-100"}`}>
            <svg className={`w-3.5 h-3.5 ${isTimeWarning ? "text-red-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-[12px] font-bold tabular-nums ${isTimeWarning ? "text-red-600 anim-pulse-gentle" : "text-slate-700"}`}>
              {formatTimer(timeLeft)}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold">
              {session.studentName?.charAt(0)?.toUpperCase() || "S"}
            </div>
            <span className="text-[12px] font-semibold text-slate-600">
              {session.studentName} <span className="text-slate-400">({session.rollNo})</span>
            </span>
          </div>
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-[12px] font-bold border-none cursor-pointer shadow-[0_4px_14px_rgba(239,68,68,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] hover:-translate-y-px active:translate-y-0"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div className="flex-1 flex min-h-[calc(100vh-60px)] relative">
        {/* ── Question Area ── */}
        <div className="flex-1 p-5 md:p-8 overflow-y-auto">
          {/* Question Header */}
          <div className="anim-fade-in flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-8 px-4 rounded-lg bg-indigo-50 border border-indigo-100 text-[12px] font-bold text-indigo-600">
                Q {currentQ + 1}/{questions.length}
              </span>
              {currentQuestion?.difficulty && (
                <span className={`inline-flex items-center h-7 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  currentQuestion.difficulty === "easy"   ? "bg-emerald-50 border border-emerald-200 text-emerald-700" :
                  currentQuestion.difficulty === "hard"   ? "bg-red-50 border border-red-200 text-red-600" :
                  "bg-amber-50 border border-amber-200 text-amber-700"
                }`}>
                  {currentQuestion.difficulty}
                </span>
              )}
            </div>
            {currentQuestion?.inferredSubject && (
              <span className="text-[11px] font-medium text-slate-400 hidden sm:block">
                {currentQuestion.inferredSubject}
              </span>
            )}
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-[20px] border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 md:p-8 mb-6">
            {/* Question Text */}
            <p className="text-[16px] font-medium text-slate-900 leading-relaxed mb-8">
              {currentQuestion?.text}
            </p>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {currentQuestion?.options.map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectAnswer(currentQuestion.id, opt.id)}
                    className={`group flex items-center gap-4 rounded-2xl px-5 py-4 cursor-pointer transition-all duration-200 text-left w-full border-[1.5px] ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/50 shadow-[0_4px_20px_rgba(79,70,229,0.1)]"
                        : "border-slate-200/80 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-[0_2px_12px_rgba(79,70,229,0.06)]"
                    }`}
                  >
                    {/* Radio indicator */}
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      isSelected
                        ? "bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] shadow-[0_2px_8px_rgba(124,58,237,0.3)]"
                        : "bg-slate-100 border-2 border-slate-200 group-hover:border-indigo-200"
                    }`}>
                      {isSelected ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-[12px] font-bold text-slate-400 group-hover:text-indigo-400">{opt.id}</span>
                      )}
                    </span>
                    <span className={`text-[14px] transition-colors ${
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
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigateQ(currentQ - 1)}
              disabled={currentQ === 0}
              className="h-10 px-4 rounded-xl flex items-center gap-2 text-[12px] font-bold bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              onClick={clearAnswer}
              className="h-10 px-4 rounded-xl flex items-center gap-2 text-[12px] font-bold bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-700 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
            <button
              onClick={markForReview}
              className={`h-10 px-4 rounded-xl flex items-center gap-2 text-[12px] font-bold transition-all ${
                statuses[currentQuestion?.id] === "marked"
                  ? "bg-amber-400 text-white border border-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-amber-200 hover:text-amber-600"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill={statuses[currentQuestion?.id] === "marked" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {statuses[currentQuestion?.id] === "marked" ? "Marked" : "Mark for Review"}
            </button>
            <div className="flex-1" />
            <button
              onClick={() => navigateQ(currentQ + 1)}
              disabled={currentQ === questions.length - 1}
              className="h-10 px-5 rounded-xl flex items-center gap-2 text-[12px] font-bold bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white shadow-[0_4px_14px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)] hover:-translate-y-px transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_14px_rgba(124,58,237,0.25)]"
            >
              Next
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        {/* Mobile overlay */}
        {showSidebar && (
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setShowSidebar(false)} />
        )}
        <div className={`${showSidebar ? "translate-x-0" : "translate-x-full"} md:translate-x-0 fixed md:static right-0 top-[60px] bottom-0 w-[280px] md:w-[270px] bg-white border-l border-slate-200/60 flex flex-col z-50 md:z-auto transition-transform duration-300 ease-out shadow-[-8px_0_30px_rgba(0,0,0,0.08)] md:shadow-none sidebar-scroll`}>
          <div className="flex-1 overflow-y-auto p-5 sidebar-scroll">
            {/* Timer */}
            <div className={`rounded-2xl bg-gradient-to-br ${timerColors.bg} border border-slate-100 p-5 text-center mb-5 relative overflow-hidden`}>
              <div className="relative mx-auto w-[120px] h-[120px] mb-3">
                {/* Timer Ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="6" opacity="0.3" />
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke={timerColors.stroke}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${(2 * Math.PI * 52) * (timerProgress / 100)}`}
                    className="timer-ring"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-[22px] font-extrabold tabular-nums tracking-wider ${isTimeWarning ? "text-red-600 anim-pulse-gentle" : "text-slate-900"}`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {formatTimer(timeLeft)}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400 mt-0.5">remaining</span>
                </div>
              </div>
            </div>

            {/* Question Palette */}
            <div className="mb-5">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">
                Question Palette
              </div>
              <div className="grid grid-cols-6 gap-[5px]">
                {questions.map((q, i) => {
                  const status = statuses[q.id] || "not-visited";
                  const isCurrent = i === currentQ;
                  const colors = STATUS_COLORS[status];

                  return (
                    <button
                      key={q.id}
                      onClick={() => { navigateQ(i); setShowSidebar(false); }}
                      className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all duration-150 hover:scale-110 ${colors.bg} ${colors.text} ${
                        isCurrent ? "ring-2 ring-indigo-500 ring-offset-1 scale-110" : ""
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 mb-5">
              {[
                { status: "answered" as const, count: answeredCount },
                { status: "not-answered" as const, count: notAnsweredCount },
                { status: "not-visited" as const, count: notVisitedCount },
                { status: "marked" as const, count: markedCount },
              ].map((item) => {
                const colors = STATUS_COLORS[item.status];
                return (
                  <div key={item.status} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-[4px] ${colors.dot} flex-shrink-0`} />
                      <span className="text-[11px] font-medium text-slate-600">{colors.label}</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-900">{item.count}</span>
                  </div>
                );
              })}
            </div>

            {/* Student Info */}
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[13px] font-bold shadow-md shadow-indigo-500/20">
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
        <div className="fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="anim-fade-in bg-white rounded-[24px] border border-slate-200/60 p-8 w-full max-w-[420px] shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5">
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
                <span className="text-amber-600 font-semibold">
                  {" "}{questions.length - answeredCount} questions are unanswered.
                </span>
              )}
            </p>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { label: "Answered", count: answeredCount, color: "bg-emerald-500" },
                { label: "Unanswered", count: notAnsweredCount, color: "bg-red-500" },
                { label: "Unvisited", count: notVisitedCount, color: "bg-slate-300" },
                { label: "Marked", count: markedCount, color: "bg-amber-400" },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color} mx-auto mb-2`} />
                  <div className="text-[15px] font-extrabold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {item.count}
                  </div>
                  <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-12 rounded-xl bg-white border-[1.5px] border-slate-200 text-slate-600 text-[13px] font-bold cursor-pointer hover:bg-slate-50 transition-colors"
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
    </div>
  );
}
