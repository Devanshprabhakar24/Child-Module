"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Bell, Loader2, Search, Calendar, ChevronDown } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

interface VaccineMilestone {
  _id: string;
  registrationId: string;
  title: string;
  description?: string;
  vaccineName?: string;
  category: string;
  status: "UPCOMING" | "DUE" | "COMPLETED" | "MISSED";
  dueDate: string;
  completedDate?: string;
  notes?: string;
}

interface ChildData {
  registrationId: string;
  childName: string;
  dateOfBirth: string;
  milestones: VaccineMilestone[];
}

export default function AdminVaccinationsPage() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [vaccineTypeFilter, setVaccineTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [marking, setMarking] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadAllVaccinations();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, vaccineTypeFilter, statusFilter]);

  async function loadAllVaccinations() {
    setLoading(true);
    try {
      const token = localStorage.getItem("wt18_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_BASE}/dashboard/admin/vaccinations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to load vaccinations");

      const data = await response.json();
      const vaccinations = data.data || [];

      // Group vaccinations by child
      const childrenMap = new Map<string, ChildData>();
      
      vaccinations.forEach((vaccination: any) => {
        const key = vaccination.registrationId;
        if (!childrenMap.has(key)) {
          childrenMap.set(key, {
            registrationId: vaccination.registrationId,
            childName: vaccination.childName,
            dateOfBirth: '', // We don't have this from the new API, but it's not used in filtering
            milestones: []
          });
        }
        
        childrenMap.get(key)!.milestones.push({
          _id: vaccination.milestoneId,
          registrationId: vaccination.registrationId,
          title: vaccination.title,
          description: '',
          vaccineName: vaccination.vaccineName,
          category: 'VACCINATION',
          status: vaccination.status as any,
          dueDate: vaccination.dueDate,
          completedDate: vaccination.completedDate,
          notes: vaccination.notes,
        });
      });

      setChildren(Array.from(childrenMap.values()));
    } catch (error) {
      console.error("Failed to load vaccinations:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(milestoneId: string, currentStatus: string) {
    const token = localStorage.getItem("wt18_token");
    if (!token) return;

    setMarking(milestoneId);
    try {
      const newStatus = currentStatus === "COMPLETED" ? "UPCOMING" : "COMPLETED";
      const body: any = { status: newStatus };

      if (newStatus === "COMPLETED") {
        body.completedDate = new Date().toISOString();
        body.administeredBy = "Admin"; // Default admin user
        body.location = "Clinic"; // Default location
      }

      const res = await fetch(`${API_BASE}/dashboard/admin/vaccination/${milestoneId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed");

      await loadAllVaccinations();
    } catch (error) {
      alert("Could not update status. Please try again.");
    } finally {
      setMarking(null);
    }
  }

  // Flatten all milestones from all children with child info
  const allMilestones = children.flatMap((child) =>
    child.milestones.map((m) => ({
      ...m,
      childName: child.childName,
      registrationId: child.registrationId,
    }))
  );

  // Filter milestones - only show when search query exists
  const filteredMilestones = allMilestones.filter((m) => {
    // Don't show any records if no search query
    if (!searchQuery.trim()) return false;

    // Match child name or registration ID (primary search)
    const matchesChild = 
      m.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.registrationId.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Also match vaccine name
    const matchesVaccine = 
      m.vaccineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    const matchesVaccineType = vaccineTypeFilter === "ALL" ||
      !m.vaccineName ||
      m.vaccineName.toLowerCase().includes(vaccineTypeFilter.toLowerCase());
    
    return (matchesChild || matchesVaccine) && matchesStatus && matchesVaccineType;
  });

  // Sort: MISSED first, then DUE, then UPCOMING, then COMPLETED
  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    const order = { MISSED: 0, DUE: 1, UPCOMING: 2, COMPLETED: 3 };
    return order[a.status] - order[b.status];
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedMilestones.length / itemsPerPage));
  const paginatedMilestones = sortedMilestones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique vaccine types for filter
  const vaccineTypes = ["ALL", ...new Set(allMilestones.map((m) => m.vaccineName).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Vaccination Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage and track vaccination records for all registered children
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search Child */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Search Child
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Name or ID (e.g. CHD-KL...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Vaccine Type */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Vaccine Type
              </label>
              <div className="relative">
                <select
                  value={vaccineTypeFilter}
                  onChange={(e) => setVaccineTypeFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-10 text-sm text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="ALL">All Vaccines</option>
                  {vaccineTypes.filter((t) => t !== "ALL").map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-10 text-sm text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="ALL">All Status</option>
                  <option value="MISSED">Missed</option>
                  <option value="DUE">Due</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Date Range
              </label>
              <div className="relative">
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-3 text-sm text-slate-700">
                  <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                  <span className="flex-1">01 Mar 2026 - 30 Mar 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Records Header */}
        {searchQuery.trim() && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Active Records ({sortedMilestones.length})
            </h2>
            <p className="text-xs text-slate-400">
              Showing {paginatedMilestones.length} of {sortedMilestones.length} records
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        )}

        {/* Empty State - No Search */}
        {!loading && !searchQuery.trim() && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Search className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <p className="text-base font-medium text-slate-700">Search for a child to view vaccinations</p>
            <p className="mt-2 text-sm text-slate-500">Enter a child's name or registration ID to see their vaccination records</p>
          </div>
        )}

        {/* No Results Found */}
        {!loading && searchQuery.trim() && sortedMilestones.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">No vaccination records found</p>
            <p className="mt-1 text-xs text-slate-500">Try adjusting your search or filters for "{searchQuery}"</p>
          </div>
        )}

        {/* Vaccination List */}
        {!loading && paginatedMilestones.length > 0 && (
          <div className="space-y-3">
            {paginatedMilestones.map((milestone) => {
              const isMissed = milestone.status === "MISSED";
              const isDue = milestone.status === "DUE";
              const isUpcoming = milestone.status === "UPCOMING";
              const isCompleted = milestone.status === "COMPLETED";

              const leftBorderColor = isMissed
                ? "border-l-red-500"
                : isDue
                ? "border-l-amber-500"
                : "border-l-slate-300";

              const iconBg = isMissed
                ? "bg-red-50 text-red-500"
                : isDue
                ? "bg-amber-50 text-amber-500"
                : "bg-slate-50 text-slate-400";

              const statusBadge = isMissed ? (
                <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-700">
                  Overdue
                </span>
              ) : isDue ? (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                  Due
                </span>
              ) : isUpcoming ? (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Upcoming
                </span>
              ) : null;

              const dueDate = new Date(milestone.dueDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              const buttonStyle = isMissed
                ? "bg-red-500 text-white hover:bg-red-600"
                : isDue
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-slate-100 text-slate-400 cursor-not-allowed";

              const bellButtonStyle = isMissed
                ? "text-red-400 hover:bg-red-50 hover:text-red-600"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600";

              return (
                <div
                  key={milestone._id}
                  className={`flex items-center justify-between rounded-xl border-l-4 ${leftBorderColor} bg-white border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                      {isMissed ? (
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v4" />
                          <path d="M12 16h.01" />
                        </svg>
                      ) : isDue ? (
                        <AlertTriangle className="h-6 w-6" />
                      ) : (
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {milestone.vaccineName || milestone.title}
                        </h3>
                        {statusBadge}
                      </div>
                      <p className="text-xs text-slate-600">
                        {milestone.description} — {milestone.category}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-500">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          {milestone.childName} ({milestone.registrationId})
                        </span>
                        <span className={`flex items-center gap-1 font-medium ${
                          isMissed ? "text-red-600" : isDue ? "text-amber-600" : "text-slate-500"
                        }`}>
                          <Calendar className="h-3 w-3" />
                          {dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <button
                        onClick={() => handleToggleStatus(milestone._id, milestone.status)}
                        disabled={marking === milestone._id}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                      >
                        {marking === milestone._id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Mark as Undone
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(milestone._id, milestone.status)}
                        disabled={marking === milestone._id || isUpcoming}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${buttonStyle} disabled:opacity-60`}
                      >
                        {marking === milestone._id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Mark as Done
                          </>
                        )}
                      </button>
                    )}
                    <button
                      className={`rounded-lg p-2 transition-colors ${bellButtonStyle}`}
                      title="Send Reminder"
                    >
                      <Bell className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && sortedMilestones.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors ${
                    pageNum === currentPage
                      ? "bg-emerald-500 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
