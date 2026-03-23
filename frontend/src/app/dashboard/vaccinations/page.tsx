"use client";

import { useState, useEffect } from "react";
import VaccinationHeader from "@/components/dashboard/vaccinations/VaccinationHeader";
import VaccinationSidePanel from "@/components/dashboard/vaccinations/VaccinationSidePanel";
import MarkVaccineDoneModal from "@/components/dashboard/vaccinations/MarkVaccineDoneModal";
import ViewRecordModal from "@/components/dashboard/vaccinations/ViewRecordModal";
import { useChildData } from "@/hooks/useChildData";
import {
  Syringe, AlertTriangle, Loader2, Check, X, Eye,
  Baby, Calendar, Shield, Star, Zap, ChevronDown
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Prevent prerendering
export const dynamic = 'force-dynamic';

// Age period definitions matching vaccination-schedule.ts ageInMonths values
const AGE_PERIODS = [
  { label: "At Birth", months: 0, icon: Baby, color: "bg-pink-50 border-pink-200 text-pink-700" },
  { label: "6 Weeks", months: 1.5, icon: Shield, color: "bg-blue-50 border-blue-200 text-blue-700" },
  { label: "10 Weeks", months: 2.5, icon: Shield, color: "bg-blue-50 border-blue-200 text-blue-700" },
  { label: "14 Weeks", months: 3.5, icon: Shield, color: "bg-blue-50 border-blue-200 text-blue-700" },
  { label: "6 Months", months: 6, icon: Star, color: "bg-purple-50 border-purple-200 text-purple-700" },
  { label: "7 Months", months: 7, icon: Star, color: "bg-purple-50 border-purple-200 text-purple-700" },
  { label: "9 Months", months: 9, icon: Star, color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { label: "12 Months (1 Year)", months: 12, icon: Calendar, color: "bg-green-50 border-green-200 text-green-700" },
  { label: "13 Months", months: 13, icon: Calendar, color: "bg-green-50 border-green-200 text-green-700" },
  { label: "15 Months", months: 15, icon: Zap, color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
  { label: "18 Months", months: 18, icon: Zap, color: "bg-orange-50 border-orange-200 text-orange-700" },
  { label: "24 Months (2 Years)", months: 24, icon: Calendar, color: "bg-teal-50 border-teal-200 text-teal-700" },
  { label: "Annual Vaccines (2-5 Years)", months: 31, icon: Calendar, color: "bg-cyan-50 border-cyan-200 text-cyan-700" },
  { label: "4-5 Years", months: 60, icon: Calendar, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { label: "9 Years", months: 108, icon: Calendar, color: "bg-violet-50 border-violet-200 text-violet-700" },
  { label: "10 Years", months: 120, icon: Calendar, color: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700" },
  { label: "14 Years", months: 168, icon: Calendar, color: "bg-rose-50 border-rose-200 text-rose-700" },
  { label: "16-18 Years", months: 192, icon: Calendar, color: "bg-slate-50 border-slate-200 text-slate-700" },
];

// Map a milestone's dueDate + child DOB → closest period months value
function getPeriodMonths(dueDate: string, dob: string): number {
  const due = new Date(dueDate).getTime();
  const birth = new Date(dob).getTime();
  const diffMonths = (due - birth) / (1000 * 60 * 60 * 24 * 30.44);

  // Special handling for annual flu vaccines (group them together)
  if (diffMonths >= 19 && diffMonths <= 67) {
    return 31; // Group all annual vaccines 2-5 years together
  }
  if (diffMonths >= 79 && diffMonths <= 211) {
    return 192; // Group annual vaccines 6-18 years together
  }

  // Find closest period
  let closest = AGE_PERIODS[0];
  let minDiff = Math.abs(diffMonths - AGE_PERIODS[0].months);
  for (const p of AGE_PERIODS) {
    const diff = Math.abs(diffMonths - p.months);
    if (diff < minDiff) {
      minDiff = diff;
      closest = p;
    }
  }
  return closest.months;
}

function groupMilestonesByPeriod(milestones: any[], dob: string) {
  const map = new Map<number, any[]>();
  for (const p of AGE_PERIODS) map.set(p.months, []);

  for (const m of milestones) {
    const periodMonths = getPeriodMonths(m.dueDate, dob);
    map.get(periodMonths)?.push(m);
  }

  return AGE_PERIODS.map((p) => ({ ...p, milestones: map.get(p.months) || [] })).filter(
    (p) => p.milestones.length > 0
  );
}

const STATUS_CONFIG: Record<string, { label: string; textColor: string; bg: string; border: string }> = {
  COMPLETED: { label: "Completed", textColor: "text-green-700", bg: "bg-green-100", border: "border-green-200" },
  DUE: { label: "Due Today", textColor: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200" },
  UPCOMING: { label: "Upcoming", textColor: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" },
  MISSED: { label: "Missed", textColor: "text-red-700", bg: "bg-red-100", border: "border-red-200" },
};

export default function VaccinationTrackerPage() {
  const { loading, error, vaccination, profile, token, registrationId, refetch } = useChildData();
  const [filter, setFilter] = useState("All");
  const [showOptional, setShowOptional] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [showMarkDoneModal, setShowMarkDoneModal] = useState(false);
  const [showViewRecordModal, setShowViewRecordModal] = useState(false);
  const [healthRecords, setHealthRecords] = useState<Record<string, any>>({});
  const [undoing, setUndoing] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const togglePeriod = (label: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  useEffect(() => {
    if (!token || !registrationId || !vaccination?.milestones) return;
    const fetchHealthRecords = async () => {
      try {
        const res = await fetch(`${API_BASE}/health-records/${registrationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const records = data.data || [];
        const recordMap: Record<string, any> = {};
        vaccination.milestones.forEach((milestone: any) => {
          if (milestone.status === "COMPLETED" && milestone.completedDate) {
            const milestoneDate = new Date(milestone.completedDate).toISOString().split("T")[0];
            const match = records.find((r: any) => {
              const rd = new Date(r.recordDate).toISOString().split("T")[0];
              return r.category === "Vaccination Cards" && rd === milestoneDate;
            });
            if (match) {
              recordMap[milestone._id] = {
                ...match,
                fileUrl: match.fileUrl?.startsWith("http") ? match.fileUrl : `${API_BASE}${match.fileUrl}`,
              };
            }
          }
        });
        setHealthRecords(recordMap);
      } catch {}
    };
    fetchHealthRecords();
  }, [token, registrationId, vaccination]);

  const handleMarkDone = (m: any) => { setSelectedMilestone(m); setShowMarkDoneModal(true); };
  const handleViewRecord = (m: any) => {
    const record = healthRecords[m._id];
    setSelectedMilestone({
      ...m,
      record: record || {
        title: m.vaccineName || m.title,
        recordDate: m.completedDate,
        recordType: "VACCINATION",
        description: m.description,
        notes: m.notes,
      },
    });
    setShowViewRecordModal(true);
  };

  const handleUndo = async (m: any) => {
    if (!token || !confirm("Reset this vaccination status?")) return;
    setUndoing(m._id);
    try {
      const res = await fetch(`${API_BASE}/dashboard/milestones/${m._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "DUE", completedDate: null, notes: null }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      refetch();
    } catch (e: any) {
      alert(`Failed: ${e.message}`);
    } finally {
      setUndoing(null);
    }
  };

  const milestones = vaccination?.milestones || [];
  const filtered =
    filter === "All"
      ? milestones
      : milestones.filter(
          (m) => m.status === filter.toUpperCase() || (filter === "Overdue" && m.status === "MISSED")
        );

  const completed = vaccination?.completed ?? 0;
  const total = vaccination?.total ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = {
    completed: milestones.filter((m) => m.status === "COMPLETED").length,
    due: milestones.filter((m) => m.status === "DUE").length,
    upcoming: milestones.filter((m) => m.status === "UPCOMING").length,
    missed: milestones.filter((m) => m.status === "MISSED").length,
  };

  const dob = profile?.dateOfBirth || "";
  const grouped = dob ? groupMilestonesByPeriod(filtered, dob) : [];

  return (
    <div className="mx-auto max-w-8xl">
      <VaccinationHeader
        completed={stats.completed}
        due={stats.due}
        upcoming={stats.upcoming}
        missed={stats.missed}
      />

      {/* Info Banner */}
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900">Comprehensive Vaccination Schedule</h3>
            <p className="mt-1 text-xs text-blue-700">
              This schedule includes 90+ vaccines from birth to 18 years, covering all mandatory and optional vaccines recommended by IAP (Indian Academy of Pediatrics). 
              Optional vaccines are marked with a blue badge. Use the toggle above to show/hide optional vaccines.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Overall Progress</p>
            <p className="mt-1 text-sm text-slate-600">
              {loading ? "Loading..." : `${completed} of ${total} vaccines completed`}
            </p>
          </div>
          <span className="text-2xl font-bold text-primary">{loading ? "—" : `${pct}%`}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        
        {/* Vaccine Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="text-xs font-medium text-green-600">Completed</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{stats.completed}</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-600">Due Now</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{stats.due}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-600">Upcoming</p>
            <p className="mt-1 text-2xl font-bold text-slate-700">{stats.upcoming}</p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-medium text-red-600">Missed</p>
            <p className="mt-1 text-2xl font-bold text-red-700">{stats.missed}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
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
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOptional}
                  onChange={(e) => setShowOptional(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm text-slate-600">Show Optional Vaccines</span>
              </label>
            </div>
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

          {/* Timeline */}
          {!loading && !error && grouped.length > 0 && (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

              <div className="space-y-10">
                {grouped.map((period, pi) => {
                  const allDone = period.milestones.every((m: any) => m.status === "COMPLETED");
                  const hasDue = period.milestones.some((m: any) => m.status === "DUE" || m.status === "MISSED");
                  const PeriodIcon = period.icon;

                  return (
                    <div key={period.label} className="relative pl-14">
                      {/* Period dot — click to collapse/expand */}
                      <button
                        onClick={() => togglePeriod(period.label)}
                        className={`absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm z-10 transition-colors ${
                          allDone
                            ? "border-primary bg-primary text-white"
                            : hasDue
                            ? "border-amber-400 bg-amber-50 text-amber-500"
                            : "border-slate-300 bg-white text-slate-400"
                        }`}
                        title={collapsed.has(period.label) ? "Expand" : "Collapse"}
                      >
                        {collapsed.has(period.label) ? (
                          <ChevronDown className="h-4 w-4 -rotate-90 transition-transform" />
                        ) : (
                          <PeriodIcon className="h-4 w-4" />
                        )}
                      </button>

                      {/* Period label with color coding */}
                      <div
                        className="mb-3 flex cursor-pointer items-center gap-2 select-none"
                        onClick={() => togglePeriod(period.label)}
                      >
                        <div className={`rounded-lg border px-3 py-1 ${period.color}`}>
                          <h3 className="text-sm font-semibold">{period.label}</h3>
                        </div>
                        <span className="text-xs text-slate-400">
                          {period.milestones.filter((m: any) => m.status === "COMPLETED").length}/
                          {period.milestones.length} done
                        </span>
                        {allDone && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            All Complete
                          </span>
                        )}
                        <ChevronDown
                          className={`ml-auto h-4 w-4 text-slate-400 transition-transform duration-200 ${
                            collapsed.has(period.label) ? "-rotate-90" : ""
                          }`}
                        />
                      </div>

                      {/* Vaccine cards — collapsible */}
                      {!collapsed.has(period.label) && (
                        <div className="space-y-3">
                          {period.milestones.map((m: any) => {
                          const s = STATUS_CONFIG[m.status] || STATUS_CONFIG.UPCOMING;
                          const dateLabel =
                            m.status === "COMPLETED" && m.completedDate
                              ? `Given on: ${new Date(m.completedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
                              : `Due: ${new Date(m.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;

                          return (
                            <div
                              key={m._id}
                              className={`flex flex-col justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center ${
                                m.status === "DUE" ? "border-l-4 border-l-amber-400 border-t-slate-200 border-r-slate-200 border-b-slate-200" :
                                m.status === "MISSED" ? "border-l-4 border-l-red-400 border-t-slate-200 border-r-slate-200 border-b-slate-200" :
                                "border-slate-200"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                    m.status === "COMPLETED" ? "bg-primary/10 text-primary" :
                                    m.status === "DUE" ? "bg-amber-50 text-amber-500" :
                                    m.status === "MISSED" ? "bg-red-50 text-red-500" :
                                    "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {m.status === "DUE" || m.status === "MISSED" ? (
                                    <AlertTriangle className="h-5 w-5" />
                                  ) : (
                                    <Syringe className="h-5 w-5" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <h4 className="text-sm font-medium text-slate-900">{m.vaccineName || m.title}</h4>
                                    <span className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase ${s.bg} ${s.textColor}`}>
                                      {s.label}
                                    </span>
                                    {m.description?.includes("optional") && (
                                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                                        Optional
                                      </span>
                                    )}
                                  </div>
                                  {m.description && (
                                    <p className="text-xs text-slate-500 line-clamp-1">{m.description}</p>
                                  )}
                                  <p className={`mt-1 text-xs font-medium ${
                                    m.status === "DUE" ? "text-amber-600" :
                                    m.status === "MISSED" ? "text-red-600" :
                                    m.status === "COMPLETED" ? "text-slate-600" : "text-slate-400"
                                  }`}>
                                    {dateLabel}
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                {m.status === "COMPLETED" ? (
                                  <>
                                    <button
                                      onClick={() => handleViewRecord(m)}
                                      className="flex items-center gap-1.5 rounded-lg border border-primary bg-white px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                                    >
                                      <Eye className="h-3.5 w-3.5" /> View
                                    </button>
                                    <button
                                      onClick={() => handleUndo(m)}
                                      disabled={undoing === m._id}
                                      className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                                    >
                                      {undoing === m._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                                      Undo
                                    </button>
                                  </>
                                ) : (
                                  <div className="relative group">
                                    <button
                                      onClick={() => handleMarkDone(m)}
                                      disabled={m.status === "UPCOMING"}
                                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                        m.status === "UPCOMING"
                                          ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                          : "bg-primary text-white hover:bg-primary/90"
                                      }`}
                                    >
                                      <Check className="h-3.5 w-3.5" /> Mark Done
                                    </button>
                                    {m.status === "UPCOMING" && (
                                      <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-white shadow-lg group-hover:block z-20">
                                        Not due yet
                                        <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fallback flat list when DOB not available */}
          {!loading && !error && !dob && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((m: any) => {
                const s = STATUS_CONFIG[m.status] || STATUS_CONFIG.UPCOMING;
                return (
                  <div key={m._id} className={`flex items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-sm ${
                    m.status === "DUE" ? "border-l-4 border-l-amber-400" : m.status === "MISSED" ? "border-l-4 border-l-red-400" : "border-slate-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <Syringe className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{m.vaccineName || m.title}</p>
                        <span className={`text-[10px] font-medium uppercase ${s.textColor}`}>{s.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <VaccinationSidePanel />
      </div>

      {showMarkDoneModal && selectedMilestone && token && registrationId && (
        <MarkVaccineDoneModal
          isOpen={showMarkDoneModal}
          onClose={() => { setShowMarkDoneModal(false); setSelectedMilestone(null); }}
          milestone={selectedMilestone}
          registrationId={registrationId}
          token={token}
          onSuccess={refetch}
        />
      )}

      {showViewRecordModal && selectedMilestone?.record && (
        <ViewRecordModal
          isOpen={showViewRecordModal}
          onClose={() => { setShowViewRecordModal(false); setSelectedMilestone(null); }}
          record={selectedMilestone.record}
        />
      )}
    </div>
  );
}
