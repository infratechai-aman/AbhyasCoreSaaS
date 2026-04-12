import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Syllabus } from "@/lib/syllabus";
import { useAuth } from "@/lib/auth-context";
import { X } from "lucide-react";
import { 
  FileText, 
  Database, 
  Clock, 
  Flame, 
  Crown, 
  Sparkles,
  Zap,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";

export default function DashboardPage() {
  const { userData } = useAuth();
  const [quickTestOpen, setQuickTestOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const startTest = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setQuickTestOpen(false);
      alert("Test environment would launch here!");
    }, 2000);
  };

  return (
    <>
    <DashboardShell quickTestHandler={() => setQuickTestOpen(true)}>
      <div className="flex h-full bg-[#fafafc]">
        {/* Central Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Top Toggle */}
          <div className="inline-flex p-1 bg-white border border-slate-200/80 rounded-[10px] shadow-sm mb-10">
            <button className="flex items-center gap-2 px-5 py-2 rounded-md bg-indigo-600 text-white text-[13px] font-medium shadow-[0_2px_8px_rgba(79,70,229,0.25)]">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-md text-slate-500 hover:text-slate-800 text-[13px] font-medium transition-colors">
              <Sparkles className="h-4 w-4" />
              Practice Hub
            </button>
          </div>

          <div className="mb-10">
            <h2 className="text-[28px] font-semibold text-slate-900 tracking-tight leading-none mb-2">Welcome back, {userData?.name || "Aspirant"}!</h2>
            <p className="text-slate-500 text-[14px]">Here's your {userData?.subscription || "standard"} dashboard overview.</p>
          </div>

          {/* Stats Cards - Dynamic Integration */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
             <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Mocks Completed</div>
                <div className="text-[28px] font-bold text-slate-900 leading-none">{userData?.mocksCompleted || 0}</div>
             </div>
             <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Database className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Questions Solved</div>
                <div className="text-[28px] font-bold text-slate-900 leading-none">{userData?.questionsSolved || 0}</div>
             </div>
             <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Performance Index</div>
                <div className="text-[28px] font-bold text-slate-900 leading-none">{userData?.performanceIndex || "0.0"}</div>
             </div>
             <div className="bg-white rounded-[16px] p-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="h-8 w-8 rounded-lg bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mb-4">
                  <Flame className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase mb-1">Active Streak</div>
                <div className="text-[28px] font-bold text-slate-900 leading-none">{userData?.streak || 0} Days</div>
             </div>
          </div>

          {/* Current Subjects - Dynamic Syllabus Integration */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-slate-900">Current Subjects <span className="text-slate-400 font-medium text-[13px] ml-2">(Class 11)</span></h3>
              <button className="text-[10px] font-bold tracking-[0.1em] text-indigo-600 uppercase hover:text-indigo-700 transition-colors">View Full Curriculum</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(Syllabus.Class11) as Array<keyof typeof Syllabus.Class11>).map((sub) => {
                const chapters = Syllabus.Class11[sub];
                const total = chapters.length;
                const ready = chapters.filter(c => c.hasData).length;
                const percent = Math.round((ready / total) * 100);
                return (
                  <div key={sub} className="bg-white rounded-[16px] border border-slate-200/60 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-200 transition-colors group cursor-pointer relative overflow-hidden">
                     <div className="text-[14px] font-bold text-slate-900 mb-1">{sub}</div>
                     <div className="text-[11px] font-medium text-slate-500 mb-4">{ready} of {total} Chapters Ready</div>
                     <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 rounded-full transition-all group-hover:bg-indigo-600" style={{ width: `${percent}%` }} />
                     </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently Built Papers -> Recent Test Attempts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-slate-900">Recent Test Attempts</h3>
              <button className="text-[10px] font-bold tracking-[0.1em] text-indigo-600 uppercase hover:text-indigo-700 transition-colors flex items-center gap-1">
                Access Vault <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { subject: "JEE Advanced Full Mock", class: "Pattern 1", marks: "360 Marks", intensity: "MODERATE", date: "03/04/2026" },
                { subject: "Physics Sectional", class: "Electromagnetism", marks: "120 Marks", intensity: "HARD", date: "01/04/2026" },
                { subject: "Chemistry Drill", class: "Organic Chemistry", marks: "40 Marks", intensity: "MODERATE", date: "28/03/2026" },
                { subject: "Mathematics Part Test", class: "Calculus", marks: "80 Marks", intensity: "HARD", date: "25/03/2026" }
              ].map((paper, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white rounded-[16px] border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900 mb-0.5">{paper.subject}</div>
                      <div className="text-[12px] text-slate-500 mb-2">{paper.class} &bull; {paper.marks}</div>
                      <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500 tracking-[0.1em] uppercase">{paper.intensity}</span>
                         <span className="text-[11px] font-medium text-slate-400">{paper.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-indigo-600 transition-colors mr-2">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="h-12"></div>
        </div>

        {/* Right Info Sidebar - EXACTLY matching ScorePrepPro style */}
        <div className="w-[300px] bg-white border-l border-slate-200 p-6 flex flex-col overflow-y-auto">
          {/* Plan Status */}
          <div className="bg-white border border-slate-200/80 rounded-[16px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] mb-8 flex flex-col text-center">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <Crown className="h-6 w-6" />
            </div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-1">Plan Status</div>
            <div className="text-[15px] font-bold text-slate-900 mb-2">Premium Plan</div>
            <p className="text-[12px] leading-relaxed text-slate-500 mb-5 px-1">
              Your subscription is active until Dec 2026.
            </p>
            <button className="w-full py-2 rounded-lg border border-indigo-200 text-indigo-600 text-[12px] font-bold tracking-wide hover:bg-indigo-50 transition-colors">
              Manage Billing
            </button>
          </div>

          {/* Exam Calendar */}
          <div className="mb-8 flex-1">
             <div className="flex items-center justify-between mb-5">
               <h3 className="text-[13px] font-bold text-slate-900">Exam Calendar</h3>
               <button className="text-[9px] uppercase tracking-[0.1em] font-bold text-indigo-600 hover:text-indigo-700">Full Schedule</button>
             </div>

             <div className="space-y-4">
                {[
                  { month: "Jan", day: "12", title: "JEE Mains Session 1", desc: "All Subjects", color: "bg-blue-500" },
                  { month: "Apr", day: "04", title: "JEE Mains Session 2", desc: "All Subjects", color: "bg-orange-500" },
                  { month: "May", day: "26", title: "JEE Advanced", desc: "Paper 1 & 2", color: "bg-emerald-500" }
                ].map((ev, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm rounded-lg py-1.5 min-w-[48px]">
                      <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">{ev.month}</span>
                      <span className="text-[14px] font-bold text-slate-900 leading-none">{ev.day}</span>
                    </div>
                    <div className="flex-1 flex justify-between items-start pt-0.5">
                       <div>
                         <div className="text-[12px] font-bold text-slate-900 mb-0.5">{ev.title}</div>
                         <div className="text-[11px] text-slate-500">{ev.desc}</div>
                       </div>
                       <div className={`h-1.5 w-1.5 rounded-full ${ev.color} mt-1`} />
                    </div>
                  </div>
                ))}
             </div>

             <button className="mt-6 text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors flex items-center">
               + Add Important Date
             </button>
          </div>

          {/* Pro Tip */}
          <div className="mt-auto bg-[#1a1c29] rounded-[16px] p-5 relative overflow-hidden shadow-xl shadow-slate-900/10">
            <div className="absolute top-0 right-0 p-3 opacity-10 text-white">
              <Sparkles className="w-16 h-16" />
            </div>
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Zap className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-[13px] font-bold text-white tracking-wide">Pro Tip</span>
            </div>
            <p className="text-[12px] leading-[1.6] text-slate-300 mb-4 relative z-10">
              Analyzing your mock tests right after attempting them boosts retention by 40%. Don't skip the post-mock AI review.
            </p>
            <button className="text-[10px] font-bold uppercase tracking-[0.1em] text-indigo-400 hover:text-indigo-300 transition-colors relative z-10">
              Learn More &gt;
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
    
    {quickTestOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
         <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
               <h3 className="font-display font-bold text-slate-900 text-lg">Quick Generate Test</h3>
               <button onClick={() => setQuickTestOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-full transition-colors">
                  <X className="w-4 h-4" />
               </button>
            </div>
            
            <div className="p-6">
               {generating ? (
                 <div className="py-8 flex flex-col items-center text-center">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                    <div className="font-bold text-slate-900">Assembling via AI...</div>
                    <div className="text-[12px] text-slate-500 mt-2">Pulling weak topics from Recent Attempts.</div>
                 </div>
               ) : (
                 <>
                   <div className="mb-5">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Subject Selection</label>
                      <select className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[14px] outline-none">
                         <option>Full PCMB Syllabus (JEE/NEET)</option>
                         <option>Physics Only</option>
                         <option>Chemistry Only</option>
                         <option>Mathematics Only</option>
                      </select>
                   </div>
                   
                   <div className="mb-6">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Difficulty Curve</label>
                      <div className="flex gap-2">
                         <button className="flex-1 py-2.5 rounded-xl border border-indigo-600 bg-indigo-50 text-indigo-700 font-bold text-[13px]">Standard</button>
                         <button className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-bold text-[13px] hover:bg-slate-100">Adaptive</button>
                         <button className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-bold text-[13px] hover:bg-slate-100">Hardcore</button>
                      </div>
                   </div>
                   
                   <button onClick={startTest} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-colors flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" /> Start Quick Mock
                   </button>
                 </>
               )}
            </div>
         </div>
      </div>
    )}
    </>
  );
}
