"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Target, Clock, Trophy, ChevronRight, LayoutGrid, Rocket, Bookmark, Shield, Flame } from "lucide-react";
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
      <div className="flex flex-col h-full bg-[#fafafc] p-4 md:p-8">
        
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
        {/* Global Full Syllabus Mocks */}
        <div className="mb-8">
            <h3 className="font-display text-[20px] font-bold text-slate-900 mb-5 flex items-center gap-2">
               <Rocket className="w-5 h-5 text-indigo-600" /> Full Syllabus Simulations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {targetExam === "JEE" ? (
                // JEE Full Mock Card
                <div onClick={() => alert("Full Grand Simulations are currently being populated. Check back within 48 hours!")} className="relative bg-slate-900 text-white rounded-[24px] p-6 shadow-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all">
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
                <div onClick={() => alert("Full Grand Simulations are currently being populated. Check back within 48 hours!")} className="relative bg-slate-900 text-white rounded-[24px] p-6 shadow-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all">
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

            {/* Tiered Mock Series - Horizontal Scroll */}
            {targetExam === "JEE" && (
              <div className="mb-12">
                 <h3 className="font-display text-[20px] font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" /> Tiered Mock Series
                 </h3>
                 <div className="overflow-x-auto pb-6 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex gap-4 w-max">
                      {[
                        { level: 1, name: "Foundation Mock I",    difficulty: "Easy",     desc: "Warm-up level. NCERT-based conceptual questions to build exam temperament.", glow: "bg-emerald-500", badge: "text-emerald-700 bg-emerald-100" },
                        { level: 2, name: "Foundation Mock II",   difficulty: "Easy",     desc: "Slightly elevated NCERT+ problems. Builds confidence before harder papers.", glow: "bg-emerald-500", badge: "text-emerald-700 bg-emerald-100" },
                        { level: 3, name: "Momentum Mock III",    difficulty: "Moderate", desc: "Mixed difficulty. Matches the average NTA paper with standard traps.", glow: "bg-sky-500", badge: "text-sky-700 bg-sky-100" },
                        { level: 4, name: "Momentum Mock IV",     difficulty: "Moderate", desc: "Application-heavy questions testing multi-concept integration.", glow: "bg-sky-500", badge: "text-sky-700 bg-sky-100" },
                        { level: 5, name: "Challenger Mock V",    difficulty: "Hard",     desc: "Above-average difficulty. Designed to push your speed and accuracy limits.", glow: "bg-indigo-500", badge: "text-indigo-700 bg-indigo-100" },
                        { level: 6, name: "Challenger Mock VI",   difficulty: "Hard",     desc: "Tricky numeric-type and assertion-reason questions. Real exam pressure.", glow: "bg-indigo-500", badge: "text-indigo-700 bg-indigo-100" },
                        { level: 7, name: "Elite Mock VII",       difficulty: "Advanced", desc: "JEE Advanced-level cross-topic problems. Only for serious contenders.", glow: "bg-violet-500", badge: "text-violet-700 bg-violet-100" },
                        { level: 8, name: "Elite Mock VIII",      difficulty: "Advanced", desc: "Paragraph-based and matrix-match questions modeled after JEE Advanced.", glow: "bg-violet-500", badge: "text-violet-700 bg-violet-100" },
                        { level: 9, name: "Apex Simulation IX",   difficulty: "Extreme",  desc: "Top 1% difficulty. Designed to simulate the hardest possible JEE paper.", glow: "bg-rose-500", badge: "text-rose-700 bg-rose-100" },
                        { level: 10, name: "Apex Simulation X",   difficulty: "Extreme",  desc: "The ultimate stress test. If you conquer this, you conquer the exam.", glow: "bg-rose-500", badge: "text-rose-700 bg-rose-100" },
                      ].map((mock) => (
                        <div key={mock.level} onClick={() => alert("This tiered mock scale is currently being built into the backend. Stay tuned!")} className="relative bg-white border border-slate-200 text-slate-800 rounded-[20px] p-5 shadow-sm overflow-hidden group cursor-pointer hover:border-indigo-400 hover:shadow-lg transition-all w-[300px] shrink-0 flex flex-col h-[200px]">
                          <div className={`absolute -right-10 -top-10 w-24 h-24 ${mock.glow} rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition-all pointer-events-none`} />
                          
                          <div className="flex justify-between items-start mb-3 relative z-10">
                             <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border border-white/50 ${mock.badge}`}>
                               {mock.difficulty}
                             </div>
                             <div className="bg-slate-50 border border-slate-100 w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-bold text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                #{mock.level}
                             </div>
                          </div>
                          
                          <div className="relative z-10 flex-1 flex flex-col">
                             <h4 className="text-[16px] font-bold mb-1.5 text-slate-900 leading-tight">{mock.name}</h4>
                             <p className="text-[11px] text-slate-500 leading-relaxed mb-auto line-clamp-2">
                               {mock.desc}
                             </p>
                             
                             <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                   <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> 180M</span>
                                   <span className="flex items-center gap-1"><Target className="w-3 h-3 text-slate-400" /> 300</span>
                                </div>
                                <button className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
            )}

            {/* Custom Exam Builder Entry */}
            <div className="mb-14">
               <h3 className="font-display text-[20px] font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" /> Custom DIY Examinations
               </h3>
               <Link href="/dashboard/custom-test" className="block">
                 <div className="relative bg-[#1e1e2f] text-white rounded-[24px] p-6 md:p-8 shadow-xl overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all border border-indigo-500/10">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
                    <div className="absolute bottom-0 left-10 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                       <div>
                         <div className="bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 inline-block shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse">
                           Beta Feature
                         </div>
                         <h4 className="text-[24px] md:text-[28px] font-display font-bold mb-3 tracking-tight">Custom Exam Builder</h4>
                         <p className="text-[13px] md:text-[14px] text-slate-400 max-w-xl leading-relaxed">
                           Mix and match specific chapters across Physics, Chemistry, and Math. Set your own question count and time limit to target your exact weaknesses dynamically.
                         </p>
                       </div>
                       
                       <div className="shrink-0 w-full md:w-auto">
                         <button className="w-full md:w-auto bg-white text-slate-900 px-8 py-3.5 rounded-xl text-[13px] font-bold hover:bg-slate-100 transition-colors shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02]">
                           Create Test Now <ChevronRight className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                 </div>
               </Link>
            </div>
        </div>

        {/* Micro Chapter Tests Section */}
        <div>
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h3 className="font-display text-[20px] font-bold text-slate-900 mb-2 md:mb-0 flex items-center gap-2">
                 <Bookmark className="w-5 h-5 text-indigo-600" /> Chapter-wise Mocks
              </h3>
              
              {/* Class Toggle */}
              <div className="overflow-x-auto -mx-1 px-1 scrollbar-hide">
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
           </div>

           {/* Modern Tabs for Subject */}
           <div className="overflow-x-auto -mx-1 px-1 scrollbar-hide">
             <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm w-max">
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
           </div>

           {/* Square Practice Grid Layout */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
             {syllabusData.map((chapter) => {
               const isAvailable = chapter.hasData;
               const displayMarks = targetExam === "JEE" ? "100" : "180";
               const maxQ = targetExam === "JEE" ? "25" : "45";
               const timeMins = targetExam === "JEE" ? "60" : "45";

               return (
                 <div 
                   key={chapter.name} 
                   className={`bg-white rounded-[20px] p-6 text-left transition-all relative overflow-hidden group flex flex-col min-h-[220px] ${
                     isAvailable 
                       ? 'border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1' 
                       : 'border border-slate-100 bg-slate-50/50 opacity-70'
                   }`}
                 >
                    {isAvailable && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Ch {chapter.chapterNumber}
                      </div>
                    </div>
                    
                    <h3 className={`text-[15px] font-bold leading-snug mb-2 ${isAvailable ? 'text-slate-900' : 'text-slate-500'}`}>
                      {chapter.name}
                    </h3>
                    
                    {isAvailable ? (
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-4 text-[11px] font-medium text-slate-500">
                           <span className="flex items-center gap-1"><LayoutGrid className="w-3.5 h-3.5" /> {maxQ} Qs</span>
                           <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {displayMarks}</span>
                        </div>
                        <Link href={`/test-console/${chapter.file?.replace(".xml", "")}`} className="block w-full">
                          <button className="flex items-center justify-between w-full py-2.5 px-4 bg-indigo-50/50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors font-bold text-[12px] rounded-xl cursor-pointer">
                             <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Start {timeMins}m Mock</span>
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
               )
             })}
           </div>
        </div>
        
      </div>
    </DashboardShell>
  );
}
