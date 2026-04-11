import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";

export default function PracticePage() {
  return (
    <DashboardShell
      title="Practice modes"
      subtitle="Flexible chapter-wise and subject-wise drilling for focused improvement between mocks."
    >
      <section className="grid gap-6 md:grid-cols-3">
        {["Chapter-wise sprints", "Adaptive difficulty sets", "Revision mode with bookmarks"].map((item) => (
          <Card key={item} className="rounded-[30px] p-6">
            <h2 className="text-xl font-semibold">{item}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Designed to sharpen weak chapters and keep practice deliberate instead of overwhelming.
            </p>
          </Card>
        ))}
      </section>
    </DashboardShell>
  );
}
