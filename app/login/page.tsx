"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  ArrowRight, 
  Chrome,
  AlertCircle,
  Loader2
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, user } = useAuth();

  // Redirect already-logged-in users to dashboard
  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (!auth) throw new Error("Authentication service is not available.");
      await signInWithEmailAndPassword(auth, email, password);
      // Full page navigation to properly initialize auth context + Firestore listeners
      window.location.href = "/dashboard";
    } catch (err: any) {
      let friendlyMessage = "Incorrect email or password. Please try again.";
      if (err.message) {
        if (err.message.includes("auth/wrong-password") || err.message.includes("auth/invalid-credential") || err.message.includes("auth/user-not-found")) {
          friendlyMessage = "Incorrect email or password. Please try again.";
        } else if (err.message.includes("auth/too-many-requests")) {
          friendlyMessage = "Too many failed attempts. Please try again later.";
        }
      }
      setError(friendlyMessage);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      window.location.href = "/dashboard";
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
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex flex-col items-center gap-3 mb-4">
            <Image src="/logo.png" alt="AbhyasCore Logo" width={280} height={176} className="h-44 w-auto object-contain" priority />
          </Link>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to continue your rank-building journey</p>
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

            <div>
              <label htmlFor="login-email" className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 block mb-2 px-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  id="login-email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aman@example.com"
                  required
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between px-1 mb-2">
                <label htmlFor="login-password" className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 block">Password</label>
                <Link href="/forgot-password" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  id="login-password"
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
              disabled={loading}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <span className="relative px-4 bg-white text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">or continue with</span>
          </div>

          <button 
                onClick={handleGoogleSignIn}
                type="button" 
                className="w-full h-14 border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors font-bold text-[13px] text-slate-700"
              >
               <Chrome className="h-4 w-4 text-indigo-500" /> Continue with Google
             </button>
        </div>

        <p className="text-center mt-8 text-slate-500 text-[14px]">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4">Create Account</Link>
        </p>

      </motion.div>
    </div>
  );
}
