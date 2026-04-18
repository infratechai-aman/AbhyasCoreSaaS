"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Target, Zap, ChevronRight, Lock } from "lucide-react";
import { Syllabus, SubjectSyllabus } from "@/lib/syllabus";
import { useAuth } from "@/lib/auth-context";

export default function PracticeModePage() {
  const { userData } = useAuth();
  const [activeClass, setActiveClass] = useState<keyof typeof Syllabus>("Class11");
  const [activeSubject, setActiveSubject] = useState<keyof SubjectSyllabus>("Physics");

  // Determine which subjects to show based on targetExam
  const targetExam = userData?.targetExam || "JEE";
  const allSubjects = Object.keys(Syllabus.Class11) as Array<keyof SubjectSyllabus>;
  const allowedSubjects = allSubjects.filter(sub => {
    if (targetExam === "JEE" && sub === "Biology") return false;
    if (targetExam === "NEET" && sub === "Mathematics") return false;
    return true;
  });

  // Ensure activeSubject is valid
  if (!allowedSubjects.includes(activeSubject)) {
    setActiveSubject(allowedSubjects[0]);
  }

  const syllabusData = Syllabus[activeClass][activeSubject];

  return (
    <DashboardShell>
      <div className="flex flex-col h-full bg-[#fafafc] p-4 md:p-8 overflow-y-auto overflow-x-hidden">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
               <Target className="w-3.5 h-3.5" /> Granular Mastery
            </div>
            <h2 className="text-[32px] font-display font-bold text-slate-900 tracking-tight leading-none mb-3">Practice Mode</h2>
            <p className="text-slate-500 text-[14px]">
              Targeted drills dynamically pulled from our curriculum mapping. Master individual concepts before taking on full mock exams.
            </p>
          </div>

          {/* Class Toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/60 shadow-sm w-full md:w-max overflow-x-auto custom-scrollbar shrink-0">
            {["Class11", "Class12"].map((cls) => (
              <button
                key={cls}
                onClick={() => setActiveClass(cls as any)}
                className={`px-6 py-2 rounded-xl text-[12px] font-bold transition-all ${
                  activeClass === cls 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cls === "Class11" ? "Class XI" : "Class XII"}
              </button>
            ))}
          </div>
        </div>
        
        {/* Modern Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm w-full md:w-max overflow-x-auto custom-scrollbar">
           {allowedSubjects.map((sub) => (
             <button
                key={sub}
                onClick={() => setActiveSubject(sub)}
                className={`px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                  activeSubject === sub 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
             >
                {sub}
             </button>
           ))}
        </div>
        
        {/* Practice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {syllabusData.map((chapter) => (
            <div 
              key={chapter.chapterNumber} 
              className={`bg-white rounded-[20px] p-6 text-left transition-all relative overflow-hidden group flex flex-col min-h-[220px] ${
                chapter.hasData 
                  ? 'border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer' 
                  : 'border border-slate-100 bg-slate-50/50 opacity-70'
              }`}
            >
               {chapter.hasData && (
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
               )}
               
               <div className="flex justify-between items-start mb-4">
                 <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                   Ch {chapter.chapterNumber}
                 </div>
                 {!chapter.hasData && (
                   <Lock className="w-4 h-4 text-slate-300" />
                 )}
               </div>
               
               <h3 className={`text-[15px] font-bold leading-snug mb-2 ${chapter.hasData ? 'text-slate-900' : 'text-slate-500'}`}>
                 {chapter.name}
               </h3>
               
               {chapter.hasData ? (
                 <div className="mt-auto">
                   <div className="flex items-center gap-2 mb-4">
                     <div className="flex -space-x-1">
                       <div className="w-5 h-5 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-emerald-700">Q</div>
                       <div className="w-5 h-5 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-indigo-700">P</div>
                     </div>
                     <span className="text-[11px] font-medium text-slate-400">120+ Questions</span>
                   </div>
                   <Link href={`/test-console/${chapter.file?.replace(".xml", "")}`}>
                     <button className="flex items-center justify-between w-full py-2.5 px-4 bg-indigo-50/50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors font-bold text-[12px] rounded-xl cursor-pointer">
                        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Start Drill</span>
                        <ChevronRight className="w-4 h-4" />
                     </button>
                   </Link>
                 </div>
               ) : (
                 <div className="mt-auto">
                    <div className="text-[11px] font-semibold text-slate-400 bg-slate-100/50 px-3 py-1.5 rounded-lg inline-block">
                      Coming Soon
                    </div>
                 </div>
               )}
            </div>
          ))}
        </div>
        
      </div>
    </DashboardShell>
  );
}
