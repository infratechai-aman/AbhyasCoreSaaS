"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ExamJoinPage() {
  const router = useRouter();
  const params = useParams();
  const examCode = (params.examCode as string) || "";

  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!studentName.trim() || studentName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!rollNo.trim()) {
      setError("Please enter your roll number.");
      return;
    }
    if (!password) {
      setError("Please enter the exam password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/institute/verify-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examCode: examCode.toUpperCase(),
          password,
          studentName: studentName.trim(),
          rollNo: rollNo.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to join exam.");
        return;
      }

      // Store session data and redirect to test console
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "institute_exam_session",
          JSON.stringify({
            examSessionToken: data.examSessionToken,
            examTitle: data.examTitle,
            targetExam: data.targetExam,
            duration: data.duration,
            questionCount: data.questionCount,
            questions: data.questions,
            studentName: studentName.trim(),
            rollNo: rollNo.trim(),
          })
        );
      }

      router.push(`/exam/take/${examCode}`);
    } catch (e) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f1f5f9] flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Left Branding Panel */}
      <div className="hidden md:flex flex-col justify-center flex-1 px-12 py-16 max-w-[520px]">
        <div className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#c4b5fd] bg-[#ede9fe] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7c3aed] mb-[18px] w-fit">
          <span className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
          Institute Exam
        </div>

        <h1
          className="text-[clamp(24px,4vw,38px)] font-extrabold text-[#0f172a] mb-3 tracking-tight leading-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Join Your <em className="not-italic text-[#7c3aed]">Exam</em>
        </h1>
        <p className="text-sm font-medium text-[#64748b] leading-relaxed mb-6">
          Enter your details and the exam password provided by your teacher to start the test.
          Your answers will be automatically graded.
        </p>

        {/* Exam Info Pill */}
        <div className="flex items-center gap-3.5 bg-white border border-[#e2e8f0] rounded-xl p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] mb-[18px]">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-lg flex-shrink-0">
            📝
          </div>
          <div>
            <div className="text-[13px] font-bold text-[#0f172a]">
              Exam Code: {examCode.toUpperCase()}
            </div>
            <div className="text-[11px] text-[#64748b] font-medium mt-0.5">
              Powered by AbhyasCore
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] p-3.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-2.5">
            Before you start
          </div>
          {[
            "✅ Enter your full name exactly as given to your institute",
            "✅ Use the roll number assigned by your coaching",
            "✅ Ask your teacher for the exam password",
            "✅ Ensure stable internet connection",
            "⏰ Timer starts once you begin — no pausing",
          ].map((item, i) => (
            <div key={i} className="text-xs font-medium text-[#64748b] mb-1.5 flex items-center gap-2">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white border border-[#e2e8f0] rounded-[20px] p-8 shadow-[0_6px_24px_rgba(0,0,0,0.07)] w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-6 md:mb-4">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-sm font-black text-white">
              A
            </div>
            <div>
              <div
                className="text-[15px] font-extrabold text-[#0f172a]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                AbhyasCore
              </div>
              <div className="text-[10px] text-[#64748b] font-medium">Institute Exam Portal</div>
            </div>
          </div>

          <h2
            className="text-[17px] font-extrabold text-[#0f172a] mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Start Your Exam
          </h2>
          <p className="text-xs text-[#64748b] font-medium mb-5">
            Enter your details to begin the test
          </p>

          {error && (
            <div className="rounded-lg bg-[#fef2f2] border border-[#fecaca] px-3.5 py-2.5 text-xs font-semibold text-[#dc2626] mb-3.5">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="mb-3.5">
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-xs font-medium text-[#0f172a] outline-none transition-all focus:border-[#a5b4fc] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.07)] placeholder:text-[#cbd5e1]"
              autoFocus
            />
          </div>

          {/* Roll Number */}
          <div className="mb-3.5">
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5">
              Roll Number
            </label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="Enter your roll number"
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-xs font-medium text-[#0f172a] outline-none transition-all focus:border-[#a5b4fc] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.07)] placeholder:text-[#cbd5e1]"
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1.5">
              Exam Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password from your teacher"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-xs font-medium text-[#0f172a] outline-none transition-all focus:border-[#a5b4fc] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.07)] placeholder:text-[#cbd5e1]"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full py-3 rounded-[10px] bg-[#7c3aed] text-white text-sm font-bold border-none cursor-pointer shadow-[0_4px_16px_rgba(124,58,237,0.3)] transition-all hover:bg-[#6d28d9] hover:shadow-[0_6px_24px_rgba(124,58,237,0.45)] hover:-translate-y-px flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>🚀 Start Exam</>
            )}
          </button>

          <p className="text-center text-[11px] text-[#94a3b8] font-medium mt-3">
            🔒 Your answers are securely graded server-side
          </p>
        </div>
      </div>
    </div>
  );
}
