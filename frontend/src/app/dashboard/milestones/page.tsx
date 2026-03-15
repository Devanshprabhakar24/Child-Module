"use client";

import { useState } from "react";
import { useChildData } from "@/hooks/useChildData";
import { Check, AlertTriangle, Clock, Loader2, Info } from "lucide-react";
import TipsAndActivities from "@/components/dashboard/milestones/TipsAndActivities";

const STATUS_CONFIG = {
  COMPLETED: { icon: Check, color: "text-primary", bg: "bg-primary/10", label: "Achieved" },
  DUE: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", label: "Due" },
  UPCOMING: { icon: Clock, color: "text-slate-400", bg: "bg-slate-100", label: "Upcoming" },
  MISSED: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", label: "Delayed" },
};

export default function MilestonesPage() {
  const { loading, error, milestones } = useChildData();
  const [filter, setFilter] = useState("All");

  const nonVax = milestones.filter((m) => m.category !== "VACCINATION");
  const filtered = filter === "All" ? nonVax : nonVax.filter((m) => m.status === filter.toUpperCase());

  const completed = nonVax.filter((m) => m.status === "COMPLETED").length;
  const total = nonVax.length || 1;
  const pct = Math.round((completed / total) * 100);
  const delayed = nonVax.filter((m) => m.status === "MISSED").length;

  return (
    <div className="mx-auto w-full max-w-8xl">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-medium tracking-tight text-slate-900">Milestone Tracker</h1>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Progress Card */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h3 className="mb-6 font-medium text-slate-900">Overall Progress</h3>
            <div className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center">
              <svg className="h-full w-full -rotate-90">
                <circle className="text-primary/10" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" />
                <circle
                  className="text-primary"
                  cx="80" cy="80" fill="transparent" r="70"
                  stroke="currentColor"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * pct) / 100}
                  strokeLinecap="round"
                  strokeWidth="12"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-medium text-slate-900">{loading ? "—" : `${pct}%`}</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Achieved</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between px-4 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="font-medium">On Track</span>
                </div>
                <span className="font-medium text-slate-900">{completed}</span>
              </div>
              <div className="flex items-center justify-between px-4 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="font-medium">Delayed</span>
                </div>
                <span className="font-medium text-slate-900">{delayed}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-xs font-normal leading-relaxed text-amber-800">
                Consult your pediatrician if any milestone is delayed by 2+ months beyond the typical age range.
              </p>
            </div>
          </div>
        </div>

        {/* Milestones List */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {["All", "Completed", "Due", "Upcoming", "Missed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-xs font-normal transition-all ${
                  filter === f ? "bg-primary text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading milestones...
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              {nonVax.length === 0
                ? "No development milestones tracked yet. Vaccination milestones are shown in the Vaccination Tracker."
                : "No milestones match this filter."}
            </div>
          )}

          {!loading && filtered.map((m) => {
            const cfg = STATUS_CONFIG[m.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.UPCOMING;
            const Icon = cfg.icon;
            const dateStr = m.status === "COMPLETED" && m.completedDate
              ? `Achieved: ${new Date(m.completedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
              : `Due: ${new Date(m.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;

            return (
              <div key={m._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.bg} ${cfg.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{m.title}</p>
                      {m.description && <p className="text-xs text-slate-500">{m.description}</p>}
                      <p className="mt-0.5 text-[11px] font-normal text-slate-400">{dateStr}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TipsAndActivities />
    </div>
  );
}
