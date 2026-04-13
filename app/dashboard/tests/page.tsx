"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Target, Clock, Trophy, ChevronRight, LayoutGrid, Rocket, Bookmark } from "lucide-react";
import { Syllabus, SubjectSyllabus } from "@/lib/syllabus";
import { useAuth } from "@/lib/auth-context";

export default function TestsPage() {
  const { userData } = useAuth();
  const [activeClass, setActiveClass] = useState<keyof typeof Syllabus>("Class11");
  const [activeSubject, setActiveSubject] = useState<keyof SubjectSyllabus>("Physics");

  // Filter based on targetExam
  const targetExam = userData?.targetExam || "JEE";
  const allSubjects = Object.keys(Syllabus.Class11) as Array<keyof SubjectSyllabus>;
  const allowedSubjects = allSubjects.filter(sub => {
    if (targetExam === "JEE" && sub === "Biology") return false;
    if (targetExam === "NEET" && sub === "Mathematics") return false;
    return true;
  });

  // Ensure activeSubject is valid for the current track
  if (!allowedSubjects.includes(activeSubject)) {
    setActiveSubject(allowedSubjects[0]);
  }

  const syllabusData = Syllabus[activeClass][activeSubject];

  return (
    <DashboardShell>
      <div className="flex flex-col h-full bg-[#fafafc] p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
             <Target className="w-3.5 h-3.5" /> Official Exam Patterns
          </div>
          <h2 className="text-[32px] font-display font-bold text-slate-900 tracking-tight leading-none mb-3">Test Library</h2>
          <p className="text-slate-500 text-[14px]">
            Simulate the actual examination environment. Mocks are generated using historical data and proper marking schemes.
          </p>
        </div>

        {/* Global Full Syllabus Mocks */}
        <div className="mb-12">
            <h3 className="font-display text-[20px] font-bold text-slate-900 mb-5 flex items-center gap-2">
               <Rocket className="w-5 h-5 text-indigo-600" /> Full Syllabus Simulations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {targetExam === "JEE" ? (
                // JEE Full Mock Card
                <div className="relative bg-slate-900 text-white rounded-[24px] p-6 shadow-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all">
                  <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500 rounded-full blur-[50px] opacity-30 group-hover:opacity-50 transition-all" />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                     <div className="bg-white/10 border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-widest uppercase">
                       JEE Main Pattern
                     </div>
                     <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                     </div>
                  </div>
                  
                  <div className="relative z-10">
                     <h4 className="text-[24px] font-bold mb-2">Grand JEE Simulation</h4>
                     <p className="text-[13px] text-slate-400 mb-6 max-w-[85%]">
                       Full syllabus mock covering Physics, Chemistry, and Mathematics identically modeled after NTA guidelines.
                     </p>
                     
                     <div className="flex items-center gap-6 mb-6 text-[12px] font-semibold text-slate-300">
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-400" /> 180 Mins</div>
                        <div className="flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-emerald-400" /> 90 Questions</div>
                        <div className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-400" /> 300 Marks</div>
                     </div>
                     
                     <div className="flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="text-[10px] font-medium text-slate-400">Marking: +4 (Correct), -1 (Incorrect)</span>
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-slate-900 hover:scale-110 transition-transform">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                </div>
              ) : (
                // NEET Full Mock Card
                <div className="relative bg-slate-900 text-white rounded-[24px] p-6 shadow-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all">
                  <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500 rounded-full blur-[50px] opacity-30 group-hover:opacity-50 transition-all" />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                     <div className="bg-white/10 border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-widest uppercase text-emerald-400">
                       NEET (UG) Pattern
                     </div>
                     <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                     </div>
                  </div>
                  
                  <div className="relative z-10">
                     <h4 className="text-[24px] font-bold mb-2">Grand NEET Simulation</h4>
                     <p className="text-[13px] text-slate-400 mb-6 max-w-[85%]">
                       Full syllabus mock covering Physics, Chemistry, and Biology identically modeled after NTA guidelines.
                     </p>
                     
                     <div className="flex items-center gap-6 mb-6 text-[12px] font-semibold text-slate-300">
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-400" /> 200 Mins</div>
                        <div className="flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-emerald-400" /> 200 Questions</div>
                        <div className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-400" /> 720 Marks</div>
                     </div>
                     
                     <div className="flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="text-[10px] font-medium text-slate-400">Marking: +4 (Correct), -1 (Incorrect), Attempt 180</span>
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-slate-900 hover:scale-110 transition-transform">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* Micro Chapter Tests Section */}
        <div>
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h3 className="font-display text-[20px] font-bold text-slate-900 mb-2 md:mb-0 flex items-center gap-2">
                 <Bookmark className="w-5 h-5 text-indigo-600" /> Chapter-wise Mocks
              </h3>
              
              {/* Class Toggle */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/60 shadow-sm w-max shrink-0">
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

           <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
              {/* Left sidebar - Subject Filter */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
                 {allowedSubjects.map((subject) => (
                   <button
                     key={subject}
                     onClick={() => setActiveSubject(subject)}
                     className={`flex-shrink-0 text-left px-5 py-4 rounded-2xl border transition-all ${
                       activeSubject === subject
                         ? 'border-indigo-600 bg-white shadow-[0_4px_20px_rgba(79,70,229,0.1)] text-indigo-700'
                         : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-white hover:border-slate-300'
                     }`}
                   >
                     <div className="font-bold text-[14px]">{subject}</div>
                     <div className="text-[11px] font-medium opacity-70 mt-1">{Syllabus[activeClass][subject].length} Chapters</div>
                   </button>
                 ))}
              </div>

              {/* Right Content - Chapter List */}
              <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                   <h3 className="font-bold text-slate-900 text-[16px]">{activeSubject} Tests</h3>
                   <span className="text-[12px] font-bold text-slate-400 tracking-wider uppercase">{activeClass === 'Class11' ? 'XI' : 'XII'} Syllabus</span>
                </div>
                
                <div className="p-6 flex flex-col gap-4">
                  {syllabusData.map((chapter) => {
                     // Chapter mock pattern logic
                     const isAvailable = chapter.hasData;
                     const displayMarks = targetExam === "JEE" ? "100 Marks" : "180 Marks";
                     const maxQ = targetExam === "JEE" ? "25 Qs" : "45 Qs";
                     
                     return (
                       <div 
                         key={chapter.name} 
                         className={`flex items-center justify-between p-5 rounded-2xl border ${
                           isAvailable 
                             ? 'border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer bg-white transition-all group' 
                             : 'border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed'
                         }`}
                       >
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                               <div className="text-[14px] font-bold text-slate-900">{chapter.name}</div>
                               {!isAvailable && <span className="bg-slate-200 text-slate-500 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Locked</span>}
                            </div>
                            <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
                               <span className="flex items-center gap-1"><LayoutGrid className="w-3 h-3" /> {maxQ}</span>
                               <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {displayMarks}</span>
                               <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {targetExam === "JEE" ? "60 mins" : "45 mins"}</span>
                            </div>
                          </div>
                          
                          {isAvailable ? (
                            <div className="text-slate-300 group-hover:text-indigo-600 transition-colors bg-slate-50 group-hover:bg-indigo-50 p-2 rounded-full">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          ) : null}
                       </div>
                     )
                  })}
                </div>
              </div>
           </div>
        </div>
        
      </div>
    </DashboardShell>
  );
}
