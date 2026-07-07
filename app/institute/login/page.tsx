"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ArrowRight,
  Chrome,
  GraduationCap,
} from "lucide-react";

export default function InstituteLoginPage() {
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // After login, verify institute ownership then redirect
  useEffect(() => {
    if (!user || verifying) return;

    const verifyAndRedirect = async () => {
      setVerifying(true);
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/institute/verify-owner", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data?.isInstitute) {
          // Set institute cookie so middleware allows access
          document.cookie =
            "abhyas_institute=1; path=/; max-age=86400; SameSite=Lax; Secure";
          document.cookie =
            "abhyas_session=1; path=/; max-age=86400; SameSite=Lax; Secure";
          try {
            sessionStorage.setItem(
              "abhyas_institute",
              JSON.stringify({ id: data.instituteId, name: data.instituteName })
            );
          } catch {}
          // Full navigation to properly initialize
          window.location.href = "/institute/dashboard";
        } else {
          setError(
            "This account is not registered as an institute. Please contact support or use the student login."
          );
          setLoading(false);
          setVerifying(false);
        }
      } catch {
        setError("Failed to verify institute status. Please try again.");
        setLoading(false);
        setVerifying(false);
      }
    };

    verifyAndRedirect();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // DEV BYPASS: Allow any credentials
    document.cookie = "abhyas_institute=1; path=/; max-age=86400; SameSite=Lax; Secure";
    document.cookie = "abhyas_session=1; path=/; max-age=86400; SameSite=Lax; Secure";
    try {
      sessionStorage.setItem(
        "abhyas_institute",
        JSON.stringify({ id: "dev_institute", name: "Dev Mode Institute" })
      );
    } catch {}
    window.location.href = "/institute/dashboard?demo=true";
    return;

    try {
      if (!auth)
        throw new Error("Authentication service is not available.");
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // useEffect above will handle verify + redirect
    } catch (err: any) {
      let friendlyMessage = "Incorrect email or password. Please try again.";
      if (err.message) {
        if (
          err.message.includes("auth/too-many-requests")
        ) {
          friendlyMessage =
            "Too many failed attempts. Please try again later.";
        }
      }
      setError(friendlyMessage);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      // useEffect above will handle verify + redirect
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed. Please try again.");
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
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex flex-col items-center gap-3 mb-4">
            <Image
              src="/logo.png"
              alt="AbhyasCore Logo"
              width={240}
              height={150}
              className="h-36 w-auto object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 border border-indigo-100 mb-4">
            <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
              Institute Portal
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Teacher / Institute Login
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sign in to manage your exams and students
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[32px] border border-slate-200/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-5">
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

            {verifying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-[13px] font-medium"
              >
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Verifying institute access...
              </motion.div>
            )}

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 block mb-2 px-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@institute.com"
                  required
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between px-1 mb-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 block">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || verifying}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading || verifying ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In to Institute <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative px-4 bg-white text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
              or continue with
            </span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            type="button"
            disabled={loading || verifying}
            className="w-full h-14 border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors font-bold text-[13px] text-slate-700 disabled:opacity-50"
          >
            <Chrome className="h-4 w-4 text-indigo-500" /> Continue with Google
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-3">
          <p className="text-slate-500 text-[14px]">
            Are you a student?{" "}
            <Link
              href="/login"
              className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
            >
              Student Login
            </Link>
          </p>
          <p className="text-slate-400 text-[12px]">
            Don&apos;t have an institute account?{" "}
            <Link
              href="/contact"
              className="font-semibold text-slate-500 hover:text-slate-600 underline underline-offset-4"
            >
              Contact Us
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
