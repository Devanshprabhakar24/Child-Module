"use client";

import { useState, useEffect } from "react";
import { Trash2, Download, Search, Loader2, AlertCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
      `'${child.phone}`, // Add single quote prefix to prevent scientific notation
      child.email,
      child.paymentStatus,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Add UTF-8 BOM for proper Excel encoding
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

  const filteredChildren = children.filter(
    (child) =>
      child.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.registrationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.motherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Children Management</h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage all registered children in the system
            </p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={filteredChildren.length === 0}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            Export to CSV
          </button>
        </div>

        {/* Search & Stats */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="text-sm text-slate-600">
            Showing {filteredChildren.length} of {children.length} children
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        {!loading && filteredChildren.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Registration ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Child Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Gender
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      DOB
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Mother
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      State
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredChildren.map((child) => (
                    <tr key={child.registrationId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-mono text-slate-900">
                        {child.registrationId}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {child.childName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {child.childGender}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(child.dateOfBirth).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {child.motherName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {child.phone}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {child.state}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            child.paymentStatus === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : child.paymentStatus === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {child.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(child.registrationId, child.childName)}
                          disabled={deleting === child.registrationId}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
                        >
                          {deleting === child.registrationId ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  );
}

