"use client";

import { useState } from "react";
import VaccinationHeader from "@/components/dashboard/vaccinations/VaccinationHeader";
import VaccinationSidePanel from "@/components/dashboard/vaccinations/VaccinationSidePanel";
import { useChildData } from "@/hooks/useChildData";
import { Syringe, AlertTriangle, Loader2 } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  COMPLETED: { label: "Completed", color: "text-green-700", bg: "bg-green-100" },
  DUE: { label: "Due", color: "text-amber-700", bg: "bg-amber-100" },
  UPCOMING: { label: "Upcoming", color: "text-slate-500", bg: "bg-slate-100" },
  MISSED: { label: "Missed", color: "text-red-700", bg: "bg-red-100" },
};

// Group milestones by age period derived from title or dueDate proximity to DOB
function groupByPeriod(milestones: any[]) {
  const groups: Record<string, any[]> = {};
  for (const m of milestones) {
    const period = m.title?.match(/\(([^)]+)\)/)?.[1] || "Scheduled";
    if (!groups[period]) groups[period] = [];
    groups[period].push(m);
  }
  return groups;
}

export default function VaccinationTrackerPage() {
  const { loading, error, vaccination, profile, token, registrationId } = useChildData();
  const [filter, setFilter] = useState("All");

  const milestones = vaccination?.milestones || [];
  const filtered = filter === "All"
    ? milestones
    : milestones.filter((m) => m.status === filter.toUpperCase() || (filter === "Overdue" && m.status === "MISSED"));

  const completed = vaccination?.completed ?? 0;
  const total = vaccination?.total ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-8xl">
      <VaccinationHeader />

      {/* Progress Bar */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Overall Progress</p>
            <p className="mt-1 text-sm font-normal text-slate-600">
              {loading ? "Loading..." : `${completed} of ${total} vaccines completed`}
            </p>
          </div>
          <span className="text-2xl font-bold text-primary">{loading ? "—" : `${pct}%`}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1">
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {["All", "Due", "Completed", "Overdue"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-xs font-normal transition-all ${
                  filter === f ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading vaccines...
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No vaccines found for this filter.
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map((m) => {
                const s = STATUS_LABELS[m.status] || STATUS_LABELS.UPCOMING;
                const dateLabel = m.status === "COMPLETED" && m.completedDate
                  ? `Given on: ${new Date(m.completedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
                  : `Due: ${new Date(m.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;

                return (
                  <div
                    key={m._id}
                    className={`flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center ${
                      m.status === "DUE" ? "border-l-4 border-l-amber-500" : ""
                    } ${m.status === "MISSED" ? "border-l-4 border-l-red-500" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                        m.status === "COMPLETED" ? "bg-primary/10 text-primary" :
                        m.status === "DUE" ? "bg-amber-50 text-amber-500" :
                        m.status === "MISSED" ? "bg-red-50 text-red-500" :
                        "bg-slate-100 text-slate-400"
                      }`}>
                        {m.status === "DUE" || m.status === "MISSED"
                          ? <AlertTriangle className="h-6 w-6" />
                          : <Syringe className="h-6 w-6" />}
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="font-medium text-slate-900">{m.vaccineName || m.title}</h4>
                          <span className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase ${s.bg} ${s.color}`}>
                            {s.label}
                          </span>
                        </div>
                        {m.description && <p className="text-xs text-slate-500">{m.description}</p>}
                        <p className={`mt-1 text-xs font-medium ${
                          m.status === "DUE" ? "text-amber-600" :
                          m.status === "MISSED" ? "text-red-600" :
                          m.status === "COMPLETED" ? "text-slate-700" : "text-slate-500"
                        }`}>{dateLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-lg px-4 py-2 text-xs font-medium ${
                        m.status === "COMPLETED" 
                          ? "bg-green-50 text-green-700" 
                          : m.status === "DUE"
                          ? "bg-amber-50 text-amber-700"
                          : m.status === "MISSED"
                          ? "bg-red-50 text-red-700"
                          : "bg-slate-50 text-slate-700"
                      }`}>
                        {m.status === "COMPLETED" ? "✓ Done" : s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <VaccinationSidePanel />
      </div>
    </div>
  );
}

