"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, XCircle, ChevronDown, ChevronUp, 
  Trophy, Target, Clock, Zap, RotateCcw, LayoutDashboard, 
  TrendingUp, AlertCircle, BookOpen, Download, Users, Dumbbell
} from "lucide-react";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, YAxis, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
// html2canvas and jspdf are loaded dynamically on demand (see downloadReport)
// to avoid adding ~300kB to the initial page bundle.
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
           let formatted = [...userHist].reverse().map((h: any, i: number) => ({
             name: `Test ${i+1}`,
             score: h.accuracy || Math.round((h.correctCount/(h.correctCount+h.wrongCount))*100) || 0
           })).slice(-6);
           
           if (formatted.length === 1) {
             formatted.unshift({ name: "Start", score: 0 });
           }
           
           setHistory(formatted.length > 0 ? formatted : [{name: "Start", score: 0}, {name: "Test 1", score: 0}]);
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

  // Compute real difficulty breakdown instead of Math.random()
  const difficultyBreakdown = (() => {
    const groups: Record<string, { correct: number; total: number }> = {
      Easy: { correct: 0, total: 0 },
      Medium: { correct: 0, total: 0 },
      Hard: { correct: 0, total: 0 },
    };
    questions.forEach(q => {
      const d = (q.difficulty || 'medium').toLowerCase();
      const key = d === 'easy' ? 'Easy' : d === 'hard' ? 'Hard' : 'Medium';
      groups[key].total++;
      if (answers[q.id] === q.answer) groups[key].correct++;
    });
    return groups;
  })();

  // Compute dynamic strengths and weaknesses from difficulty performance
  const dynamicInsights = (() => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const easyAcc = difficultyBreakdown.Easy.total > 0 ? difficultyBreakdown.Easy.correct / difficultyBreakdown.Easy.total : 0;
    const medAcc = difficultyBreakdown.Medium.total > 0 ? difficultyBreakdown.Medium.correct / difficultyBreakdown.Medium.total : 0;
    const hardAcc = difficultyBreakdown.Hard.total > 0 ? difficultyBreakdown.Hard.correct / difficultyBreakdown.Hard.total : 0;
    if (easyAcc >= 0.7) strengths.push('Strong fundamentals (easy questions)');
    else if (easyAcc < 0.5 && difficultyBreakdown.Easy.total > 0) weaknesses.push('Revise basic concepts (easy questions)');
    if (medAcc >= 0.6) strengths.push('Good application skills (medium questions)');
    else if (medAcc < 0.4 && difficultyBreakdown.Medium.total > 0) weaknesses.push('Practice application-level problems');
    if (hardAcc >= 0.5) strengths.push('Excellent problem-solving (hard questions)');
    else if (hardAcc < 0.3 && difficultyBreakdown.Hard.total > 0) weaknesses.push('Focus on advanced/hard problems');
    if (unattempted === 0) strengths.push('Full attempt rate — no questions skipped');
    else if (unattempted > total * 0.3) weaknesses.push('Too many skipped — work on time management');
    if (accuracy >= 80) strengths.push('High accuracy under exam conditions');
    else if (wrong > correct && total - unattempted > 0) weaknesses.push('Reduce guessing — negative marking is costly');
    if (strengths.length === 0) strengths.push('Consistent attempt across difficulty levels');
    if (weaknesses.length === 0) weaknesses.push('Overall strong — keep refining edge cases');
    return { strengths, weaknesses };
  })();

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
      // Dynamic import to avoid loading ~300kB on initial page load
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
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
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#f8fafc" strokeWidth="16" />
                  <circle 
                    cx="60" cy="60" r="46" fill="none" 
                    stroke="url(#scoreGradient)" 
                    strokeWidth="16" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - percentage / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center z-10 flex flex-col items-center justify-center w-[96px] h-[96px] bg-white rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-50 absolute">
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">ABHYASCORE</div>
                  <div className="font-display text-[32px] font-bold text-slate-900 leading-none tracking-tight">{score}</div>
                  <div className="text-[11px] text-slate-400 font-bold mt-0.5">/ {maxScore}</div>
                </div>
                <div className="absolute -bottom-1 bg-indigo-600 text-white text-[11px] font-bold px-5 py-1.5 rounded-full shadow-lg border-[3px] border-white z-20">
                  {percentage}% Score
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col justify-center">
                <div className="mb-6 text-center md:text-left">
                   <h2 className="font-display text-[24px] font-bold text-slate-900 mb-1.5 flex items-center justify-center md:justify-start gap-2">
                     {percentage >= 70 ? "Excellent Effort! 🚀" : percentage >= 40 ? "Great Attempt! 🎉" : "Keep Practicing! 💪"}
                   </h2>
                   <p className="text-slate-500 text-[13px] font-medium">
                     You've completed the test with strong effort and consistency.
                   </p>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Correct */}
                  <div className="bg-white border border-emerald-100 rounded-[16px] p-4 text-center shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
                    <div className="absolute inset-0 bg-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[12px] font-bold text-slate-700">Correct</span>
                      </div>
                      <div className="text-[28px] font-display font-bold text-emerald-500 leading-none mb-1">{correct}</div>
                      <div className="text-[10px] text-emerald-500 font-bold tracking-wide">+4 marks</div>
                    </div>
                  </div>

                  {/* Wrong */}
                  <div className="bg-white border border-rose-100 rounded-[16px] p-4 text-center shadow-sm relative overflow-hidden group hover:border-rose-200 transition-colors">
                    <div className="absolute inset-0 bg-rose-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <XCircle className="w-4 h-4 text-rose-500" />
                        <span className="text-[12px] font-bold text-slate-700">Wrong</span>
                      </div>
                      <div className="text-[28px] font-display font-bold text-rose-500 leading-none mb-1">{wrong}</div>
                      <div className="text-[10px] text-rose-500 font-bold tracking-wide">-1 mark</div>
                    </div>
                  </div>

                  {/* Skipped */}
                  <div className="bg-white border border-amber-100/60 rounded-[16px] p-4 text-center shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
                    <div className="absolute inset-0 bg-amber-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <div className="w-4 h-4 rounded-full border-[2px] border-amber-500 flex items-center justify-center"><div className="w-2 h-0.5 bg-amber-500 rounded-full"/></div>
                        <span className="text-[12px] font-bold text-slate-700">Skipped</span>
                      </div>
                      <div className="text-[28px] font-display font-bold text-amber-500 leading-none mb-1">{unattempted}</div>
                      <div className="text-[10px] text-amber-500 font-bold tracking-wide">0 marks</div>
                    </div>
                  </div>

                  {/* Accuracy */}
                  <div className="bg-blue-50/30 border border-blue-100/80 rounded-[16px] p-4 text-center shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                    <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-[12px] font-bold text-blue-700">Accuracy</span>
                      </div>
                      <div className="text-[28px] font-display font-bold text-blue-600 leading-none mb-1">{accuracy}%</div>
                      <div className="text-[10px] text-blue-600/70 font-bold tracking-wide">Good</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Your Performance Trend</h3>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2.5 py-1 shadow-sm">
                   <span className="text-[11px] font-bold text-slate-600">Score</span>
                   <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>
              <div className="h-[180px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                    <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: "4 4" }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
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
          <div className="lg:col-span-4 flex flex-col gap-4 md:gap-5">
            <div className="bg-white rounded-[24px] border border-slate-100 p-6 flex items-center gap-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="w-12 h-12 rounded-full bg-indigo-50/50 border border-indigo-100/50 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Time Taken</div>
                <div className="font-display text-[20px] font-bold text-slate-800 leading-none mb-1">{timeMins}m {timeSecs}s</div>
                <div className="text-[11px] text-slate-400 font-medium">Keep practicing to improve speed!</div>
              </div>
            </div>
            
            <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-5 mb-4">
                <div className="w-12 h-12 rounded-full bg-rose-50/50 border border-rose-100/50 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Attempted</div>
                  <div className="font-display text-[20px] font-bold text-slate-800 leading-none mb-1">{total - unattempted} / {total}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{Math.round(((total-unattempted)/total)*100)}% Attempted</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 bg-rose-50 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: `${Math.round(((total-unattempted)/total)*100)}%` }} />
                </div>
                <span className="text-[11px] font-bold text-slate-500">{Math.round(((total-unattempted)/total)*100)}%</span>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-100 p-6 flex items-center gap-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="w-12 h-12 rounded-full bg-emerald-50/50 border border-emerald-100/50 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Expected Score</div>
                <div className="font-display text-[20px] font-bold text-slate-800 leading-none mb-1">{score} / {maxScore}</div>
                <div className="text-[11px] text-slate-400 font-medium">Based on marking scheme</div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-100 p-6 flex items-center gap-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="w-12 h-12 rounded-full bg-purple-50/50 border border-purple-100/50 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Predicted Rank</div>
                <div className="font-display text-[20px] font-bold text-slate-800 leading-none mb-1">
                  {Math.max(1, Math.round(120000 * (1 - (percentage + 10)/100))) } / 1,20,000
                </div>
                <div className="text-[11px] text-amber-500 font-semibold">Rough estimate only</div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-100 p-6 flex items-center gap-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="w-12 h-12 rounded-full bg-blue-50/50 border border-blue-100/50 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Estimated Percentile</div>
                <div className="font-display text-[20px] font-bold text-slate-800 leading-none mb-1">{Math.min(99.9, percentage + 25.4).toFixed(1)}</div>
                <div className="text-[11px] text-amber-500 font-semibold">Rough estimate only</div>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Analytics */}
        <div className="mb-8">
          <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest mb-4">Detailed Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">Difficulty Breakdown</h4>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-28 h-28 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Easy', value: difficultyBreakdown.Easy.total, color: '#10b981' },
                          { name: 'Medium', value: difficultyBreakdown.Medium.total, color: '#f59e0b' },
                          { name: 'Hard', value: difficultyBreakdown.Hard.total, color: '#f43f5e' }
                        ].filter(d => d.value > 0)}
                        cx="50%" cy="50%" innerRadius={35} outerRadius={45}
                        paddingAngle={2} dataKey="value" stroke="none"
                      >
                        {[
                          { name: 'Easy', value: difficultyBreakdown.Easy.total, color: '#10b981' },
                          { name: 'Medium', value: difficultyBreakdown.Medium.total, color: '#f59e0b' },
                          { name: 'Hard', value: difficultyBreakdown.Hard.total, color: '#f43f5e' }
                        ].filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-[16px] font-bold text-slate-800 leading-none">{Math.round(((total-unattempted)/total)*100)}%</span>
                     <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">Attempted</span>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-3">
                  {Object.entries(difficultyBreakdown).map(([level, stats]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${level === 'Easy' ? 'bg-emerald-500' : level === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        <span className="text-[12px] font-semibold text-slate-700">{level}</span>
                      </div>
                      <div className="text-[12px] font-bold text-slate-900">
                        {stats.correct} / {stats.total}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Attempted</span>
                      <div className="text-[12px] font-bold text-slate-800">
                        {total - unattempted} / {total}
                      </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/40 rounded-[24px] border border-emerald-100 p-6 relative overflow-hidden group shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <Target className="absolute -bottom-4 -right-4 w-32 h-32 text-emerald-500/10 group-hover:scale-110 transition-transform duration-500" />
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <Dumbbell className="w-4 h-4 text-emerald-500" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Strengths</h4>
              </div>
              <ul className="space-y-2.5 text-[12px] text-emerald-800 font-medium list-disc pl-5 relative z-10">
                {dynamicInsights.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
              <p className="text-[12px] text-emerald-600 mt-6 font-semibold relative z-10">Great job! Keep building on your strengths.</p>
            </div>

            <div className="bg-rose-50/40 rounded-[24px] border border-rose-100 p-6 relative overflow-hidden group shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-rose-500/10 group-hover:scale-110 transition-transform duration-500" />
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-700">Areas to Improve</h4>
              </div>
              <ul className="space-y-2.5 text-[12px] text-rose-800 font-medium list-disc pl-5 relative z-10">
                {dynamicInsights.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
              <p className="text-[12px] text-rose-600 mt-6 font-semibold relative z-10">Focus on these areas to boost your score.</p>
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
