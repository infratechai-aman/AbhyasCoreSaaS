"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { FileText, Plus, ChevronRight, ClipboardList, Users, Activity } from "lucide-react";
import { fetchDashboardStats } from "@/lib/dashboard-cache";

export default function ExamsListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "live" | "scheduled" | "ended">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const isDemo = typeof window !== "undefined" && window.location.search.includes("demo=true");
    if (isDemo || user) {
      loadExams(isDemo && !user);
    }
  }, [user]);

  const loadExams = async (isDemo = false) => {
    try {
      const data = await fetchDashboardStats(user, isDemo);
      setExams(data.allExams || []);
    } catch (e: any) {
      setError("Failed to load exams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = filter === "all" ? exams : exams.filter((e) => e.status === filter);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return iso; }
  };

  const copyExamLink = (examCode: string, examId: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${baseUrl}/exam/join/${examCode}`);
    setCopiedId(examId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExamStatus = async (examId: string, currentStatus: string) => {
    const newStatus = currentStatus === "live" ? "ended" : "live";
    setTogglingId(examId);

    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/institute/update-exam", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ examId, status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update exam status.");
        return;
      }

      // Update local state on success
      setExams((prev) => prev.map((e) => (e.id === examId ? { ...e, status: newStatus } : e)));
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-5 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto mt-10">
          <p className="text-red-600 font-semibold">{error}</p>
          <button onClick={() => { setError(""); setLoading(true); loadExams(false); }} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-md">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[24px] font-semibold text-slate-900 tracking-tight mb-1">All Exams</h2>
          <p className="text-[14px] text-slate-500">Manage all your created exams. {exams.length} total exams.</p>
        </div>
        <button
          onClick={() => router.push("/institute/create-exam")}
          className="flex items-center justify-center h-9 px-5 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:bg-indigo-700 transition-all hover:scale-[1.02] gap-2"
        >
          <Plus className="w-4 h-4" /> Create Exam
        </button>
      </div>

      {/* Filter Pills */}
      <div className="inline-flex p-1 bg-white border border-slate-200/80 rounded-[10px] shadow-sm mb-8 w-full sm:w-auto">
        {(["all", "live", "scheduled", "ended"] as const).map((f) => {
          const count = f === "all" ? exams.length : exams.filter((e) => e.status === f).length;
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white shadow-[0_2px_8px_rgba(79,70,229,0.25)]"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={`text-[11px] ${active ? "text-indigo-200" : "text-slate-400"}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Exams List */}
      {filteredExams.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center bg-slate-50 rounded-[16px] border border-slate-200/60 border-dashed">
          <ClipboardList className="w-8 h-8 text-slate-300 mb-3" />
          <p className="text-slate-500 text-[13px] font-medium">
            {filter !== "all" ? "No exams match this filter." : "No exams created yet. Create your first exam."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="flex items-center justify-between p-5 bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-100 hover:shadow-md transition-all group">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-slate-900 mb-0.5">{exam.title}</div>
                  <div className="text-[12px] text-slate-500 mb-2">
                    {exam.targetExam} {exam.examType === "full" ? "Full Mock" : "Chapter Test"} &bull; {exam.questionCount} Questions &bull; {exam.duration}min
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {exam.status === "live" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-[9px] font-bold text-red-600 tracking-[0.1em] uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                      </span>
                    )}
                    {exam.status === "scheduled" && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[9px] font-bold text-blue-600 tracking-[0.1em] uppercase">Upcoming</span>
                    )}
                    {exam.status === "ended" && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500 tracking-[0.1em] uppercase">Ended</span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500 tracking-[0.1em] uppercase">
                      {exam.attemptCount || 0} Attempts
                    </span>
                    {exam.avgScore > 0 && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[9px] font-bold text-emerald-600 tracking-[0.1em] uppercase">
                        Avg: {exam.avgScore}%
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-slate-400">{formatDate(exam.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); copyExamLink(exam.examCode, exam.id); }}
                  className={`h-8 px-3 rounded-lg border text-[11px] font-bold transition-all ${
                    copiedId === exam.id
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {copiedId === exam.id ? "✓ Copied" : "🔗 Copy"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleExamStatus(exam.id, exam.status); }}
                  disabled={togglingId === exam.id}
                  className={`h-8 px-3 rounded-lg border text-[11px] font-bold transition-all disabled:opacity-50 ${
                    exam.status === "live"
                      ? "bg-white border-red-200 text-red-500 hover:bg-red-50"
                      : "bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {togglingId === exam.id ? "..." : exam.status === "live" ? "⏹ End" : "▶ Reopen"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/institute/repository/${exam.id}`); }}
                  className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                >
                  📊 Results
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="h-12"></div>
    </div>
  );
}
