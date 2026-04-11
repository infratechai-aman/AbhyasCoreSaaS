import Image from "next/image";
import Link from "next/link";
import { Check, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricing } from "@/lib/data";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.14),transparent_26%),linear-gradient(180deg,#eef2ff_0%,#ffffff_100%)] text-slate-950">
      <header className="px-4 pt-4 lg:px-8">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between rounded-full border border-slate-200 bg-white/85 px-5 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#4f46e5)] text-white shadow-[0_16px_30px_rgba(99,102,241,0.25)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold text-slate-950">RankForge AI</div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-slate-500">Pricing</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                Back Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-[linear-gradient(135deg,#7c3aed,#4f46e5)] text-white">Open Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1450px] px-4 pb-24 pt-16 lg:px-8">
        <section className="grid gap-10 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="pt-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-indigo-700">
              <Zap className="h-3.5 w-3.5" />
              Premium plans for serious aspirants
            </div>
            <h1 className="mt-7 font-display text-5xl font-bold leading-[0.92] tracking-[-0.05em] lg:text-7xl">
              Pricing that looks premium and feels exam-season ready.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Start free for daily discipline, upgrade when mock frequency, analytics depth, and AI support become
              mission critical.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/dashboard">
                <Button className="bg-[linear-gradient(135deg,#7c3aed,#4f46e5)] px-7 py-3.5 text-white">Start Free</Button>
              </Link>
              <Button variant="secondary" className="border-slate-200 bg-white px-7 py-3.5 text-slate-800 hover:bg-slate-50">
                Compare plans
              </Button>
            </div>
          </div>

          <div className="relative min-h-[560px]">
            <div className="absolute left-0 top-0 w-[58%] rounded-[38px] bg-white p-4 shadow-[0_24px_80px_rgba(99,102,241,0.08)] group hover:scale-[1.02] transition-transform duration-500">
              <Image
                src="/assets/main_dashboard.png"
                alt="Product Dashboard Mockup"
                width={1536}
                height={1024}
                className="h-[460px] w-full rounded-[28px] object-cover object-top border border-slate-100"
              />
            </div>
            <div className="absolute right-0 top-[8%] w-[38%] rounded-[30px] bg-[linear-gradient(135deg,#0f1435,#191f4d)] p-8 text-white shadow-[0_26px_90px_rgba(15,23,42,0.2)] z-10">
              <div className="text-[11px] uppercase tracking-[0.28em] text-indigo-400 font-bold">Best for</div>
              <div className="mt-4 font-display text-4xl font-bold leading-tight">Students aiming for consistency at scale.</div>
            </div>
            <div className="absolute bottom-0 right-[8%] w-[46%] rounded-[32px] bg-white p-4 shadow-[0_24px_90px_rgba(0,0,0,0.12)] group hover:scale-105 transition-transform duration-500 z-20">
              <Image
                src="/assets/analytics_chart.png"
                alt="Analytics UI"
                width={1536}
                height={1024}
                className="h-[280px] w-full rounded-[24px] object-cover object-center border border-slate-100"
              />
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-8 lg:grid-cols-2">
          {pricing.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative overflow-hidden rounded-[40px] p-[1px] shadow-[0_28px_90px_rgba(99,102,241,0.08)] ${
                index === 1 ? "bg-[linear-gradient(135deg,#7c3aed,#4f46e5,#22d3ee)]" : "bg-[linear-gradient(180deg,#e2e8f0,#cbd5e1)]"
              }`}
            >
              <div className={`h-full rounded-[39px] p-8 ${index === 1 ? "bg-[linear-gradient(180deg,#0e1433,#171d42)] text-white" : "bg-white text-slate-950"}`}>
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className={`text-[11px] uppercase tracking-[0.3em] ${index === 1 ? "text-indigo-200" : "text-indigo-600"}`}>{plan.name}</div>
                    <div className="mt-4 font-display text-6xl font-bold">{plan.price}</div>
                    <p className={`mt-4 max-w-md text-base leading-8 ${index === 1 ? "text-indigo-100/78" : "text-slate-600"}`}>{plan.description}</p>
                  </div>
                  {index === 1 ? (
                    <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white">
                      Most loved
                    </div>
                  ) : null}
                </div>

                <div className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm">
                      <div className={`rounded-full p-1 ${index === 1 ? "bg-white/10 text-indigo-100" : "bg-indigo-50 text-indigo-600"}`}>
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex gap-3">
                  <Button className={index === 1 ? "bg-white text-slate-950 hover:bg-indigo-50" : "bg-[linear-gradient(135deg,#7c3aed,#4f46e5)] text-white"}>
                    Choose {plan.name}
                  </Button>
                  <Button
                    variant="secondary"
                    className={index === 1 ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"}
                  >
                    See details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-3">
          {[
            "Unlimited mocks with deeper AI analysis",
            "Rank prediction, revision mode, and bookmarks",
            "A visual system that matches the core product experience"
          ].map((item) => (
            <div key={item} className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(99,102,241,0.06)]">
              <div className="text-[11px] uppercase tracking-[0.28em] text-indigo-600">Included</div>
              <p className="mt-4 font-display text-2xl font-bold text-slate-950">{item}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
