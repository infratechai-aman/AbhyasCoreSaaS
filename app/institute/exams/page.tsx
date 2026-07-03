"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function ExamsListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "live" | "scheduled" | "ended">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchExams();
  }, [user]);

  const fetchExams = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/institute/dashboard-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setExams(data.allExams || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = filter === "all" ? exams : exams.filter((e) => e.status === filter);

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

  const copyExamLink = (examCode: string, examId: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${baseUrl}/exam/join/${examCode}`);
    setCopiedId(examId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExamStatus = async (examId: string, currentStatus: string) => {
    const newStatus = currentStatus === "live" ? "ended" : "live";
    try {
      const token = await user?.getIdToken();
      // We'll update via a simple PATCH-like approach through the API
      // For now, optimistically update the UI
      setExams((prev) =>
        prev.map((e) => (e.id === examId ? { ...e, status: newStatus } : e))
      );
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#64748b] font-medium">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2
            className="text-xl font-extrabold text-[#0f172a] mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            All Exams
          </h2>
          <p className="text-xs font-medium text-[#64748b]">
            Manage all your created exams. {exams.length} total exams.
          </p>
        </div>
        <button
          onClick={() => router.push("/institute/create-exam")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] bg-[#7c3aed] text-white text-[12px] font-bold border-none cursor-pointer shadow-[0_2px_8px_rgba(124,58,237,0.3)] transition-all hover:bg-[#6d28d9]"
        >
          ＋ Create Exam
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "live", "scheduled", "ended"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all border ${
              filter === f
                ? "bg-[#7c3aed] text-white border-[#7c3aed] shadow-[0_2px_8px_rgba(124,58,237,0.3)]"
                : "bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#a5b4fc] hover:text-[#4f46e5]"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}{" "}
            <span className="ml-1 opacity-70">
              ({f === "all" ? exams.length : exams.filter((e) => e.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Exams Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden">
        {filteredExams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">📋</p>
            <p className="text-sm font-semibold text-[#64748b]">No exams found</p>
            <p className="text-xs text-[#94a3b8] mt-1">
              {filter !== "all" ? "Try a different filter." : "Create your first exam to get started."}
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#94a3b8] border-b border-[#e2e8f0]">
                  Exam Name
                </th>
                <th className="text-left px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#94a3b8] border-b border-[#e2e8f0]">
                  Type
                </th>
                <th className="text-left px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#94a3b8] border-b border-[#e2e8f0]">
                  Date
                </th>
                <th className="text-left px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#94a3b8] border-b border-[#e2e8f0]">
                  Questions
                </th>
                <th className="text-left px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#94a3b8] border-b border-[#e2e8f0]">
                  Status
                </th>
                <th className="text-left px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#94a3b8] border-b border-[#e2e8f0]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-3.5 py-3 text-xs font-bold text-[#0f172a] border-b border-[#f8fafc]">
                    {exam.title}
                  </td>
                  <td className="px-3.5 py-3 border-b border-[#f8fafc]">
                    <span
                      className={`px-2 py-0.5 rounded-[5px] text-[10px] font-bold ${
                        exam.targetExam === "JEE"
                          ? "bg-[#ede9fe] text-[#5b21b6]"
                          : "bg-[#dcfce7] text-[#166534]"
                      }`}
                    >
                      {exam.targetExam}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-xs text-[#64748b] border-b border-[#f8fafc]">
                    {formatDate(exam.createdAt)}
                  </td>
                  <td className="px-3.5 py-3 text-xs font-semibold text-[#0f172a] border-b border-[#f8fafc]">
                    {exam.questionCount}
                  </td>
                  <td className="px-3.5 py-3 border-b border-[#f8fafc]">
                    {exam.status === "live" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#fee2e2] text-[#dc2626] border border-[#fecaca]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] animate-pulse" />
                        LIVE
                      </span>
                    )}
                    {exam.status === "scheduled" && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
                        Upcoming
                      </span>
                    )}
                    {exam.status === "ended" && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]">
                        Ended
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-3 border-b border-[#f8fafc]">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => copyExamLink(exam.examCode, exam.id)}
                        title="Copy Link"
                        className={`w-[26px] h-[26px] rounded-md border flex items-center justify-center text-[11px] cursor-pointer transition-all ${
                          copiedId === exam.id
                            ? "bg-[#16a34a] border-[#16a34a] text-white"
                            : "bg-white border-[#e2e8f0] hover:border-[#a5b4fc] hover:bg-[#f5f3ff]"
                        }`}
                      >
                        {copiedId === exam.id ? "✓" : "🔗"}
                      </button>
                      <button
                        onClick={() => router.push(`/institute/results/${exam.id}`)}
                        title="View Results"
                        className="w-[26px] h-[26px] rounded-md border border-[#e2e8f0] bg-white flex items-center justify-center text-[11px] cursor-pointer transition-all hover:border-[#a5b4fc] hover:bg-[#f5f3ff]"
                      >
                        📊
                      </button>
                      <button
                        onClick={() => toggleExamStatus(exam.id, exam.status)}
                        title={exam.status === "live" ? "End Exam" : "Make Live"}
                        className="w-[26px] h-[26px] rounded-md border border-[#e2e8f0] bg-white flex items-center justify-center text-[11px] cursor-pointer transition-all hover:border-[#a5b4fc] hover:bg-[#f5f3ff]"
                      >
                        {exam.status === "live" ? "⏹" : "▶"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
