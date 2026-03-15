"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Bell, Loader2, Search, Filter } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    loadAllChildren();
  }, []);

  async function loadAllChildren() {
    setLoading(true);
    try {
      const token = localStorage.getItem("wt18_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Use admin endpoint to get all children
      const childrenRes = await fetch(`${API_BASE}/dashboard/admin/all-children`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!childrenRes.ok) throw new Error("Failed to load children");

      const childrenData = await childrenRes.json();
      const allChildren = childrenData.data || [];

      // Load milestones for each child
      const childrenWithMilestones = await Promise.all(
        allChildren.map(async (kid: any) => {
          const milRes = await fetch(
            `${API_BASE}/dashboard/milestones/${kid.registrationId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const milData = await milRes.json();
          return {
            registrationId: kid.registrationId,
            childName: kid.childName,
            dateOfBirth: kid.dateOfBirth,
            milestones: milData.data || [],
          };
        })
      );

      setChildren(childrenWithMilestones);
      if (childrenWithMilestones.length > 0) {
        setSelectedChild(childrenWithMilestones[0].registrationId);
      }
    } catch (error) {
      console.error("Failed to load children:", error);
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
      }

      const res = await fetch(`${API_BASE}/dashboard/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed");

      // Reload data
      await loadAllChildren();
    } catch (error) {
      alert("Could not update status. Please try again.");
    } finally {
      setMarking(null);
    }
  }

  const currentChild = children.find((c) => c.registrationId === selectedChild);
  const milestones = currentChild?.milestones || [];

  // Filter milestones
  const filteredMilestones = milestones.filter((m) => {
    const matchesSearch = m.vaccineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort: MISSED first, then DUE, then UPCOMING, then COMPLETED
  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    const order = { MISSED: 0, DUE: 1, UPCOMING: 2, COMPLETED: 3 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Vaccination Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage and track vaccination records for all registered children
          </p>
        </div>

        {/* Child Selector & Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-medium text-slate-700">Select Child</label>
            <select
              value={selectedChild || ""}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {children.map((child) => (
                <option key={child.registrationId} value={child.registrationId}>
                  {child.childName} ({child.registrationId})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search vaccines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Status</option>
              <option value="MISSED">Missed</option>
              <option value="DUE">Due</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Vaccination List */}
        {!loading && sortedMilestones.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">No vaccination records found</p>
          </div>
        )}

        {!loading && sortedMilestones.length > 0 && (
          <div className="space-y-3">
            {sortedMilestones.map((milestone) => {
              const isMissed = milestone.status === "MISSED";
              const isDue = milestone.status === "DUE";
              const isCompleted = milestone.status === "COMPLETED";
              
              const borderColor = isMissed ? "border-l-red-500" : isDue ? "border-l-amber-500" : "border-l-slate-200";
              const bgColor = isMissed ? "bg-red-50" : isDue ? "bg-amber-50" : "bg-white";
              
              const statusBadge = isMissed ? (
                <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium uppercase text-red-700">
                  Missed
                </span>
              ) : isDue ? (
                <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium uppercase text-amber-700">
                  Due
                </span>
              ) : null;

              const dueDate = new Date(milestone.dueDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={milestone._id}
                  className={`flex items-center justify-between rounded-xl border-l-4 ${borderColor} ${bgColor} border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                      isMissed ? "bg-red-100 text-red-600" :
                      isDue ? "bg-amber-100 text-amber-600" :
                      "bg-slate-100 text-slate-400"
                    }`}>
                      <AlertTriangle className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {milestone.vaccineName || milestone.title}
                        </h3>
                        {statusBadge}
                      </div>
                      <p className="text-xs text-slate-600">{milestone.description}</p>
                      <p className={`mt-1 text-xs font-medium ${
                        isMissed ? "text-red-600" : isDue ? "text-amber-600" : "text-slate-500"
                      }`}>
                        Due: {dueDate}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(milestone._id, milestone.status)}
                      disabled={marking === milestone._id}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        isCompleted
                          ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          : "bg-primary text-white hover:bg-primary/90"
                      } disabled:opacity-60`}
                    >
                      {marking === milestone._id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : isCompleted ? (
                        "Unmark"
                      ) : (
                        "Mark as Done"
                      )}
                    </button>
                    <button
                      className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
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
      </div>
    </div>
  );
}
