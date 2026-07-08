"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { 
  BarChart3, TrendingUp, Target, Download, FileText, ChevronRight,
  ArrowUpRight, ArrowDownRight, Loader2
} from "lucide-react";
import { fetchDashboardStats } from "@/lib/dashboard-cache";

interface SubjectPerf {
  name: string;
  accuracy: number;
  attempts: number;
}

interface ExamTrend {
  name: string;
  score: number;
  change: number;
  date: string;
  attemptCount: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");
  const [avgAccuracy, setAvgAccuracy] = useState(0);
  const [topSubject, setTopSubject] = useState("—");
  const [weakSubject, setWeakSubject] = useState("—");
  const [examTrends, setExamTrends] = useState<ExamTrend[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerf[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalExams, setTotalExams] = useState(0);

  useEffect(() => {
    const isDemo = typeof window !== "undefined" && window.location.search.includes("demo=true");
    if (isDemo || user) {
      loadStats(isDemo && !user);
    }
  }, [user]);

  const loadStats = async (isDemo = false) => {
    try {
      const data = await fetchDashboardStats(user, isDemo);

      // Set overall stats
      setAvgAccuracy(data.avgScore || 0);
      setTotalAttempts(data.totalAttempts || 0);
      setTotalExams(data.totalExams || 0);

      // Subject performance from API
      const subjects: SubjectPerf[] = data.subjectPerformance || [];
      setSubjectPerformance(subjects);

      // Determine top and weakest subjects
      if (subjects.length > 0) {
        const sorted = [...subjects].sort((a, b) => b.accuracy - a.accuracy);
        setTopSubject(sorted[0].name);
        setWeakSubject(sorted[sorted.length - 1].name);
      }

      // Build exam trends from allExams (which now include per-exam stats)
      const allExams = data.allExams || [];
      const trends: ExamTrend[] = allExams.slice(0, 8).map((exam: any, i: number) => {
        // Calculate score change compared to next (older) exam
        const nextExam = allExams[i + 1];
        const change = nextExam ? Math.round((exam.avgScore || 0) - (nextExam.avgScore || 0)) : 0;
        
        return {
          name: exam.title,
          score: exam.avgScore || 0,
          change,
          date: formatDate(exam.createdAt),
          attemptCount: exam.attemptCount || 0,
        };
      });
      setExamTrends(trends);
    } catch {
      // Just show empty state
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return iso; }
  };

  const exportCSV = () => {
    if (subjectPerformance.length === 0) return;
    
    const headers = ["Subject", "Accuracy (%)", "Attempts"];
    const rows = subjectPerformance.map((s) => [s.name, s.accuracy, s.attempts]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[24px] font-semibold text-slate-900 tracking-tight mb-1">Advanced Analytics</h2>
          <p className="text-[14px] text-slate-500">Deep-dive into student performance, subject-wise accuracy, and trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="flex items-center justify-center h-9 px-5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[13px] font-semibold hover:bg-slate-50 transition-all gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-10">
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Target className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Avg. Accuracy</div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">{avgAccuracy}%</div>
        </div>
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Top Subject</div>
          <div className="text-[18px] font-bold text-slate-900 leading-none truncate">{topSubject}</div>
        </div>
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Weakest Subject</div>
          <div className="text-[18px] font-bold text-slate-900 leading-none truncate">{weakSubject}</div>
        </div>
        <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <FileText className="h-4 w-4" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Total Attempts</div>
          <div className="text-[28px] font-bold text-slate-900 leading-none">{totalAttempts.toLocaleString()}</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
        {/* Recent Exam Trends */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-slate-900">Recent Exam Trends</h3>
          </div>
          {examTrends.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center bg-slate-50 rounded-[16px] border border-slate-200/60 border-dashed">
              <FileText className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-slate-500 text-[13px] font-medium">No exam data yet. Create and conduct exams to see trends.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {examTrends.map((exam, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900 mb-0.5 max-w-[250px] truncate">{exam.name}</div>
                      <div className="text-[12px] text-slate-500">Avg: {exam.score}% &bull; {exam.attemptCount} attempts &bull; {exam.date}</div>
                    </div>
                  </div>
                  {exam.change !== 0 && (
                    <div className={`flex items-center gap-1 text-[12px] font-bold ${exam.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {exam.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {Math.abs(exam.change)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subject Performance */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-slate-900">Subject Performance</h3>
          </div>
          {subjectPerformance.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center bg-slate-50 rounded-[16px] border border-slate-200/60 border-dashed">
              <BarChart3 className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-slate-500 text-[13px] font-medium">No subject data yet. Create exams with subjects to see performance.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-2">
              {subjectPerformance.map((ch, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-[13px] font-bold text-slate-900 w-[140px] truncate">{ch.name}</div>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${ch.accuracy >= 70 ? 'bg-emerald-500' : ch.accuracy >= 50 ? 'bg-indigo-500' : 'bg-red-400'}`} 
                        style={{ width: `${ch.accuracy}%` }} 
                      />
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-[13px] font-bold text-slate-900">{ch.accuracy}%</div>
                    <div className="text-[10px] text-slate-400">{ch.attempts} attempts</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
