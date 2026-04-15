"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  ChevronRight,
  Target
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetExam, setTargetExam] = useState("JEE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (!auth) throw new Error("Authentication service is not available.");
      if (!db) throw new Error("Database service is not available.");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update Auth Profile
      await updateProfile(user, { displayName: name });
      
      // Create Firestore User Doc
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        targetExam,
        createdAt: new Date().toISOString(),
        streak: 0,
        questionsSolved: 0,
        mocksCompleted: 0,
        subscription: "free"
      });
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-4 selection:bg-indigo-100 font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px]"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center px-4">
          <Link href="/" className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="font-display text-2xl font-bold text-slate-900 tracking-tight">AbhyasCore</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Create Your Account</h1>
          <p className="text-slate-500 text-sm mt-1">Join 50,000+ aspirants preparing smarter with AI</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[32px] border border-slate-200/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <form onSubmit={handleRegister} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 block mb-2 px-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aman T."
                    required
                    className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 block mb-2 px-1">Target Exam</label>
                <div className="relative group">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select 
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none appearance-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="JEE">JEE Mains</option>
                    <option value="NEET">NEET UG</option>
                    <option value="Advanced">JEE Advanced</option>
                  </select>
                </div>
              </div>
            </div>

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
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 block mb-2 px-1">Create Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Start Preparing <ChevronRight className="h-4 w-4" /></>}
              </button>
            </div>
          </form>

          <p className="text-[11px] text-slate-400 mt-6 text-center leading-relaxed">
            By signing up, you agree to our <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
          </p>
        </div>

        <p className="text-center mt-8 text-slate-500 text-[14px]">
          Already an aspirant?{" "}
          <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4">Log In Instead</Link>
        </p>
      </motion.div>
    </div>
  );
}
