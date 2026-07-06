"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  PlusSquare,
  ClipboardList,
  Trophy,
  BarChart3,
  BookOpen,
  Settings,
  Bell,
  LogOut,
  Menu,
  X
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard, href: "/institute/dashboard" },
  { id: "batches", label: "Batches", icon: Users, href: "/institute/batches" },
  { id: "create-exam", label: "Create Exam", icon: PlusSquare, href: "/institute/create-exam" },
  { id: "exams", label: "Exams", icon: ClipboardList, href: "/institute/exams" },
  { id: "results", label: "Results", icon: Trophy, href: "/institute/results" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/institute/analytics" },
  { id: "question-bank", label: "Question Bank", icon: BookOpen, href: "/institute/question-bank" },
];

const bottomNavItems = [
  { id: "settings", label: "Settings", icon: Settings, href: "/institute/settings" },
];

export default function InstituteLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [instituteName, setInstituteName] = useState("Institute");
  const [plan, setPlan] = useState("Coaching Plan");
  const [planExpiry, setPlanExpiry] = useState("");
  const [usedAttempts, setUsedAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(5000);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("abhyas_institute");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.name) setInstituteName(parsed.name);
        }
      } catch {}
    }
  }, []);

  // Fetch dashboard stats for sidebar info
  useEffect(() => {
    const isDemo = typeof window !== "undefined" && window.location.search.includes("demo=true");
    
    if (isDemo) {
      fetch("/api/institute/dashboard-stats?demo=true")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            if (data.instituteName) setInstituteName(data.instituteName);
            if (data.plan) setPlan(data.plan === "coaching" ? "Coaching Plan" : data.plan === "enterprise" ? "Enterprise" : "Free Plan");
            if (typeof data.usedAttempts === "number") setUsedAttempts(data.usedAttempts);
            if (typeof data.maxAttempts === "number") setMaxAttempts(data.maxAttempts);
            if (data.planExpiry) setPlanExpiry(data.planExpiry);
          }
        })
        .catch(() => {});
      return;
    }

    if (!user) return;
    user.getIdToken().then((token) => {
      fetch("/api/institute/dashboard-stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            if (data.instituteName) setInstituteName(data.instituteName);
            if (data.plan) setPlan(data.plan === "coaching" ? "Coaching Plan" : data.plan === "enterprise" ? "Enterprise" : "Free Plan");
            if (typeof data.usedAttempts === "number") setUsedAttempts(data.usedAttempts);
            if (typeof data.maxAttempts === "number") setMaxAttempts(data.maxAttempts);
            if (data.planExpiry) setPlanExpiry(data.planExpiry);
          }
        })
        .catch(() => {});
    });
  }, [user]);

  const getActiveItem = () => {
    if (pathname.includes("/batches")) return "batches";
    if (pathname.includes("/create-exam")) return "create-exam";
    if (pathname.includes("/exams")) return "exams";
    if (pathname.includes("/results")) return "results";
    if (pathname.includes("/analytics")) return "analytics";
    if (pathname.includes("/question-bank")) return "question-bank";
    if (pathname.includes("/settings")) return "settings";
    return "dashboard";
  };

  const activeItem = getActiveItem();
  const usagePercent = maxAttempts > 0 ? Math.min((usedAttempts / maxAttempts) * 100, 100) : 0;

  // Get initials from institute name
  const initials = instituteName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const pageTitle = navItems.concat(bottomNavItems).find((i) => i.id === activeItem)?.label || "Dashboard Overview";

  // Don't wrap the login page with sidebar/topbar
  if (pathname === "/institute/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/institute/login");
  };

  return (
    <div className="flex min-h-screen bg-[#fafafc] text-slate-800 font-sans overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR - Desktop exactly matches student portal */}
      <aside className={`
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 fixed lg:sticky top-0 z-[70] lg:z-auto
        w-[260px] flex-shrink-0 bg-[#1e1e2f] flex flex-col h-screen text-slate-300
        transition-transform duration-300 ease-in-out
      `}>
        {/* Logo matching student portal */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 cursor-default">
            <Image src="/logo.png" alt="AbhyasCore" width={112} height={56} className="h-14 w-auto object-contain brightness-150" />
            <div>
              <div className="font-bold text-[16px] text-white tracking-tight -mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                AbhyasCore<span className="text-indigo-400">Inst.</span>
              </div>
              <div className="text-[9px] font-bold tracking-[0.15em] text-slate-400 uppercase mt-0.5">
                Institute Portal
              </div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  router.push(item.href);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all ${
                  active 
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)]" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-indigo-400" : "text-slate-500"}`} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}

          <div className="pt-8 pb-4">
            <div className="px-4 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-4">System</div>
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all ${
                    active 
                      ? "bg-white/10 text-white border border-white/10" 
                      : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom - System Status + Sign Out */}
        <div className="p-4 mt-auto">
          <div className="rounded-xl border border-white/5 bg-white/5 p-4 relative mb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[11px] font-semibold text-slate-200">Institute Status</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Exam Engine v3.0 is active.
            </p>
          </div>

          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent relative">
        {/* Top Header - Matching student portal exactly */}
        <header className="h-[64px] md:h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-[16px] md:text-[18px] font-bold text-slate-900 truncate">
              {pageTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button title="Notifications" className="text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right flex-col pt-0.5 hidden sm:flex">
                <span className="text-[13px] font-bold text-slate-900 leading-none truncate max-w-[120px]">{instituteName}</span>
                <span className="text-[9px] font-bold tracking-[0.1em] text-indigo-600 uppercase mt-1 leading-none truncate max-w-[120px]">
                  {plan}
                </span>
              </div>
              <div className="relative group">
                <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[12px] md:text-[13px] shadow-[0_2px_8px_rgba(79,70,229,0.25)] ml-1 shrink-0 cursor-pointer hover:bg-indigo-700 transition-colors">
                  {initials}
                </div>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100">
                    <div className="text-[12px] font-bold text-slate-800 truncate">{instituteName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{plan}</div>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => router.push("/institute/settings")}
                      className="w-full text-left px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-[12px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => router.push("/institute/create-exam")}
              className="hidden md:flex items-center justify-center h-9 px-5 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:bg-indigo-700 transition-all hover:scale-[1.02]"
            >
              Quick Exam
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar scroll-smooth">
          <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
