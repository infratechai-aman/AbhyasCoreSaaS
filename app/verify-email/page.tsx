"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // If user verifies on another tab, wait for them to click "I have verified"
    // Or auto-redirect if auth state updates
    if (user && user.emailVerified) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setResending(true);
    setMessage("");
    setError("");
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage("Verification email has been resent! Please check your spam folder too.");
    } catch (err: any) {
      if (err.code === "auth/too-many-requests") {
         setError("You've requested too many emails recently. Please wait a few minutes.");
      } else {
         setError("Failed to resend. Please try again later.");
      }
    } finally {
      setResending(false);
    }
  };

  const handleRefreshState = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        router.push("/dashboard");
      } else {
        setError("Your email is still not verified. Please click the link sent to your inbox.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-4 selection:bg-indigo-100 font-sans">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px]"
      >
        <div className="bg-white rounded-[32px] border border-slate-200/60 p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-xl text-center">
          
          <div className="mx-auto w-20 h-20 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Mail className="w-8 h-8" />
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-3">Verify your email</h1>
          <p className="text-slate-500 text-[15px] leading-relaxed mb-6">
            We sent a secure verification link to <br/>
            <span className="font-bold text-slate-800">{user?.email || "your inbox"}</span>.
            <br/> Please click the link to activate your account.
          </p>

          {message && (
             <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[13px] font-medium flex items-start gap-3 text-left">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                {message}
             </div>
          )}

          {error && (
             <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[13px] font-medium flex items-start gap-3 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
             </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleRefreshState}
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-0.5"
            >
              I have verified my email <ArrowRight className="w-4 h-4" />
            </button>
            
            <button 
              onClick={handleResend}
              disabled={resending}
              className="w-full h-14 bg-white border border-slate-200 hover:border-indigo-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50"
            >
              {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Resend verification link
            </button>
          </div>

        </div>

        <p className="text-center mt-8 text-slate-500 text-[14px]">
          Entered the wrong email?{" "}
          <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4">Sign up again</Link>
        </p>
      </motion.div>
    </div>
  );
}
