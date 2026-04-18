import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PlayCircle, Clock, Trophy, BarChart2, Star, Sparkles, ChevronRight, FileText, CheckCircle2 } from "lucide-react";

export default function MockTestsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col h-full bg-[#fafafc] p-4 md:p-8 overflow-x-hidden overflow-y-auto">
        
        {/* Header Section */}
        <div className="flex items-end justify-between mb-10">
           <div>
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
               <Sparkles className="w-3.5 h-3.5" /> Premium Testing Engine
             </div>
             <h2 className="text-[32px] font-display font-bold text-slate-900 tracking-tight leading-none mb-3">Mock Tests Arena</h2>
             <p className="text-slate-500 text-[14px] max-w-xl">
               Full-scale exam simulations calibrated with NTA-level difficulty. Experience the exact CBT interface of JEE & NEET.
             </p>
           </div>
           
           <div className="hidden lg:flex items-center gap-4">
              <div className="bg-white rounded-xl border border-slate-200/60 p-3 shadow-sm flex items-center gap-4 h-[60px]">
                 <div>
                    <div className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">Avg. Score</div>
                    <div className="text-[16px] font-bold text-slate-900">242<span className="text-[12px] text-slate-400 font-medium">/300</span></div>
                 </div>
                 <div className="w-[1px] h-full bg-slate-200" />
                 <div>
                    <div className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">Percentile</div>
                    <div className="text-[16px] font-bold text-emerald-600">99.4</div>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
           
           {/* Left Section: Available Mocks */}
           <div>
             <h3 className="text-[15px] font-bold text-slate-900 mb-5 flex items-center gap-2">
               Recommended for You <span className="flex h-5 items-center rounded bg-indigo-100 px-2 text-[10px] text-indigo-700">NEW</span>
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
               {[
                 { title: "JEE Advanced 2026", type: "Paper 1 & 2", diff: "Hard", time: "6 Hours", qps: 108, color: "from-indigo-500 to-indigo-600", tag: "LIVE" },
                 { title: "JEE Mains Session 2", type: "Full Syllabus", diff: "Standard", time: "3 Hours", qps: 90, color: "from-cyan-500 to-blue-600" },
                 { title: "NEET UG Mega Mock", type: "Botany + Zoology", diff: "Adaptive", time: "3h 20m", qps: 200, color: "from-emerald-500 to-teal-600" }
               ].map((test, i) => (
                 <div key={i} className="group relative bg-white rounded-[24px] border border-slate-200/60 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 flex flex-col">
                    <div className={`h-2 w-full bg-gradient-to-r ${test.color}`} />
                    <div className="p-6 flex flex-col flex-1">
                       <div className="flex justify-between items-start mb-4">
                          <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center bg-gradient-to-br ${test.color} text-white shadow-md`}>
                            <PlayCircle className="w-6 h-6" />
                          </div>
                          {test.tag && (
                             <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                               <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> {test.tag}
                             </span>
                          )}
                       </div>
                       
                       <h3 className="text-[16px] font-bold text-slate-900 mb-1">{test.title}</h3>
                       <div className="text-[12px] font-medium text-slate-500 mb-6">{test.type}</div>
                       
                       <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                          <div className="bg-slate-50 rounded-xl p-2.5">
                             <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</div>
                             <div className="text-[13px] font-bold text-slate-700">{test.time}</div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-2.5">
                             <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 flex items-center gap-1"><FileText className="w-3 h-3" /> Qs</div>
                             <div className="text-[13px] font-bold text-slate-700">{test.qps} Questions</div>
                          </div>
                       </div>
                       
                       <button className="w-full py-3 bg-slate-900 text-white group-hover:bg-indigo-600 transition-colors font-bold text-[13px] rounded-xl flex items-center justify-center gap-2">
                          Launch Environment <ChevronRight className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               ))}
             </div>
             
             {/* Previous Papers Table */}
             <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                   <h3 className="text-[15px] font-bold text-slate-900">Previous Year Papers Vault</h3>
                   <button className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider hover:text-indigo-800">View All</button>
                </div>
                <div className="divide-y divide-slate-100">
                   {[
                     { name: "JEE Mains 2025 - Jan 27 Shift 1", score: "210/300", acc: "84%", date: "Attempted 2d ago" },
                     { name: "JEE Mains 2024 - Apr 15 Shift 2", score: "185/300", acc: "76%", date: "Attempted 1w ago" },
                     { name: "NEET 2024 Re-Exam", score: "620/720", acc: "89%", date: "Attempted 2w ago" }
                   ].map((row, i) => (
                     <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                              <CheckCircle2 className="w-5 h-5" />
                           </div>
                           <div>
                              <div className="text-[14px] font-bold text-slate-900">{row.name}</div>
                              <div className="text-[12px] text-slate-500">{row.date}</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-8">
                           <div className="text-right">
                              <div className="text-[14px] font-bold text-slate-900">{row.score}</div>
                              <div className="text-[11px] font-medium text-emerald-600">{row.acc} Accuracy</div>
                           </div>
                           <button className="text-[12px] font-bold text-indigo-600 border border-indigo-200 rounded-lg px-4 py-1.5 hover:bg-indigo-50">Report</button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             
           </div>
           
           {/* Right Section: Analytics Sidebar */}
           <div className="flex flex-col gap-6">
              <div className="bg-slate-900 rounded-[24px] p-6 text-white overflow-hidden relative shadow-xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-50 mix-blend-screen" />
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold tracking-[0.15em] text-[10px] uppercase mb-4">
                       <Trophy className="w-3.5 h-3.5" /> Leaderboard Status
                    </div>
                    <div className="text-[32px] font-display font-bold leading-none mb-1">AIR 2,140</div>
                    <div className="text-[13px] text-slate-400 mb-6">Based on rolling average of last 5 mocks.</div>
                    
                    <div className="space-y-4">
                       <div>
                          <div className="flex justify-between text-[11px] font-bold mb-1.5">
                             <span className="text-slate-300">Physics Percentile</span>
                             <span className="text-white">99.1</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full">
                             <div className="h-full bg-cyan-400 rounded-full" style={{ width: '99%' }} />
                          </div>
                       </div>
                       <div>
                          <div className="flex justify-between text-[11px] font-bold mb-1.5">
                             <span className="text-slate-300">Chemistry Percentile</span>
                             <span className="text-white">98.4</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full">
                             <div className="h-full bg-fuchsia-400 rounded-full" style={{ width: '98%' }} />
                          </div>
                       </div>
                       <div>
                          <div className="flex justify-between text-[11px] font-bold mb-1.5">
                             <span className="text-slate-300">Maths Percentile</span>
                             <span className="text-white">99.8</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full">
                             <div className="h-full bg-indigo-400 rounded-full" style={{ width: '99.8%' }} />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 shadow-sm">
                 <h3 className="text-[14px] font-bold text-slate-900 mb-4">Test Strategies</h3>
                 <div className="space-y-3">
                    {[
                      { t: "How to attempt physics paper without losing time", icon: Clock },
                      { t: "Maximizing scores in block chemistry", icon: Star },
                      { t: "The 3-round attempting strategy engineered", icon: BarChart2 }
                    ].map((item, i) => {
                       const Icon = item.icon;
                       return (
                         <div key={i} className="flex gap-3 items-center p-3 rounded-[12px] bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors group">
                           <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-indigo-200 group-hover:text-indigo-600 text-slate-400 transition-colors">
                             <Icon className="w-4 h-4" />
                           </div>
                           <span className="text-[12px] font-bold text-slate-700 group-hover:text-indigo-700 line-clamp-2 leading-snug">{item.t}</span>
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
