"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";

interface Attempt {
  id: string;
  rank: number;
  studentName: string;
  rollNo: string;
  score: number;
  maxScore: number;
  percentage: number;
  correct: number;
  wrong: number;
  skipped: number;
  timeTaken: number;
  submittedAt: string;
}

export default function ExamResultsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const examId = params.examId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !examId) return;
    fetchResults();
  }, [user, examId]);

  const fetchResults = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/institute/results/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch");
      }
      const result = await res.json();
      setData(result);
    } catch (e: any) {
      setError(e.message || "Failed to load results.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const exportCSV = () => {
    if (!data?.attempts?.length) return;

    const headers = ["Rank", "Student Name", "Roll No", "Score", "Max Score", "Percentage", "Correct", "Wrong", "Skipped", "Time Taken", "Submitted At"];
    const rows = data.attempts.map((a: Attempt) => [
      a.rank,
      a.studentName,
      a.rollNo,
      a.score,
      a.maxScore,
      `${a.percentage}%`,
      a.correct,
      a.wrong,
      a.skipped,
      formatTime(a.timeTaken),
      a.submittedAt,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r: any[]) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.examTitle || "exam"}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={() => router.push("/institute/exams")}
          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold"
        >
          Back to Exams
        </button>
      </div>
    );
  }

  const attempts: Attempt[] = data?.attempts || [];

  return (
    <div className="flex-1 p-5 md:p-8 max-w-5xl">
      {/* Back Button */}
      <button
        onClick={() => router.push("/institute/exams")}
        className="flex items-center gap-1 text-xs font-semibold text-slate-500 mb-4 bg-transparent border-none cursor-pointer hover:text-indigo-600"
      >
        ← Back to Exams
      </button>

      {/* Score Hero Card */}
      <div className="rounded-2xl bg-[#18184a] p-10 text-center mb-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(124,58,237,0.35),transparent)] pointer-events-none" />
        <h2
          className="text-sm font-bold text-white/60 uppercase tracking-[0.2em] mb-2 relative z-10">
          {data?.examTitle || "Exam Results"}
        </h2>
        <div className="relative z-10">
          <span
            className="text-6xl font-extrabold text-white leading-none">
            {data?.totalAttempts || 0}
          </span>
          <span className="text-2xl text-white/40 ml-1">attempts</span>
        </div>
        <p className="text-[11px] text-white/40 mt-1.5 mb-6 relative z-10">
          {data?.targetExam} • +4/−1 Marking Scheme
        </p>

        {/* Stats Row */}
        <div className="flex justify-center gap-9 relative z-10">
          <div className="text-center">
            <div
              className="text-2xl font-extrabold text-[#4ade80]">
              {data?.avgScore || 0}%
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/[0.35] mt-0.5">
              Avg Score
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-2xl font-extrabold text-[#60a5fa]">
              {data?.topScore || 0}%
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/[0.35] mt-0.5">
              Top Score
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-2xl font-extrabold text-[#fbbf24]">
              {data?.avgTimeTaken ? formatTime(data.avgTimeTaken) : "—"}
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/[0.35] mt-0.5">
              Avg Time
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Header */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-sm font-extrabold text-slate-900 tracking-tight">
          🏆 Leaderboard
        </h3>
        <button
          onClick={exportCSV}
          disabled={attempts.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200/60 bg-white text-[11px] font-bold text-slate-500 cursor-pointer transition-all hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📥 Export CSV
        </button>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200/60 rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        {attempts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">📊</p>
            <p className="text-sm font-semibold text-slate-500">No attempts yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Share the exam link with your students to start collecting results.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Rank", "Student", "Roll No", "Score", "%", "Correct", "Wrong", "Skipped", "Time"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 border-b border-slate-200/60"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => {
                const rankBg =
                  a.rank === 1
                    ? "bg-[#fef3c7] text-[#92400e]"
                    : a.rank === 2
                    ? "bg-[#f1f5f9] text-[#475569]"
                    : a.rank === 3
                    ? "bg-[#fce7f3] text-[#9d174d]"
                    : "";
                return (
                  <tr key={a.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-3 py-3 border-b border-slate-50">
                      <span
                        className={`w-6 h-6 rounded-md inline-flex items-center justify-center text-[10px] font-extrabold ${
                          rankBg || "text-slate-400"
                        }`}
                      >
                        {a.rank <= 3 ? ["🥇", "🥈", "🥉"][a.rank - 1] : a.rank}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs font-bold text-slate-900 border-b border-slate-50">
                      {a.studentName}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500 border-b border-slate-50">
                      {a.rollNo}
                    </td>
                    <td className="px-3 py-3 border-b border-slate-50">
                      <span
                        className="text-sm font-extrabold text-slate-900 tracking-tight">
                        {a.score}
                      </span>
                      <span className="text-[10px] text-slate-400">/{a.maxScore}</span>
                    </td>
                    <td className="px-3 py-3 border-b border-slate-50">
                      <span
                        className={`text-xs font-extrabold ${
                          a.percentage >= 80
                            ? "text-[#16a34a]"
                            : a.percentage >= 60
                            ? "text-[#2563eb]"
                            : a.percentage >= 40
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {a.percentage}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-[#16a34a] border-b border-slate-50">
                      {a.correct}
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-red-600 border-b border-slate-50">
                      {a.wrong}
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-orange-600 border-b border-slate-50">
                      {a.skipped}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500 border-b border-slate-50">
                      {formatTime(a.timeTaken)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
