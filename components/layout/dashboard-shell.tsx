"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
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
  PenTool,
  Sparkles,
  Database
} from "lucide-react";
import { OnboardingModal } from "@/components/layout/onboarding-modal";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/dashboard/practice": "Practice Hub",
  "/dashboard/tests": "Test Library",
  "/dashboard/leaderboard": "Leaderboard",
  "/dashboard/performance": "Performance Analytics",
  "/dashboard/settings": "Account Settings",
  "/dashboard/help-support": "Help & Support"
};

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Market Practice', href: '/dashboard/practice', icon: Sparkles },
  { name: 'Test Library', href: '/dashboard/tests', icon: Database },
  { name: 'Performance', href: '/dashboard/performance', icon: Trophy },
  { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Target },
  { name: 'AI Tutor', href: '/dashboard/ai-tutor', icon: BrainCircuit },
];

const bottomNavItems = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help & Support', href: '/dashboard/help-support', icon: HelpCircle },
];

export function DashboardShell({
  children,
  quickTestHandler
}: {
  children: React.ReactNode;
  quickTestHandler?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#fafafc]">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const pageTitle = pageTitles[pathname] || "Dashboard";

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-800 font-sans flex overflow-hidden">
      <OnboardingModal />
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#1e1e2f] flex-shrink-0 flex flex-col items-stretch h-screen text-slate-300">
        <div className="p-6 pb-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display font-medium text-[18px] text-white tracking-tight -mb-1">RankForge<span className="font-bold text-indigo-400">AI</span></div>
              <div className="text-[9px] font-bold tracking-[0.15em] text-slate-400 uppercase mt-0.5">{userData?.subscription === 'premium' ? 'Premium' : 'Free Tier'}</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all ${
                  active 
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)]" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-indigo-400" : "text-slate-500"}`} />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-8 pb-4">
            <div className="px-4 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-4">System</div>
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all ${
                    active 
                      ? "bg-white/10 text-white border border-white/10" 
                      : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom - System Status + Sign Out */}
        <div className="p-4 mt-auto">
          <div className="rounded-xl border border-white/5 bg-white/5 p-4 relative mb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[11px] font-semibold text-slate-200">System Status</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Rank Predictor v3.0 is active for {userData?.targetExam || 'JEE & NEET'}.
            </p>
          </div>

          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
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
                <span className="text-[13px] font-bold text-slate-900 leading-none">{userData?.name || "Aspirant"}</span>
                <span className="text-[9px] font-bold tracking-[0.1em] text-indigo-600 uppercase mt-1 leading-none">{userData?.subscription === 'premium' ? 'Premium' : 'Standard'}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[13px] shadow-[0_2px_8px_rgba(79,70,229,0.25)] ml-1">
                {(userData?.name || "A").charAt(0).toUpperCase()}
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
