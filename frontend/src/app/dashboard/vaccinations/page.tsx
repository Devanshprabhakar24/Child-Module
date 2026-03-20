"use client";

import { useState, useEffect } from "react";
import VaccinationHeader from "@/components/dashboard/vaccinations/VaccinationHeader";
import VaccinationSidePanel from "@/components/dashboard/vaccinations/VaccinationSidePanel";
import MarkVaccineDoneModal from "@/components/dashboard/vaccinations/MarkVaccineDoneModal";
import ViewRecordModal from "@/components/dashboard/vaccinations/ViewRecordModal";
import { useChildData } from "@/hooks/useChildData";
import { Syringe, AlertTriangle, Loader2, Check, X, Eye } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  const { loading, error, vaccination, profile, token, registrationId, refetch } = useChildData();
  const [filter, setFilter] = useState("All");
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [showMarkDoneModal, setShowMarkDoneModal] = useState(false);
  const [showViewRecordModal, setShowViewRecordModal] = useState(false);
  const [healthRecords, setHealthRecords] = useState<Record<string, any>>({});
  const [undoing, setUndoing] = useState<string | null>(null);

  // Fetch health records for completed vaccines
  useEffect(() => {
    if (!token || !registrationId || !vaccination?.milestones) return;
    
    const fetchHealthRecords = async () => {
      try {
        console.log('🔍 Fetching health records for:', registrationId);
        const res = await fetch(
          `${API_BASE}/health-records/${registrationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          const records = data.data || [];
          console.log('📋 Health records fetched:', records);
          
          // Map records by matching recordDate with milestone completedDate
          const recordMap: Record<string, any> = {};
          
          vaccination.milestones.forEach((milestone: any) => {
            if (milestone.status === 'COMPLETED' && milestone.completedDate) {
              const milestoneDate = new Date(milestone.completedDate).toISOString().split('T')[0];
              
              // Find record with matching date and vaccination category
              const matchingRecord = records.find((record: any) => {
                const recordDate = new Date(record.recordDate).toISOString().split('T')[0];
                const isVaccination = record.category === 'Vaccination Cards';
                const dateMatches = recordDate === milestoneDate;
                
                return isVaccination && dateMatches;
              });
              
              if (matchingRecord) {
                // Ensure fileUrl has full API base URL
                const fullRecord = {
                  ...matchingRecord,
                  fileUrl: matchingRecord.fileUrl?.startsWith('http') 
                    ? matchingRecord.fileUrl 
                    : `${API_BASE}${matchingRecord.fileUrl}`
                };
                recordMap[milestone._id] = fullRecord;
                console.log(`✅ Matched record for milestone ${milestone._id}:`, fullRecord);
              }
            }
          });
          
          console.log('🗺️ Final record map:', recordMap);
          setHealthRecords(recordMap);
        } else {
          console.error('❌ Failed to fetch health records:', res.status);
        }
      } catch (err) {
        console.error("Failed to fetch health records:", err);
      }
    };

    fetchHealthRecords();
  }, [token, registrationId, vaccination]);

  const handleMarkDone = (milestone: any) => {
    setSelectedMilestone(milestone);
    setShowMarkDoneModal(true);
  };

  const handleViewRecord = (milestone: any) => {
    const record = healthRecords[milestone._id];
    console.log('👁️ View record for milestone:', milestone._id);
    console.log('📋 Found record:', record);
    console.log('🗺️ All health records:', healthRecords);
    
    // Show modal with either the health record or just the milestone details
    setSelectedMilestone({ 
      ...milestone, 
      record: record || {
        title: milestone.vaccineName || milestone.title,
        recordDate: milestone.completedDate,
        recordType: "VACCINATION",
        description: milestone.description,
        notes: milestone.notes,
      }
    });
    setShowViewRecordModal(true);
  };

  const handleUndo = async (milestone: any) => {
    if (!token) return;
    
    if (!confirm("Are you sure you want to undo this vaccination? This will reset the status.")) {
      return;
    }
    
    setUndoing(milestone._id);
    try {
      const res = await fetch(
        `${API_BASE}/dashboard/milestones/${milestone._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "DUE",
            completedDate: null,
            notes: null,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to undo vaccine");
      }

      alert("✅ Vaccine status reset!");
      refetch();
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Failed to undo: ${error.message}`);
    } finally {
      setUndoing(null);
    }
  };

  const handleSuccess = () => {
    refetch();
  };

  const milestones = vaccination?.milestones || [];
  const filtered = filter === "All"
    ? milestones
    : milestones.filter((m) => m.status === filter.toUpperCase() || (filter === "Overdue" && m.status === "MISSED"));

  const completed = vaccination?.completed ?? 0;
  const total = vaccination?.total ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Calculate statistics
  const stats = {
    completed: milestones.filter((m) => m.status === "COMPLETED").length,
    due: milestones.filter((m) => m.status === "DUE").length,
    upcoming: milestones.filter((m) => m.status === "UPCOMING").length,
    missed: milestones.filter((m) => m.status === "MISSED").length,
  };

  return (
    <div className="mx-auto max-w-8xl">
      <VaccinationHeader 
        completed={stats.completed}
        due={stats.due}
        upcoming={stats.upcoming}
        missed={stats.missed}
      />

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

                const hasRecord = healthRecords[m._id];

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
                      {m.status === "COMPLETED" ? (
                        <>
                          <button
                            onClick={() => handleViewRecord(m)}
                            className="flex items-center gap-1.5 rounded-lg border border-primary bg-white px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleUndo(m)}
                            disabled={undoing === m._id}
                            className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                          >
                            {undoing === m._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
                            Undo
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleMarkDone(m)}
                          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Mark as Done
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <VaccinationSidePanel />
      </div>

      {/* Modals */}
      {showMarkDoneModal && selectedMilestone && token && registrationId && (
        <MarkVaccineDoneModal
          isOpen={showMarkDoneModal}
          onClose={() => {
            setShowMarkDoneModal(false);
            setSelectedMilestone(null);
          }}
          milestone={selectedMilestone}
          registrationId={registrationId}
          token={token}
          onSuccess={handleSuccess}
        />
      )}

      {showViewRecordModal && selectedMilestone?.record && (
        <ViewRecordModal
          isOpen={showViewRecordModal}
          onClose={() => {
            setShowViewRecordModal(false);
            setSelectedMilestone(null);
          }}
          record={selectedMilestone.record}
        />
      )}
    </div>
  );
}

