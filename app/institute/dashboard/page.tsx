"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

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

export default function InstituteDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/institute/dashboard-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#64748b] font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        <button onClick={fetchStats} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold">
          Retry
        </button>
      </div>
    );
  }

  const kpis = [
    {
      icon: "📝",
      iconBg: "bg-[#ede9fe]",
      label: "Exams Created",
      value: stats?.totalExams || 0,
      change: `↑ ${Math.min(stats?.totalExams || 0, 8)} this month`,
      changeColor: "text-[#16a34a]",
    },
    {
      icon: "📈",
      iconBg: "bg-[#eff6ff]",
      label: "Total Attempts",
      value: (stats?.totalAttempts || 0).toLocaleString(),
      change: `↑ ${stats?.totalAttempts || 0} total`,
      changeColor: "text-[#2563eb]",
    },
    {
      icon: "⚡",
      iconBg: "bg-[#fef3c7]",
      label: "Live Exams",
      value: stats?.liveExamCount || 0,
      change: `● ${stats?.activeStudents || 0} students active`,
      changeColor: "text-[#dc2626]",
    },
    {
      icon: "🎯",
      iconBg: "bg-[#dcfce7]",
      label: "Average Score",
      value: `${stats?.avgScore || 0}%`,
      change: "Across all exams",
      changeColor: "text-[#16a34a]",
    },
  ];

  const recentExams: ExamStat[] = stats?.recentExams || [];
  const topStudents: TopStudent[] = stats?.topStudents || [];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2
            className="text-xl font-extrabold text-[#0f172a] mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Welcome back, {stats?.instituteName || "Institute"} 👋
          </h2>
          <p className="text-xs font-medium text-[#64748b]">
            Here&apos;s what&apos;s happening with your exams today.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6 max-[1000px]:grid-cols-2">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="bg-white border border-[#e2e8f0] rounded-[14px] p-[18px_20px] flex items-start gap-3.5 transition-all hover:border-[#c4b5fd] hover:shadow-[0_4px_20px_rgba(79,70,229,0.08)] shadow-[0_1px_4px_rgba(0,0,0,0.03)]"
          >
            <div
              className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0 ${kpi.iconBg}`}
            >
              {kpi.icon}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1">
                {kpi.label}
              </div>
              <div
                className="text-2xl font-extrabold text-[#0f172a] leading-none"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {kpi.value}
              </div>
              <div className={`text-[11px] font-semibold mt-1.5 ${kpi.changeColor}`}>
                {kpi.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Grid: Upcoming Exams + Recent Results */}
      <div className="grid grid-cols-2 gap-[18px] mb-[18px] max-[900px]:grid-cols-1">
        {/* Upcoming / Live Exams */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-[#e2e8f0]">
            <h3
              className="text-[13px] font-extrabold text-[#0f172a]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Upcoming / Live Exams
            </h3>
            <button
              onClick={() => router.push("/institute/exams")}
              className="text-[11px] font-bold text-[#4f46e5] cursor-pointer hover:underline bg-transparent border-none"
            >
              View All
            </button>
          </div>
          <div className="p-[14px_18px]">
            <div className="flex flex-col gap-2.5">
              {recentExams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[#64748b]">No exams created yet.</p>
                  <button
                    onClick={() => router.push("/institute/create-exam")}
                    className="mt-3 px-4 py-2 bg-[#7c3aed] text-white rounded-lg text-xs font-bold"
                  >
                    Create Your First Exam
                  </button>
                </div>
              ) : (
                recentExams.slice(0, 3).map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-3 rounded-[10px] border border-[#e2e8f0] bg-[#fafafa] transition-all hover:border-[#c4b5fd] hover:bg-white hover:shadow-[0_2px_12px_rgba(79,70,229,0.07)]"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[13px] font-bold text-[#0f172a]">{exam.title}</span>
                        {exam.status === "live" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#fee2e2] text-[#dc2626] border border-[#fecaca]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] animate-pulse" />
                            LIVE
                          </span>
                        )}
                        {exam.status === "scheduled" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
                            Upcoming
                          </span>
                        )}
                        {exam.status === "ended" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]">
                            Ended
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3.5 flex-wrap">
                        <span className="text-[11px] font-medium text-[#64748b] flex items-center gap-1">
                          📅 {formatDate(exam.createdAt)}
                        </span>
                        <span className="text-[11px] font-medium text-[#64748b] flex items-center gap-1">
                          ⏰ {exam.duration} min
                        </span>
                        <span className="text-[11px] font-medium text-[#64748b] flex items-center gap-1">
                          👤 {exam.attemptCount} attempted
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/institute/results/${exam.id}`)}
                      className={`px-3.5 py-1.5 rounded-[7px] text-[11px] font-bold cursor-pointer border-none transition-all ${
                        exam.status === "live"
                          ? "bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#a5b4fc] hover:text-[#4f46e5]"
                          : "bg-[#7c3aed] text-white shadow-[0_2px_8px_rgba(124,58,237,0.25)] hover:bg-[#6d28d9]"
                      }`}
                    >
                      {exam.status === "live" ? "Monitor" : "Results"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Results */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-[#e2e8f0]">
            <h3
              className="text-[13px] font-extrabold text-[#0f172a]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Recent Results
            </h3>
            <button
              onClick={() => router.push("/institute/exams")}
              className="text-[11px] font-bold text-[#4f46e5] cursor-pointer hover:underline bg-transparent border-none"
            >
              View All
            </button>
          </div>
          <div className="p-[14px_18px]">
            {recentExams.length === 0 ? (
              <p className="text-sm text-[#64748b] text-center py-6">No results yet.</p>
            ) : (
              <div className="flex flex-col">
                {recentExams.slice(0, 4).map((exam, i) => (
                  <div
                    key={exam.id}
                    className={`flex items-center justify-between py-2.5 ${
                      i < recentExams.length - 1 ? "border-b border-[#f1f5f9]" : ""
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0f172a] mb-0.5">{exam.title}</div>
                      <div className="text-[10px] text-[#94a3b8]">{formatDate(exam.createdAt)}</div>
                    </div>
                    <div className="flex gap-5 items-center">
                      <div className="text-right">
                        <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#94a3b8] mb-0.5">
                          Avg Score
                        </div>
                        <div
                          className="text-sm font-extrabold text-[#0f172a]"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {exam.avgScore}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#94a3b8] mb-0.5">
                          Top Score
                        </div>
                        <div
                          className="text-sm font-extrabold text-[#16a34a]"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {exam.topScore}%
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/institute/results/${exam.id}`)}
                        className="w-7 h-7 rounded-[7px] border border-[#e2e8f0] bg-white flex items-center justify-center cursor-pointer text-xs transition-all hover:border-[#a5b4fc] hover:bg-[#f5f3ff]"
                      >
                        📊
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Students */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-[#e2e8f0]">
          <h3
            className="text-[13px] font-extrabold text-[#0f172a]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Top Performing Students
          </h3>
        </div>
        <div className="p-[14px_18px]">
          {topStudents.length === 0 ? (
            <p className="text-sm text-[#64748b] text-center py-6">No student data yet.</p>
          ) : (
            <div className="flex flex-col">
              {topStudents.slice(0, 5).map((student, i) => {
                const rankBg =
                  i === 0
                    ? "bg-[#fef3c7] text-[#92400e]"
                    : i === 1
                    ? "bg-[#f1f5f9] text-[#475569]"
                    : i === 2
                    ? "bg-[#fce7f3] text-[#9d174d]"
                    : "bg-[#f8fafc] text-[#94a3b8]";
                const avatarInitials = student.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 py-2.5 ${
                      i < topStudents.length - 1 ? "border-b border-[#f1f5f9]" : ""
                    }`}
                  >
                    <div className="w-5 text-center">
                      <span
                        className={`w-[22px] h-[22px] rounded-md inline-flex items-center justify-center text-[10px] font-extrabold ${rankBg}`}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#ede9fe] flex items-center justify-center text-[10px] font-extrabold text-[#4f46e5] flex-shrink-0">
                      {avatarInitials}
                    </div>
                    <div className="flex-1 text-xs font-bold text-[#0f172a]">{student.name}</div>
                    <div className="text-xs font-extrabold text-[#16a34a]">{student.avgScore}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
