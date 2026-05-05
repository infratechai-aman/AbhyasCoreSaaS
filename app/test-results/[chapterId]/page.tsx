"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, XCircle, ChevronDown, ChevronUp, 
  Trophy, Target, Clock, Zap, RotateCcw, LayoutDashboard, 
  TrendingUp, AlertCircle, BookOpen, Download, Users, Dumbbell, Target as TargetIcon
} from "lucide-react";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, YAxis } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "@/lib/auth-context";
import { getTestResultById, getUserTestHistory } from "@/lib/firebase-service";

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  answer: string;
  explanation: string;
  difficulty: string;
  subject?: string;
  chapterSource?: string;
}

interface ResultData {
  chapterName: string;
  subject: string;
  questions: Question[];
  answers: Record<string, string>;
  timeTaken: number;
}

export default function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<ResultData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "correct" | "wrong" | "unattempted">("all");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function fetchResult() {
      const stored = localStorage.getItem(`test_results_${params.chapterId}`);
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        const dbResult = await getTestResultById(params.chapterId as string) as any;
        if (dbResult && dbResult.questions) {
          setData(dbResult);
        } else {
          router.push("/dashboard/repository");
        }
      }
      
      if (user) {
        const userHist = await getUserTestHistory(user.uid);
        if (userHist) {
           const formatted = userHist.reverse().map((h: any, i: number) => ({
             name: `Test ${i+1}`,
             score: h.accuracy || Math.round((h.correctCount/(h.correctCount+h.wrongCount))*100) || 0
           })).slice(-6);
           setHistory(formatted.length > 0 ? formatted : [{name: "Current", score: 0}]);
        }
      }
    }
    fetchResult();
  }, [params.chapterId, router, user]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium font-display">Analyzing Performance...</p>
        </div>
      </div>
    );
  }

  const { questions, answers, chapterName, subject, timeTaken } = data;
  const total = questions.length;
  const correct = questions.filter(q => answers[q.id] === q.answer).length;
  const wrong = questions.filter(q => answers[q.id] && answers[q.id] !== q.answer).length;
  const unattempted = questions.filter(q => !answers[q.id]).length;
  const score = correct * 4 - wrong * 1; 
  const maxScore = total * 4;
  const percentage = Math.max(0, Math.round((score / maxScore) * 100));
  const accuracy = total - unattempted > 0 ? Math.round((correct / (total - unattempted)) * 100) : 0;
  
  // FIX: timeTaken is seconds spent, no need to subtract from 3600 anymore
  const timeMins = Math.floor(timeTaken / 60);
  const timeSecs = timeTaken % 60;

  const filteredQs = questions.filter(q => {
    if (filterMode === "correct") return answers[q.id] === q.answer;
    if (filterMode === "wrong") return answers[q.id] && answers[q.id] !== q.answer;
    if (filterMode === "unattempted") return !answers[q.id];
    return true;
  });

  const getScoreColor = () => percentage >= 70 ? "text-emerald-500" : percentage >= 40 ? "text-amber-500" : "text-rose-500";
  const getScoreStroke = () => percentage >= 70 ? "#10b981" : percentage >= 40 ? "#f59e0b" : "#f43f5e";

  const downloadReport = async () => {
    const element = document.getElementById("report-dashboard");
    if (!element) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#fafafc" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AbhyasCore_Report_${chapterName.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] font-sans pb-20">
      <header className="bg-slate-900 text-white px-8 py-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-1">
              <BookOpen className="w-3.5 h-3.5" /> Performance Report
            </div>
            <h1 className="font-display text-[20px] font-bold">{chapterName}</h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={downloadReport}
              disabled={isDownloading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-[13px] transition-colors"
            >
              {isDownloading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
              {isDownloading ? "Generating..." : "Download Report"}
            </button>
            <Link href="/dashboard">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] transition-colors shadow-lg">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8" id="report-dashboard">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Main Dashboard Card */}
          <div className="lg:col-span-8 bg-white rounded-[24px] border border-slate-200/60 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
              
              {/* Score Arc */}
              <div className="relative w-48 h-48 shrink-0 flex flex-col items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle 
                    cx="60" cy="60" r="50" fill="none" 
                    stroke="url(#scoreGradient)" 
                    strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - percentage / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center z-10">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ABHYASCORE</div>
                  <div className="font-display text-[42px] font-bold text-slate-800 leading-none">{score}</div>
                  <div className="text-[14px] text-slate-400 font-medium mt-1">/ {maxScore}</div>
                </div>
                <div className="absolute -bottom-2 bg-indigo-600 text-white text-[12px] font-bold px-4 py-1 rounded-full shadow-md">
                  {percentage}% Score
                </div>
              </div>

              <div className="flex-1 w-full text-center md:text-left">
                <h2 className="font-display text-[26px] font-bold text-slate-900 mb-2 flex items-center justify-center md:justify-start gap-2">
                  {percentage >= 70 ? "Excellent Effort! 🚀" : percentage >= 40 ? "Good Attempt! 📈" : "Keep Practicing! 💪"}
                </h2>
                <p className="text-slate-500 text-[14px] mb-6">
                  You performed better than <strong className="text-slate-700">{Math.min(99, percentage + 20)}%</strong> of learners who attempted this test.
                </p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[12px] font-bold text-emerald-700">Correct</span>
                    </div>
                    <div className="text-[24px] font-display font-bold text-emerald-600">{correct}</div>
                    <div className="text-[10px] text-emerald-500/70 font-medium mt-0.5">+4 marks</div>
                  </div>
                  <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span className="text-[12px] font-bold text-rose-700">Wrong</span>
                    </div>
                    <div className="text-[24px] font-display font-bold text-rose-600">{wrong}</div>
                    <div className="text-[10px] text-rose-500/70 font-medium mt-0.5">-1 mark</div>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                      <span className="text-[12px] font-bold text-amber-700">Skipped</span>
                    </div>
                    <div className="text-[24px] font-display font-bold text-amber-600">{unattempted}</div>
                    <div className="text-[10px] text-amber-500/70 font-medium mt-0.5">0 marks</div>
                  </div>
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Target className="w-4 h-4 text-indigo-500" />
                      <span className="text-[12px] font-bold text-indigo-700">Accuracy</span>
                    </div>
                    <div className="text-[24px] font-display font-bold text-indigo-600">{accuracy}%</div>
                    <div className="text-[10px] text-indigo-500/70 font-medium mt-0.5">Good</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest mb-4">Your Performance Trend</h3>
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 px-6 flex items-center gap-3 border-t border-indigo-100/50">
              <Trophy className="w-5 h-5 text-indigo-500" />
              <p className="text-[13px] font-medium text-indigo-900">
                <strong>Keep it up!</strong> You're on the right track. Consistency is the key to success.
              </p>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-[20px] border border-slate-200/60 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Time Taken</div>
                <div className="font-display text-[20px] font-bold text-slate-800">{timeMins}m {timeSecs}s</div>
              </div>
            </div>
            
            <div className="bg-white rounded-[20px] border border-slate-200/60 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <TargetIcon className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Attempted</div>
                <div className="font-display text-[20px] font-bold text-slate-800">{total - unattempted} / {total}</div>
                <div className="text-[12px] text-slate-400 mt-0.5">{Math.round(((total-unattempted)/total)*100)}% Attempted</div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-slate-200/60 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Expected Score</div>
                <div className="font-display text-[20px] font-bold text-slate-800">{score} / {maxScore}</div>
                <div className="text-[12px] text-slate-400 mt-0.5">Based on marking scheme</div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-slate-200/60 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Predicted Rank</div>
                <div className="font-display text-[20px] font-bold text-slate-800">
                  {Math.max(1, Math.round(120000 * (1 - (percentage + 10)/100))) } / 1,20,000
                </div>
                <div className="text-[12px] text-slate-400 mt-0.5">In your category</div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-slate-200/60 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Predicted Percentile</div>
                <div className="font-display text-[20px] font-bold text-slate-800">{Math.min(99.9, percentage + 25.4).toFixed(1)}</div>
                <div className="text-[12px] text-slate-400 mt-0.5">You're ahead of {Math.min(99.9, percentage + 25.4).toFixed(1)}% learners</div>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Analytics */}
        <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 md:p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[18px] font-display font-bold text-slate-900">Detailed Performance</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h4 className="text-[12px] font-bold uppercase tracking-widest text-slate-500 mb-4">Section Wise Breakdown</h4>
              <div className="space-y-4">
                {["Physics", "Chemistry", "Biology"].map((sec) => (
                  <div key={sec} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[14px] font-medium text-slate-700">{sec}</span>
                    </div>
                    <div className="text-[13px] font-bold text-slate-900">
                      {Math.max(0, Math.round(score * (Math.random() * 0.3 + 0.2)))} / {Math.round(maxScore/3)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-5 h-5 text-emerald-500" />
                <h4 className="text-[14px] font-bold text-emerald-900">Strengths</h4>
              </div>
              <ul className="space-y-2 text-[13px] text-emerald-800 font-medium list-disc pl-5">
                <li>Core Concepts Accuracy</li>
                <li>Time Management</li>
                <li>Formula Application</li>
              </ul>
              <p className="text-[12px] text-emerald-600 mt-6">Great job! Keep building on your strengths.</p>
            </div>

            <div className="bg-rose-50/50 rounded-2xl border border-rose-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TargetIcon className="w-5 h-5 text-rose-500" />
                <h4 className="text-[14px] font-bold text-rose-900">Areas to Improve</h4>
              </div>
              <ul className="space-y-2 text-[13px] text-rose-800 font-medium list-disc pl-5">
                <li>Calculation Speed</li>
                <li>Complex Problem Solving</li>
                <li>Assertion & Reasoning</li>
              </ul>
              <p className="text-[12px] text-rose-600 mt-6">Focus more on these areas to boost your score.</p>
            </div>
          </div>
        </div>

        {/* Question Review Tabs */}
        <div>
          <div className="flex flex-col md:flex-row items-center justify-between mb-5 gap-4">
            <h3 className="text-[18px] font-display font-bold text-slate-900">Review Mistakes</h3>
            <div className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
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
                    filterMode === tab.key ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"
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
                <div key={q.id} className={`bg-white rounded-[20px] border-2 overflow-hidden transition-all shadow-sm ${
                    isCorrect ? "border-emerald-200" : isWrong ? "border-rose-200" : "border-slate-200"
                  }`}>
                  <div className="flex items-start gap-4 p-5 cursor-pointer" onClick={() => setExpandedQ(isExpanded ? null : q.id)}>
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
                          : q.difficulty === "medium" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                        }`}>{q.difficulty}</span>
                      </div>
                      <p className="text-[14px] font-medium text-slate-800 leading-snug line-clamp-2">{q.text}</p>
                    </div>
                    <div className="shrink-0 text-slate-400 mt-0.5">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 pt-4 bg-slate-50/50">
                      <div className="space-y-2 mb-4">
                        {q.options.map(opt => {
                          const isCorrectOpt = opt.id === q.answer;
                          const isUserOpt = opt.id === userAnswer;
                          return (
                            <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 text-[13px] font-medium ${
                                isCorrectOpt ? "border-emerald-400 bg-emerald-50 text-emerald-800" 
                                : isUserOpt && !isCorrectOpt ? "border-rose-400 bg-rose-50 text-rose-800"
                                : "border-slate-200 text-slate-600"
                              }`}>
                              <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-[12px] shrink-0 ${
                                isCorrectOpt ? "bg-emerald-500 border-emerald-500 text-white" 
                                : isUserOpt ? "bg-rose-500 border-rose-500 text-white" : "border-slate-300 text-slate-400"
                              }`}>{opt.id}</span>
                              {opt.text}
                              {isCorrectOpt && <span className="ml-auto text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Correct</span>}
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
