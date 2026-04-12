import { Calculator, Flag, Hourglass, ListChecks } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sampleQuestion } from "@/lib/data";

export default function MockLivePage() {
  return (
    <DashboardShell>
      <section className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_280px]">
        <Card className="rounded-[30px] p-5">
          <div className="flex items-center gap-2 text-sm text-brand-4">
            <ListChecks className="h-4 w-4" />
            Question palette
          </div>
          <div className="mt-5 grid grid-cols-5 gap-3">
            {Array.from({ length: 30 }).map((_, index) => (
              <button
                key={index}
                className={`rounded-2xl border px-0 py-3 text-sm ${index === 0 ? "border-brand-3 bg-brand-3/15 text-white" : "border-white/10 bg-white/5 text-muted"}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-3 text-xs text-muted">
            <div>Answered: 12</div>
            <div>Marked for review: 5</div>
            <div>Not visited: 13</div>
          </div>
        </Card>

        <Card className="rounded-[30px] p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-brand-3/20 bg-brand-3/10 px-3 py-1 text-xs text-brand-4">
              {sampleQuestion.subject}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
              {sampleQuestion.chapter}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
              {sampleQuestion.difficulty}
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-semibold leading-10">{sampleQuestion.questionText}</h2>
          <div className="mt-8 space-y-4">
            {sampleQuestion.options.map((option, index) => (
              <button
                key={option}
                className={`w-full rounded-[24px] border px-5 py-4 text-left text-sm transition ${index === 2 ? "border-brand-3 bg-brand-3/10 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="secondary" className="gap-2">
              <Flag className="h-4 w-4" />
              Mark for review
            </Button>
            <Button variant="ghost">Skip</Button>
            <Button>Next question</Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[30px] p-5">
            <div className="flex items-center gap-2 text-sm text-brand-4">
              <Hourglass className="h-4 w-4" />
              Timer
            </div>
            <div className="mt-4 text-5xl font-semibold">02:12:18</div>
            <p className="mt-3 text-sm text-muted">Auto-submit triggers when the countdown reaches zero.</p>
          </Card>
          <Card className="rounded-[30px] p-5">
            <div className="text-sm font-medium">Sections</div>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <div className="rounded-2xl border border-brand-3/20 bg-brand-3/10 px-4 py-3 text-white">Physics</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Chemistry</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Mathematics</div>
            </div>
          </Card>
          <Card className="rounded-[30px] p-5">
            <div className="flex items-center gap-2 text-sm text-brand-4">
              <Calculator className="h-4 w-4" />
              JEE calculator
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
              {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"].map((key) => (
                <button key={key} className="rounded-xl border border-white/10 bg-white/5 py-3 hover:bg-white/10">
                  {key}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </DashboardShell>
  );
}
