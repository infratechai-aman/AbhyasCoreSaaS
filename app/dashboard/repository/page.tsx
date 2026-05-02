"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePremium } from "@/lib/hooks/usePremium";
import { ProLockScreen } from "@/components/ui/pro-lock-screen";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Archive, Calendar, Target, ChevronRight, BarChart2, Loader2 } from "lucide-react";
import Link from "next/link";
import { getUserTestHistory } from "@/lib/firebase-service";

export default function RepositoryPage() {
  const { user } = useAuth();
  const { canAccessRepository, isTrialExpired } = usePremium();
  const [pastExams, setPastExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user?.uid) {
        const history = await getUserTestHistory(user.uid);
        setPastExams(history);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (!canAccessRepository) {
    return (
      <DashboardShell>
        <ProLockScreen
          featureName="Examination Repository"
          description="Access your full examination history, detailed score analysis, and AI-generated improvement insights — only for Pro members."
          isTrialExpired={isTrialExpired}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Archive className="w-6 h-6 text-indigo-600" /> Examination Repository
            </h1>
            <p className="text-slate-500 text-sm mt-1">Review all your previous examination scores, reports, and AI insights.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Attempts</div>
            <div className="text-lg font-bold text-indigo-600">{loading ? "..." : pastExams.length}</div>
          </div>
        </div>

        {/* Exams List */}
        <Card className="rounded-[32px] border-slate-200 bg-white p-2 md:p-4 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
             <div className="min-w-[700px]">
                {/* Table Header */}
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <div>Examination</div>
                  <div>Date & Time</div>
                  <div>Score</div>
                  <div>Accuracy & %ile</div>
                  <div className="w-10"></div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100/60">
                  {loading ? (
                    <div className="py-8 flex justify-center w-full">
                       <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                  ) : pastExams.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 font-medium">No previous examinations found. Please complete a mock test!</div>
                  ) : pastExams.map((exam) => {
                    const d = exam.timestamp?.toDate ? exam.timestamp.toDate() : new Date();
                    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const score = (exam.correctCount || 0) * 4 - ((exam.totalQuestions || 0) - (exam.correctCount || 0)) * 1; 
                    const totalScore = (exam.totalQuestions || 30) * 4;
                    const accuracy = Math.round(((exam.correctCount || 0) / (exam.totalQuestions || 1)) * 100);
                    
                    return (
                    <div key={exam.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-5 hover:bg-slate-50/80 transition-colors group items-center">
                      
                      {/* Name & Type */}
                      <div>
                        <div className="font-bold text-[14px] text-slate-900 mb-1">{exam.chapterName || exam.chapterId || "Mock Test"}</div>
                        <div className="text-[11px] font-semibold text-indigo-500 bg-indigo-50 py-0.5 px-2 rounded-md inline-block">
                          {exam.subject || "Full Syllabus"}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {dateStr}
                      </div>

                      {/* Score */}
                      <div>
                        <div className="text-[16px] font-bold text-slate-900">
                          {score} <span className="text-slate-400 text-sm font-medium">/ {totalScore}</span>
                        </div>
                      </div>

                      {/* Accuracy & Percentile */}
                      <div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                            <Target className="w-3.5 h-3.5" /> {accuracy}%
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex justify-end">
                        <Link href={`/test-results/${exam.id}?dbRef=true`}>
                           <button className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                             <ChevronRight className="w-4 h-4" />
                           </button>
                        </Link>
                      </div>

                    </div>
                  )})}
                </div>
             </div>
          </div>
        </Card>

      </div>
    </DashboardShell>
  );
}
