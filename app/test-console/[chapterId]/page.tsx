"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, LayoutTemplate, AlertCircle, ChevronRight, Bookmark, X, Loader2, CheckCircle2, Flag, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { saveTestResult } from "@/lib/firebase-service";

export default function ExamConsole({ params }: { params: { chapterId: string } }) {
  const router = useRouter();
  const { user, userData } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<{ chapterName: string; subject: string; questions: any[] } | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [timeLeft, setTimeLeft] = useState(3600);

  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/exam/${params.chapterId}`)
      .then(res => res.json())
      .then(json => {
        if (json.questions) {
          setData(json);
          const initialStatuses: any = {};
          json.questions.forEach((q: any, i: number) => {
            initialStatuses[q.id] = i === 0 ? "not_answered" : "not_visited";
          });
          setStatuses(initialStatuses);
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [params.chapterId]);

  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const currentQ = data?.questions[currentIndex];
  const totalQuestions = data?.questions.length || 0;
  const answeredCount = Object.values(statuses).filter(s => s === "answered").length;
  const progressPct = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const timeWarning = timeLeft < 300; // < 5 minutes

  const handleOptionSelect = (optionId: string) => {
    setAnswers({ ...answers, [currentQ.id]: optionId });
  };

  const handleSaveAndNext = () => {
    const isAnswered = !!answers[currentQ.id];
    setStatuses(prev => ({
      ...prev,
      [currentQ.id]: isAnswered ? "answered" : "not_answered"
    }));

    if (currentIndex < data!.questions.length - 1) {
      const nextId = data!.questions[currentIndex + 1].id;
      setStatuses(prev => ({
        ...prev,
        [nextId]: prev[nextId] === "not_visited" ? "not_answered" : prev[nextId]
      }));
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleMarkForReview = () => {
    setStatuses(prev => ({ ...prev, [currentQ.id]: "marked" }));
    if (currentIndex < data!.questions.length - 1) {
      const nextId = data!.questions[currentIndex + 1].id;
      setStatuses(prev => ({
        ...prev,
        [nextId]: prev[nextId] === "not_visited" ? "not_answered" : prev[nextId]
      }));
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleClearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentQ.id];
    setAnswers(newAnswers);
  };

  const jumpToQuestion = (index: number) => {
    const currentId = data!.questions[currentIndex].id;
    if (statuses[currentId] === "not_visited") {
      setStatuses(prev => ({ ...prev, [currentId]: "not_answered" }));
    }
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    const jumpId = data!.questions[index].id;
    if (statuses[jumpId] === "not_visited") {
      setStatuses(prev => ({ ...prev, [jumpId]: "not_answered" }));
    }
  };

  const submitExam = async () => {
    if (!data || submitting) return;
    setSubmitting(true);
    try {
      let correct = 0;
      let wrong = 0;
      data.questions.forEach((q: any) => {
        const userAns = answers[q.id];
        if (userAns) {
          if (userAns === q.answer) correct++;
          else wrong++;
        }
      });
      const unattempted = totalQuestions - (correct + wrong);
      const finalScore = (correct * 4) - (wrong * 1);
      const timeUsed = 3600 - timeLeft;

      const resultPayload = {
        chapterId: params.chapterId,
        chapterName: data.chapterName,
        subject: data.subject,
        questions: data.questions,
        answers,
        correctCount: correct,
        wrongCount: wrong,
        skippedCount: unattempted,
        totalScore: finalScore,
        maxScore: totalQuestions * 4,
        timeTaken: timeUsed,
        accuracy: (correct + wrong) > 0 ? (correct / (correct + wrong)) * 100 : 0
      };

      if (user) {
        await saveTestResult(user.uid, resultPayload);
      }
      localStorage.setItem(`test_results_${params.chapterId}`, JSON.stringify({
        ...resultPayload,
        timeTaken: timeLeft
      }));
      router.push(`/test-results/${params.chapterId}`);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit your test. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status: string, isCurrent: boolean) => {
    const base = "w-full aspect-square rounded-xl flex items-center justify-center text-[12px] font-bold transition-all duration-200 border-2";
    const ring = isCurrent ? " ring-2 ring-offset-1 ring-indigo-400 scale-115 shadow-lg shadow-indigo-500/30 z-10" : "";
    switch (status) {
      case "answered": return `${base} bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/30${ring}`;
      case "not_answered": return `${base} bg-rose-500 border-rose-400 text-white shadow-sm shadow-rose-500/20${ring}`;
      case "marked": return `${base} bg-violet-500 border-violet-400 text-white shadow-sm shadow-violet-500/20${ring}`;
      default: return `${base} bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200${ring}`;
    }
  };

  const getDifficultyStyle = (difficulty: string) => {
    const d = difficulty?.toLowerCase();
    if (d === "easy") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    if (d === "hard") return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  };

  const userName = userData?.name || user?.displayName || "Aspirant";
  const userInitial = userName.charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f1a] flex flex-col items-center justify-center text-white">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-indigo-400" />
          </div>
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin absolute -top-1 -right-1" />
        </div>
        <h2 className="font-bold text-xl tracking-widest text-white">RANKFORGE</h2>
        <p className="text-slate-500 mt-2 tracking-widest text-xs uppercase">Initializing Exam Environment...</p>
      </div>
    );
  }

  if (!data || !data.questions.length) {
    return (
      <div className="min-h-screen bg-[#0d0f1a] flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Drill Initialization Failed</h2>
        <p className="text-slate-500 mb-6 max-w-md">The selected chapter dataset could not be parsed or was not found.</p>
        <Link href="/dashboard/practice-mode">
          <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-500 transition-colors">Return to Dashboard</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0d0f1a] flex flex-col overflow-hidden font-sans">

      {/* ── Header ── */}
      <header className="h-[58px] bg-[#111320]/95 backdrop-blur-xl text-white flex items-center justify-between px-6 shrink-0 relative z-20 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)]">
            <LayoutTemplate className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-wide text-white">{data.chapterName}</div>
            <div className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">{data.subject} · {totalQuestions} Qs</div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-900/30 border border-rose-800/50 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">Negative Marking</span>
          </div>

          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border ${timeWarning ? "bg-rose-900/40 border-rose-700/60" : "bg-emerald-900/20 border-emerald-700/30"}`}>
            <Clock className={`w-4 h-4 ${timeWarning ? "text-rose-400 animate-pulse" : "text-emerald-400"}`} />
            <span className={`font-bold text-[18px] tracking-widest tabular-nums ${timeWarning ? "text-rose-400" : "text-emerald-400"}`}>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={submitExam}
            disabled={submitting}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition-all text-white text-[12px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-900/50 hover:shadow-indigo-500/30"
          >
            {submitting ? "Submitting…" : "Submit Mock"}
          </button>
        </div>

        {/* Progress bar at very bottom of header */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Question panel */}
        <div className="flex-1 flex flex-col relative overflow-hidden">

          {/* Subtle background gradient blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[80px] right-[40px] w-[300px] h-[300px] bg-violet-600/5 rounded-full blur-3xl" />
          </div>

          {/* Info Bar */}
          <div className="px-8 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-white">Question {currentIndex + 1}</span>
              <span className="text-[13px] font-medium text-slate-500">of {totalQuestions}</span>
            </div>
            <div className="flex items-center gap-3">
              {answers[currentQ.id] && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" /> Answered
                </span>
              )}
              <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-widest ${getDifficultyStyle(currentQ.difficulty)}`}>
                {currentQ.difficulty}
              </span>
            </div>
          </div>

          {/* Scrollable area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="max-w-3xl"
              >
                {/* Question text */}
                <div className="text-[17px] leading-relaxed text-slate-100 font-medium mb-10 pb-7 border-b border-white/5">
                  <span className="mr-3 text-indigo-400 font-bold">Q.</span>
                  {currentQ.text}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQ.options.map((opt: any, idx: number) => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    const labels = ["A", "B", "C", "D"];
                    return (
                      <motion.div
                        key={opt.id}
                        onClick={() => handleOptionSelect(opt.id)}
                        whileHover={{ scale: 1.008 }}
                        whileTap={{ scale: 0.996 }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`group relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                            : "border-white/8 bg-white/3 hover:border-indigo-500/40 hover:bg-indigo-500/5"
                        }`}
                      >
                        {isSelected && <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600/5 to-violet-600/5 pointer-events-none" />}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold transition-colors mr-4 shrink-0 border-2 ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                            : "border-white/10 text-slate-400 group-hover:border-indigo-500/40 group-hover:text-indigo-400"
                        }`}>
                          {labels[idx] || opt.id}
                        </div>
                        <div className={`text-[15px] font-medium leading-relaxed ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                          {opt.text}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Floating Action Island ── */}
          <div className="shrink-0 px-8 py-4 flex items-center justify-between border-t border-white/5 bg-[#0d0f1a]/80 backdrop-blur-sm">
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleClearResponse}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 border border-white/5"
              >
                <X className="w-4 h-4" /> Clear
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleMarkForReview}
                className="px-4 py-2.5 bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 border border-violet-500/20"
              >
                <Flag className="w-4 h-4" /> Mark for Review
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleSaveAndNext}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-[14px] font-bold tracking-wide shadow-lg shadow-indigo-900/60 transition-all flex items-center gap-2"
            >
              Save &amp; Next <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Right: Glassmorphism Palette */}
        <div className="w-[300px] bg-[#111320]/80 backdrop-blur-xl flex flex-col shrink-0 border-l border-white/5">

          {/* Progress summary */}
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Question Palette</h3>
              <span className="text-[11px] font-bold text-emerald-400">{answeredCount}/{totalQuestions}</span>
            </div>
            {/* Mini progress bar */}
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden mb-4">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="grid grid-cols-2 gap-y-2 gap-x-3">
              {[
                { color: "bg-emerald-500", label: "Answered" },
                { color: "bg-rose-500", label: "Not Answered" },
                { color: "bg-slate-700", label: "Not Visited" },
                { color: "bg-violet-500", label: "Marked" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <div className={`w-3 h-3 rounded-sm ${color}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Number grid */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-5 gap-2">
              {data.questions.map((q, i) => {
                const status = statuses[q.id] || "not_visited";
                const isCurrent = currentIndex === i;
                return (
                  <motion.button
                    key={q.id}
                    onClick={() => jumpToQuestion(i)}
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    className={getStatusStyle(status, isCurrent)}
                  >
                    {i + 1}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* User profile mini */}
          <div className="p-4 border-t border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-[14px] shadow-[0_0_12px_rgba(99,102,241,0.4)] shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-white truncate">{userName}</div>
              <div className="text-[9px] text-indigo-400 font-bold tracking-widest uppercase">{userData?.targetExam || "JEE"} Aspirant</div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        .scale-115 { transform: scale(1.15); }
      `}} />
    </div>
  );
}
