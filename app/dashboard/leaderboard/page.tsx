import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { leaderboard } from "@/lib/data";

export default function LeaderboardPage() {
  const topThree = leaderboard.slice(0, 3);

  return (
    <DashboardShell>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] mb-8">
        <Card className="rounded-[32px] border-slate-200 bg-[#0f1435] bg-[linear-gradient(135deg,#0f1435,#1d265a)] p-5 md:p-8 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-20" />
          <div className="relative z-10">
            <div className="text-[10px] md:text-sm uppercase tracking-[0.2em] text-indigo-300 font-bold">Top momentum</div>
            <h2 className="mt-3 font-display text-2xl md:text-3xl font-bold tracking-tight">This week&apos;s front runners</h2>
            <div className="mt-8 space-y-3">
              {topThree.map((student, index) => (
                <div key={student.name} className="rounded-[24px] border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-4 transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-indigo-200 font-bold">Rank #{index + 1}</div>
                      <div className="mt-1 font-display text-xl md:text-2xl font-bold group-hover:text-indigo-300 transition-colors">{student.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-indigo-100/60 font-bold uppercase tracking-wider">Score</div>
                      <div className="mt-0.5 text-xl md:text-2xl font-semibold tabular-nums">{student.score}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-[12px] text-indigo-100/70 font-medium">
                    {student.streak} day streak • {student.city}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
          {[
            { label: "Average score", value: "682", icon: "📊" },
            { label: "Best streak", value: "27 days", icon: "🔥" },
            { label: "Top city", value: "Kota", icon: "📍" }
          ].map((item) => (
            <Card key={item.label} className="rounded-[32px] border-slate-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-all">
              <div className="text-[10px] md:text-sm uppercase tracking-[0.2em] text-indigo-600 font-bold mb-4">{item.label}</div>
              <div className="flex items-baseline gap-2">
                <div className="font-display text-3xl md:text-4xl font-bold text-slate-950 tracking-tight">{item.value}</div>
                <span className="text-xl opacity-20">{item.icon}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card className="rounded-[32px] border-slate-200 bg-white p-4 md:p-8">
        <div className="overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0 scrollbar-hide">
          <div className="min-w-[600px] md:min-w-full">
            <div className="grid grid-cols-[70px_1.3fr_100px_100px_120px] gap-4 border-b border-slate-100 pb-4 text-[10px] md:text-xs uppercase tracking-[0.22em] text-slate-400 px-4">
              <div>Rank</div>
              <div>Name</div>
              <div>Score</div>
              <div>Streak</div>
              <div className="text-right">City</div>
            </div>
            <div className="mt-4 space-y-3 pb-2">
              {leaderboard.map((student, index) => (
                <div
                  key={student.name}
                  className="grid grid-cols-[70px_1.3fr_100px_100px_120px] gap-4 rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8faff)] px-5 py-4 text-sm text-slate-700 hover:border-indigo-200 hover:shadow-sm transition-all group"
                >
                  <div className="font-display text-xl font-bold text-indigo-600 group-hover:scale-110 transition-transform">#{index + 1}</div>
                  <div className="font-semibold text-slate-950 truncate pr-2">{student.name}</div>
                  <div className="tabular-nums font-medium text-slate-600">{student.score}</div>
                  <div className="text-slate-500 text-[13px]">{student.streak} days</div>
                  <div className="text-right text-slate-500 font-medium">{student.city}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </DashboardShell>
  );
}
