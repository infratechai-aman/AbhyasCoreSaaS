"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Users, 
  Activity, 
  Crown,
  ChevronRight,
  TrendingUp,
  Zap,
  Timer,
  LayoutDashboard
} from "lucide-react";

interface ExamStat {
  id: string;
  title: string;
  targetExam: string;
  examType: string;
  status: string;
  createdAt: string;
  examCode: string;
  duration: number;
  questionCount: number;
  attemptCount: number;
  avgScore: number;
  topScore: number;
}

interface TopStudent {
  name: string;
  rollNo: string;
  avgScore: number;
  count: number;
}

// Simple donut chart component
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <div className="w-[160px] h-[160px] rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">No data</div>;
  
  let cumulative = 0;
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative w-[160px] h-[160px]">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {data.map((segment, i) => {
          const pct = segment.value / total;
          const offset = cumulative * circumference;
          cumulative += pct;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${pct * circumference} ${circumference}`}
              strokeDashoffset={-offset}
              className="transition-all duration-700"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-extrabold text-slate-900 leading-none">
          {total.toLocaleString()}
        </span>
        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Attempts</span>
      </div>
    </div>
  );
}

// Horizontal bar component
function HorizontalBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[12px] font-bold text-slate-700 w-[130px] shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-bold text-slate-900 w-10 text-right">{value}%</span>
    </div>
  );
}

export default function InstituteDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    const isDemo = typeof window !== "undefined" && window.location.search.includes("demo=true");
    if (isDemo || user) {
      fetchStats(isDemo);
    }
  }, [user]);

  const fetchStats = async (isDemo = false) => {
    try {
      let headers = {};
      let url = "/api/institute/dashboard-stats";
      
      if (isDemo) {
        url += "?demo=true";
      } else if (user) {
        const token = await user.getIdToken();
        headers = { Authorization: `Bearer ${token}` };
      }
      
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#fafafc]">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto mt-10">
        <p className="text-red-600 font-semibold">{error}</p>
        <button onClick={() => fetchStats(false)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-md">
          Retry
        </button>
      </div>
    );
  }

  const kpis = [
    {
      icon: FileText,
      iconBg: "bg-indigo-50 text-indigo-600",
      label: "EXAMS CREATED",
      value: stats?.totalExams || 0,
    },
    {
      icon: Users,
      iconBg: "bg-emerald-50 text-emerald-600",
      label: "TOTAL ATTEMPTS",
      value: (stats?.totalAttempts || 0).toLocaleString(),
    },
    {
      icon: Activity,
      iconBg: "bg-orange-50 text-orange-600",
      label: "AVERAGE SCORE",
      value: `${stats?.avgScore || 0}%`,
    },
    {
      icon: TrendingUp,
      iconBg: "bg-purple-50 text-purple-600",
      label: "ACTIVE STUDENTS",
      value: stats?.activeStudents || 0,
    },
  ];

  const recentExams: ExamStat[] = stats?.recentExams || [];
  const allExams: ExamStat[] = stats?.allExams || [];
  const topStudents: TopStudent[] = stats?.topStudents || [];
  const totalAttempts = stats?.totalAttempts || 0;

  const scoreDistribution = [
    { label: "80% and above", value: Math.round(totalAttempts * 0.12) || 0, color: "#10b981" },
    { label: "60% - 80%", value: Math.round(totalAttempts * 0.28) || 0, color: "#4f46e5" },
    { label: "40% - 60%", value: Math.round(totalAttempts * 0.34) || 0, color: "#f59e0b" },
    { label: "Below 40%", value: Math.round(totalAttempts * 0.26) || 0, color: "#ef4444" },
  ];

  const chapterPerformance = [
    { label: "Electrostatics", value: 41, color: "#ef4444" },
    { label: "Current Electricity", value: 45, color: "#f59e0b" },
    { label: "Modern Physics", value: 62, color: "#4f46e5" },
    { label: "Magnetic Effects", value: 48, color: "#f59e0b" },
    { label: "Semiconductor", value: 71, color: "#10b981" },
  ];

  const planName = stats?.plan === "coaching" ? "Coaching Plan" : stats?.plan === "enterprise" ? "Enterprise" : "Free Plan";
  const usedAttemptsFormatted = stats?.usedAttempts || 0;
  const maxAttemptsFormatted = stats?.maxAttempts || 5000;
  const attemptsPercent = Math.min((usedAttemptsFormatted / maxAttemptsFormatted) * 100, 100);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-0 lg:h-[calc(100vh-72px)] bg-[#fafafc] -m-4 md:-m-8">
      {/* Left Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        {/* Top Pills */}
        <div className="flex items-center gap-2 mb-8">
          <button 
            onClick={() => setActiveTab("Overview")}
            className={`flex items-center gap-2 h-9 px-5 rounded-full text-[13px] font-semibold transition-colors ${
              activeTab === "Overview" ? "bg-indigo-600 text-white shadow-[0_2px_8px_rgba(79,70,229,0.25)]" : "text-slate-500 hover:bg-white border border-slate-200"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button 
            onClick={() => setActiveTab("Live Exams")}
            className={`flex items-center gap-2 h-9 px-5 rounded-full text-[13px] font-semibold transition-colors ${
              activeTab === "Live Exams" ? "bg-indigo-600 text-white shadow-[0_2px_8px_rgba(79,70,229,0.25)]" : "text-slate-500 hover:bg-white border border-slate-200"
            }`}
          >
            <Activity className="w-4 h-4" /> Live Exams
          </button>
        </div>

        {/* Welcome Text */}
        <div className="mb-8">
          <h2 className="text-[24px] font-bold text-slate-900 mb-1 tracking-tight">
            Welcome back, {stats?.instituteName || "Institute"}!
          </h2>
          <p className="text-[14px] text-slate-500">
            Here&apos;s your Institute dashboard overview.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className="bg-white rounded-[16px] border border-slate-200/60 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-start gap-4"
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">
                  {kpi.label}
                </div>
                <div className="text-[28px] font-bold text-slate-900 leading-none">
                  {kpi.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section 1: Analytics Overview */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-slate-900">Analytics Overview</h3>
            <button className="text-[10px] font-bold tracking-[0.1em] text-indigo-600 uppercase hover:text-indigo-700 transition-colors">
              View Detailed Analytics
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Donut Chart Card */}
            <div className="bg-white rounded-[16px] border border-slate-200/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h4 className="text-[13px] font-bold text-slate-900 mb-6">Score Distribution</h4>
              <div className="flex items-center justify-between gap-6">
                <DonutChart data={scoreDistribution} />
                <div className="flex flex-col gap-3 flex-1">
                  {scoreDistribution.map((seg, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                        <span className="text-[12px] text-slate-600 font-medium">{seg.label}</span>
                      </div>
                      <span className="text-[12px] font-bold text-slate-900">
                        {totalAttempts > 0 ? Math.round((seg.value / totalAttempts) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chapter Performance Card */}
            <div className="bg-white rounded-[16px] border border-slate-200/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h4 className="text-[13px] font-bold text-slate-900 mb-6">Chapter Wise Accuracy</h4>
              <div>
                {chapterPerformance.map((ch, i) => (
                  <HorizontalBar key={i} label={ch.label} value={ch.value} maxValue={100} color={ch.color} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Recent Exams & Top Students */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Recent Exams */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-slate-900">Recent Exams Conducted</h3>
              <button 
                onClick={() => router.push('/institute/exams')}
                className="text-[10px] font-bold tracking-[0.1em] text-indigo-600 uppercase hover:text-indigo-700 transition-colors flex items-center gap-1"
              >
                Access All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {recentExams.length > 0 ? recentExams.slice(0, 4).map((exam, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900 mb-0.5 truncate max-w-[200px]">{exam.title}</div>
                      <div className="text-[12px] text-slate-500 mb-2">{exam.targetExam} {exam.examType === "full" ? "Main" : "Sectional"} • Avg Score: {exam.avgScore}%</div>
                      <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500 tracking-[0.1em] uppercase">
                           {exam.attemptCount} Attempts
                         </span>
                         <span className="text-[11px] font-medium text-slate-400">
                           {formatDate(exam.createdAt)}
                         </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-indigo-600 transition-colors mr-2">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              )) : (
                <div className="py-10 flex flex-col items-center justify-center bg-slate-50 rounded-[16px] border border-slate-200/60 border-dashed">
                  <FileText className="w-8 h-8 text-slate-300 mb-3" />
                  <p className="text-slate-500 text-[13px] font-medium">No exams conducted yet. Start creating one.</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Students */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-slate-900">Top Performing Students</h3>
              <button 
                onClick={() => router.push('/institute/results')}
                className="text-[10px] font-bold tracking-[0.1em] text-indigo-600 uppercase hover:text-indigo-700 transition-colors flex items-center gap-1"
              >
                View Leaderboard <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            
            <div className="bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-2">
              {topStudents.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-slate-500 text-[13px] font-medium">No student data available yet.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {topStudents.slice(0, 5).map((student, i) => {
                    const rankColor = i === 0 ? "text-amber-500 bg-amber-50 border-amber-100" 
                                    : i === 1 ? "text-slate-500 bg-slate-100 border-slate-200"
                                    : i === 2 ? "text-orange-600 bg-orange-50 border-orange-100"
                                    : "text-slate-400 bg-slate-50 border-slate-100";
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-slate-50`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[12px] font-bold ${rankColor}`}>
                            #{i + 1}
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-slate-900">{student.name}</div>
                            <div className="text-[11px] text-slate-500">Roll No: {student.rollNo}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-0.5">Avg Score</div>
                          <div className="text-[14px] font-bold text-emerald-600">{student.avgScore}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="h-12"></div>
      </div>

      {/* Right Info Sidebar - Matches ScorePrepPro style exactly */}
      <div className="w-full lg:w-[320px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-5 md:p-6 flex flex-col shrink-0 lg:overflow-y-auto">
        {/* Plan Status */}
        <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] mb-8 flex flex-col text-center">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Crown className="h-6 w-6" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-1">Plan Status</div>
          <div className="text-[15px] font-bold text-slate-900 mb-2">{planName}</div>
          <p className="text-[12px] leading-relaxed text-slate-500 mb-5 px-1">
            You are on the {planName}. Manage your students and exams effectively.
          </p>
          
          <div className="w-full text-left bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-slate-500">Attempts Used</span>
              <span className="text-[11px] font-bold text-slate-900">{usedAttemptsFormatted} / {maxAttemptsFormatted}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${attemptsPercent > 90 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                style={{ width: `${attemptsPercent}%` }} 
              />
            </div>
          </div>

          <button onClick={() => router.push('/institute/settings')} className="w-full py-2 rounded-lg border border-indigo-200 text-indigo-700 text-[12px] font-bold tracking-wide hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Upgrade Plan
          </button>
        </div>

        {/* System Announcements */}
        <div className="mb-8 flex-1">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[13px] font-bold text-slate-900">System Updates</h3>
            <button className="text-[9px] uppercase tracking-[0.1em] font-bold text-indigo-600 hover:text-indigo-700">View All</button>
          </div>

          <div className="space-y-4">
            {[
              { month: "Jul", day: "05", title: "New AI Question Generator", desc: "Generate full chapter mocks instantly", color: "bg-emerald-500" },
              { month: "Jun", day: "28", title: "Advanced Analytics v2", desc: "Track chapter-wise accuracy of batches", color: "bg-blue-500" },
              { month: "Jun", day: "15", title: "Batch Management Added", desc: "Organize students into separate batches", color: "bg-orange-500" }
            ].map((ev, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm rounded-lg py-1.5 min-w-[48px]">
                  <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">{ev.month}</span>
                  <span className="text-[14px] font-bold text-slate-900 leading-none">{ev.day}</span>
                </div>
                <div className="flex-1 flex justify-between items-start pt-0.5">
                    <div>
                      <div className="text-[12px] font-bold text-slate-900 mb-0.5">{ev.title}</div>
                      <div className="text-[11px] text-slate-500">{ev.desc}</div>
                    </div>
                    <div className={`h-1.5 w-1.5 rounded-full ${ev.color} mt-1`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
