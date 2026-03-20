"use client";

import { useEffect, useState } from "react";
import { Cake, Syringe, FileText, TrendingUp, Activity, Clock, CheckCircle, AlertCircle, Scale, ExternalLink, Droplets, CalendarClock } from "lucide-react";
import type { DashboardChild, DashboardMilestone } from "@/hooks/useDashboardData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface StatsGridProps {
  child?: DashboardChild;
  milestones?: DashboardMilestone[];
}

interface HealthRecord {
  _id: string;
  documentName: string;
  category: string;
  recordDate: string;
  fileUrl: string;
  notes?: string;
}

function calcBmi(heightCm?: number, weightKg?: number): number | null {
  if (!heightCm || !weightKg || heightCm <= 0) return null;
  return Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10;
}

function bmiStatus(bmi: number, ageYears: number | null): { label: string; color: string } {
  // Use simplified child BMI ranges (not adult WHO)
  if (ageYears !== null && ageYears < 18) {
    if (bmi < 14) return { label: "Underweight", color: "text-amber-600" };
    if (bmi < 18) return { label: "Healthy", color: "text-primary" };
    if (bmi < 22) return { label: "Overweight", color: "text-orange-500" };
    return { label: "Obese", color: "text-red-600" };
  }
  if (bmi < 18.5) return { label: "Underweight", color: "text-amber-600" };
  if (bmi < 25) return { label: "Healthy", color: "text-primary" };
  if (bmi < 30) return { label: "Overweight", color: "text-orange-500" };
  return { label: "Obese", color: "text-red-600" };
}

