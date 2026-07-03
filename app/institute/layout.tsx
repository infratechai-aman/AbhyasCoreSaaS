"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";

const sidebarItems = [
  { id: "dashboard", label: "Overview", icon: "🏠", href: "/institute/dashboard" },
  { id: "create-exam", label: "Create Exam", icon: "＋", href: "/institute/create-exam" },
  { id: "exams", label: "Exams", icon: "📋", href: "/institute/exams" },
  { id: "results", label: "Results", icon: "🏆", href: "/institute/results" },
];

export default function InstituteLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [instituteName, setInstituteName] = useState("Institute");
  const [plan, setPlan] = useState("Coaching Plan");
  const [usedAttempts, setUsedAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(5000);

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
          }
        })
        .catch(() => {});
    });
  }, [user]);

  const getActiveItem = () => {
    if (pathname.includes("/create-exam")) return "create-exam";
    if (pathname.includes("/exams")) return "exams";
    if (pathname.includes("/results")) return "results";
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

  const pageTitle = sidebarItems.find((i) => i.id === activeItem)?.label || "Dashboard";

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      {/* SIDEBAR */}
      <aside className="w-[200px] flex-shrink-0 bg-[#18184a] flex flex-col min-h-screen sticky top-0" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Logo */}
        <div className="px-4 pt-5 pb-4 border-b border-white/[0.08] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center text-[14px] font-black text-white">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              AbhyasCore
            </span>
            <span className="text-[9px] font-semibold text-white/[0.35] uppercase tracking-[0.1em] mt-px">
              Institute Portal
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[9px] text-[12px] font-semibold cursor-pointer transition-all duration-150 border border-transparent w-full text-left
                ${activeItem === item.id
                  ? "bg-[#7c3aed] text-white shadow-[0_4px_12px_rgba(124,58,237,0.4)]"
                  : "text-white/[0.65] hover:bg-white/[0.07] hover:text-white"
                }`}
            >
              <span className="text-[14px] w-[18px] text-center flex-shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer / Plan Card */}
        <div className="px-2.5 py-3 border-t border-white/[0.08]">
          <div className="bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.3)] rounded-[10px] p-3">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/[0.4] mb-0.5">
              Your Plan
            </div>
            <div className="text-[12px] font-bold text-[#c4b5fd] mb-2">{plan}</div>
            <div className="h-1 bg-white/[0.1] rounded-sm mb-1.5">
              <div
                className="h-full rounded-sm bg-gradient-to-r from-[#7c3aed] to-[#06b6d4]"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="text-[10px] font-semibold text-white/[0.5] mb-2.5">
              {usedAttempts.toLocaleString()} / {maxAttempts.toLocaleString()} Attempts
            </div>
            <button className="w-full py-2 rounded-lg bg-[#7c3aed] text-white text-[11px] font-bold cursor-pointer transition-all hover:bg-[#6d28d9]">
              Upgrade Plan
            </button>
          </div>
          <div className="mt-2.5 flex items-center gap-2 px-2">
            <span className="text-[14px]">🎧</span>
            <div className="text-[10px] text-white/[0.35] font-medium leading-snug">
              Need Help?<br />support@abhyascore.com
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Bar */}
        <div className="h-14 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-7 flex-shrink-0 sticky top-0 z-50">
          <h1
            className="text-[15px] font-bold text-[#0f172a]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {pageTitle}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/institute/create-exam")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] bg-[#7c3aed] text-white text-[12px] font-bold border-none cursor-pointer shadow-[0_2px_8px_rgba(124,58,237,0.3)] transition-all hover:bg-[#6d28d9] hover:shadow-[0_4px_16px_rgba(124,58,237,0.4)] hover:-translate-y-px"
            >
              ＋ Create New Exam
            </button>
            <div className="relative w-[34px] h-[34px] rounded-[9px] border border-[#e2e8f0] bg-white flex items-center justify-center cursor-pointer text-[15px] transition-all hover:border-[#a5b4fc] hover:bg-[#f5f3ff]">
              🔔
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#7c3aed] border-2 border-white text-[9px] font-extrabold text-white flex items-center justify-center">
                3
              </span>
            </div>
            <div
              className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-[12px] font-extrabold text-white cursor-pointer"
              title={instituteName}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
