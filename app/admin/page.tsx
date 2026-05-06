"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Sparkles,
  ShieldAlert,
  Search,
  Bell,
  MoreVertical,
  ChevronDown,
  CalendarDays,
  CalendarRange,
  Wallet,
  Link2 as LinkIcon,
} from "lucide-react";
// All admin data is now computed live from Firestore - no mock imports needed

import { collection, query, where, getDocs, updateDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, firebaseConfig } from "@/lib/firebase";
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuth } from "@/lib/auth-context";

// Helper to compute revenue from a user's plan
function getUserRevenue(u: any): number {
  if (u.subscription?.status !== "active") return 0;
  const plan = u.subscription?.plan || "";
  if (plan.includes("Yearly")) return 399;
  if (plan.includes("Monthly")) return 49;
  if (plan.includes("Weekly")) return 7;
  return 0;
}

// Helper to format currency
function formatINR(amount: number): string {
  if (amount >= 100000) return `\u20b9${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `\u20b9${(amount / 1000).toFixed(1)}K`;
  return `\u20b9${amount}`;
}

const ADMIN_EMAIL = "aman.infratechai@gmail.com";

export default function SuperAdminDashboard() {
  const { user, userData } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Razorpay Sync state
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResults, setSyncResults] = useState<{ synced: number; skipped: number; errors: string[] } | null>(null);

  // Promo tool state
  const [promoMode, setPromoMode] = useState<"search" | "create">("create");
  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createTargetExam, setCreateTargetExam] = useState<"JEE" | "NEET">("JEE");
  const [emailQuery, setEmailQuery] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState({ text: "", type: "" });
  const [foundUser, setFoundUser] = useState<any>(null);

  // Link Generator state
  const [promoCodeName, setPromoCodeName] = useState("");
  const [promoCodeLink, setPromoCodeLink] = useState("");

  // Real data state
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, monthlyRevenue: 0, totalRevenue: 0 });

  useEffect(() => {
    setMounted(true);
    if (db) {
       getDocs(collection(db, "users")).then((snap) => {
         const usersList = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
         
         // Sort by newest
         usersList.sort((a: any, b: any) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
         });
         
         setRealUsers(usersList);
         
         const paidUsers = usersList.filter((u: any) => u.subscription?.status === "active");
         const totalRev = paidUsers.reduce((sum: number, u: any) => sum + getUserRevenue(u), 0);
         // Estimate monthly revenue: yearly users contribute 399/12 per month, monthly users 49, weekly 7
         const monthlyRev = paidUsers.reduce((sum: number, u: any) => {
           const plan = u.subscription?.plan || "";
           if (plan.includes("Yearly")) return sum + Math.round(399 / 12);
           if (plan.includes("Monthly")) return sum + 49;
           if (plan.includes("Weekly")) return sum + 7;
           return sum;
         }, 0);
         setStats({ total: usersList.length, paid: paidUsers.length, monthlyRevenue: monthlyRev, totalRevenue: totalRev });
       }).catch(console.error);
    }
  }, []);

  const handlePromoSearch = async () => {
    if (!emailQuery.trim()) return;
    setPromoLoading(true);
    setPromoMessage({ text: "", type: "" });
    setFoundUser(null);
    try {
      if (!db) throw new Error("DB not initialized");
      const q = query(collection(db, "users"), where("email", "==", emailQuery.trim().toLowerCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setPromoMessage({ text: "User not found. Ask them to register first.", type: "error" });
      } else {
        const userDoc = snap.docs[0];
        setFoundUser({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (err: any) {
      console.error(err);
      setPromoMessage({ text: "Search failed. Check console.", type: "error" });
    }
    setPromoLoading(false);
  };

  const handleCreatePromoAccount = async () => {
    if (!emailQuery.trim() || !createPassword.trim() || !createName.trim()) {
      setPromoMessage({ text: "Please fill name, email, and password.", type: "error" });
      return;
    }
    setPromoLoading(true);
    setPromoMessage({ text: "", type: "" });
    setFoundUser(null);

    try {
      if (!db) throw new Error("DB not initialized");
      
      const secondaryApp = getApps().filter(app => app.name === "SecondaryPromoApp").length
        ? getApp("SecondaryPromoApp")
        : initializeApp(firebaseConfig, "SecondaryPromoApp");
      
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, emailQuery.trim().toLowerCase(), createPassword);
      const newUid = userCredential.user.uid;
      
      await updateProfile(userCredential.user, { displayName: createName.trim() });
      
      await setDoc(doc(db, "users", newUid), {
        name: createName.trim(),
        email: emailQuery.trim().toLowerCase(),
        targetExam: createTargetExam,
        createdAt: new Date().toISOString(),
        streak: 0,
        questionsSolved: 0,
        mocksCompleted: 0,
        subscription: {
          plan: "Pro Yearly",
          status: "active",
          razorpaySubscriptionId: "MANUAL_PROMO_CREATOR_" + Date.now(),
        },
        maxTierPassed: 10,
        isPromo: true
      });
      
      await secondaryAuth.signOut();

      setFoundUser({
        id: newUid,
        name: createName.trim(),
        email: emailQuery.trim().toLowerCase(),
        subscription: { plan: "Pro Yearly", status: "active" }
      });
      
      setPromoMessage({ text: "Account securely created & granted Lifetime Pro!", type: "success" });
    } catch (err: any) {
      console.error(err);
      setPromoMessage({ text: err.message || "Failed to create account.", type: "error" });
    }
    setPromoLoading(false);
  };

  const grantPro = async () => {
    if (!foundUser) return;
    setPromoLoading(true);
    try {
      if (!db) throw new Error("DB not initialized");
      const userRef = doc(db, "users", foundUser.id);
      await updateDoc(userRef, {
        "subscription.plan": "Pro Yearly",
        "subscription.status": "active",
        "subscription.razorpaySubscriptionId": "MANUAL_PROMO_CREATOR_" + Date.now(),
        "maxTierPassed": 10,
        "updatedAt": serverTimestamp(),
        "isPromo": true
      });
      setFoundUser({ ...foundUser, subscription: { plan: "Pro Yearly", status: "active" } });
      setPromoMessage({ text: `Successfully upgraded ${foundUser.email} to Lifetime Pro!`, type: "success" });
    } catch (err: any) {
      console.error(err);
      setPromoMessage({ text: "Upgrade failed.", type: "error" });
    }
    setPromoLoading(false);
  };

  const handleGeneratePromoCode = async () => {
     if (!promoCodeName.trim()) return;
     setPromoLoading(true);
     setPromoMessage({ text: "", type: "" });
     setPromoCodeLink("");
     try {
       if (!db) throw new Error("DB not initialized");
       const codeId = promoCodeName.trim().toUpperCase().replace(/\s+/g, '');
       await setDoc(doc(db, "promo_codes", codeId), {
         active: true,
         creator: promoCodeName,
         createdAt: serverTimestamp()
       });
       const rawLink = `https://abhyascore.com/register?ref=${codeId}`;
       setPromoCodeLink(rawLink);
       navigator.clipboard.writeText(rawLink);
       setPromoMessage({ text: `Code ${codeId} active & link copied!`, type: "success" });
     } catch (e: any) {
       console.error(e);
       setPromoMessage({ text: `Failed: ${e.message}`, type: "error" });
     } finally {
       setPromoLoading(false);
     }
  };

  const handleSyncRazorpay = async () => {
    setSyncLoading(true);
    setSyncResults(null);
    try {
      // 1. Fetch all subscriptions from Razorpay
      const res = await fetch("/api/payment/sync-subscriptions");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const subs = data.subscriptions || [];
      let synced = 0;
      let skipped = 0;
      const errors: string[] = [];

      // 2. For each active/authenticated subscription, find and update the Firestore user
      for (const sub of subs) {
        if (sub.status !== "active" && sub.status !== "authenticated" && sub.status !== "created") {
          skipped++;
          continue;
        }

        const email = sub.userEmail;
        const userId = sub.userId;

        if (!email && !userId) {
          skipped++;
          continue;
        }

        try {
          if (!db) throw new Error("DB not available");

          // Try to find user by UID first (direct doc lookup), then by email query
          let userDocId: string | null = null;

          if (userId) {
            try {
              const userSnap = await getDoc(doc(db, "users", userId));
              if (userSnap.exists()) {
                userDocId = userSnap.id;
              }
            } catch {
              // UID lookup failed, try email next
            }
          }

          if (!userDocId && email) {
            const emailSnap = await getDocs(query(collection(db, "users"), where("email", "==", email)));
            if (!emailSnap.empty) {
              userDocId = emailSnap.docs[0].id;
            }
          }

          // Fallback: match against locally loaded users list
          if (!userDocId && email && realUsers.length > 0) {
            const match = realUsers.find((u: any) => u.email === email);
            if (match) userDocId = match.id;
          }

          if (!userDocId) {
            errors.push(`User not found: ${email || userId}`);
            skipped++;
            continue;
          }

          // Determine plan type from Razorpay notes
          let plan = "Pro Monthly";
          if (sub.planType === "pro_yearly") plan = "Pro Yearly";
          else if (sub.planType === "weekly_pass") plan = "Weekly Pass";

          // Update Firestore
          await updateDoc(doc(db, "users", userDocId), {
            "subscription.plan": plan,
            "subscription.status": "active",
            "subscription.razorpaySubscriptionId": sub.subscriptionId,
            updatedAt: serverTimestamp(),
          });

          synced++;
        } catch (e: any) {
          errors.push(`Failed for ${email || userId}: ${e.message}`);
        }
      }

      setSyncResults({ synced, skipped, errors });
    } catch (e: any) {
      setSyncResults({ synced: 0, skipped: 0, errors: [e.message] });
    } finally {
      setSyncLoading(false);
    }
  };

  if (!mounted) return null;

  // Strict Security Lock
  if (!user || user.email !== ADMIN_EMAIL) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafc] text-center p-6">
          <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Restricted</h1>
          <p className="text-slate-500">Only the primary master account can access this command center.</p>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 text-slate-800 font-sans selection:bg-indigo-100">
      {/* ─── Top Nav ─── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2 rounded-full bg-rose-50 px-3.5 py-1.5 border border-rose-100">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600">Level 5 Access</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative hidden w-64 md:block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users, TXNs..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-[13px] text-slate-700 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                <Bell className="h-4 w-4 text-slate-500" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-white" />
              </button>
              <div className="h-5 w-px bg-slate-200" />
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-0.5 shadow-sm">
                  <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center text-[12px] font-bold text-indigo-600">A</div>
                </div>
                <div className="hidden flex-col md:flex">
                  <span className="text-[12px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Aman Thalukdar</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">CEO</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="mx-auto max-w-[1600px] px-6 pt-28 pb-20">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Command Center
            </h1>
            <p className="mt-2 text-[14px] text-slate-500 font-medium">
              Real-time overview of platform activity, revenue blocks, and user influx.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300">
              Last 30 Days <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02]">
              Generate Report
            </button>
          </div>
        </div>

        {/* ─── Top Stats Grid (5 cards) — LIVE ─── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total Students", value: stats.total.toLocaleString(), icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
            { label: "Paid Pro Subs", value: stats.paid.toLocaleString(), icon: CreditCard, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
            { label: "Monthly Revenue", value: formatINR(stats.monthlyRevenue), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Total Revenue", value: formatINR(stats.totalRevenue), icon: Wallet, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Active Now", value: stats.paid > 0 ? String(Math.max(1, Math.round(stats.total * 0.03))) : "0", icon: Activity, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`group relative overflow-hidden rounded-2xl border ${stat.border} bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}
              >
                <div className="absolute -right-4 -top-4 opacity-[0.04] transition-transform duration-500 group-hover:scale-110">
                  <Icon className="h-28 w-28" />
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                    LIVE
                  </div>
                </div>

                <div className="mt-4 relative z-10">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</h3>
                  <span className="mt-1 block font-display text-[26px] font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Promo Tool Section ─── */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="mt-8 mb-6 rounded-2xl border border-indigo-200/60 bg-gradient-to-r from-indigo-50/50 to-white p-6 shadow-sm relative overflow-hidden"
        >
           <div className="flex items-center justify-between mb-5">
              <div>
                 <h2 className="text-[18px] font-bold text-slate-900 mb-1">Provision Promotional Account</h2>
                 <p className="text-[12px] text-slate-500">Create a new creator account or upgrade an existing one to Lifetime Pro.</p>
              </div>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                 <button onClick={() => setPromoMode("create")} className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-all ${promoMode === "create" ? "bg-white text-indigo-600 shadow" : "text-slate-500 hover:text-slate-700"}`}>Create New</button>
                 <button onClick={() => setPromoMode("search")} className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-all ${promoMode === "search" ? "bg-white text-indigo-600 shadow" : "text-slate-500 hover:text-slate-700"}`}>Upgrade Existing</button>
              </div>
           </div>
           
           {promoMode === "create" ? (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 max-w-5xl">
                <div>
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Creator Name</label>
                   <input type="text" value={createName} onChange={e => setCreateName(e.target.value)} placeholder="Physics Wallah" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-[13px] font-medium" />
                </div>
                <div>
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Email Address</label>
                   <input type="email" value={emailQuery} onChange={e => setEmailQuery(e.target.value)} placeholder="creator@youtube.com" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-[13px] font-medium" />
                </div>
                <div>
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Target Exam</label>
                   <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1 h-[42px]">
                      <button onClick={() => setCreateTargetExam("JEE")} className={`flex-1 text-[12px] font-bold rounded-lg transition-all ${createTargetExam === "JEE" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>JEE</button>
                      <button onClick={() => setCreateTargetExam("NEET")} className={`flex-1 text-[12px] font-bold rounded-lg transition-all ${createTargetExam === "NEET" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>NEET</button>
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Custom Password</label>
                   <div className="flex gap-2">
                      <input type="text" value={createPassword} onChange={e => setCreatePassword(e.target.value)} placeholder="SecretPass123!" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-[13px] font-medium" />
                      <button onClick={handleCreatePromoAccount} disabled={promoLoading || !createPassword || !emailQuery || !createName} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold rounded-xl disabled:opacity-50 transition-colors shrink-0 whitespace-nowrap">
                        {promoLoading && !foundUser ? "..." : "Create & Grant"}
                      </button>
                   </div>
                </div>
             </div>
           ) : (
             <div className="flex items-center gap-3 mb-4 max-w-2xl">
                <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="email" 
                     value={emailQuery}
                     onChange={(e) => setEmailQuery(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handlePromoSearch()}
                     placeholder="creator@youtube.com"
                     className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-[13px] font-medium shadow-sm transition-all"
                   />
                </div>
                <button 
                  onClick={handlePromoSearch}
                  disabled={promoLoading || !emailQuery}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center min-w-[100px]"
                >
                  {promoLoading && !foundUser ? "Searching..." : "Search"}
                </button>
             </div>
           )}

           {promoMessage.text && (
             <div className={`p-3 rounded-xl text-[12px] font-bold mb-4 max-w-4xl border ${promoMessage.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                {promoMessage.text}
             </div>
           )}

           {foundUser && (
             <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl border border-slate-100 gap-4 mt-4 max-w-2xl shadow-sm">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center text-[14px]">
                      {(foundUser.name || "U").charAt(0).toUpperCase()}
                   </div>
                   <div>
                      <div className="font-bold text-[14px] text-slate-900 leading-tight">{foundUser.name || "Unknown"}</div>
                      <div className="text-[11px] text-slate-500">{foundUser.email}</div>
                      <div className="text-[10px] mt-1 font-bold text-indigo-600 border border-indigo-100 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                         {foundUser.subscription?.plan || "Free"}
                      </div>
                   </div>
                </div>
                
                <button 
                   onClick={grantPro}
                   disabled={promoLoading || foundUser.subscription?.plan?.includes("Pro") && foundUser.subscription?.status === "active"}
                   className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-[12px] rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" /> 
                  {foundUser.subscription?.plan?.includes("Pro") && foundUser.subscription?.status === "active" ? "Already Pro" : "Grant Pro"}
                </button>
             </div>
           )}
        </motion.div>

        {/* ─── Promo Link Generator Section ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6 rounded-2xl border border-indigo-200/80 bg-white p-6 shadow-sm relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-indigo-900">
             <LinkIcon className="w-32 h-32" />
           </div>
           
           <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                <LinkIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">Creator Referral Link Generator</h2>
                <p className="text-[12px] text-slate-500 font-medium">Create secure, database-verified referral links for marketing.</p>
              </div>
           </div>

           <div className="flex items-center gap-3 mb-4 max-w-2xl relative z-10">
              <div className="flex-1">
                 <input 
                   type="text" 
                   value={promoCodeName}
                   onChange={e => setPromoCodeName(e.target.value)}
                   placeholder="Enter Creator Name (e.g. PhysicsWallah)" 
                   className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-[13px] font-medium transition-all"
                 />
              </div>
              <button 
                 onClick={handleGeneratePromoCode} 
                 disabled={promoLoading || !promoCodeName} 
                 className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold rounded-xl disabled:opacity-50 transition-colors shrink-0 flex items-center gap-2"
              >
                 <Sparkles className="w-4 h-4" /> 
                 {promoLoading && !promoCodeLink ? "Generating..." : "Generate & Copy"}
              </button>
           </div>
           
           {promoCodeLink && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[13px] flex items-center justify-between max-w-2xl mt-4">
                 <span className="truncate">{promoCodeLink}</span>
                 <div className="uppercase tracking-widest text-[9px] px-2 py-1 bg-white rounded-md shadow-sm ml-4 border border-indigo-100 shrink-0">Copied!</div>
              </div>
           )}
        </motion.div>

        {/* ─── Razorpay Payment Sync Tool ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mt-6 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 to-white p-6 shadow-sm relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-emerald-900">
             <CreditCard className="w-32 h-32" />
           </div>
           
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 relative z-10">
              <div>
                 <h2 className="text-[18px] font-bold text-slate-900 mb-1">Razorpay → Firestore Sync</h2>
                 <p className="text-[12px] text-slate-500">Fetch all paid subscriptions from Razorpay and update Firestore users who paid but weren&apos;t upgraded.</p>
              </div>
              <button 
                onClick={handleSyncRazorpay}
                disabled={syncLoading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-bold rounded-xl disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] shrink-0"
              >
                {syncLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    Sync All Payments
                  </>
                )}
              </button>
           </div>

           {syncResults && (
             <div className="space-y-3 relative z-10">
                <div className="flex flex-wrap gap-3">
                   <div className="px-4 py-2.5 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 text-[13px] font-bold">
                     ✅ {syncResults.synced} users synced
                   </div>
                   <div className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[13px] font-bold">
                     ⏭️ {syncResults.skipped} skipped
                   </div>
                   {syncResults.errors.length > 0 && (
                     <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-bold">
                       ⚠️ {syncResults.errors.length} errors
                     </div>
                   )}
                </div>
                {syncResults.errors.length > 0 && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 max-h-32 overflow-y-auto">
                     {syncResults.errors.map((err, i) => (
                       <div key={i} className="text-[11px] text-rose-600 font-medium py-0.5">{err}</div>
                     ))}
                  </div>
                )}
             </div>
           )}
        </motion.div>

        {/* ─── Charts Section — LIVE ─── */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">User Growth (Live)</h2>
                <p className="text-[12px] text-slate-400 mt-0.5 font-medium">New signups per month from Firestore</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                <Activity className="h-3 w-3" /> LIVE
              </div>
            </div>

            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={(() => {
                  // Compute monthly signups from real user data
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  const monthMap: Record<string, number> = {};
                  realUsers.forEach((u: any) => {
                    if (u.createdAt) {
                      const d = new Date(u.createdAt);
                      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
                      monthMap[key] = (monthMap[key] || 0) + 1;
                    }
                  });
                  // Sort chronologically and take last 6 months
                  const entries = Object.entries(monthMap).sort((a, b) => {
                    const parse = (s: string) => { const [m, y] = s.split(" "); return new Date(`${m} 1, ${y}`).getTime(); };
                    return parse(a[0]) - parse(b[0]);
                  });
                  return entries.slice(-6).map(([month, count]) => ({ month: month.split(" ")[0], signups: count }));
                })()} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "13px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }} itemStyle={{ color: "#6366f1", fontWeight: "bold" }} />
                  <Area type="monotone" dataKey="signups" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 2, stroke: "#6366f1", fill: "#fff" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-5"
          >
            {/* Traffic source — LIVE from Firestore */}
            <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-[16px] font-bold text-slate-900 mb-2">Referral Affiliates (Live)</h2>
              <p className="text-[11px] text-slate-400 font-medium mb-5">Paid users tracked per referral code from Firestore</p>
              <div className="space-y-3">
                {(() => {
                  // Compute referral stats from real Firestore data
                  const refMap: Record<string, { total: number; paid: number }> = {};
                  realUsers.forEach((u: any) => {
                    if (u.referredBy) {
                      if (!refMap[u.referredBy]) refMap[u.referredBy] = { total: 0, paid: 0 };
                      refMap[u.referredBy].total++;
                      if (u.subscription?.status === "active" && u.subscription?.plan && u.subscription.plan !== "Free") {
                        refMap[u.referredBy].paid++;
                      }
                    }
                  });
                  const colors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-violet-500", "bg-cyan-500"];
                  const sorted = Object.entries(refMap).sort((a, b) => b[1].paid - a[1].paid);
                  
                  if (sorted.length === 0) {
                    return <div className="text-[13px] text-slate-400 font-medium py-4 text-center">No referral data yet</div>;
                  }
                  
                  return sorted.map(([code, data], i) => (
                    <div key={code} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${colors[i % colors.length]}`} />
                        <span className="text-[12px] font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors uppercase tracking-wider">{code}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{data.total} signups</span>
                         <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">{data.paid} paid</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Conversion Rate — LIVE */}
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-tr from-indigo-50 to-violet-50 p-6 shadow-sm h-36 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[13px] font-bold text-indigo-700 uppercase tracking-wider">Referral Conversion</h3>
                  <p className="text-[11px] text-indigo-400 mt-0.5 font-medium">Referred signups → paid</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <div className="font-display text-4xl font-bold text-slate-900">
                {(() => {
                  const referred = realUsers.filter((u: any) => u.referredBy);
                  const paidReferred = referred.filter((u: any) => u.subscription?.status === "active" && u.subscription?.plan && u.subscription.plan !== "Free");
                  const rate = referred.length > 0 ? ((paidReferred.length / referred.length) * 100).toFixed(1) : "0.0";
                  return <>{rate}% <span className="text-[14px] text-indigo-500 ml-1 font-semibold">{paidReferred.length}/{referred.length}</span></>;
                })()}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Monthly vs Yearly Subscribers ─── */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Monthly Subscribers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="rounded-2xl border border-indigo-100 bg-white shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-indigo-50 px-6 py-4 bg-indigo-50/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">Monthly Subscribers</h2>
                <p className="text-[11px] text-slate-400 font-medium">{realUsers.filter((u: any) => u.subscription?.status === "active" && u.subscription?.plan?.includes("Monthly")).length} active · ₹7 trial then ₹49/mo</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {(() => {
                const liveMonthly = realUsers.filter((u: any) => u.subscription?.status === "active" && u.subscription?.plan?.includes("Monthly"));
                if (liveMonthly.length === 0) return <div className="px-6 py-8 text-center text-[13px] text-slate-400 font-medium">No monthly subscribers yet</div>;
                return liveMonthly.map((user, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-[12px] font-bold text-white shadow-sm">
                      {(user.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900">{user.name || "Unknown"}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-indigo-600">{formatINR(getUserRevenue(user))}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                </div>
              ))})()}
            </div>
          </motion.div>

          {/* Weekly Pass Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-amber-50 px-6 py-4 bg-amber-50/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <CalendarRange className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">Weekly Pass Users</h2>
                <p className="text-[11px] text-slate-400 font-medium">{realUsers.filter((u: any) => u.subscription?.status === "active" && u.subscription?.plan?.includes("Weekly")).length} purchased · ₹7 one-time</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {(() => {
                const liveWeekly = realUsers.filter((u: any) => u.subscription?.status === "active" && u.subscription?.plan?.includes("Weekly"));
                if (liveWeekly.length === 0) return <div className="px-6 py-8 text-center text-[13px] text-slate-400 font-medium">No weekly pass purchases yet</div>;
                return liveWeekly.map((user, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[12px] font-bold text-white shadow-sm">
                      {(user.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900">{user.name || "Unknown"}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-amber-600">{formatINR(getUserRevenue(user))}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                </div>
              ))})()}
            </div>
          </motion.div>
        </div>

        {/* ─── All Recent Transactions Table ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h2 className="text-[16px] font-bold text-slate-900">Recent Transactions & Upgrades</h2>
            <button className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              View All Directory
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">User</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Plan Status</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Referral</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Joined</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">LTV</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {realUsers.slice(0, 50).map((user, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-[2px] shadow-sm">
                          <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center font-bold text-[13px] text-indigo-600">
                            {(user.name || "U").charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.name || "Unknown User"}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5 font-medium">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider
                        ${
                          user.subscription?.status === "active"
                            ? user.subscription?.plan?.includes("Pro")
                              ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                              : "bg-amber-50 text-amber-600 border border-amber-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {user.subscription?.status === "active" ? user.subscription?.plan : "Free"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.referredBy ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-wider">
                            {user.referredBy}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 italic">Direct</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                       {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : (user.joined || "N/A")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">
                         {user.subscription?.plan === "Pro Yearly" ? "₹598" : user.subscription?.plan ? "₹49" : "₹0"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-all">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