export default function StatsGrid({ child, milestones = [] }: StatsGridProps) {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [totalRecordsCount, setTotalRecordsCount] = useState<number | null>(null);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const age = child?.ageInYears ?? null;
  const ageGroup = child?.ageGroup || "—";
  const ageInMonths = age !== null ? Math.round(age * 12) : null;
  const ageYears = ageInMonths !== null ? Math.floor(ageInMonths / 12) : null;
  const ageMonths = ageInMonths !== null ? ageInMonths % 12 : null;

  // Vaccination stats
  const vaxMilestones = milestones.filter((m) => m.category === "VACCINATION");
  const completed = vaxMilestones.filter((m) => m.status === "COMPLETED").length;
  const pending = vaxMilestones.filter((m) => ["UPCOMING", "DUE", "PENDING"].includes(m.status)).length;
  const overdue = vaxMilestones.filter((m) => m.status === "OVERDUE").length;
  const total = vaxMilestones.length || 1;
  const percent = Math.round((completed / total) * 100);
  const upcoming = vaxMilestones
    .filter((m) => ["UPCOMING", "DUE"].includes(m.status))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const next = upcoming[0];
  const nextDate = next ? new Date(next.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—";
  const nextLabel = next ? next.vaccineName || next.title : null;

  // Health checkup milestones
  const growthMilestones = milestones.filter((m) => m.category === "HEALTH_CHECKUP");
  const completedGrowth = growthMilestones.filter((m) => m.status === "COMPLETED").length;
  const nextGrowthMilestone = growthMilestones
    .filter((m) => m.status !== "COMPLETED")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  // Days until next checkup
  const daysUntilCheckup = nextGrowthMilestone
    ? Math.ceil((new Date(nextGrowthMilestone.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // BMI from registration data
  const bmi = calcBmi(child?.heightCm, child?.weightKg);
  const bmiCategory = bmi !== null ? bmiStatus(bmi, ageYears) : { label: "", color: "" };

  // Fetch health records
  useEffect(() => {
    if (!child?.registrationId) return;
    const fetchHealthRecords = async () => {
      setLoadingRecords(true);
      try {
        const token = localStorage.getItem("wt18_token");
        const response = await fetch(
          `${API_BASE}/health-records/${encodeURIComponent(child.registrationId)}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (response.ok) {
          const data = await response.json();
          const records: HealthRecord[] = Array.isArray(data.data?.records)
            ? data.data.records
            : Array.isArray(data.data) ? data.data : [];
          setHealthRecords(records);
          setTotalRecordsCount(data.data?.stats?.totalRecords ?? records.length);
        }
      } catch (error) {
        console.error("Failed to fetch health records:", error);
      } finally {
        setLoadingRecords(false);
      }
    };
    fetchHealthRecords();
  }, [child?.registrationId]);

  const totalRecords = totalRecordsCount ?? healthRecords.length;
  const recentRecords = healthRecords.slice(0, 2);
  const milestonesUrl = `/dashboard/milestones${child?.registrationId ? `?registrationId=${child.registrationId}` : ""}`;
  const recordsUrl = `/dashboard/records${child?.registrationId ? `?registrationId=${child.registrationId}` : ""}`;

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Vaccination Progress Card */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Vaccination Progress</h3>
            <p className="text-xs text-slate-400 mt-0.5">Immunization journey</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Syringe className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl font-bold text-slate-900">{percent}%</span>
          <div className="flex-1">
            <div className="h-2 w-full rounded-full bg-emerald-50 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-600 transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{completed} of {total} completed</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-bold text-primary leading-none">{completed}</p>
              <p className="text-[10px] text-slate-500">Done</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-600 leading-none">{pending}</p>
              <p className="text-[10px] text-slate-500">Pending</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-2 py-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-600 leading-none">{overdue}</p>
              <p className="text-[10px] text-slate-500">Overdue</p>
            </div>
          </div>
        </div>
        {next && (
          <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2 border border-emerald-100">
            <Syringe className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-emerald-900 truncate">{nextLabel}</p>
              <p className="text-[10px] text-primary">Due {nextDate}</p>
            </div>
          </div>
        )}
      </div>

      {/* Age & Growth Card */}
      <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Age & Growth</h3>
            <p className="text-xs text-slate-400 mt-0.5">BMI · Blood Group · Checkups</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-600">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        {/* Age row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Cake className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Current Age</p>
            {ageYears !== null ? (
              <p className="text-xl font-bold text-slate-900 leading-tight">
                {ageYears}y {ageMonths !== null && ageMonths > 0 ? `${ageMonths}m` : ""}
              </p>
            ) : (
              <p className="text-xl font-medium text-slate-900">—</p>
            )}
          </div>
          {ageGroup && ageGroup !== "—" && (
            <div className="ml-auto inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-100 px-2 py-1">
              <Activity className="h-3 w-3 text-teal-600" />
              <span className="text-[10px] font-medium text-teal-700">{ageGroup}</span>
            </div>
          )}
        </div>

        {/* BMI + Blood Group */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 p-3">
            <div className="flex items-center gap-1 mb-1">
              <Scale className="h-3.5 w-3.5 text-teal-600" />
              <span className="text-[10px] font-semibold text-teal-800 uppercase tracking-wide">BMI</span>
            </div>
            {bmi !== null ? (
              <>
                <p className="text-lg font-bold text-slate-900 leading-none">{bmi}</p>
                <p className={`text-[10px] mt-0.5 font-medium ${bmiCategory.color}`}>{bmiCategory.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{child?.heightCm}cm · {child?.weightKg}kg</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-400">—</p>
                <p className="text-[10px] text-slate-400 mt-0.5">No height/weight</p>
              </>
            )}
          </div>

          <div className="rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 p-3">
            <div className="flex items-center gap-1 mb-1">
              <Droplets className="h-3.5 w-3.5 text-red-500" />
              <span className="text-[10px] font-semibold text-red-800 uppercase tracking-wide">Blood</span>
            </div>
            {child?.bloodGroup ? (
              <>
                <p className="text-lg font-bold text-red-600 leading-none">{child.bloodGroup}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">On record</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-400">—</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Not recorded</p>
              </>
            )}
          </div>
        </div>

        {/* Health Checkups — linked to milestones */}
        <a href={milestonesUrl} className="block rounded-xl bg-white border border-teal-100 p-3 hover:bg-teal-50/50 transition-colors group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
              <span className="text-xs font-semibold text-teal-900">Health Checkups</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-teal-700">{completedGrowth}/{growthMilestones.length || 0}</span>
              <ExternalLink className="h-3 w-3 text-teal-400 group-hover:text-teal-600" />
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-teal-100 overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-primary transition-all duration-500"
              style={{ width: `${growthMilestones.length > 0 ? Math.round((completedGrowth / growthMilestones.length) * 100) : 0}%` }}
            />
          </div>
          {nextGrowthMilestone ? (
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-teal-700 truncate flex-1 mr-2">Next: {nextGrowthMilestone.title}</p>
              {daysUntilCheckup !== null && (
                <div className="flex items-center gap-1 shrink-0 rounded-full bg-teal-100 px-2 py-0.5">
                  <CalendarClock className="h-3 w-3 text-teal-600" />
                  <span className="text-[10px] font-semibold text-teal-700">
                    {daysUntilCheckup <= 0 ? "Today" : `${daysUntilCheckup}d`}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-teal-700">
              {growthMilestones.length === 0 ? "No checkups tracked yet" : "All checkups completed 🎉"}
            </p>
          )}
        </a>
      </div>

      {/* Health Records Card */}
      <div className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Health Records</h3>
            <p className="text-xs text-slate-400 mt-0.5">Medical documents & reports</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
            <FileText className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-slate-900">{loadingRecords ? "..." : totalRecords}</span>
          <span className="text-xs text-slate-400">documents uploaded</span>
        </div>
        {totalRecords > 0 ? (
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-cyan-500" />
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Recent</span>
            </div>
            {recentRecords.map((record, idx) => (
              <div key={record._id || idx} className="flex items-center gap-2 rounded-lg bg-cyan-50/50 p-2 hover:bg-cyan-50 transition-colors cursor-pointer border border-cyan-100">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-cyan-200 text-cyan-600">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 truncate">{record.documentName}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(record.recordDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-3 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 p-4 text-center border border-cyan-100">
            <FileText className="h-6 w-6 text-cyan-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-slate-700">No records yet</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Upload medical documents to track here</p>
          </div>
        )}
        <a href={recordsUrl} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 border border-emerald-100 transition-colors hover:bg-emerald-100">
          <FileText className="h-3.5 w-3.5" />
          View All Records
        </a>
      </div>
    </section>
  );
}
