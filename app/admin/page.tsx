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
} from "lucide-react";
import { adminRevenueData, adminRecentUsers } from "@/lib/data";

/* values /10 as requested */
const topStats = [
  { label: "Total Students", value: "8,432", trend: "+12.5%", isPositive: true, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
  { label: "Paid Pro Subs", value: "1,184", trend: "+24.1%", isPositive: true, icon: CreditCard, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
  { label: "Monthly Revenue", value: "₹58K", trend: "+18.2%", isPositive: true, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { label: "Total Revenue", value: "₹2.56L", trend: "+31.4%", isPositive: true, icon: Wallet, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  { label: "Active Now", value: "240", trend: "-2.4%", isPositive: false, icon: Activity, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
];

/* monthly vs yearly subscriber breakdown */
const monthlyUsers = adminRecentUsers.filter(u => u.status === "Pro Monthly");
const yearlyUsers = adminRecentUsers.filter(u => u.status === "Pro Yearly");
const freeUsers = adminRecentUsers.filter(u => u.status === "Free");

export default function SuperAdminDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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

        {/* ─── Top Stats Grid (5 cards) ─── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {topStats.map((stat, i) => {
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
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${stat.isPositive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
                    {stat.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                    {stat.trend}
                  </div>
                </div>

                <div className="mt-4 relative z-10">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</h3>
                  <span className="mt-1 block font-display text-[26px] font-bold tracking-tight text-slate-900">{stat.value}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Charts Section ─── */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">Revenue Trajectory</h2>
                <p className="text-[12px] text-slate-400 mt-0.5 font-medium">Monthly recurring revenue (MRR) growth</p>
              </div>
              <button className="rounded-lg hover:bg-slate-50 p-2 transition-colors border border-transparent hover:border-slate-200">
                <MoreVertical className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={adminRevenueData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value >= 1000 ? value / 1000 + "k" : value}`} dx={-10} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "13px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }} itemStyle={{ color: "#6366f1", fontWeight: "bold" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 2, stroke: "#6366f1", fill: "#fff" }} />
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
            {/* Traffic source */}
            <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-[16px] font-bold text-slate-900 mb-6">Traffic Diagnostics</h2>
              <div className="space-y-5">
                {[
                  { source: "Direct", val: "42%", color: "bg-indigo-500" },
                  { source: "Organic Search", val: "35%", color: "bg-emerald-500" },
                  { source: "Social Media", val: "18%", color: "bg-blue-500" },
                  { source: "Referral", val: "5%", color: "bg-fuchsia-500" },
                ].map((t) => (
                  <div key={t.source}>
                    <div className="flex justify-between text-[12px] font-semibold text-slate-600 mb-2">
                      <span>{t.source}</span>
                      <span className="text-slate-900 font-bold">{t.val}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${t.color}`} style={{ width: t.val }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-tr from-indigo-50 to-violet-50 p-6 shadow-sm h-36 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[13px] font-bold text-indigo-700 uppercase tracking-wider">Conversion Rate</h3>
                  <p className="text-[11px] text-indigo-400 mt-0.5 font-medium">Free to Pro upgrades</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <div className="font-display text-4xl font-bold text-slate-900">
                12.4% <span className="text-[16px] text-indigo-500 ml-1 font-semibold">avg</span>
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
                <p className="text-[11px] text-slate-400 font-medium">{monthlyUsers.length} active · Rs 67/mo (Rs 29 first month)</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {monthlyUsers.length > 0 ? monthlyUsers.map((user, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-[12px] font-bold text-white shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-indigo-600">{user.value}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{user.joined}</div>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-8 text-center text-[13px] text-slate-400 font-medium">No monthly subscribers yet</div>
              )}
            </div>
          </motion.div>

          {/* Yearly Subscribers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border border-violet-100 bg-white shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-violet-50 px-6 py-4 bg-violet-50/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <CalendarRange className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">Yearly Subscribers</h2>
                <p className="text-[11px] text-slate-400 font-medium">{yearlyUsers.length} active · Rs 499/yr</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {yearlyUsers.length > 0 ? yearlyUsers.map((user, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-[12px] font-bold text-white shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-violet-600">{user.value}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{user.joined}</div>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-8 text-center text-[13px] text-slate-400 font-medium">No yearly subscribers yet</div>
              )}
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
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Date Joined</th>
                  <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[11px]">LTV</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminRecentUsers.map((user, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-[2px] shadow-sm">
                          <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center font-bold text-[13px] text-indigo-600">
                            {user.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5 font-medium">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider
                        ${
                          user.status === "Pro Yearly"
                            ? "bg-violet-50 text-violet-600 border border-violet-200"
                            : user.status === "Pro Monthly"
                            ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{user.joined}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{user.value}</div>
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
