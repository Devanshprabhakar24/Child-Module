import { Activity, CheckCircle, Hourglass, AlertTriangle } from "lucide-react";
import type { DashboardMilestone } from "@/hooks/useDashboardData";

interface VaccinationTimelineProps {
  milestones?: DashboardMilestone[];
}

export default function VaccinationTimeline({ milestones = [] }: VaccinationTimelineProps) {
  const vax = milestones.filter((m) => m.category === "VACCINATION");
  if (vax.length === 0) {
    return null;
  }

  const completed = vax.filter((m) => m.status === "COMPLETED");
  const dueSoon = vax.filter((m) => ["UPCOMING", "DUE"].includes(m.status));
  const missed = vax.filter((m) => m.status === "MISSED");

  const cards = [
    {
      label: "Completed",
      color: "text-primary",
      border: "border-primary",
      icon: CheckCircle,
      item: completed[0],
      dateLabel: "Administered",
      dateField: "completedDate" as const,
    },
    {
      label: "Due Soon",
      color: "text-orange-500",
      border: "border-orange-500",
      icon: Hourglass,
      item: dueSoon[0],
      dateLabel: "Due",
      dateField: "dueDate" as const,
    },
    {
      label: "Overdue",
      color: "text-red-500",
      border: "border-red-500",
      icon: AlertTriangle,
      item: missed[0],
      dateLabel: "Missed",
      dateField: "dueDate" as const,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xl font-medium">
          <Activity className="h-6 w-6 text-primary" />
          Vaccination Timeline
        </h3>
      </div>
      <div className="flex flex-col gap-4 overflow-x-auto pb-2 md:flex-row">
        {cards
          .filter((c) => c.item)
          .map((card, idx) => {
            const dateRaw = (card.item as any)?.[card.dateField];
            const dateText = dateRaw
              ? new Date(dateRaw).toLocaleDateString("en-IN")
              : "—";
            return (
              <div
                key={idx}
                className={`min-w-[280px] flex-1 rounded-xl border-l-4 ${card.border} bg-white p-5 shadow-sm`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <span
                    className={`text-xs font-medium uppercase tracking-wider ${card.color}`}
                  >
                    {card.label}
                  </span>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <h5 className="text-lg font-medium">
                  {card.item?.vaccineName || card.item?.title}
                </h5>
                {card.item?.description && (
                  <p className="text-sm text-slate-500">{card.item.description}</p>
                )}
                <p className="mt-3 text-xs font-medium text-slate-500">
                  {card.dateLabel}: {dateText}
                </p>
              </div>
            );
          })}
      </div>
    </section>
  );
}
