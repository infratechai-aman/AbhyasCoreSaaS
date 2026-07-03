"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  difficulty?: string;
  chapterSource?: string;
  inferredSubject?: string;
}

type QStatus = "not-visited" | "answered" | "not-answered" | "marked";

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
    } catch {
      router.push(`/exam/join/${examCode}`);
    }
  }, [examCode, router]);

  // Timer — uses submitRef to avoid stale closure
  useEffect(() => {
    if (submitted || timeLeft <= 0) return;
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
  }, [submitted]);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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

  if (!session || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#64748b] font-medium">Loading exam...</p>
        </div>
      </div>
    );
  }

  // ─── RESULT SCREEN ───
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="max-w-[860px] mx-auto w-full px-6 py-8">
          {/* Score Hero */}
          <div className="rounded-2xl bg-[#18184a] p-10 text-center mb-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(124,58,237,0.35),transparent)] pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-2">{session.examTitle}</p>
              <span className="text-6xl font-extrabold text-white leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {result.score}
              </span>
              <span className="text-2xl text-white/40">/{result.maxScore}</span>
              <p className="text-[11px] text-white/40 mt-1.5 mb-6">+4 correct / −1 wrong marking</p>
              <div className="flex justify-center gap-9">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-[#4ade80]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{result.correctCount}</div>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/[0.35] mt-0.5">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-[#f87171]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{result.wrongCount}</div>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/[0.35] mt-0.5">Wrong</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-[#fbbf24]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{result.skippedCount}</div>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/[0.35] mt-0.5">Skipped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-[#60a5fa]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{result.percentage}%</div>
                  <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/[0.35] mt-0.5">Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Graded Questions */}
          {result.resultAvailable && result.gradedQuestions && (
            <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden">
              <div className="px-[18px] py-3.5 border-b border-[#e2e8f0]">
                <h3 className="text-[13px] font-extrabold text-[#0f172a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Question-wise Review
                </h3>
              </div>
              <div>
                {result.gradedQuestions.map((gq: any, i: number) => {
                  const q = questions.find((qq) => qq.id === gq.id);
                  return (
                    <div key={gq.id} className="flex gap-3 px-5 py-3.5 border-b border-[#f8fafc] last:border-b-0">
                      <span className="text-[15px] flex-shrink-0 mt-0.5">
                        {gq.isCorrect ? "✅" : gq.userAnswer ? "❌" : "⬜"}
                      </span>
                      <div className="flex-1">
                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#94a3b8] mb-1">
                          Question {i + 1}
                        </p>
                        <p className="text-xs font-medium text-[#0f172a] leading-relaxed mb-1.5">
                          {q?.text || `Q${i + 1}`}
                        </p>
                        <p className="text-[11px] font-semibold">
                          {gq.userAnswer ? (
                            <span className={gq.isCorrect ? "text-[#16a34a]" : "text-[#dc2626]"}>
                              Your answer: {gq.userAnswer} {gq.isCorrect ? "✓" : `✗ (Correct: ${gq.correctAnswer})`}
                            </span>
                          ) : (
                            <span className="text-[#d97706]">Skipped — Correct: {gq.correctAnswer}</span>
                          )}
                        </p>
                        {gq.explanation && (
                          <p className="text-[11px] text-[#64748b] mt-1 leading-relaxed">
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
            <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-8 text-center">
              <p className="text-lg mb-2">🔒</p>
              <p className="text-sm font-semibold text-[#0f172a]">Results will be released by your institute</p>
              <p className="text-xs text-[#64748b] mt-1">Your answers have been recorded. Check back later.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── EXAM UI ───
  const currentQuestion = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const isTimeWarning = timeLeft < 300; // Less than 5 mins

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="h-[52px] bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 sticky top-0 z-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold text-[#0f172a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            AbhyasCore
          </span>
          <span className="w-px h-4 bg-[#e2e8f0]" />
          <span className="text-xs font-semibold text-[#64748b]">{session.examTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#64748b]">
            {session.studentName} ({session.rollNo})
          </span>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#dc2626] text-white text-[11px] font-bold border-none cursor-pointer shadow-[0_2px_8px_rgba(220,38,38,0.3)] transition-all hover:bg-[#b91c1c]"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 grid grid-cols-[1fr_240px] min-h-[calc(100vh-52px)] max-[750px]:grid-cols-1">
        {/* Question Area */}
        <div className="p-7 overflow-y-auto bg-[#f1f5f9]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b] mb-2">
            Question {currentQ + 1} of {questions.length}
            {currentQuestion?.difficulty && (
              <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                currentQuestion.difficulty === "easy" ? "bg-[#dcfce7] text-[#166534]" :
                currentQuestion.difficulty === "hard" ? "bg-[#fef2f2] text-[#dc2626]" :
                "bg-[#fef3c7] text-[#92400e]"
              }`}>
                {currentQuestion.difficulty.toUpperCase()}
              </span>
            )}
          </p>
          <p className="text-[15px] font-medium text-[#0f172a] leading-relaxed mb-6">
            {currentQuestion?.text}
          </p>

          {/* Options */}
          <div className="flex flex-col gap-2.5">
            {currentQuestion?.options.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => selectAnswer(currentQuestion.id, opt.id)}
                  className={`flex items-center gap-3.5 bg-white border-[1.5px] rounded-[10px] px-4 py-3 cursor-pointer transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-left w-full ${
                    isSelected
                      ? "border-[#7c3aed] bg-[#f5f3ff] shadow-[0_2px_14px_rgba(124,58,237,0.12)]"
                      : "border-[#e2e8f0] hover:border-[#a5b4fc] hover:shadow-[0_2px_12px_rgba(79,70,229,0.08)]"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-[7px] flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 ${
                      isSelected
                        ? "bg-[#7c3aed] text-white"
                        : "bg-[#f1f5f9] text-[#64748b]"
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span
                    className={`text-[13px] font-medium ${
                      isSelected ? "text-[#0f172a] font-semibold" : "text-[#64748b]"
                    }`}
                  >
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation Actions */}
          <div className="flex gap-2.5 flex-wrap mt-6 pt-5 border-t border-[#e2e8f0]">
            <button
              onClick={() => navigateQ(currentQ - 1)}
              disabled={currentQ === 0}
              className="px-3.5 py-1.5 rounded-[7px] text-[11px] font-bold cursor-pointer border-none transition-all bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#a5b4fc] hover:text-[#4f46e5] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={clearAnswer}
              className="px-3.5 py-1.5 rounded-[7px] text-[11px] font-bold cursor-pointer border-none transition-all bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#a5b4fc] hover:text-[#4f46e5]"
            >
              Clear Response
            </button>
            <button
              onClick={markForReview}
              className={`px-3.5 py-1.5 rounded-[7px] text-[11px] font-bold cursor-pointer border-none transition-all ${
                statuses[currentQuestion?.id] === "marked"
                  ? "bg-[#fef3c7] text-[#92400e]"
                  : "bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#a5b4fc] hover:text-[#4f46e5]"
              }`}
            >
              {statuses[currentQuestion?.id] === "marked" ? "★ Marked" : "☆ Mark for Review"}
            </button>
            <button
              onClick={() => navigateQ(currentQ + 1)}
              disabled={currentQ === questions.length - 1}
              className="px-3.5 py-1.5 rounded-[7px] text-[11px] font-bold cursor-pointer border-none transition-all bg-[#7c3aed] text-white shadow-[0_2px_8px_rgba(124,58,237,0.25)] hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-white border-l border-[#e2e8f0] p-[18px] overflow-y-auto">
          {/* Timer */}
          <div className="rounded-[10px] bg-[#18184a] p-3.5 text-center mb-[18px]">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/[0.35] mb-1">
              Time Remaining
            </div>
            <div
              className={`text-2xl font-extrabold tracking-wider tabular-nums ${
                isTimeWarning ? "text-[#f87171] animate-pulse" : "text-white"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {formatTimer(timeLeft)}
            </div>
          </div>

          {/* Question Palette */}
          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#64748b] mb-2.5">
            Question Palette
          </div>
          <div className="grid grid-cols-6 gap-1">
            {questions.map((q, i) => {
              const status = statuses[q.id] || "not-visited";
              const isCurrent = i === currentQ;
              let cellClass = "bg-[#f1f5f9] text-[#94a3b8] border-[#e2e8f0]"; // not-visited
              if (status === "answered") cellClass = "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]";
              else if (status === "not-answered") cellClass = "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]";
              else if (status === "marked") cellClass = "bg-[#fffbeb] text-[#d97706] border-[#fde68a]";

              return (
                <button
                  key={q.id}
                  onClick={() => navigateQ(i)}
                  className={`aspect-square rounded-[5px] flex items-center justify-center text-[9px] font-bold cursor-pointer border-[1.5px] transition-transform hover:scale-110 ${cellClass} ${
                    isCurrent ? "!border-[#7c3aed] !border-2 shadow-[0_0_0_2px_rgba(124,58,237,0.15)]" : ""
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-col gap-1.5">
            {[
              { color: "bg-[#f0fdf4] border-[#bbf7d0]", label: `Answered (${answeredCount})` },
              { color: "bg-[#fef2f2] border-[#fecaca]", label: `Not Answered (${Object.values(statuses).filter(s => s === 'not-answered').length})` },
              { color: "bg-[#f1f5f9] border-[#e2e8f0]", label: `Not Visited (${Object.values(statuses).filter(s => s === 'not-visited').length})` },
              { color: "bg-[#fffbeb] border-[#fde68a]", label: `Marked (${Object.values(statuses).filter(s => s === 'marked').length})` },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-[7px] text-[10px] font-medium text-[#64748b]">
                <span className={`w-[9px] h-[9px] rounded-sm flex-shrink-0 border ${item.color}`} />
                {item.label}
              </div>
            ))}
          </div>

          {/* Student Info */}
          <div className="mt-3.5 pt-3.5 border-t border-[#e2e8f0]">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#94a3b8] mb-1">Student</div>
            <div className="text-xs font-bold text-[#0f172a]">{session.studentName}</div>
            <div className="text-[11px] text-[#64748b]">Roll No: {session.rollNo}</div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-[rgba(15,23,42,0.55)] backdrop-blur-sm z-[1000] flex items-center justify-center">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-7 w-full max-w-[380px] shadow-[0_24px_60px_rgba(0,0,0,0.15)]">
            <h3 className="text-[17px] font-extrabold text-[#0f172a] mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Submit Exam?
            </h3>
            <p className="text-[13px] text-[#64748b] leading-relaxed mb-5">
              You have answered <strong className="text-[#0f172a]">{answeredCount}</strong> out of{" "}
              <strong className="text-[#0f172a]">{questions.length}</strong> questions.
              {questions.length - answeredCount > 0 && (
                <span className="text-[#d97706]">
                  {" "}{questions.length - answeredCount} questions are unanswered.
                </span>
              )}
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-white border-[1.5px] border-[#e2e8f0] text-[#64748b] text-xs font-bold cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-xs font-bold cursor-pointer shadow-[0_2px_8px_rgba(124,58,237,0.3)] disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
