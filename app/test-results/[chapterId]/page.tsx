"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, XCircle, ChevronDown, ChevronUp, 
  Trophy, Target, Clock, Zap, RotateCcw, LayoutDashboard, 
  TrendingUp, AlertCircle, BookOpen
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  answer: string;
  explanation: string;
  difficulty: string;
}

interface ResultData {
  chapterName: string;
  subject: string;
  questions: Question[];
  answers: Record<string, string>;
  timeTaken: number;
}

import { getTestResultById } from "@/lib/firebase-service";

export default function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ResultData | null>(null);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "correct" | "wrong" | "unattempted">("all");

  useEffect(() => {
    async function fetchResult() {
      const stored = localStorage.getItem(`test_results_${params.chapterId}`);
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        // Fallback to Firebase
        const dbResult = await getTestResultById(params.chapterId as string) as any;
        if (dbResult && dbResult.questions) {
          setData(dbResult);
        } else {
          router.push("/dashboard/repository");
        }
      }
    }
    fetchResult();
  }, [params.chapterId, router]);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  const { questions, answers, chapterName, subject, timeTaken } = data;
  const total = questions.length;
  const correct = questions.filter(q => answers[q.id] === q.answer).length;
  const wrong = questions.filter(q => answers[q.id] && answers[q.id] !== q.answer).length;
  const unattempted = questions.filter(q => !answers[q.id]).length;
  const score = correct * 4 - wrong * 1; // JEE marking: +4 correct, -1 wrong
  const maxScore = total * 4;
  const percentage = Math.max(0, Math.round((score / maxScore) * 100));
  const accuracy = total - unattempted > 0 
    ? Math.round((correct / (total - unattempted)) * 100) 
    : 0;
  const timeMins = Math.floor((3600 - timeTaken) / 60);
  const timeSecs = (3600 - timeTaken) % 60;

  const filteredQs = questions.filter(q => {
    if (filterMode === "correct") return answers[q.id] === q.answer;
    if (filterMode === "wrong") return answers[q.id] && answers[q.id] !== q.answer;
    if (filterMode === "unattempted") return !answers[q.id];
    return true;
  });

  const getScoreColor = () => {
    if (percentage >= 70) return "text-emerald-500";
    if (percentage >= 40) return "text-amber-500";
    return "text-rose-500";
  };

  return (
    <div className="min-h-screen bg-[#fafafc] font-sans">
      
      {/* Header */}
      <header className="bg-slate-900 text-white px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-1">
              <BookOpen className="w-3.5 h-3.5" /> {subject} Drill Complete
            </div>
            <h1 className="font-display text-[20px] font-bold">{chapterName}</h1>
          </div>
          <div className="flex gap-3">
            <Link href={`/dashboard/practice-mode`}>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-[13px] transition-colors">
                <RotateCcw className="w-4 h-4" /> Retry Drill
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] transition-colors shadow-lg">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10">
        
        {/* Score Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-10">
          
          <div className="bg-white rounded-[28px] border border-slate-200/60 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              {/* Score Circle */}
              <div className="relative w-40 h-40 shrink-0 mx-auto md:mx-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle 
                    cx="60" cy="60" r="52" fill="none" 
                    stroke={percentage >= 70 ? "#10b981" : percentage >= 40 ? "#f59e0b" : "#f43f5e"} 
                    strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - percentage / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`font-display text-[32px] font-bold leading-none ${getScoreColor()}`}>{score}</span>
                  <span className="text-[12px] text-slate-500 font-bold mt-1">/ {maxScore}</span>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex-1">
                <h2 className="font-display text-[24px] font-bold text-slate-900 mb-1">
                  {percentage >= 70 ? "🔥 Excellent Work!" : percentage >= 40 ? "📈 Good Attempt!" : "💪 Keep Practicing!"}
                </h2>
                <p className="text-slate-500 text-[14px] mb-6">
                  Marking scheme: <span className="font-bold text-emerald-600">+4 correct</span>, <span className="font-bold text-rose-500">–1 wrong</span>, <span className="font-bold text-slate-400">0 unattempted</span>
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="text-[24px] font-display font-bold text-emerald-600">{correct}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mt-0.5">Correct</div>
                  </div>
                  <div className="text-center p-3 bg-rose-50 rounded-2xl border border-rose-100">
                    <div className="text-[24px] font-display font-bold text-rose-600">{wrong}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mt-0.5">Wrong</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="text-[24px] font-display font-bold text-slate-600">{unattempted}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Skipped</div>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <div className="text-[24px] font-display font-bold text-indigo-600">{accuracy}%</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mt-0.5">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Side stats */}
          <div className="flex lg:flex-col gap-4 lg:gap-5 justify-center">
            {[
              { icon: Clock, label: "Time Taken", value: `${timeMins}m ${timeSecs}s`, color: "text-indigo-600" },
              { icon: Target, label: "Attempted", value: `${total - unattempted}/${total}`, color: "text-amber-600" },
              { icon: TrendingUp, label: "Score %", value: `${percentage}%`, color: getScoreColor() },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white rounded-[20px] border border-slate-200/60 p-5 shadow-sm flex flex-col items-center lg:min-w-[140px]">
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <div className={`text-[22px] font-display font-bold ${color}`}>{value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Review */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[18px] font-display font-bold text-slate-900">Detailed Review</h3>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {([
                { key: "all", label: `All (${total})` },
                { key: "correct", label: `✓ Correct (${correct})` },
                { key: "wrong", label: `✗ Wrong (${wrong})` },
                { key: "unattempted", label: `− Skipped (${unattempted})` },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilterMode(tab.key)}
                  className={`px-4 py-2 rounded-lg text-[12px] font-bold transition-colors ${
                    filterMode === tab.key 
                      ? "bg-slate-900 text-white" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredQs.map((q, i) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.answer;
              const isWrong = userAnswer && !isCorrect;
              const isSkipped = !userAnswer;
              const isExpanded = expandedQ === q.id;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-[20px] border-2 overflow-hidden transition-all shadow-sm ${
                    isCorrect ? "border-emerald-200" : isWrong ? "border-rose-200" : "border-slate-200"
                  }`}
                >
                  {/* Q Header Row */}
                  <div
                    className="flex items-start gap-4 p-5 cursor-pointer"
                    onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      {isWrong && <XCircle className="w-5 h-5 text-rose-500" />}
                      {isSkipped && <AlertCircle className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Q{questions.indexOf(q) + 1}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          q.difficulty === "easy" ? "bg-emerald-50 text-emerald-600" 
                          : q.difficulty === "medium" ? "bg-amber-50 text-amber-600" 
                          : "bg-rose-50 text-rose-600"
                        }`}>{q.difficulty}</span>
                        {isCorrect && <span className="ml-auto text-[12px] font-bold text-emerald-600">+4 marks</span>}
                        {isWrong && <span className="ml-auto text-[12px] font-bold text-rose-600">-1 mark</span>}
                        {isSkipped && <span className="ml-auto text-[12px] font-bold text-slate-400">0 marks</span>}
                      </div>
                      <p className="text-[14px] font-medium text-slate-800 leading-snug line-clamp-2">{q.text}</p>
                    </div>
                    <div className="shrink-0 text-slate-400 mt-0.5">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 pt-4 bg-slate-50/50">
                      <div className="space-y-2 mb-4">
                        {q.options.map(opt => {
                          const isCorrectOpt = opt.id === q.answer;
                          const isUserOpt = opt.id === userAnswer;
                          return (
                            <div
                              key={opt.id}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-[13px] font-medium ${
                                isCorrectOpt 
                                  ? "border-emerald-400 bg-emerald-50 text-emerald-800" 
                                  : isUserOpt && !isCorrectOpt 
                                    ? "border-rose-400 bg-rose-50 text-rose-800"
                                    : "border-slate-200 text-slate-600"
                              }`}
                            >
                              <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-[12px] shrink-0 ${
                                isCorrectOpt ? "bg-emerald-500 border-emerald-500 text-white" 
                                : isUserOpt ? "bg-rose-500 border-rose-500 text-white" 
                                : "border-slate-300 text-slate-400"
                              }`}>{opt.id}</span>
                              {opt.text}
                              {isCorrectOpt && <span className="ml-auto text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Correct Answer</span>}
                              {isUserOpt && !isCorrectOpt && <span className="ml-auto text-[10px] font-bold text-rose-600 uppercase tracking-wider">Your Answer</span>}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <div className="flex gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                          <Zap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1 block">Explanation</span>
                            <p className="text-[13px] text-indigo-900 leading-relaxed">{q.explanation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
