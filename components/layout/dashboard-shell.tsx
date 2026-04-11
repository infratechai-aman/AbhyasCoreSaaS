"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  LayoutDashboard, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Bell,
  Target,
  BrainCircuit,
  Trophy,
  PenTool
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/mock-tests", label: "Mock Tests", icon: PenTool },
  { href: "/dashboard/practice-mode", label: "Practice Mode", icon: Target },
  { href: "/dashboard/ai-tutor", label: "AI Tutor", icon: BrainCircuit },
  { href: "/dashboard/performance", label: "Performance", icon: Trophy },
];

const bottomNavItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/help-support", label: "Help & Support", icon: HelpCircle },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/mock-tests": "Mock Tests Arena",
  "/dashboard/practice-mode": "Practice Mode",
  "/dashboard/ai-tutor": "AI Copilot",
  "/dashboard/performance": "Performance Matrix",
  "/dashboard/settings": "Settings",
  "/dashboard/help-support": "Help & Support",
};

export function DashboardShell({
  children,
  quickTestHandler
}: {
  children: React.ReactNode;
  quickTestHandler?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const pageTitle = pageTitles[pathname] || "Dashboard";

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-800 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#1e1e2f] flex-shrink-0 flex flex-col items-stretch h-screen text-slate-300">
        <div className="p-6 pb-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display font-medium text-[18px] text-white tracking-tight -mb-1">RankForge<span className="font-bold text-indigo-400">AI</span></div>
              <div className="text-[9px] font-bold tracking-[0.15em] text-slate-400 uppercase mt-0.5">Premium</div>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-4 overflow-y-auto pt-4 space-y-6">
          {/* Main Nav */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 tracking-[0.15em] mb-3 px-3 uppercase">Main Menu</div>
            <nav className="space-y-1">
              {navItems.map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                    isActive(href, exact)
                      ? "bg-indigo-600 text-white shadow-[0_2px_8px_rgba(79,70,229,0.25)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Bottom Nav (Settings / Help) */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 tracking-[0.15em] mb-3 px-3 uppercase">Support</div>
            <nav className="space-y-1">
              {bottomNavItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                    isActive(href)
                      ? "bg-indigo-600 text-white shadow-[0_2px_8px_rgba(79,70,229,0.25)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom - System Status + Sign Out */}
        <div className="p-4 mt-auto">
          <div className="rounded-xl border border-white/5 bg-white/5 p-4 relative mb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[11px] font-semibold text-slate-200">System Status</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Rank Predictor v3.0 is active for JEE &amp; NEET.
            </p>
          </div>

          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent">
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-[18px] font-bold text-slate-900">{pageTitle}</h1>
          
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-red-500 border border-white ring-2 ring-white"></span>
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right flex flex-col pt-0.5">
                <span className="text-[13px] font-bold text-slate-900 leading-none">Aman Talukdar</span>
                <span className="text-[9px] font-bold tracking-[0.1em] text-indigo-600 uppercase mt-1 leading-none">Premium</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[13px] shadow-[0_2px_8px_rgba(79,70,229,0.25)] ml-1">
                AT
              </div>
            </div>

            <button onClick={quickTestHandler} className="h-9 px-5 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:bg-indigo-700 transition-all hover:scale-[1.02]">
              Quick Test
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
