"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Download,
  Search,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  MoreHorizontal,
  Eye,
  Edit,
  CheckSquare,
  Square,
  X,
  ChevronDown,
  Filter,
  RefreshCcw,
} from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

interface Child {
  registrationId: string;
  childName: string;
  childGender: string;
  dateOfBirth: string;
  ageGroup: string;
  state: string;
  motherName: string;
  phone: string;
  email: string;
  paymentStatus: string;
  profilePictureUrl?: string;
}

export default function AdminChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedChildren, setSelectedChildren] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  // Filter states
  const [ageGroupFilter, setAgeGroupFilter] = useState("All Ages");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [vaccinationFilter, setVaccinationFilter] = useState("Any Status");
  const [goGreenFilter, setGoGreenFilter] = useState("All Enrolled");

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    setLoading(true);
    try {
      const token = localStorage.getItem("wt18_token");
      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const res = await fetch(`${API_BASE}/dashboard/admin/all-children`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load children");

      const data = await res.json();
      setChildren(data.data || []);
    } catch (error) {
      console.error("Failed to load children:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(registrationId: string, childName: string) {
    if (!confirm(`Are you sure you want to delete ${childName}? This action cannot be undone.`)) {
      return;
    }

    setDeleting(registrationId);
    try {
      const token = localStorage.getItem("wt18_token");
      const res = await fetch(`${API_BASE}/dashboard/admin/delete-child/${registrationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");

      alert(`${childName} has been deleted successfully.`);
      await loadChildren();
    } catch (error) {
      alert("Failed to delete child. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  function exportToCSV() {
    const headers = [
      "Registration ID",
      "Child Name",
      "Gender",
      "Date of Birth",
      "Age Group",
      "State",
      "Mother Name",
      "Phone",
      "Email",
      "Payment Status",
    ];

    const rows = filteredChildren.map((child) => [
      child.registrationId,
      child.childName,
      child.childGender,
      new Date(child.dateOfBirth).toLocaleDateString("en-IN"),
      child.ageGroup,
      child.state,
      child.motherName,
      `'${child.phone}`,
      child.email,
      child.paymentStatus,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `children_list_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const toggleSelectChild = (registrationId: string) => {
    const newSelected = new Set(selectedChildren);
    if (newSelected.has(registrationId)) {
      newSelected.delete(registrationId);
    } else {
      newSelected.add(registrationId);
    }
    setSelectedChildren(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedChildren.size === filteredChildren.length) {
      setSelectedChildren(new Set());
    } else {
      setSelectedChildren(new Set(filteredChildren.map((c) => c.registrationId)));
    }
  };

  const clearSelection = () => {
    setSelectedChildren(new Set());
  };

  const resetFilters = () => {
    setAgeGroupFilter("All Ages");
    setClassFilter("All Classes");
    setVaccinationFilter("Any Status");
    setGoGreenFilter("All Enrolled");
  };

  const filteredChildren = children.filter((child) => {
    const matchesSearch =
      child.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.registrationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.motherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.phone.includes(searchQuery);

    const matchesAgeGroup = ageGroupFilter === "All Ages" || child.ageGroup === ageGroupFilter;
    const matchesVaccination = vaccinationFilter === "Any Status" || 
      (vaccinationFilter === "Fully Vaccinated" && child.paymentStatus === "COMPLETED") ||
      (vaccinationFilter === "Partial Overdue" && child.paymentStatus === "PENDING");
    const matchesGoGreen = goGreenFilter === "All Enrolled" || true; // Placeholder for Go Green logic

    return matchesSearch && matchesAgeGroup && matchesVaccination && matchesGoGreen;
  });

  // Calculate stats
  const totalChildren = children.length;
  const vaccinationRate = totalChildren > 0 
    ? ((children.filter((c) => c.paymentStatus === "COMPLETED").length / totalChildren) * 100).toFixed(1)
    : "0.0";
  const pendingRecords = children.filter((c) => c.paymentStatus === "PENDING").length;

  // Get unique age groups and classes for filters
  const ageGroups = ["All Ages", ...new Set(children.map((c) => c.ageGroup))];
  const classes = ["All Classes", ...new Set(children.map((c) => c.state))];

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getVaccinationStatus = (child: Child) => {
    if (child.paymentStatus === "COMPLETED") {
      return { label: "Fully Vaccinated", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    } else if (child.paymentStatus === "PENDING") {
      return { label: "Partial Overdue", color: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    return { label: "Not Started", color: "bg-slate-50 text-slate-700 border-slate-200" };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, Registration ID, or parent phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Header Actions */}
          <div className="ml-3 flex items-center gap-2">
            <button
              onClick={exportToCSV}
              disabled={filteredChildren.length === 0}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export to CSV</span>
            </button>
            <button className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-600">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="hidden sm:inline">Add New Student</span>
            </button>
            <button className="relative rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-4">
        <div className="mx-auto max-w-7xl">
          {/* Stats Cards */}
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Children</p>
                  <p className="text-xl font-bold text-slate-900">{totalChildren.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Vaccination Rate</p>
                  <p className="text-xl font-bold text-slate-900">{vaccinationRate}%</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <svg className="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Pending Records</p>
                  <p className="text-xl font-bold text-slate-900">{pendingRecords}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Page Title */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Children Management</h1>
              <p className="mt-0.5 text-xs text-slate-600">Manage all registered children in the WombTo18 system</p>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => setViewMode("table")}
                className={`rounded p-1.5 transition-colors ${viewMode === "table" ? "bg-emerald-50 text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded p-1.5 transition-colors ${viewMode === "grid" ? "bg-emerald-50 text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[140px]">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Age Group</label>
                <div className="relative">
                  <select
                    value={ageGroupFilter}
                    onChange={(e) => setAgeGroupFilter(e.target.value)}
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {ageGroups.map((age) => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Class/Section</label>
                <div className="relative">
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Vaccination</label>
                <div className="relative">
                  <select
                    value={vaccinationFilter}
                    onChange={(e) => setVaccinationFilter(e.target.value)}
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option>Any Status</option>
                    <option>Fully Vaccinated</option>
                    <option>Partial Overdue</option>
                    <option>Not Started</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Go Green</label>
                <div className="relative">
                  <select
                    value={goGreenFilter}
                    onChange={(e) => setGoGreenFilter(e.target.value)}
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option>All Enrolled</option>
                    <option>Enrolled</option>
                    <option>Not Enrolled</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <button
                onClick={resetFilters}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Reset
              </button>
              <button className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-100">
                Apply
              </button>
            </div>
          </div>

          {/* Bulk Selection Toolbar */}
          {selectedChildren.size > 0 && (
            <div className="mb-3 flex items-center justify-between rounded-lg bg-emerald-500 px-3 py-2 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4" />
                  <span className="text-xs font-semibold">{selectedChildren.size} students selected</span>
                </div>
                <div className="flex items-center gap-0.5 border-l border-emerald-400 pl-3">
                  <button className="rounded p-1 transition-colors hover:bg-emerald-600" title="Email">
                    <Mail className="h-3.5 w-3.5" />
                  </button>
                  <button className="rounded p-1 transition-colors hover:bg-emerald-600" title="Edit">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button className="rounded p-1 transition-colors hover:bg-emerald-600" title="Export">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <button
                onClick={clearSelection}
                className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium transition-colors hover:bg-emerald-700"
              >
                <X className="h-3.5 w-3.5" />
                Clear Selection
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          )}

          {/* Empty State */}
          {!loading && children.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="text-sm text-slate-500">No children registered yet</p>
            </div>
          )}

          {/* Children Table */}
          {!loading && filteredChildren.length > 0 && viewMode === "table" && (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="w-10 px-3 py-2">
                        <button onClick={toggleSelectAll} className="text-slate-400 hover:text-emerald-600">
                          {selectedChildren.size === filteredChildren.length ? (
                            <CheckSquare className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        Child Details
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        Age / Gender
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        Parent / Contact
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        Vaccination Status
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        Payment
                      </th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredChildren.map((child) => {
                      const vaccinationStatus = getVaccinationStatus(child);
                      const age = calculateAge(child.dateOfBirth);
                      
                      return (
                        <tr key={child.registrationId} className="group hover:bg-slate-50">
                          <td className="px-3 py-2.5">
                            <button
                              onClick={() => toggleSelectChild(child.registrationId)}
                              className={`transition-colors ${selectedChildren.has(child.registrationId) ? "text-emerald-600" : "text-slate-300 hover:text-emerald-600"}`}
                            >
                              {selectedChildren.has(child.registrationId) ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-semibold text-xs">
                                {child.childName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-900">{child.childName}</p>
                                <p className="text-[10px] font-mono text-slate-500">{child.registrationId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div>
                              <p className="text-xs font-medium text-slate-900">{age} yrs</p>
                              <p className="text-[10px] text-slate-500">DOB: {new Date(child.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                              <p className="text-[10px] text-slate-500">{child.childGender}</p>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div>
                              <p className="text-xs font-medium text-slate-900">{child.motherName}</p>
                              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                                <Phone className="h-3 w-3" />
                                {child.phone}
                              </div>
                              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                                <Mail className="h-3 w-3" />
                                {child.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[10px] font-semibold ${vaccinationStatus.color}`}>
                                <span className="h-1 w-1 rounded-full bg-current"></span>
                                {vaccinationStatus.label}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Go Green Enrolled
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                                child.paymentStatus === "COMPLETED"
                                  ? "bg-blue-50 text-blue-700"
                                  : child.paymentStatus === "PENDING"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-50 text-slate-700"
                              }`}
                            >
                              {child.paymentStatus}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <button className="rounded p-1 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600" title="View">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button className="rounded p-1 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600" title="Edit">
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(child.registrationId, child.childName)}
                                disabled={deleting === child.registrationId}
                                className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                                title="Delete"
                              >
                                {deleting === child.registrationId ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-2">
                <p className="text-[10px] text-slate-600">
                  Showing {filteredChildren.length} of {totalChildren} children
                </p>
                <div className="flex items-center gap-0.5">
                  <button className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50" disabled>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500 text-xs font-semibold text-white transition-colors hover:bg-emerald-600">
                    1
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100">
                    2
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100">
                    3
                  </button>
                  <span className="flex items-center px-1 text-[10px] text-slate-400">...</span>
                  <button className="flex h-7 w-7 items-center justify-center rounded text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100">
                    {Math.ceil(filteredChildren.length / 10)}
                  </button>
                  <button className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50" disabled>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && children.length > 0 && filteredChildren.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-500">
                No children found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
