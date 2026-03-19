"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Upload,
  Eye,
  Download,
  Trash2,
  FileText,
  Calendar,
  User,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  List,
  Image,
  File,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Child {
  registrationId: string;
  childName: string;
  dateOfBirth: string;
  state: string;
  motherName: string;
  phone: string;
}

interface Report {
  _id: string;
  registrationId: string;
  documentName: string;
  category: string;
  recordDate: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  notes?: string;
  doctorName?: string;
  uploadedBy: 'USER' | 'ADMIN';
  createdAt: string;
}

const categories = [
  "Vaccination Cards",
  "Annual Check-ups",
  "Dental Records",
  "Eye Check-ups",
  "BMI Reports",
  "Lab Tests",
  "Prescriptions",
  "Medical Certificates",
  "Other",
];

export default function AdminReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    reportName: "",
    category: "Vaccination",
    reportDate: "",
    notes: "",
    doctorName: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadAllChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadReports(selectedChild.registrationId);
    }
  }, [selectedChild]);

  async function loadAllChildren() {
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
    }
  }

  async function loadReports(registrationId: string) {
    setLoading(true);
    try {
      const token = localStorage.getItem("wt18_token");
      const res = await fetch(`${API_BASE}/health-records/${registrationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load reports");

      const data = await res.json();
      setReports(data.data.records || []);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(!!query.trim());
    
    if (!query.trim()) {
      setSelectedChild(null);
      setReports([]);
    }
  }

  function selectChild(child: Child) {
    setSelectedChild(child);
    setSearchQuery(`${child.childName} (${child.registrationId})`);
    setShowSearchResults(false);
  }

  function clearSelection() {
    setSelectedChild(null);
    setSearchQuery("");
    setReports([]);
    setUploadForm({
      reportName: "",
      category: "Vaccination",
      reportDate: "",
      notes: "",
      doctorName: "",
    });
    setSelectedFile(null);
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  function handleFileSelect(file: File) {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a PDF, JPG, or PNG file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }
    setSelectedFile(file);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChild || !selectedFile) return;

    setUploading(true);
    try {
      const token = localStorage.getItem("wt18_token");
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("documentName", uploadForm.reportName);
      formData.append("category", uploadForm.category);
      formData.append("recordDate", uploadForm.reportDate);
      formData.append("notes", uploadForm.notes);
      if (uploadForm.doctorName) formData.append("doctorName", uploadForm.doctorName);

      const res = await fetch(`${API_BASE}/health-records/admin/upload/${selectedChild.registrationId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload report");
      }

      alert("Report uploaded successfully");
      setUploadForm({
        reportName: "",
        category: "Vaccination",
        reportDate: "",
        notes: "",
        doctorName: "",
      });
      setSelectedFile(null);
      setShowUploadModal(false);
      loadReports(selectedChild.registrationId);
    } catch (error) {
      alert("Failed to upload report. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(reportId: string) {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const token = localStorage.getItem("wt18_token");
      const res = await fetch(`${API_BASE}/health-records/${reportId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");

      alert("Report deleted successfully");
      if (selectedChild) {
        loadReports(selectedChild.registrationId);
      }
    } catch (error) {
      alert("Failed to delete report");
    }
  }

  function calculateAge(dob: string) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  function getFileIcon(fileType: string) {
    if (fileType.includes("pdf")) return <File className="h-4 w-4 text-red-500" />;
    if (fileType.includes("image")) return <Image className="h-4 w-4 text-blue-500" />;
    return <FileText className="h-4 w-4 text-slate-500" />;
  }

  function getCategoryColor(category: string) {
    const colors: Record<string, string> = {
      "Vaccination Cards": "bg-emerald-50 text-emerald-700",
      "Annual Check-ups": "bg-blue-50 text-blue-700",
      "Dental Records": "bg-pink-50 text-pink-700",
      "Eye Check-ups": "bg-violet-50 text-violet-700",
      "BMI Reports": "bg-amber-50 text-amber-700",
      "Lab Tests": "bg-cyan-50 text-cyan-700",
      Prescriptions: "bg-rose-50 text-rose-700",
      "Medical Certificates": "bg-indigo-50 text-indigo-700",
      Other: "bg-gray-50 text-gray-700",
    };
    return colors[category] || colors.Other;
  }

  const filteredChildren = searchQuery.trim()
    ? children.filter(
        (child) =>
          child.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          child.registrationId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const totalPages = Math.max(1, Math.ceil(reports.length / itemsPerPage));
  const paginatedReports = reports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Child Name or ID (e.g., CHD-KA-2026...)"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {/* Search Results Dropdown */}
            {showSearchResults && filteredChildren.length > 0 && (
              <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                {filteredChildren.map((child) => (
                  <button
                    key={child.registrationId}
                    onClick={() => selectChild(child)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-semibold">
                      {child.childName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{child.childName}</p>
                      <p className="text-xs text-slate-500">{child.registrationId}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
              </svg>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <button className="text-sm font-medium text-slate-700 hover:text-slate-900">
              Reports Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6">
        {/* Active Profile Context */}
        {selectedChild ? (
          <div className="mb-8">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-2xl font-bold">
                    {selectedChild.childName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-900">{selectedChild.childName}</h2>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        Active Profile
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        <User className="h-3 w-3" />
                        Age: {calculateAge(selectedChild.dateOfBirth)} years
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        <FileText className="h-3 w-3" />
                        ID: {selectedChild.registrationId}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        <MapPin className="h-3 w-3" />
                        {selectedChild.state}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        <User className="h-3 w-3" />
                        Parent: {selectedChild.motherName}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={clearSelection}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Change Child
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Search className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">Search for a Child</h3>
            <p className="mt-2 text-sm text-slate-500">
              Enter a child's name or registration ID to view and upload their medical reports
            </p>
          </div>
        )}

        {selectedChild && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Existing Medical Reports</h2>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600"
              >
                <Upload className="h-4 w-4" />
                Upload New Report
              </button>
            </div>

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  </div>
                ) : reports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <AlertCircle className="h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-sm font-medium text-slate-700">No reports found</p>
                    <p className="mt-1 text-xs text-slate-500">Upload the first medical report for this child</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-slate-200 bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                              Report Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                              Category
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                              File
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {paginatedReports.map((report) => (
                            <tr key={report._id} className="group hover:bg-slate-50">
                              <td className="px-4 py-4">
                                <div>
                                  <p className="font-medium text-slate-900">{report.documentName}</p>
                                  {report.doctorName && (
                                    <p className="text-xs text-slate-500">Dr. {report.doctorName}</p>
                                  )}
                                  {report.notes && (
                                    <p className="text-xs text-slate-500">{report.notes}</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getCategoryColor(report.category)}`}>
                                  {report.category}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Calendar className="h-4 w-4 text-slate-400" />
                                  {new Date(report.recordDate).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  {getFileIcon(report.fileType)}
                                  <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-600 uppercase">
                                      {report.fileType.split("/")[1] || "PDF"}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {(report.fileSize / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <a
                                    href={`${API_BASE}${report.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </a>
                                  <a
                                    href={`${API_BASE}${report.fileUrl}`}
                                    download={report.fileName}
                                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                  <button
                                    onClick={() => handleDelete(report._id)}
                                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-600">
                          Showing {paginatedReports.length} of {reports.length} reports
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                          >
                            Prev
                          </button>
                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          
        )}

        {/* Upload Modal */}
        {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">Upload New Report</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-4">
              <form onSubmit={handleUpload} className="space-y-4">
                {/* File Upload */}
                <div
                  className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                    dragActive
                      ? "border-emerald-500 bg-emerald-50"
                      : selectedFile
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  {selectedFile ? (
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 text-emerald-500" />
                      <p className="mt-3 text-sm font-medium text-slate-900">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                        className="mt-3 text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <p className="mt-3 text-sm font-medium text-slate-700">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-slate-500">PDF, JPG, or PNG (Max 5MB)</p>
                    </div>
                  )}
                </div>

                {/* Report Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Report Name
                  </label>
                  <input
                    type="text"
                    value={uploadForm.reportName}
                    onChange={(e) => setUploadForm({ ...uploadForm, reportName: e.target.value })}
                    placeholder="e.g. Dental Checkup 2024"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Category */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date of Report */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date of Report
                    </label>
                    <input
                      type="date"
                      value={uploadForm.reportDate}
                      onChange={(e) => setUploadForm({ ...uploadForm, reportDate: e.target.value })}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Doctor Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Doctor Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadForm.doctorName || ""}
                    onChange={(e) => setUploadForm({ ...uploadForm, doctorName: e.target.value })}
                    placeholder="Dr. John Smith"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Optional Notes */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Optional Notes
                  </label>
                  <textarea
                    value={uploadForm.notes}
                    onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                    placeholder="Additional observations..."
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !uploadForm.reportName || !uploadForm.reportDate}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Finish Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
