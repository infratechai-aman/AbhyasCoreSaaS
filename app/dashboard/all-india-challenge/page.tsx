"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/lib/auth-context";
import { Trophy, Clock, Users, Flame, Play, Loader2, Crown, Calendar, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

function getNextSunday(): Date {
  const now = new Date();
  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const day = istNow.getUTCDay(); // 0=Sun
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const nextSun = new Date(istNow);
  nextSun.setUTCDate(nextSun.getUTCDate() + daysUntilSunday);
  nextSun.setUTCHours(10, 0, 0, 0); // 10 AM IST window
  // Convert back to UTC for countdown
  return new Date(nextSun.getTime() - istOffset);
}

function isSundayWindow(): boolean {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const day = istNow.getUTCDay();
  const hour = istNow.getUTCHours();
  // Window: Sunday 10 AM to 2 PM IST
  return day === 0 && hour >= 10 && hour < 14;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00:00";
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((ms % (1000 * 60)) / 1000);
  return `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

export default function AllIndiaChallengePagePage() {
  const { userData } = useAuth();
  const router = useRouter();
  const exam = userData?.targetExam === "NEET" ? "NEET" : "JEE";
  const [countdown, setCountdown] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    function tick() {
      const live = isSundayWindow();
      setIsLive(live);
      if (live) {
        setCountdown("LIVE NOW");
      } else {
        const target = getNextSunday();
        const diff = target.getTime() - Date.now();
        setCountdown(formatCountdown(diff));
      }
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const handleLaunchChallenge = () => {
    setLaunching(true);
    const chapters = exam === "NEET"
      ? "cell_the_unit_of_life,human_health_and_disease,photosynthesis_in_higher_plants,current_electricity,equilibrium,chemical_kinetics,molecular_basis_of_inheritance,evolution"
      : "kinematics,laws_of_motion,electrostatic_potential_and_capacitance,chemical_kinetics,complex_numbers_and_quadratic_equations,application_of_derivatives,matrices,probability_12";
    router.push(`/test-console/custom?c=${chapters}&q=30`);
  };

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: "Arjun S.", score: 28, time: "18:42" },
    { rank: 2, name: "Priya M.", score: 27, time: "20:15" },
    { rank: 3, name: "Rahul K.", score: 26, time: "19:58" },
    { rank: 4, name: "Ananya D.", score: 25, time: "22:30" },
    { rank: 5, name: "Vikram R.", score: 25, time: "23:01" },
    { rank: 6, name: "Sneha G.", score: 24, time: "21:45" },
    { rank: 7, name: "Karan P.", score: 23, time: "24:10" },
    { rank: 8, name: "Meera J.", score: 22, time: "25:30" },
  ];

  return (
    <DashboardShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h1 className="text-[28px] font-display font-bold text-slate-900">All-India Elite Challenge</h1>
            <p className="text-slate-500">Compete simultaneously against thousands of aspirants nationwide.</p>
          </div>
        </div>

        {/* Countdown Hero */}
        <div className={`rounded-[28px] p-8 text-center relative overflow-hidden ${isLive ? "bg-gradient-to-br from-emerald-600 to-teal-700" : "bg-gradient-to-br from-slate-800 to-slate-900"}`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4"><Trophy className="w-32 h-32" /></div>
            <div className="absolute bottom-4 left-4"><Shield className="w-24 h-24" /></div>
          </div>
          <div className="relative z-10">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4 ${isLive ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-white/60"}`}>
              <Calendar className="w-3.5 h-3.5" />
              {isLive ? "Challenge is LIVE" : "Next Challenge: Sunday 10 AM IST"}
            </div>
            <div className={`text-[40px] md:text-[52px] font-display font-bold leading-none mb-4 ${isLive ? "text-white" : "text-white"}`}>
              {countdown}
            </div>
            <p className="text-white/50 text-[14px] max-w-md mx-auto mb-6">
              {isLive
                ? "The arena is open! 30 high-difficulty questions, 60 minutes, one shot — prove your rank."
                : "Every Sunday, 10 AM – 2 PM IST. One 30-question sprint. National leaderboard ranking."}
            </p>
            <button
              onClick={handleLaunchChallenge}
              disabled={!isLive || launching}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-[15px] transition-all ${
                isLive
                  ? "bg-white text-emerald-700 hover:bg-emerald-50 shadow-2xl shadow-white/20 hover:scale-[1.02]"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              {launching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {isLive ? "Enter the Arena" : "Locked Until Sunday"}
            </button>
          </div>
        </div>

        {/* Rules + Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
              <Clock className="w-4 h-4" />
            </div>
            <div className="font-bold text-slate-900 mb-1">60 Minutes</div>
            <div className="text-[13px] text-slate-500">Complete 30 questions within the time limit. No extensions.</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Flame className="w-4 h-4" />
            </div>
            <div className="font-bold text-slate-900 mb-1">High Difficulty</div>
            <div className="text-[13px] text-slate-500">Questions curated from advanced topics across your syllabus.</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <div className="font-bold text-slate-900 mb-1">National Rank</div>
            <div className="text-[13px] text-slate-500">Your score is ranked live against all participating students.</div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" /> Last Week&apos;s Leaderboard
            </h2>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top 8</span>
          </div>
          <div className="divide-y divide-slate-50">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 ${
                  entry.rank === 1 ? "bg-amber-100 text-amber-700" :
                  entry.rank === 2 ? "bg-slate-200 text-slate-600" :
                  entry.rank === 3 ? "bg-orange-100 text-orange-600" :
                  "bg-slate-50 text-slate-400"
                }`}>
                  {entry.rank}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-[14px]">{entry.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 text-[14px]">{entry.score}/30</div>
                  <div className="text-[11px] text-slate-400">{entry.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
