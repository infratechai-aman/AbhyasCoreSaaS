"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserTestHistory } from "@/lib/firebase-service";
import { authenticatedFetch } from "@/lib/api";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Syllabus } from "@/lib/syllabus";
import { useAuth } from "@/lib/auth-context";
import { useRazorpay } from "@/lib/hooks/useRazorpay";
import { X, CheckCircle, AlertTriangle } from "lucide-react";
import { 
  FileText, 
  Database, 
  Clock, 
  Flame, 
  Crown, 
  Sparkles,
  Zap,
  ChevronRight,
  LayoutDashboard,
  Shield,
  Check,
  Star,
  Rocket
} from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const { userData, user } = useAuth();
  const searchParams = useSearchParams();
  const { openCheckout } = useRazorpay();
  const [quickTestOpen, setQuickTestOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [recentMocks, setRecentMocks] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [difficulty, setDifficulty] = useState("Standard");
  const [quickSubject, setQuickSubject] = useState("Full PCMB Syllabus");
  const [showProModal, setShowProModal] = useState(false);
  const [selectedProPlan, setSelectedProPlan] = useState<"monthly" | "yearly">("monthly");
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (user?.uid) {
      getUserTestHistory(user.uid, 4).then(res => setRecentMocks(res));
    }
  }, [user?.uid]);

  // Auto-sync missing subscriptions for Free users (uses authenticated API)
  useEffect(() => {
    const checkMissingSubscription = async () => {
      if (!user?.uid || !user?.email || userData?.subscription?.plan !== "Free") return;
      
      try {
        const res = await authenticatedFetch("/api/payment/check-user-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        
        if (data.hasActiveSubscription && data.plan) {
          setToast({ message: "Your Pro plan has been restored and synced!", type: "success" });
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (err) {
        console.error("Auto-sync failed", err);
      }
    };

    // Only run this once per session to avoid spamming the API
    if (!sessionStorage.getItem("hasCheckedSubSyncV4")) {
      sessionStorage.setItem("hasCheckedSubSyncV4", "true");
      checkMissingSubscription();
    }
  }, [user, userData]);

  // Pro features check
  const isPremium = userData?.subscription?.plan === "Pro Monthly" || userData?.subscription?.plan === "Pro Yearly" || userData?.subscription?.plan === "Weekly Pass" || userData?.subscription?.plan === "Pro Trial";

  const handleCheckout = async (planType: "monthly" | "yearly" = "monthly") => {
    if (isDebouncing) return;
    setIsDebouncing(true);
    setTimeout(() => setIsDebouncing(false), 3000); // 3-second lockout

    try {
      setIsProcessingPayment(true);
      // Use authenticated fetch — server will use the token to identify the user
      const res = await authenticatedFetch("/api/payment/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });
      const data = await res.json();

      if (data.error) {
        setToast({ message: "Payment initialization failed: " + data.error, type: "error" });
        setIsProcessingPayment(false);
        return;
      }

      openCheckout({
        type: "subscription",
        subscriptionId: data.subscriptionId,
        name: "AbhyasCore Pro",
        description: userData?.referredBy 
          ? `AbhyasCore Pro — ₹${planType === 'yearly' ? '399/year' : '49/month'} with autopay`
          : `₹7 for 7-day trial, then ₹${planType === 'yearly' ? '399/year' : '49/month'}`,
        prefill: {
          name: userData?.displayName || userData?.name || "Aspirant",
          email: userData?.email || "",
        },
        onSuccess: async (response) => {
          // Verify payment signature — server writes subscription via Admin SDK
          const verifyRes = await authenticatedFetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, planType }),
          });
          const verifyData = await verifyRes.json();

          setIsProcessingPayment(false);
          if (verifyData.success) {
            setToast({ message: `Payment successful! Your ${userData?.referredBy ? 'Pro plan' : '7-day Pro Trial'} is now active.`, type: "success" });
            setTimeout(() => window.location.reload(), 1500);
          } else {
            setToast({ message: "Payment verified but activation failed. Contact support.", type: "error" });
          }
        },
        onError: () => {
          setIsProcessingPayment(false);
          setToast({ message: "Payment failed or cancelled.", type: "error" });
        }
      });

    } catch (e) {
      console.error(e);
      setIsProcessingPayment(false);
    }
  };


  // Auto-prompt payment for referred users OR if redirect hit from onboarding/landing page
  const checkoutTriggered = useRef(false);
  const checkoutIntent = searchParams?.get("checkout");
  const isReferredFromUrl = searchParams?.get("referred") === "1";
  useEffect(() => {
    // IMPORTANT: Wait until user session and userData are fully loaded before triggering checkout
    if (!user || !userData) return;
    if (isProcessingPayment || checkoutTriggered.current) return;

    if (checkoutIntent) {
      // Don't trigger if they already have this exact plan
      if (userData?.subscription?.plan === checkoutIntent) return;

      checkoutTriggered.current = true;
      if (isReferredFromUrl || userData?.referredBy) {
        // Referred users: show the Pro modal first
        setSelectedProPlan(checkoutIntent === "Pro Yearly" ? "yearly" : "monthly");
        setTimeout(() => setShowProModal(true), 600);
      } else {
        // General users coming from ₹7 trial — open Razorpay directly
        if (checkoutIntent === "Pro Monthly") {
          setTimeout(() => handleCheckout("monthly"), 800);
        } else if (checkoutIntent === "Pro Yearly") {
          setTimeout(() => handleCheckout("yearly"), 800);
        }
      }
    }
  }, [checkoutIntent, isProcessingPayment, isPremium, userData, user]);

  const startTest = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setQuickTestOpen(false);
      router.push("/dashboard/practice-mode");
    }, 1500);
  };

  if (!user || !userData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#fafafc]">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
    <DashboardShell quickTestHandler={() => setQuickTestOpen(true)}>
      <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden bg-[#fafafc]">
        {/* Central Content */}
        <div className="flex-1 p-5 md:p-8 shrink-0 lg:overflow-y-auto">
          {/* Top Toggle */}
          <div className="inline-flex p-1 bg-white border border-slate-200/80 rounded-[10px] shadow-sm mb-6 md:mb-10 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-md bg-indigo-600 text-white text-[13px] font-medium shadow-[0_2px_8px_rgba(79,70,229,0.25)]">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </button>
            <button onClick={() => router.push('/dashboard/practice')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-md text-slate-500 hover:text-slate-800 text-[13px] font-medium transition-colors">
              <Sparkles className="h-4 w-4 shrink-0" />
              Practice Hub
            </button>
          </div>

          <div className="mb-8 md:mb-10">
            <h2 className="text-[24px] md:text-[28px] font-semibold text-slate-900 tracking-tight leading-[1.1] mb-2">Welcome back, {userData?.name || "Aspirant"}!</h2>
            <p className="text-slate-500 text-[13px] md:text-[14px]">Here's your {userData?.subscription?.plan || "standard"} dashboard overview.</p>
          </div>

          {/* Stats Cards - Dynamic Integration */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-10 md:mb-12">
             <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Mocks Completed</div>
                <div className="text-[28px] font-bold text-slate-900 leading-none">{userData?.mocksCompleted || 0}</div>
             </div>
             <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Database className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Questions Solved</div>
                <div className="text-[28px] font-bold text-slate-900 leading-none">{userData?.questionsSolved || 0}</div>
             </div>
             <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Performance Index</div>
                <div className="text-[28px] font-bold text-slate-900 leading-none">{userData?.performanceIndex || "0.0"}</div>
             </div>
             <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="h-8 w-8 rounded-lg bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mb-4">
                  <Flame className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Active Streak</div>
                <div className="text-[28px] font-bold text-slate-900 leading-none">{userData?.streak || 0} Days</div>
             </div>
          </div>

          {/* Current Subjects - Dynamic Syllabus Integration */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] md:text-[15px] font-bold text-slate-900">Current Subjects <span className="text-slate-400 font-medium text-[12px] md:text-[13px] ml-1 md:ml-2">(Class 11)</span></h3>
              <button onClick={() => router.push('/dashboard/practice')} className="text-[10px] font-bold tracking-[0.1em] text-indigo-600 uppercase hover:text-indigo-700 transition-colors hidden sm:block">View Full Curriculum</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {((Object.keys(Syllabus.Class11) as Array<keyof typeof Syllabus.Class11>).filter(sub => {
                const exam = userData?.targetExam || "JEE";
                if (exam === "JEE" && sub === "Biology") return false;
                if (exam === "NEET" && sub === "Mathematics") return false;
                return true;
              })).map((sub) => {
                const chapters = Syllabus.Class11[sub];
                const total = chapters.length;
                const ready = chapters.filter(c => c.hasData).length;
                const percent = Math.round((ready / total) * 100);
                return (
                  <div key={sub} onClick={() => router.push('/dashboard/practice')} className="bg-white rounded-[16px] border border-slate-200/60 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-200 transition-colors group cursor-pointer relative overflow-hidden">
                     <div className="text-[14px] font-bold text-slate-900 mb-1">{sub}</div>
                     <div className="text-[11px] font-medium text-slate-500 mb-4">{ready} of {total} Chapters Ready</div>
                     <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 rounded-full transition-all group-hover:bg-indigo-600" style={{ width: `${percent}%` }} />
                     </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently Built Papers -> Recent Test Attempts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-slate-900">Recent Test Attempts</h3>
              <button onClick={() => router.push('/dashboard/repository')} className="text-[10px] font-bold tracking-[0.1em] text-indigo-600 uppercase hover:text-indigo-700 transition-colors flex items-center gap-1">
                Access Vault <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentMocks.length > 0 ? recentMocks.slice(0, 4).map((paper: any, i: number) => {
                const isJEE = userData?.targetExam === "JEE";
                return (
                <div key={i} className="flex items-center justify-between p-5 bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900 mb-0.5">{paper.chapterName || paper.subject}</div>
                      <div className="text-[12px] text-slate-500 mb-2">{isJEE ? "JEE Pattern" : "NEET Pattern"} &bull; Score: {paper.totalScore}/{paper.maxScore}</div>
                      <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500 tracking-[0.1em] uppercase">Accuracy {Math.round(paper.accuracy || 0)}%</span>
                         <span className="text-[11px] font-medium text-slate-400">
                           {paper.timestamp?.seconds ? new Date(paper.timestamp.seconds * 1000).toLocaleDateString() : "Just now"}
                         </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-indigo-600 transition-colors mr-2">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              )}) : (
                <div className="col-span-full py-10 flex flex-col items-center justify-center bg-slate-50 rounded-[16px] border border-slate-200/60 border-dashed">
                  <FileText className="w-8 h-8 text-slate-300 mb-3" />
                  <p className="text-slate-500 text-[13px] font-medium">No tests attempted yet. Start a quick mock or chapter drill.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="h-6 md:h-12"></div>
        </div>

        {/* Right Info Sidebar - EXACTLY matching ScorePrepPro style */}
        <div className="w-full lg:w-[300px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-5 md:p-6 flex flex-col shrink-0 lg:overflow-y-auto">
          {/* Plan Status */}
          <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] mb-8 flex flex-col text-center">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <Crown className="h-6 w-6" />
            </div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-1">Plan Status</div>
            <div className="text-[15px] font-bold text-slate-900 mb-2">{isPremium ? userData?.subscription?.plan : "Free Tier"}</div>
            <p className="text-[12px] leading-relaxed text-slate-500 mb-5 px-1">
              {isPremium ? "Your subscription is currently active." : "You are missing out on AI insight drills and unlimited mocks."}
            </p>
            {!isPremium ? (
               <div className="flex flex-col gap-2 w-full">
                 <button onClick={() => handleCheckout("monthly")} className="w-full py-2 rounded-lg border border-indigo-200 text-indigo-700 text-[12px] font-bold tracking-wide hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                   <Zap className="w-3.5 h-3.5" /> Pro (₹49/mo)
                 </button>
                 <button onClick={() => handleCheckout("yearly")} className="w-full py-2 rounded-lg bg-indigo-600 text-white text-[12px] font-bold tracking-wide hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                   <Crown className="w-3.5 h-3.5" /> Pro (₹399/yr)
                 </button>
               </div>
            ) : (
              <button onClick={() => router.push('/dashboard/settings')} className="w-full py-2 rounded-lg border border-indigo-200 text-indigo-600 text-[12px] font-bold tracking-wide hover:bg-indigo-50 transition-colors">
                Manage Billing
              </button>
            )}
          </div>

          {/* Exam Calendar */}
          <div className="mb-8 flex-1">
             <div className="flex items-center justify-between mb-5">
               <h3 className="text-[13px] font-bold text-slate-900">{userData?.targetExam === "NEET" ? "NEET Exam Updates" : "JEE Exam Updates"}</h3>
               <button onClick={() => setToast({ message: "Full calendar schedule is coming soon!", type: "success" })} className="text-[9px] uppercase tracking-[0.1em] font-bold text-indigo-600 hover:text-indigo-700">Full Schedule</button>
             </div>

             <div className="space-y-4">
                {(userData?.targetExam === "NEET" ? [
                  { month: "Jan", day: "15", title: "NEET 2026 Registration Opens", desc: "Application Window • nta.ac.in", color: "bg-blue-500" },
                  { month: "Apr", day: "25", title: "NEET 2026 Admit Card", desc: "Download from exams.nta.ac.in", color: "bg-orange-500" },
                  { month: "May", day: "03", title: "NEET UG 2026 Exam", desc: "2:00 PM – 5:00 PM IST • Offline", color: "bg-emerald-500" }
                ] : [
                  { month: "Jan", day: "21", title: "JEE Main 2026 Session 1", desc: "Jan 21 – 30 • B.E./B.Tech", color: "bg-blue-500" },
                  { month: "Apr", day: "02", title: "JEE Main 2026 Session 2", desc: "Apr 2 – 8 • B.E./B.Tech", color: "bg-orange-500" },
                  { month: "May", day: "17", title: "JEE Advanced 2026", desc: "Paper 1 & 2 • IIT Exam", color: "bg-emerald-500" }
                ]).map((ev, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm rounded-lg py-1.5 min-w-[48px]">
                      <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">{ev.month}</span>
                      <span className="text-[14px] font-bold text-slate-900 leading-none">{ev.day}</span>
                    </div>
                    <div className="flex-1 flex justify-between items-start pt-0.5">
                       <div>
                         <div className="text-[12px] font-bold text-slate-900 mb-0.5">{ev.title}</div>
                         <div className="text-[11px] text-slate-500">{ev.desc}</div>
                       </div>
                       <div className={`h-1.5 w-1.5 rounded-full ${ev.color} mt-1`} />
                    </div>
                  </div>
                ))}
             </div>

             <button onClick={() => setToast({ message: "Custom dates feature is coming soon!", type: "success" })} className="mt-6 text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors flex items-center">
               + Add Important Date
             </button>
          </div>

          {/* Pro Tip */}
          <div className="mt-auto bg-[#1a1c29] rounded-[16px] p-5 relative overflow-hidden shadow-xl shadow-slate-900/10">
            <div className="absolute top-0 right-0 p-3 opacity-10 text-white">
              <Sparkles className="w-16 h-16" />
            </div>
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Zap className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-[13px] font-bold text-white tracking-wide">Pro Tip</span>
            </div>
            <p className="text-[12px] leading-[1.6] text-slate-300 mb-4 relative z-10">
              Analyzing your mock tests right after attempting them boosts retention by 40%. Don't skip the post-mock AI review.
            </p>
            <button onClick={() => router.push('/dashboard/help-support')} className="text-[10px] font-bold uppercase tracking-[0.1em] text-indigo-400 hover:text-indigo-300 transition-colors relative z-10">
              Learn More &gt;
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
    
    {quickTestOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
         <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
               <h3 className="font-display font-bold text-slate-900 text-lg">Quick Generate Test</h3>
               <button onClick={() => setQuickTestOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-full transition-colors">
                  <X className="w-4 h-4" />
               </button>
            </div>
            
            <div className="p-6">
               {generating ? (
                 <div className="py-8 flex flex-col items-center text-center">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                    <div className="font-bold text-slate-900">Assembling via AI...</div>
                    <div className="text-[12px] text-slate-500 mt-2">Pulling weak topics from Recent Attempts.</div>
                 </div>
               ) : (
                 <>
                   <div className="mb-5">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Subject Selection</label>
                      <select value={quickSubject} onChange={(e) => setQuickSubject(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] outline-none">
                         <option>Full PCMB Syllabus (JEE/NEET)</option>
                         <option>Physics Only</option>
                         <option>Chemistry Only</option>
                         <option>Mathematics Only</option>
                      </select>
                   </div>
                   
                   <div className="mb-6">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Difficulty Curve</label>
                      <div className="flex gap-2">
                         {["Standard", "Adaptive", "Hardcore"].map(d => (
                           <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2.5 rounded-xl border font-bold text-[13px] transition-colors ${difficulty === d ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{d}</button>
                         ))}
                      </div>
                   </div>
                   
                   <button onClick={startTest} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-colors flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" /> Start Quick Mock
                   </button>
                 </>
               )}
            </div>
         </div>
      </div>
    )}

    {/* ═══════════════ PRO UPGRADE MODAL (for referred users) ═══════════════ */}
    {showProModal && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
        <div className="bg-white rounded-[24px] md:rounded-[32px] w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 relative scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Close button */}
          <button 
            onClick={() => setShowProModal(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 md:p-8 pt-10 flex flex-col items-center text-center">
            {/* Pro Crown icon */}
            <div className="relative mx-auto w-14 h-14 mb-4">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[20px] animate-pulse" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[18px] flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                <Rocket className="w-7 h-7 text-white" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] font-bold tracking-[0.2em] uppercase mb-3">
              <Star className="w-3 h-3 fill-indigo-500" /> Exclusive Invite
            </div>

            <h2 className="text-[22px] md:text-[26px] font-display font-bold text-slate-900 leading-tight mb-1">
              🚀 Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">AbhyasCore Pro</span>
            </h2>
            <p className="text-slate-500 text-[13px] mb-5 max-w-sm mx-auto">
              You&apos;ve been invited! Get unlimited access to every premium feature.
            </p>

            {/* Plan Selection */}
            <div className="grid grid-cols-2 gap-2 w-full mb-4">
              <button
                onClick={() => setSelectedProPlan("monthly")}
                className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                  selectedProPlan === "monthly"
                    ? "border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-500/10"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Monthly</div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-[20px] font-black ${selectedProPlan === "monthly" ? "text-indigo-700" : "text-slate-800"}`}>₹49</span>
                  <span className="text-[11px] text-slate-400 font-semibold">/month</span>
                </div>
                {selectedProPlan === "monthly" && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>
              <button
                onClick={() => setSelectedProPlan("yearly")}
                className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                  selectedProPlan === "yearly"
                    ? "border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-500/10"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="absolute -top-2 right-2.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-bold tracking-wider">SAVE 32%</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Yearly</div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-[20px] font-black ${selectedProPlan === "yearly" ? "text-indigo-700" : "text-slate-800"}`}>₹399</span>
                  <span className="text-[11px] text-slate-400 font-semibold">/year</span>
                </div>
                {selectedProPlan === "yearly" && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>
            </div>

            {/* Pro features list */}
            <div className="bg-slate-50 rounded-xl border border-slate-200/60 p-4 mb-4 text-left w-full">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Everything You Get with Pro</div>
              <div className="space-y-2">
                {[
                  "Unlimited mock tests with repeats",
                  "Market Practice & Examination Repository",
                  "40,000 AI Tutor tokens per day",
                  "5 Custom Exams per day",
                  "Deep analytics & rank prediction",
                  "Priority support & early access",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-[12px] font-medium text-slate-700">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              {/* Go Pro CTA */}
              <button 
                onClick={() => {
                  setShowProModal(false);
                  handleCheckout(selectedProPlan);
                }}
                disabled={isProcessingPayment}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white rounded-[14px] font-bold text-[15px] transition-all shadow-xl shadow-indigo-500/25 hover:scale-[1.01]"
              >
                <Crown className="w-4.5 h-4.5" /> Go Pro Now — ₹{selectedProPlan === "yearly" ? "399/yr" : "49/mo"}
              </button>

              {/* Skip Option */}
              <button 
                onClick={() => setShowProModal(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-600 text-[12px] font-semibold transition-colors"
              >
                Maybe later, continue with Free plan →
              </button>
            </div>

            {/* Trust badge */}
            <div className="mt-3 flex items-center justify-center gap-2 text-[9px] text-slate-400 font-bold">
              <Shield className="w-3 h-3" /> Secure checkout • Cancel anytime • Instant activation
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Styled Toast Notification */}
    {toast && (
      <div className={`fixed z-[200] flex items-center gap-3 rounded-2xl shadow-2xl border backdrop-blur-xl max-w-md
        bottom-20 left-4 right-4 px-4 py-3
        md:bottom-auto md:top-6 md:left-auto md:right-6 md:px-5 md:py-4
        ${
        toast.type === "success"
          ? "bg-emerald-50/95 border-emerald-200 text-emerald-900"
          : "bg-red-50/95 border-red-200 text-red-900"
      }`}>
        {toast.type === "success" ? (
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
        )}
        <p className="text-[13px] font-semibold leading-snug flex-1">{toast.message}</p>
        <button onClick={() => setToast(null)} className="shrink-0 text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-[#fafafc]">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
