"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Archive, Calendar, Target, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface ExamResult {
  id: string;
  title: string;
  targetExam: string;
  examType: string;
  status: string;
  attemptCount: number;
  avgScore: number;
  topScore: number;
  questionCount: number;
  createdAt: string;
}

export default function RepositoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<ExamResult[]>([]);

  useEffect(() => {
    const isDemo = typeof window !== "undefined" && (window.location.search.includes("demo=true") || document.cookie.includes("abhyas_institute=1"));
    if (isDemo || user) {
      fetchResults(isDemo && !user);
    }
  }, [user]);

  const fetchResults = async (isDemo = false) => {
    try {
      let headers: Record<string, string> = {};
      let url = "/api/institute/dashboard-stats";
      if (isDemo) url += "?demo=true";
      else if (user) {
        const token = await user.getIdToken();
        headers = { Authorization: `Bearer ${token}` };
      }
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setExams((data.allExams || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        targetExam: e.targetExam,
        examType: e.examType,
        status: e.status,
        attemptCount: e.attemptCount || 0,
        avgScore: e.avgScore || 0,
        topScore: e.topScore || 0,
        questionCount: e.questionCount || 0,
        createdAt: e.createdAt,
      })));
    } catch {
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return iso; }
  };

  return (
    <div className="flex-1 p-4 md:p-8">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-display font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Archive className="w-6 h-6 text-indigo-600" /> Examination Repository
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review all your previous examination scores, reports, and AI insights.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Attempts</div>
          <div className="text-lg font-bold text-indigo-600">
            {loading ? "..." : exams.reduce((s, e) => s + e.attemptCount, 0)}
          </div>
        </div>
      </div>

      {/* Exams List */}
      <Card className="rounded-[32px] border-slate-200 bg-white p-1 md:p-4 overflow-hidden mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="w-full">
          {/* Table Header (Desktop Only) */}
          <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <div>Examination</div>
            <div>Date & Time</div>
            <div>Attempts</div>
            <div>Avg Accuracy</div>
            <div className="w-10"></div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100/60">
            {loading ? (
              <div className="py-8 flex justify-center w-full">
                 <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : exams.length === 0 ? (
              <div className="py-12 px-6 text-center text-slate-400 font-medium">No previous examinations found. Start creating one!</div>
            ) : exams.map((exam) => {
              const dateStr = formatDate(exam.createdAt);
              
              return (
              <div key={exam.id} className="flex flex-col md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-3 md:gap-4 px-5 md:px-6 py-5 hover:bg-slate-50/80 transition-colors group md:items-center relative cursor-pointer" onClick={() => router.push(`/institute/repository/${exam.id}`)}>
                
                {/* Name & Type */}
                <div className="pr-10 md:pr-0">
                  <div className="font-bold text-[15px] md:text-[14px] text-slate-900 mb-1.5 md:mb-1 leading-tight">{exam.title}</div>
                  <div className="flex items-center gap-2">
                     <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 py-0.5 px-2 rounded-md inline-block uppercase tracking-wider">
                       {exam.targetExam} {exam.examType === "full" ? "MOCK" : "CHAPTER"}
                     </div>
                     {exam.status === "live" && (
                       <div className="text-[10px] font-bold text-red-600 bg-red-50 py-0.5 px-2 rounded-md inline-flex items-center gap-1 uppercase tracking-wider">
                         <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
                       </div>
                     )}
                     {/* Date on mobile inline with tag */}
                     <div className="md:hidden flex items-center gap-1 text-[11px] text-slate-400 font-medium whitespace-nowrap">
                       <Calendar className="w-3 h-3" /> {dateStr}
                     </div>
                  </div>
                </div>

                {/* Date (Desktop Only) */}
                <div className="hidden md:flex items-center gap-1.5 text-sm text-slate-500 font-medium whitespace-nowrap">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {dateStr}
                </div>

                {/* Score & Accuracy Container for Mobile */}
                <div className="flex md:contents items-center gap-8 mt-2 md:mt-0">
                  {/* Attempts */}
                  <div>
                    <div className="text-[10px] md:hidden font-bold text-slate-400 uppercase tracking-widest mb-0.5">Attempts</div>
                    <div className="text-[16px] font-bold text-slate-900">
                      {exam.attemptCount}
                    </div>
                  </div>

                  {/* Accuracy */}
                  <div>
                    <div className="text-[10px] md:hidden font-bold text-slate-400 uppercase tracking-widest mb-0.5">Avg Accuracy</div>
                    <div className="flex flex-col gap-1">
                      <div className={`flex items-center gap-1.5 text-sm font-bold ${exam.avgScore >= 70 ? 'text-emerald-600' : exam.avgScore >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                        <Target className="w-4 h-4 md:w-3.5 md:h-3.5" /> {exam.avgScore}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="absolute right-4 top-5 md:relative md:right-0 md:top-0 flex justify-end">
                   <button className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                     <ChevronRight className="w-4 h-4" />
                   </button>
                </div>

              </div>
            )})}
          </div>
        </div>
      </Card>
      <div className="h-12"></div>
    </div>
  );
}
