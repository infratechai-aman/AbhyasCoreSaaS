"use client";

import { usePremium } from "@/lib/hooks/usePremium";
import { useAuth } from "@/lib/auth-context";
import { ProLockScreen } from "@/components/ui/pro-lock-screen";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { 
  Zap, 
  Target, 
  History, 
  BookOpen, 
  ChevronRight, 
  Sparkles,
  Trophy,
  Brain
} from "lucide-react";
import Link from "next/link";

const practiceCategories = [
  {
    title: "Daily Target Drills",
    description: "Curated 10-question sets tailored to your target exam (JEE/NEET) syllabus flow. Resets at midnight.",
    icon: Target,
    color: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    shadow: "shadow-none",
    stats: "10-15 mins",
    tag: "Essential",
    href: "/dashboard/daily-target"
  },
  {
    title: "PYQ Archive",
    description: "Access verified Previous Year Questions with detailed step-by-step solutions and algorithmic analysis.",
    icon: BookOpen,
    color: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    shadow: "shadow-none",
    stats: "2010 - 2025",
    tag: "Foundation",
    href: "/test-console/custom?c=thermodynamics,equilibrium,redox_reactions,s_block_elements,p_block_elements,organic_chemistry_some_basic_principles_and_techniques&q=90"
  },
  {
    title: "Flashcard Formula Drive",
    description: "Rapid-fire visual recall mechanism for essential laws, formulas, and chemistry exceptions.",
    icon: Zap,
    color: "bg-violet-50 text-violet-600 border border-violet-100",
    shadow: "shadow-none",
    stats: "5 mins/set",
    tag: "Retention Tool",
    href: "/dashboard/flashcard-drive"
  },
  {
    title: "All-India Elite Challenge",
    description: "Live Sunday simulated environment. Compete simultaneously against thousands of aspirants nationwide.",
    icon: Trophy,
    color: "bg-rose-50 text-rose-600 border border-rose-100",
    shadow: "shadow-none",
    stats: "Live Weekly",
    tag: "Pro Challenge",
    href: "/dashboard/all-india-challenge"
  }
];

export default function PracticePage() {
  const { canAccessMarketPractice, isTrialExpired } = usePremium();
  const { userData } = useAuth();

  if (!canAccessMarketPractice) {
    return (
      <DashboardShell>
        <ProLockScreen
          featureName="Market Practice"
          description="Market Practice includes Adaptive Chapter Sprints, Daily Target Drills, Mistake Mastery, and PYQ Archives — all unlocked with Pro."
          isTrialExpired={isTrialExpired}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Top Toggle */}
          <div className="inline-flex p-1 bg-white border border-slate-200/80 rounded-[10px] shadow-sm mb-6 md:mb-10 w-full sm:w-auto">
            <Link href="/dashboard" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-md text-slate-500 hover:text-slate-800 text-[13px] font-medium transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard shrink-0"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              Overview
            </Link>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-md bg-indigo-600 text-white text-[13px] font-medium shadow-[0_2px_8px_rgba(79,70,229,0.25)]">
              <Sparkles className="h-4 w-4 shrink-0" />
              Practice Hub
            </button>
          </div>

        {/* Practice Hero Section */}
        <section className="relative rounded-[32px] overflow-hidden bg-slate-950 p-6 md:p-12 text-white shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.3),transparent_70%)] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> AI Precision Practice Active
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4 leading-[1.1]">
                Master your syllabus <br /><span className="text-indigo-400">one sprint</span> at a time.
              </h1>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                Move beyond passive reading. Use our adaptive CBT engine to sharpen your reflexes and accuracy for the actual exam day.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
                 <button className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 hover:scale-[1.02]">
                    Start Daily Drill <ChevronRight className="w-4 h-4" />
                 </button>
                 <div className="flex items-center gap-4 text-xs font-bold text-slate-400 border-l border-white/10 pl-5 py-1">
                    <div className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-amber-400" /> Focus Mode</div>
                    <div className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-emerald-400" /> 2.4k Active</div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {practiceCategories.map((item) => {
            const Icon = item.icon;
            
            let finalHref = item.href;
            if (item.title === "PYQ Archive") {
               finalHref = "/dashboard/pyq-archive";
            }
            
            const content = (
              <Card 
                className="group relative h-full rounded-[32px] border-slate-200 bg-white p-6 md:p-8 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer flex flex-col md:flex-row gap-6 items-start overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className={`shrink-0 w-16 h-16 rounded-[22px] ${item.color} flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all duration-300 z-10 relative`}>
                   <Icon className="w-7 h-7" />
                </div>
                
                <div className="flex-1 relative z-10 flex flex-col h-full">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-500 transition-colors">{item.tag}</span>
                     <span className="text-[11px] font-bold text-slate-400">{item.stats}</span>
                   </div>
                   <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">{item.title}</h2>
                   <p className="text-slate-500 text-[14px] leading-relaxed mb-6 flex-1">
                     {item.description}
                   </p>
                   <div className="flex items-center gap-2 text-indigo-600 font-bold text-[13px] group-hover:translate-x-1 transition-transform mt-auto">
                      Open Practice Module <ChevronRight className="w-4 h-4" />
                   </div>
                </div>
              </Card>
            );

            return (
              <Link key={item.title} href={finalHref} className="block transition-transform hover:-translate-y-1">
                 {content}
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
