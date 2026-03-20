"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Upload, Eye, Download, Calendar, User } from "lucide-react";
import { getRegistrationId } from "@/utils/registrationId";

interface HealthRecord {
  _id: string;
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
  status: string;
  createdAt: string;
}

interface RecordsGridProps {
  refreshTrigger?: number;
  searchTerm?: string;
  selectedCategory?: string;
}

export default function RecordsGrid({ refreshTrigger, searchTerm = "", selectedCategory = "All Records" }: RecordsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<HealthRecord | null>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors by ensuring client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchHealthRecords();
    }
  }, [refreshTrigger, mounted]);

  // Also fetch when searchParams changes (registration ID might change)
  useEffect(() => {
    if (mounted && searchParams) {
      fetchHealthRecords();
    }
  }, [searchParams, mounted]);

  // Client-side filtering
  const filtered = (records || []).filter((r) => {
    const matchesCategory = selectedCategory === "All Records" || r.category === selectedCategory;
    const matchesSearch = searchTerm.trim() === "" || r.documentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const fetchHealthRecords = async () => {
    try {
      // Use utility function to get registration ID
      const registrationId = getRegistrationId(searchParams);

      console.log('[RecordsGrid] searchParams:', searchParams?.toString());
      console.log('[RecordsGrid] registrationId from utility:', registrationId);
      console.log('[RecordsGrid] localStorage registrationId:', typeof window !== 'undefined' ? localStorage.getItem('currentRegistrationId') : 'N/A');

      // If still no registration ID, show error and return
      if (!registrationId) {
        console.warn('[RecordsGrid] No registration ID found. Waiting for navigation...');
        setRecords([]);
        setLoading(false);
        return;
      }

      console.log('[RecordsGrid] Fetching health records for registrationId:', registrationId);

      const response = await fetch(`http://localhost:8000/health-records/${registrationId}`);

      console.log('[RecordsGrid] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[RecordsGrid] Failed to fetch health records:', errorData);
        setRecords([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[RecordsGrid] Fetched data:', data);
      
      // Backend returns: { success: true, data: records, stats }
      const fetchedRecords = data.data || [];
      console.log('[RecordsGrid] Setting records:', fetchedRecords.length, 'records');
      setRecords(fetchedRecords);
    } catch (error) {
      console.error('[RecordsGrid] Error fetching health records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (record: HealthRecord) => {
    setCurrentDocument(record);
    setShowDocumentViewer(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDocumentIcon = (category: string): string => {
    switch (category) {
      case 'Vaccination Cards':
        return '💉';
      case 'Annual Check-ups':
        return '📋';
      case 'Dental Records':
        return '🦷';
      case 'Eye Check-ups':
        return '👁️';
      case 'BMI Reports':
        return '📊';
      case 'Lab Reports':
        return '🧪';
      case 'Prescriptions':
        return '💊';
      case 'Medical Certificates':
        return '📜';
      default:
        return '📄';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Vaccination Cards':
        return 'bg-red-100 text-red-800';
      case 'Annual Check-ups':
        return 'bg-blue-100 text-blue-800';
      case 'Dental Records':
        return 'bg-purple-100 text-purple-800';
      case 'Eye Check-ups':
        return 'bg-yellow-100 text-yellow-800';
      case 'BMI Reports':
        return 'bg-green-100 text-green-800';
      case 'Lab Reports':
        return 'bg-teal-100 text-teal-800';
      case 'Prescriptions':
        return 'bg-pink-100 text-pink-800';
      case 'Medical Certificates':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!mounted || loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-slate-600">Loading health records...</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mb-2 font-medium text-slate-900">
          {(records || []).length === 0 ? "No Health Records Yet" : "No records match your search"}
        </h3>
        <p className="text-sm text-slate-500">
          {(records || []).length === 0
            ? "Upload prescriptions, lab reports, dental exams, and other health documents here."
            : "Try a different search term or category."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((record) => (
          <div key={record._id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            {/* Document Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-xl">
                  {getDocumentIcon(record.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">{record.documentName}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(record.category)}`}>
                    {record.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(record.recordDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FileText className="h-4 w-4" />
                <span>{record.fileType.toUpperCase()} • {formatFileSize(record.fileSize)}</span>
              </div>
              {record.uploadedBy === 'ADMIN' && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="h-4 w-4" />
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Admin Upload
                  </span>
                </div>
              )}
            </div>

            {/* Additional Info */}
            {(record.notes || record.doctorName) && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                {record.doctorName && (
                  <p className="text-sm text-slate-600 mb-1">
                    <span className="font-medium">Doctor:</span> {record.doctorName}
                  </p>
                )}
                {record.notes && (
                  <p className="text-sm text-slate-600 line-clamp-2">
                    <span className="font-medium">Notes:</span> {record.notes}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleViewDocument(record)}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                <Eye className="h-4 w-4" />
                View
              </button>
              <a
                href={`http://localhost:8000${record.fileUrl}`}
                download={record.fileName}
                className="flex items-center justify-center bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Document Viewer Modal */}
      {showDocumentViewer && currentDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{currentDocument.documentName}</h3>
                <p className="text-sm text-gray-600">
                  {currentDocument.category} • {formatDate(currentDocument.recordDate)} • {formatFileSize(currentDocument.fileSize)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={currentDocument.fileUrl}
                  download={currentDocument.fileName}
                  className="bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <button
                  onClick={() => setShowDocumentViewer(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
              {currentDocument.fileType === 'pdf' ? (
                <div className="w-full h-full">
                  {/* PDF Viewer with local file support */}
                  <div className="mb-4">
                    <iframe
                      src={`http://localhost:8000${currentDocument.fileUrl}`}
                      className="w-full h-[600px] border-0 rounded-lg"
                      title={currentDocument.documentName}
                      onError={() => console.log('PDF iframe failed to load')}
                    />
                  </div>
                  
                  {/* PDF Action Buttons */}
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>PDF Options:</strong>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`http://localhost:8000${currentDocument.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 text-sm flex items-center gap-2 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open in New Tab
                      </a>
                      <a
                        href={`http://localhost:8000${currentDocument.fileUrl}`}
                        download={currentDocument.fileName}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm flex items-center gap-2 font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <img
                    src={`http://localhost:8000${currentDocument.fileUrl}`}
                    alt={currentDocument.documentName}
                    className="max-w-full max-h-[600px] mx-auto rounded-lg shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'text-center py-8';
                      errorDiv.innerHTML = `
                        <div class="text-gray-500 mb-4">
                          <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p>Unable to display image</p>
                          <p class="text-sm mt-2">Please download the file to view it</p>
                        </div>
                      `;
                      target.parentNode?.appendChild(errorDiv);
                    }}
                  />
                </div>
              )}
              
              {/* Document Details */}
              {(currentDocument.notes || currentDocument.doctorName) && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                  {currentDocument.doctorName && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Doctor:</strong> {currentDocument.doctorName}
                    </p>
                  )}
                  {currentDocument.notes && (
                    <p className="text-sm text-gray-600">
                      <strong>Notes:</strong> {currentDocument.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
