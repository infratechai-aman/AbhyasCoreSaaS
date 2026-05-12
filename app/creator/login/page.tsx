"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function CreatorLogin() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/creator/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!auth) throw new Error("Authentication service is unavailable.");
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Let the useEffect handle the redirect to creator dashboard once auth state updates
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-4 selection:bg-indigo-100 font-sans">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px]"
      >
        <div className="flex flex-col items-center mb-8 text-center px-4">
          <Link href="/" className="flex flex-col items-center gap-3 mb-4">
            <Image src="/logo.png" alt="AbhyasCore Logo" width={280} height={176} className="h-44 w-auto object-contain" priority />
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 border border-indigo-100 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">Creator Portal</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Welcome back, Creator</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to access your Affiliate Hub</p>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="creator@example.com"
                  required
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 block mb-2 px-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In to Hub"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
