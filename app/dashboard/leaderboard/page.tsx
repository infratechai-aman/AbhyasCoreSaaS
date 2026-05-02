import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Target, Timer } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100 relative">
          <Target className="w-10 h-10 text-indigo-600" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white">
            <Timer className="w-3 h-3 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-3 tracking-tight">Leaderboard Coming Soon</h1>
        <p className="text-slate-500 max-w-md mx-auto leading-relaxed text-sm">
          We are currently aggregating test data from over 50,000+ students to bring you the most accurate and competitive AIR ranking system. Stay tuned!
        </p>
      </div>
    </DashboardShell>
  );
}
