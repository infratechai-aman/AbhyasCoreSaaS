import Link from "next/link";
import { ArrowRight, Brain, Clock3, LayoutGrid, Rocket } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";

const tests = [
  { title: "Chapter Test", meta: "10-30 questions", icon: Brain, href: "/dashboard/tests/mock-live" },
  { title: "Subject Test", meta: "30-60 questions", icon: LayoutGrid, href: "/dashboard/tests/mock-live" },
  { title: "Full JEE Simulation", meta: "90 questions", icon: Rocket, href: "/dashboard/tests/mock-live" },
  { title: "Full NEET Simulation", meta: "180 questions", icon: Clock3, href: "/dashboard/tests/mock-live" }
];

export default function TestsPage() {
  return (
    <DashboardShell
      title="Test library"
      subtitle="Choose the right pressure level, from focused chapter practice to full exam simulations."
    >
      <section className="grid gap-6 md:grid-cols-2">
        {tests.map((test) => {
          const Icon = test.icon;
          return (
            <Link href={test.href} key={test.title}>
              <Card className="rounded-[30px] p-6 transition hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-1/20 to-brand-3/20 text-brand-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold">{test.title}</h2>
                <p className="mt-2 text-sm text-muted">{test.meta}</p>
                <div className="mt-6 flex items-center gap-2 text-sm text-brand-4">
                  Launch exam mode
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>
          );
        })}
      </section>
    </DashboardShell>
  );
}
