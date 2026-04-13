import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BrainCircuit, MessageSquare, BookOpen, Send, Sparkles, Zap, ShieldAlert, Fingerprint } from "lucide-react";

export default function AITutorPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col h-full bg-[#fafafc] p-8 overflow-y-auto">
        
        <div className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
             <Fingerprint className="w-3.5 h-3.5" /> Generative AI Copilot
          </div>
          <h2 className="text-[32px] font-display font-bold text-slate-900 tracking-tight leading-none mb-3">AI Copilot</h2>
          <p className="text-slate-500 text-[14px]">
            Your personal 24/7 mentor. Paste complex questions, request alternative solutions, or ask for a custom revision map based on your weaknesses.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 flex-1">
          
          {/* Main Chat Area */}
          <div className="bg-white rounded-[32px] border border-slate-200/60 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col h-full min-h-[500px] overflow-hidden">
             
             {/* Chat Header */}
             <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                   <div className="relative">
                     <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[8px] opacity-40 animate-pulse" />
                     <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center relative shadow-md">
                        <BrainCircuit className="w-5 h-5" />
                     </div>
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-900 leading-tight">RankForge Engine</h3>
                      <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Online
                      </span>
                   </div>
                </div>
                <div className="hidden sm:flex gap-2">
                   <span className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider rounded-lg">Model: GPT-4o-Turbo</span>
                </div>
             </div>
             
             {/* Chat Canvas */}
             <div className="flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-50 via-white to-white p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                 
                 <div className="w-16 h-16 bg-white border border-slate-200 shadow-xl shadow-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 transform -rotate-6 hover:rotate-0 transition-transform">
                    <MessageSquare className="w-8 h-8" />
                 </div>
                 <h4 className="font-display text-[18px] font-bold text-slate-900 mb-2">How can I help you today?</h4>
                 <p className="text-[13px] text-slate-500 font-medium max-w-sm mb-8">
                    Paste a screenshot of a doubt, type an organic chemistry reaction, or ask me to explain a concept.
                 </p>
                 
                 <div className="flex flex-wrap gap-2 justify-center max-w-lg relative z-10">
                    {[
                      "Explain Rotational Mechanics", 
                      "Generate a 10-Min Biology Quiz", 
                      "Why is my chemistry score dropping?"
                    ].map(pill => (
                       <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-[12px] font-semibold hover:border-indigo-400 hover:text-indigo-600 shadow-sm transition-all hover:-translate-y-0.5">
                          {pill}
                       </button>
                    ))}
                 </div>
             </div>
             
             {/* Input Area */}
             <div className="p-4 bg-white border-t border-slate-100 relative z-10">
                <div className="relative flex items-center">
                   <div className="absolute left-4 text-slate-400"><Sparkles className="w-4 h-4" /></div>
                   <input 
                     type="text" 
                     placeholder="Message RankForge AI..." 
                     className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-16 text-[14px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-inner" 
                   />
                   <button className="absolute right-2 w-10 h-10 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-md">
                      <Send className="w-4 h-4 ml-0.5" />
                   </button>
                </div>
                <div className="text-center mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                   <ShieldAlert className="w-3 h-3" /> AI outputs may occasionally be inaccurate.
                </div>
             </div>
          </div>
          
          {/* Right Sidebar Data Panel */}
          <div className="flex flex-col gap-6">
          
            <div className="relative bg-slate-900 rounded-[28px] p-6 text-white overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-20">
                  <Zap className="w-32 h-32 text-indigo-500" />
               </div>
               
               <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300 mb-6 backdrop-blur-md">
                     Recommended by AI
                  </div>
                  <h3 className="font-display text-[24px] font-bold mb-3 leading-tight">Thermodynamics <br/> <span className="text-indigo-400">Deep Dive</span></h3>
                  <p className="text-[13px] text-slate-300 leading-relaxed mb-6">
                     Based on your last mock test, your accuracy on isothermal and adiabatic processes dropped by 18%. Let me generate a specialized 5-question test to fix this.
                  </p>
                  
                  <button className="w-full py-3.5 bg-white hover:bg-slate-50 text-indigo-700 font-bold text-[13px] rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                     <BrainCircuit className="w-4 h-4" /> Start AI Review
                  </button>
               </div>
            </div>
            
            <div className="bg-white rounded-[28px] border border-slate-200/60 p-6 shadow-sm flex-1 flex flex-col">
               <h3 className="text-[14px] font-bold text-slate-900 mb-5 flex items-center justify-between">
                 Chat History <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hover:text-indigo-600 cursor-pointer">Clear</span>
               </h3>
               
               <div className="space-y-3 flex-1">
                  {[
                    { title: "Rotational Dynamics Constraint Eq...", time: "2 hours ago" },
                    { title: "Chemical Bonding VSEPR exceptions", time: "Yesterday" },
                    { title: "Genetics Probabilities in Pedigree", time: "Mar 12" }
                  ].map((t, i) => (
                    <div key={i} className="group flex gap-3.5 items-center p-3.5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm cursor-pointer transition-all">
                       <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors shrink-0">
                          <BookOpen className="w-4 h-4 text-indigo-500" />
                       </div>
                       <div>
                          <div className="text-[12px] font-bold text-slate-700 group-hover:text-slate-900 leading-tight mb-1">{t.title}</div>
                          <div className="text-[10px] font-medium text-slate-400">{t.time}</div>
                       </div>
                    </div>
                  ))}
               </div>
               
            </div>
            
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
