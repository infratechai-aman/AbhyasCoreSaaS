"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  ShieldAlert,
  Link2 as LinkIcon,
  Copy,
  CheckCircle2,
  Lock
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { authenticatedFetch } from "@/lib/api";

export default function AffiliateHubPage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    authenticatedFetch("/api/creator/referrals")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          if (res.status === 404) {
             setError("NOT_CREATOR");
          } else if (res.status === 401) {
             try {
                await logout();
             } catch (e) {}
             window.location.href = "/creator/login";
          } else {
             setError(json.error || "Failed to load data.");
          }
        } else {
          setData(json.data);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Network error. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const handleCopy = () => {
    if (!data?.codeId) return;
    navigator.clipboard.writeText(`https://abhyascore.com/register?ref=${data.codeId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
      </div>
    );
  }

  // Not a creator state
  if (error === "NOT_CREATOR") {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center px-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 shadow-sm mb-6">
          <Lock className="h-10 w-10 text-slate-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">
          Creator Access Required
        </h1>
        <p className="text-[15px] text-slate-500 max-w-[400px] leading-relaxed">
          The Affiliate Hub is exclusively for verified AbhyasCore creators. If you are a creator, please make sure your account is linked to your promo code by contacting support.
        </p>
        <button 
          onClick={() => window.location.href = "mailto:support@abhyascore.com"}
          className="mt-8 rounded-2xl bg-slate-900 px-6 py-3.5 text-[14px] font-bold text-white shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all hover:scale-[1.02]"
        >
          Contact Support
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center px-4">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
        <p className="text-slate-500 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Affiliate Hub
          </h1>
          <p className="mt-2 text-[14px] text-slate-500 font-medium">
            Track your referrals, conversions, and impact in real-time.
          </p>
        </div>
      </div>

      {/* Code Link Section */}
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="mb-8 rounded-[24px] border border-indigo-200/80 bg-gradient-to-r from-indigo-50/50 to-white p-6 sm:p-8 shadow-sm relative overflow-hidden"
      >
         <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-900">
           <LinkIcon className="w-32 h-32" />
         </div>
         
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-widest">Your Custom Link</h2>
              </div>
              <p className="text-[13px] text-slate-500 font-medium">Share this link to automatically track signups and sales.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-2 pl-4 rounded-2xl border border-indigo-100 shadow-sm max-w-md w-full sm:w-auto">
               <span className="text-[14px] font-bold text-slate-700 truncate w-full sm:w-64 select-all">
                 https://abhyascore.com/register?ref={data.codeId}
               </span>
               <button 
                  onClick={handleCopy}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
               >
                 {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-4 w-4" />}
               </button>
            </div>
         </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        {[
          { label: "Total Signups", value: data.totalSignups, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
          { label: "Pro Conversions", value: data.paidConversions, icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Conversion Rate", value: `${data.conversionRate}%`, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`group relative overflow-hidden rounded-[24px] border ${stat.border} bg-white p-6 shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 relative z-10">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</h3>
                <span className="mt-1 block font-display text-[32px] font-bold tracking-tight text-slate-900">
                  {stat.value}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-[24px] border border-slate-200/80 bg-white shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-slate-900">Recent Signups</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Your latest 50 referred students.</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-600">
            LIVE
          </div>
        </div>
        
        {data.recentSignups?.length === 0 ? (
           <div className="p-12 text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <Users className="h-6 w-6 text-slate-300" />
              </div>
              <h3 className="text-[14px] font-bold text-slate-700">No signups yet</h3>
              <p className="text-[13px] text-slate-500 mt-1">Share your link to get started!</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Date Joined</th>
                  <th className="px-6 py-4 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentSignups.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                      {user.maskedEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {user.isPaid ? (
                         <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-[10px] font-bold text-white shadow-sm">
                            <Sparkles className="h-3 w-3" /> PRO
                         </span>
                      ) : (
                         <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                            FREE
                         </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

    </div>
  );
}
