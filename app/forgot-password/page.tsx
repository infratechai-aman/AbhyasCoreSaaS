"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!auth) throw new Error("Authentication service is not available.");
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a few minutes and try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-4 selection:bg-indigo-100 font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px]"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex flex-col items-center gap-3 mb-4">
            <img src="/logo.png" alt="AbhyasCore Logo" className="h-44 w-auto object-contain" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Reset Password</h1>
          <p className="text-slate-500 text-sm mt-1">We&apos;ll send you a link to reset your password</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[32px] border border-slate-200/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="mx-auto w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Check your email</h2>
              <p className="text-slate-500 text-[14px] leading-relaxed mb-6">
                We&apos;ve sent a password reset link to<br />
                <span className="font-bold text-slate-800">{email}</span>
              </p>
              <p className="text-slate-400 text-[12px] mb-6">
                Didn&apos;t receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Try a different email
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 block mb-2 px-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aman@example.com"
                    required
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send Reset Link <KeyRound className="h-4 w-4" /></>}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-8 text-slate-500 text-[14px]">
          <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
