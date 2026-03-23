"use client";

import { useState, useEffect } from "react";
import { useChildData } from "@/hooks/useChildData";
import { TrendingUp, Activity, Ruler, Weight, Calendar, Plus, Trash2, Edit, Loader2, AlertCircle } from "lucide-react";

// Prevent prerendering
export const dynamic = 'force-dynamic';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

interface GrowthRecord {
  _id: string;
  registrationId: string;
  height: number;
  weight: number;
  bmi: number;
  bmiCategory: string;
  measurementDate: string;
  notes?: string;
  createdAt: string;
}

interface GrowthStats {
  totalRecords: number;
  averageBMI: number;
  averageHeight: number;
  averageWeight: number;
  currentBMICategory: string;
}

export default function GrowthChartPage() {
  const { registrationId, loading: childLoading, token } = useChildData();
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    measurementDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [stats, setStats] = useState<GrowthStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Fetch growth records
  const fetchGrowthRecords = async () => {
    if (!registrationId || !token) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/growth-chart/${registrationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setRecords(result.data.records);
        setStats(result.data.stats);
      } else {
        setError(result.message || "Failed to fetch growth records");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when registrationId or token changes
  useEffect(() => {
    if (registrationId && token) {
      fetchGrowthRecords();
    }
  }, [registrationId, token]);

  // Calculate BMI
  const calculateBMI = (heightCm: number, weightKg: number) => {
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(2);
  };

  // Get BMI Category
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 24.9) return "Normal";
    if (bmi < 29.9) return "Overweight";
    return "Obese";
  };

  // Get BMI color
  const getBMIColor = (category: string) => {
    switch (category) {
      case "Underweight": return "text-blue-600 bg-blue-50";
      case "Normal": return "text-green-600 bg-green-50";
      case "Overweight": return "text-orange-600 bg-orange-50";
      case "Obese": return "text-red-600 bg-red-50";
      default: return "text-slate-600 bg-slate-50";
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationId || !token) {
      setError("No child selected or not authenticated");
      return;
    }

    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);

    if (isNaN(height) || height <= 0 || height > 300) {
      setError("Please enter a valid height (0-300 cm)");
      return;
    }

    if (isNaN(weight) || weight <= 0 || weight > 500) {
      setError("Please enter a valid weight (0-500 kg)");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/growth-chart/${registrationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          height,
          weight,
          measurementDate: new Date(formData.measurementDate),
          notes: formData.notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Growth record added successfully!");
        setFormData({
          height: "",
          weight: "",
          measurementDate: new Date().toISOString().split("T")[0],
          notes: "",
        });
        setShowForm(false);
        fetchGrowthRecords();
        
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to add growth record");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this growth record?")) return;

    try {
      const response = await fetch(`${API_BASE}/growth-chart/record/${recordId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Growth record deleted successfully");
        fetchGrowthRecords();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete growth record");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    if (records.length < 2) return null;
    
    const latest = records[0];
    const oldest = records[records.length - 1];
    
    return {
      heightChange: (latest.height - oldest.height).toFixed(1),
      weightChange: (latest.weight - oldest.weight).toFixed(1),
      bmiChange: (latest.bmi - oldest.bmi).toFixed(2),
    };
  };

  const progress = calculateProgress();

  if (childLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading growth records...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-8xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Growth Chart</h1>
          <p className="mt-1 text-sm text-slate-500">Track height, weight, and BMI over time</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Record
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add Record Form */}
      {showForm && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-slate-900">Add Growth Record</h3>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                <Ruler className="mr-1 inline h-4 w-4" />
                Height (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="300"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g., 120.5"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                <Weight className="mr-1 inline h-4 w-4" />
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="500"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g., 35.5"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                <Calendar className="mr-1 inline h-4 w-4" />
                Measurement Date
              </label>
              <input
                type="date"
                value={formData.measurementDate}
                onChange={(e) => setFormData({ ...formData, measurementDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Notes (Optional)</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Any additional notes"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Adding..." : "Add Record"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      {stats && stats.totalRecords > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Ruler className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Avg Height</p>
                <p className="text-lg font-semibold text-slate-900">{stats.averageHeight} cm</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <Weight className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Avg Weight</p>
                <p className="text-lg font-semibold text-slate-900">{stats.averageWeight} kg</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Avg BMI</p>
                <p className="text-lg font-semibold text-slate-900">{stats.averageBMI}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Current BMI</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-slate-900">{records[0]?.bmi}</p>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase ${getBMIColor(records[0]?.bmiCategory)}`}>
                    {records[0]?.bmiCategory}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {progress && (
        <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-medium text-slate-900">Growth Progress</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Ruler className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-slate-600">Height:</span>
              <span className={`text-sm font-medium ${parseFloat(progress.heightChange) > 0 ? "text-green-600" : "text-red-600"}`}>
                {parseFloat(progress.heightChange) > 0 ? "+" : ""}{progress.heightChange} cm
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Weight className="h-4 w-4 text-green-600" />
              <span className="text-sm text-slate-600">Weight:</span>
              <span className={`text-sm font-medium ${parseFloat(progress.weightChange) > 0 ? "text-green-600" : "text-red-600"}`}>
                {parseFloat(progress.weightChange) > 0 ? "+" : ""}{progress.weightChange} kg
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-slate-600">BMI:</span>
              <span className={`text-sm font-medium ${parseFloat(progress.bmiChange) > 0 ? "text-orange-600" : "text-green-600"}`}>
                {parseFloat(progress.bmiChange) > 0 ? "+" : ""}{progress.bmiChange}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Growth Chart Visualization */}
      {records.length > 0 && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-slate-900">Growth Trend</h3>
          <div className="h-64 w-full">
            <svg viewBox="0 0 800 300" className="h-full w-full">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="50"
                  y1={50 + i * 50}
                  x2="780"
                  y2={50 + i * 50}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              ))}

              {/* Height line (blue) */}
              {records.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  points={records.map((r, i) => {
                    const x = 50 + (i / (records.length - 1)) * 730;
                    const normalizedHeight = (r.height / 200) * 200;
                    const y = 250 - normalizedHeight;
                    return `${x},${y}`;
                  }).join(" ")}
                />
              )}

              {/* Weight line (green) */}
              {records.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  points={records.map((r, i) => {
                    const x = 50 + (i / (records.length - 1)) * 730;
                    const normalizedWeight = (r.weight / 100) * 200;
                    const y = 250 - normalizedWeight;
                    return `${x},${y}`;
                  }).join(" ")}
                />
              )}

              {/* Data points */}
              {records.map((r, i) => {
                const x = 50 + (i / (records.length - 1)) * 730;
                const normalizedHeight = (r.height / 200) * 200;
                const heightY = 250 - normalizedHeight;
                const normalizedWeight = (r.weight / 100) * 200;
                const weightY = 250 - normalizedWeight;

                return (
                  <g key={r._id}>
                    {/* Height point */}
                    <circle cx={x} cy={heightY} r="5" fill="#3b82f6" />
                    <text x={x} y={heightY - 10} textAnchor="middle" fontSize="10" fill="#64748b">
                      {r.height}cm
                    </text>

                    {/* Weight point */}
                    <circle cx={x} cy={weightY} r="5" fill="#22c55e" />
                    <text x={x} y={weightY + 20} textAnchor="middle" fontSize="10" fill="#64748b">
                      {r.weight}kg
                    </text>

                    {/* Date label */}
                    <text x={x} y="290" textAnchor="middle" fontSize="9" fill="#94a3b8">
                      {new Date(r.measurementDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis labels */}
              <text x="45" y="255" textAnchor="end" fontSize="10" fill="#94a3b8">0</text>
              <text x="45" y="205" textAnchor="end" fontSize="10" fill="#94a3b8">50</text>
              <text x="45" y="155" textAnchor="end" fontSize="10" fill="#94a3b8">100</text>
              <text x="45" y="105" textAnchor="end" fontSize="10" fill="#94a3b8">150</text>
              <text x="45" y="55" textAnchor="end" fontSize="10" fill="#94a3b8">200</text>

              {/* Legend */}
              <g transform="translate(650, 20)">
                <circle cx="0" cy="0" r="5" fill="#3b82f6" />
                <text x="10" y="4" fontSize="11" fill="#64748b">Height (cm)</text>
                <circle cx="80" cy="0" r="5" fill="#22c55e" />
                <text x="90" y="4" fontSize="11" fill="#64748b">Weight (kg)</text>
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900">Growth History</h3>
          <p className="mt-1 text-sm text-slate-500">All recorded measurements</p>
        </div>

        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Activity className="mb-4 h-12 w-12 text-slate-300" />
            <p className="text-sm font-medium text-slate-900">No growth records yet</p>
            <p className="mt-1 text-sm text-slate-500">Add your first measurement to start tracking</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add First Record
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Height</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">BMI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Uploaded</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {records.map((record) => (
                  <tr key={record._id} className="transition-colors hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      {new Date(record.measurementDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-blue-600" />
                        {record.height} cm
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <Weight className="h-4 w-4 text-green-600" />
                        {record.weight} kg
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      {record.bmi}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getBMIColor(record.bmiCategory)}`}>
                        {record.bmiCategory}
                      </span>
                    </td>
                    <td className="max-w-xs px-6 py-4 text-sm text-slate-600 truncate">
                      {record.notes || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {new Date(record.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="text-red-600 transition-colors hover:text-red-800"
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
