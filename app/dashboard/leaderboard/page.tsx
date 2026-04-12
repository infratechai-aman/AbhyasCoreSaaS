import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { leaderboard } from "@/lib/data";

export default function LeaderboardPage() {
  const topThree = leaderboard.slice(0, 3);

  return (
    <DashboardShell>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[32px] border-slate-200 bg-[linear-gradient(135deg,#0f1435,#191f4d)] p-6 text-white">
          <div className="text-sm uppercase tracking-[0.2em] text-indigo-200">Top momentum</div>
          <h2 className="mt-3 font-display text-3xl font-bold">This week&apos;s front runners</h2>
          <div className="mt-8 space-y-4">
            {topThree.map((student, index) => (
              <div key={student.name} className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-[0.22em] text-indigo-200">Rank #{index + 1}</div>
                    <div className="mt-2 font-display text-2xl font-bold">{student.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-indigo-100/72">Score</div>
                    <div className="mt-1 text-2xl font-semibold">{student.score}</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-indigo-100/74">
                  {student.streak} day streak • {student.city}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: "Average score", value: "682" },
            { label: "Best streak", value: "27 days" },
            { label: "Top city", value: "Kota" }
          ].map((item) => (
            <Card key={item.label} className="rounded-[32px] border-slate-200 bg-white p-6">
              <div className="text-sm uppercase tracking-[0.2em] text-indigo-600">{item.label}</div>
              <div className="mt-4 font-display text-4xl font-bold text-slate-950">{item.value}</div>
            </Card>
          ))}
        </div>
      </section>

      <Card className="rounded-[32px] border-slate-200 bg-white p-6">
        <div className="grid grid-cols-[90px_1.3fr_140px_140px_140px] gap-4 border-b border-slate-200 pb-4 text-xs uppercase tracking-[0.22em] text-slate-400">
          <div>Rank</div>
          <div>Name</div>
          <div>Score</div>
          <div>Streak</div>
          <div>City</div>
        </div>
        <div className="mt-4 space-y-3">
          {leaderboard.map((student, index) => (
            <div
              key={student.name}
              className="grid grid-cols-[90px_1.3fr_140px_140px_140px] gap-4 rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8faff)] px-4 py-4 text-sm text-slate-700"
            >
              <div className="font-display text-xl font-bold text-indigo-600">#{index + 1}</div>
              <div className="font-medium text-slate-950">{student.name}</div>
              <div>{student.score}</div>
              <div>{student.streak} days</div>
              <div>{student.city}</div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardShell>
  );
}
