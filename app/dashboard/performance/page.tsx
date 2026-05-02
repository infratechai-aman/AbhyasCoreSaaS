"use client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Target, TrendingUp, Zap, Clock, Trophy, Activity, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Color map for subject bars
const SUBJECT_COLORS: Record<string, string> = {
  Physics: "from-cyan-400 to-sky-500",
  Chemistry: "from-fuchsia-400 to-violet-500",
  Mathematics: "from-indigo-400 to-blue-500",
  Biology: "from-emerald-400 to-teal-500",
  Mixed: "from-amber-400 to-orange-500",
};

interface SubjectStat {
  name: string;
  correct: number;
  attempted: number;
  accuracy: number;
  color: string;
}

export default function PerformancePage() {
  const { user, userData } = useAuth();
  const targetExam = userData?.targetExam || "JEE";
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalQuestions: 0,
    totalCorrect: 0,
    globalAccuracy: 0,
    averagePace: 0,
    projectedAir: 3218, // Default baseline
    totalExams: 0,
  });
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);

  useEffect(() => {
    async function fetchMetrics() {
      if (!user || !db) {
         setLoading(false);
         return;
      }
      try {
        const q = query(collection(db, "results"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        let correct = 0;
        let attempted = 0;
        let totalTime = 0;
        let totalExams = 0;

        // Per-subject aggregation
        const subjectMap: Record<string, { correct: number; attempted: number }> = {};
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const wrongCount = data.wrongCount || 0;
          const currCorrect = data.correctCount || 0;
          const subject = data.subject || "Mixed";
          
          correct += currCorrect;
          attempted += (currCorrect + wrongCount);
          totalTime += data.timeTaken || 0;
          totalExams++;

          // Aggregate by subject
          if (!subjectMap[subject]) {
            subjectMap[subject] = { correct: 0, attempted: 0 };
          }
          subjectMap[subject].correct += currCorrect;
          subjectMap[subject].attempted += (currCorrect + wrongCount);
        });

        const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
        const avgPace = attempted > 0 ? totalTime / attempted : 0;
        
        // AIR projection algorithm
        let simulatedAir = 32180;
        if (accuracy > 80) simulatedAir = 3218;
        if (accuracy > 90) simulatedAir = 450;
        if (accuracy < 50 && accuracy > 0) simulatedAir = 150000;

        setMetrics({
           totalQuestions: attempted,
           totalCorrect: correct,
           globalAccuracy: parseFloat(accuracy.toFixed(1)),
           averagePace: avgPace,
           projectedAir: simulatedAir,
           totalExams,
        });

        // Build subject stats array
        const stats: SubjectStat[] = Object.entries(subjectMap)
          .filter(([name]) => {
            if (targetExam === "JEE" && name === "Biology") return false;
            if (targetExam === "NEET" && name === "Mathematics") return false;
            return true;
          })
          .map(([name, data]) => ({
            name,
            correct: data.correct,
            attempted: data.attempted,
            accuracy: data.attempted > 0 ? parseFloat(((data.correct / data.attempted) * 100).toFixed(1)) : 0,
            color: SUBJECT_COLORS[name] || SUBJECT_COLORS.Mixed,
          }))
          .sort((a, b) => b.accuracy - a.accuracy);

        setSubjectStats(stats);
      } catch (err) {
        console.error("Failed to fetch telemetry:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, [user, targetExam]);

  const formatPace = (seconds: number) => {
    if (seconds === 0) return "0s";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <DashboardShell>
      <div className="flex flex-col h-full bg-[#fafafc] p-4 md:p-8 overflow-x-hidden overflow-y-auto">
        
        <div className="mb-10 max-w-2xl">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 shadow-sm">
             <Activity className="w-3.5 h-3.5" /> Granular Analytics
          </div>
          <h2 className="text-[32px] font-display font-bold text-slate-900 tracking-tight leading-none mb-3">Performance Matrix</h2>
          <p className="text-slate-500 text-[14px]">
            Track accuracy, pacing vectors, and chapter decay over time to guarantee your AIR prediction.
          </p>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
           <div className="bg-slate-900 rounded-[20px] p-6 text-white relative overflow-hidden shadow-lg hover:-translate-y-1 transition-transform cursor-default">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500 rounded-full blur-[40px] opacity-40 mix-blend-screen" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                 <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-indigo-300">Projected AIR</div>
                 <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                   <Trophy className="w-4 h-4" />
                 </div>
              </div>
              <div className="text-[36px] font-display font-bold leading-none mb-2 relative z-10">
                 {loading ? <Loader2 className="w-6 h-6 animate-spin text-white mb-2" /> : metrics.projectedAir.toLocaleString()}
              </div>
              <div className="text-[12px] text-emerald-400 font-bold flex items-center gap-1 relative z-10"><TrendingUp className="w-3 h-3" /> Based on {metrics.totalQuestions} Qs attempted</div>
           </div>
           
           <div className="bg-white rounded-[20px] border border-slate-200/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-transform cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-indigo-900"><Target className="w-24 h-24" /></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                 <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Global Accuracy</div>
              </div>
              <div className="text-[36px] font-display font-bold leading-none text-slate-900 mb-2 relative z-10">
                 {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-2" /> : `${metrics.globalAccuracy}%`}
              </div>
              <div className="text-[12px] text-emerald-600 font-bold flex items-center gap-1 relative z-10"><TrendingUp className="w-3 h-3" /> Target: 85% for Top 1K</div>
           </div>

           <div className="bg-white rounded-[20px] border border-slate-200/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-transform cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-indigo-900"><Clock className="w-24 h-24" /></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                 <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Average Pace</div>
              </div>
              <div className="text-[36px] font-display font-bold leading-none text-slate-900 mb-2 relative z-10">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-2" /> : formatPace(metrics.averagePace)}
              </div>
              <div className="text-[12px] text-red-500 font-bold flex items-center gap-1 relative z-10"><TrendingUp className="w-3 h-3 rotate-180" /> {metrics.averagePace > 90 ? 'Slower than target' : 'On track'}</div>
           </div>
           
           <div className="bg-white rounded-[20px] border border-slate-200/60 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-transform cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-indigo-900"><Zap className="w-24 h-24" /></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                 <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Exams Completed</div>
              </div>
              <div className="text-[36px] font-display font-bold leading-none text-slate-900 mb-2 relative z-10">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-2" /> : metrics.totalExams}
              </div>
              <div className="text-[12px] text-indigo-600 font-bold flex items-center gap-1 relative z-10"><Sparkles className="w-3 h-3" /> {userData?.streak || 0} Day active streak</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-8">
           
           {/* Subject Accuracy Breakdown — REAL DATA */}
           <div className="flex flex-col gap-6">
              <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex-1">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-display text-[18px] font-bold text-slate-900">Accuracy by Subject</h3>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">{metrics.totalExams} exams analyzed</span>
                </div>
                
                <div className="space-y-6">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    </div>
                  ) : subjectStats.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm font-medium">
                      No exam data yet. Complete a mock to see your subject-wise breakdown here.
                    </div>
                  ) : subjectStats.map((subject) => (
                    <div key={subject.name} className="group">
                      <div className="mb-2 flex items-center justify-between text-[14px]">
                        <span className="font-bold text-slate-700">{subject.name}</span>
                        <span className="font-bold text-slate-900">{subject.accuracy}%</span>
                      </div>
                      <div className="h-4 rounded-full bg-slate-100 p-0.5 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${subject.color} group-hover:opacity-80 transition-all`} style={{ width: `${subject.accuracy}%` }} />
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-[11px] font-medium text-slate-400">
                         <span>{subject.correct}/{subject.attempted} Qs Correct</span>
                         <span>•</span>
                         <span>{subject.attempted} Qs Attempted</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>

           {/* AI Weakness Identification */}
           <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-400 to-amber-300" />
              
              <div className="flex items-center gap-2 mb-6 mt-2">
                 <AlertCircle className="w-5 h-5 text-red-500" />
                 <h3 className="font-display text-[18px] font-bold text-slate-900">AI Weakness Detection</h3>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-red-400" />
                </div>
              ) : subjectStats.length === 0 ? (
                <p className="text-[13px] text-slate-400 font-medium py-6 text-center">
                  Complete at least 1 mock for AI weakness detection to activate.
                </p>
              ) : (
                <>
                  <p className="text-[13px] text-slate-500 font-medium mb-6">
                    Based on {metrics.totalExams} exam{metrics.totalExams !== 1 ? 's' : ''} analyzed, these areas need the most attention.
                  </p>
                  
                  <div className="space-y-3">
                    {/* Show weakest subjects dynamically */}
                    {subjectStats
                      .filter(s => s.attempted >= 1)
                      .sort((a, b) => a.accuracy - b.accuracy)
                      .slice(0, 4)
                      .map((weakness, i) => {
                        const priority = weakness.accuracy < 40 ? "CRITICAL" : weakness.accuracy < 60 ? "HIGH" : "MEDIUM";
                        return (
                          <div key={i} className="group flex flex-col p-4 rounded-2xl border border-red-100/50 bg-red-50/30 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                               <div className="flex items-center gap-2">
                                 <span className={`px-2 py-0.5 rounded uppercase font-bold tracking-wider text-[9px]
                                    ${priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                                      priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}
                                 `}>{priority}</span>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{weakness.name}</span>
                               </div>
                            </div>
                            <div className="text-[14px] font-bold text-slate-900 mb-1">{weakness.name} — {weakness.accuracy}% Accuracy</div>
                            <div className="text-[12px] font-medium text-slate-500">{weakness.correct} correct out of {weakness.attempted} attempted</div>
                          </div>
                        );
                      })}
                    {subjectStats.filter(s => s.attempted >= 1).length === 0 && (
                      <p className="text-[13px] text-slate-400 text-center py-4">Need at least 1 attempt per subject for analysis.</p>
                    )}
                  </div>
                  
                  <button className="w-full mt-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-md transition-colors">
                     Generate Remedial Protocol
                  </button>
                </>
              )}
           </div>
           
        </div>
      </div>
    </DashboardShell>
  );
}
