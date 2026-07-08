"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

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
    <div className="min-h-screen flex bg-[#fafafc]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── CSS Animations ── */}
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-18px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(124,58,237,0.3); }
          70%  { box-shadow: 0 0 0 12px rgba(124,58,237,0); }
          100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
        }
        .anim-fade-in   { animation: fadeInUp 0.6s ease-out both; }
        .anim-fade-in-d { animation: fadeInUp 0.6s 0.15s ease-out both; }
        .anim-fade-in-d2{ animation: fadeInUp 0.6s 0.3s ease-out both; }
        .anim-float     { animation: float 6s ease-in-out infinite; }
        .anim-float-d   { animation: float 8s 2s ease-in-out infinite; }
        .anim-shimmer   { background-size: 200% auto; animation: shimmer 3s linear infinite; }
        .anim-pulse-ring{ animation: pulse-ring 2s ease-in-out infinite; }
      `}</style>

      {/* ═══ LEFT HERO PANEL ═══ */}
      <div className="hidden lg:flex flex-col justify-center flex-1 relative overflow-hidden bg-gradient-to-br from-[#0f0a2e] via-[#1e1252] to-[#2d1b69]">
        {/* Animated orbs */}
        <div className="absolute top-[-15%] right-[-10%] w-[55%] h-[55%] bg-[#7c3aed]/20 rounded-full blur-[100px] anim-float" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-[#4f46e5]/20 rounded-full blur-[100px] anim-float-d" />
        <div className="absolute top-[40%] left-[50%] w-[25%] h-[25%] bg-[#22d3ee]/10 rounded-full blur-[80px] anim-float" />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: "repeat" }} />

        <div className="relative z-10 px-12 xl:px-16 max-w-[560px]">


          {/* Badge */}
          <div className="anim-fade-in inline-flex items-center gap-2 rounded-full border border-[#7c3aed]/40 bg-[#7c3aed]/10 px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#a78bfa] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c4b5fd]">Institute Exam Portal</span>
          </div>

          {/* Heading */}
          <h1
            className="anim-fade-in text-[clamp(28px,4.5vw,42px)] font-extrabold text-white mb-4 leading-[1.1] tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Join Your <br />
            <span className="bg-gradient-to-r from-[#a78bfa] via-[#818cf8] to-[#22d3ee] bg-clip-text text-transparent">
              Exam
            </span>
          </h1>

          <p className="anim-fade-in-d text-sm text-white/50 leading-relaxed mb-8 max-w-[380px]">
            Enter your details and the exam password provided by your teacher.
            Your answers will be automatically graded.
          </p>

          {/* Exam Code Card */}
          <div className="anim-fade-in-d flex items-center gap-4 bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-4 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#7c3aed]/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-bold text-white tracking-wide">
                Exam Code: <span className="text-[#a78bfa]">{examCode.toUpperCase()}</span>
              </div>
              <div className="text-[11px] text-white/30 font-medium mt-0.5">Powered by AbhyasCore</div>
            </div>
          </div>

          {/* Checklist */}
          <div className="anim-fade-in-d2 bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-xl">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30 mb-3">Before you start</div>
            {[
              { icon: "✏️", text: "Enter your full name exactly as given to your institute" },
              { icon: "🔢", text: "Use the roll number assigned by your coaching" },
              { icon: "🔑", text: "Ask your teacher for the exam password" },
              { icon: "📶", text: "Ensure stable internet connection" },
              { icon: "⏱️", text: "Timer starts once you begin — no pausing" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-[12px] text-white/50 mb-2 last:mb-0">
                <span className="text-sm flex-shrink-0">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT FORM PANEL ═══ */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 lg:px-12 relative">
        {/* Subtle background orbs for light panel */}
        <div className="absolute top-[-10%] right-[-8%] w-[40%] h-[40%] bg-indigo-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-8%] w-[35%] h-[35%] bg-violet-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="anim-fade-in w-full max-w-[440px] relative z-10">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-6">
            <Image
              src="/logo.png"
              alt="AbhyasCore"
              width={400}
              height={252}
              className="h-[120px] w-auto object-contain"
              priority
            />
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[28px] border border-slate-200/60 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <h2
              className="text-[22px] font-extrabold text-slate-900 mb-1 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Start Your Exam
            </h2>
            <p className="text-[13px] text-slate-400 font-medium mb-6">
              Enter your details to begin the test
            </p>

            {/* Error */}
            {error && (
              <div className="anim-fade-in flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-[12px] font-semibold text-red-600 mb-5">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {error}
              </div>
            )}

            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-2 px-1">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                  autoFocus
                  className="w-full h-[52px] pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/[0.06] placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Roll Number */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-2 px-1">
                Roll Number
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="Enter your roll number"
                  className="w-full h-[52px] pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/[0.06] placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-2 px-1">
                Exam Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password from your teacher"
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  className="w-full h-[52px] pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-medium text-slate-900 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/[0.06] placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full h-[52px] rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white text-[14px] font-bold border-none cursor-pointer shadow-[0_8px_30px_rgba(124,58,237,0.3)] transition-all hover:shadow-[0_12px_40px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_4px_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_30px_rgba(124,58,237,0.3)]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Exam
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400 font-medium mt-4 flex items-center justify-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Your answers are securely graded server-side
            </p>
          </div>

          {/* Mobile checklist */}
          <div className="mt-6 lg:hidden bg-white rounded-2xl border border-slate-200/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="text-[12px] font-bold text-slate-900">Exam Code: <span className="text-indigo-600">{examCode.toUpperCase()}</span></div>
                <div className="text-[10px] text-slate-400">Powered by AbhyasCore</div>
              </div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-2.5">Before you start</div>
            {[
              "Enter your full name exactly as given",
              "Use the roll number from your coaching",
              "Ask your teacher for the exam password",
              "Ensure stable internet connection",
              "Timer starts once you begin",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[12px] text-slate-500 mb-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
