import { Cake, Syringe, Calendar } from "lucide-react";
import type { DashboardChild, DashboardMilestone } from "@/hooks/useDashboardData";

interface StatsGridProps {
  child?: DashboardChild;
  milestones?: DashboardMilestone[];
}

export default function StatsGrid({ child, milestones = [] }: StatsGridProps) {
  const age = child?.ageInYears ?? null;
  const ageLabel = age !== null && age !== undefined 
    ? `${age} year${age !== 1 ? "s" : ""}` 
    : "—";

  const vaxMilestones = milestones.filter((m) => m.category === "VACCINATION");
  const completed = vaxMilestones.filter((m) => m.status === "COMPLETED").length;
  const total = vaxMilestones.length || 1;
  const percent = Math.round((completed / total) * 100);

  const upcoming = vaxMilestones.filter((m) =>
    ["UPCOMING", "DUE"].includes(m.status),
  );
  const next = upcoming[0];
  const nextDate = next ? new Date(next.dueDate).toLocaleDateString("en-IN") : "—";
  const nextLabel = next ? `${next.vaccineName || next.title}` : "No upcoming dose";

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Cake className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm text-slate-500">Age</p>
          <p className="text-xl font-medium">{ageLabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <Syringe className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm text-slate-500">Vaccines</p>
          <p className="text-xl font-medium">
            {completed}/{vaxMilestones.length || 0} ({percent}% complete)
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <Calendar className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm text-slate-500">Next Due</p>
          <p className="text-xl font-medium">
            {nextDate}{" "}
            {next && (
              <span className="text-sm text-orange-600">
                ⚠️ {nextLabel}
              </span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
