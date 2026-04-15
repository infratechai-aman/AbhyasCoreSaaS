"use client";

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
    title: "Adaptive Chapter Sprints",
    description: "Dynamic difficulty adjustment based on your real-time accuracy. Perfect for deep focus sessions.",
    icon: Zap,
    color: "bg-amber-500",
    shadow: "shadow-amber-500/20",
    stats: "15-30 mins",
    tag: "High Intensity"
  },
  {
    title: "Daily Target Drills",
    description: "Curated 10-question sets tailored to your target exam (JEE/NEET) syllabus flow. Quick and daily.",
    icon: Target,
    color: "bg-indigo-600",
    shadow: "shadow-indigo-500/20",
    stats: "10-15 mins",
    tag: "Recommended"
  },
  {
    title: "Mistake Mastery",
    description: "Re-attempt questions you got wrong in previous mocks. Turn weaknesses into strengths with AI insights.",
    icon: History,
    color: "bg-rose-500",
    shadow: "shadow-rose-500/20",
    stats: "Unlimited",
    tag: "Essential"
  },
  {
    title: "PYQ Archive",
    description: "Access verified Previous Year Questions with detailed step-by-step solutions and analysis.",
    icon: BookOpen,
    color: "bg-emerald-500",
    shadow: "shadow-emerald-500/20",
    stats: "2010 - 2024",
    tag: "Foundation"
  }
];

export default function PracticePage() {
  return (
    <DashboardShell>
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
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

        {/* Interactive Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {practiceCategories.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.title} 
                className="group relative rounded-[32px] border-slate-200 bg-white p-6 md:p-8 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all cursor-pointer flex flex-col md:flex-row gap-6 items-start overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className={`shrink-0 w-16 h-16 rounded-[22px] ${item.color} flex items-center justify-center text-white shadow-xl ${item.shadow} group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                   <Icon className="w-8 h-8" />
                </div>
                
                <div className="flex-1 relative z-10">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">{item.tag}</span>
                     <span className="text-[11px] font-bold text-slate-400">{item.stats}</span>
                   </div>
                   <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">{item.title}</h2>
                   <p className="text-slate-500 text-[14px] leading-relaxed mb-6">
                     {item.description}
                   </p>
                   <div className="flex items-center gap-2 text-indigo-600 font-bold text-[13px] group-hover:translate-x-1 transition-transform">
                      Open Practice Module <ChevronRight className="w-4 h-4" />
                   </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
