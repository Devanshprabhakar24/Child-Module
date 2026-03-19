'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './health-records.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

interface HealthRecordStats {
  totalRecords: number;
  recordsByCategory: Record<string, number>;
  recentRecords: number;
}

const CATEGORIES = [
  'Vaccination Cards',
  'Annual Check-ups',
  'Dental Records',
  'Eye Check-ups',
  'BMI Reports',
  'Lab Tests',
  'Prescriptions',
  'Medical Certificates',
  'Other',
];

export default function HealthRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [stats, setStats] = useState<HealthRecordStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Records');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<HealthRecord | null>(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    documentName: '',
    category: '',
    recordDate: '',
    notes: '',
    doctorName: '',
    file: null as File | null,
  });

  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Get registration ID from URL params or localStorage
    const params = new URLSearchParams(window.location.search);
    let regId = params.get('id') || localStorage.getItem('currentRegistrationId');

    if (!regId) {
      // Try to get from user data
      const user = JSON.parse(localStorage.getItem('wt18_user') || '{}');
      regId = user.registrationId || user.registrationIds?.[0];
    }

    if (!regId) {
      alert('Child registration ID not found. Please register a child first or access from dashboard.');
      router.push('/dashboard');
      return;
    }

    setRegistrationId(regId);
  }, []);

  useEffect(() => {
    if (!registrationId) return;

    const token = localStorage.getItem('wt18_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchHealthRecords();
  }, [registrationId, selectedCategory, searchTerm]);

  const fetchHealthRecords = async () => {
    if (!registrationId) return;

    try {
      const token = localStorage.getItem('wt18_token');

      if (!token) {
        alert('Please login first');
        router.push('/login');
        return;
      }

      const params = new URLSearchParams();
      if (selectedCategory !== 'All Records') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`${API_BASE}/health-records/${registrationId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecords(data.data.records || []);
        setStats(data.data.stats || null);
      } else if (response.status === 401) {
        alert('Session expired. Please login again.');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setUploadForm(prev => ({ ...prev, file }));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setUploadForm(prev => ({ ...prev, file }));
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only PDF, JPG, and PNG files are allowed.');
      return false;
    }

    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 10MB.');
      return false;
    }

    return true;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.file || !uploadForm.documentName || !uploadForm.category || !uploadForm.recordDate) {
      alert('Please fill in all required fields and select a file.');
      return;
    }

    if (!registrationId) {
      alert('Child registration ID not found. Please register a child first.');
      return;
    }

    setUploadLoading(true);

    try {
      const token = localStorage.getItem('wt18_token');

      if (!token) {
        alert('Please login first');
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('documentName', uploadForm.documentName);
      formData.append('category', uploadForm.category);
      formData.append('recordDate', uploadForm.recordDate);
      if (uploadForm.notes) formData.append('notes', uploadForm.notes);
      if (uploadForm.doctorName) formData.append('doctorName', uploadForm.doctorName);

      const response = await fetch(`${API_BASE}/health-records/upload/${registrationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        alert('Health record uploaded successfully!');
        setShowUploadModal(false);
        setUploadForm({
          documentName: '',
          category: '',
          recordDate: '',
          notes: '',
          doctorName: '',
          file: null,
        });
        fetchHealthRecords();
      } else {
        alert(`Failed to upload: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading health record:', error);
      alert('Failed to upload health record. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleViewDocument = (record: HealthRecord) => {
    setCurrentDocument(record);
    setShowDocumentViewer(true);
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this health record?')) return;

    try {
      const token = localStorage.getItem('wt18_token');
      if (!token) {
        alert('Please login first');
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE}/health-records/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Health record deleted successfully');
        fetchHealthRecords();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting health record:', error);
      alert('Failed to delete health record. Please try again.');
    }
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

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'Vaccination Cards':
        return {
          icon: '💉',
          bgColor: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
          badgeColor: 'bg-emerald-100 text-emerald-700',
          borderColor: 'border-emerald-200',
        };
      case 'Annual Check-ups':
        return {
          icon: '📋',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-700',
          borderColor: 'border-blue-200',
        };
      case 'Dental Records':
        return {
          icon: '🦷',
          bgColor: 'bg-pink-50',
          iconColor: 'text-pink-600',
          badgeColor: 'bg-pink-100 text-pink-700',
          borderColor: 'border-pink-200',
        };
      case 'Eye Check-ups':
        return {
          icon: '👁️',
          bgColor: 'bg-violet-50',
          iconColor: 'text-violet-600',
          badgeColor: 'bg-violet-100 text-violet-700',
          borderColor: 'border-violet-200',
        };
      case 'BMI Reports':
        return {
          icon: '📊',
          bgColor: 'bg-amber-50',
          iconColor: 'text-amber-600',
          badgeColor: 'bg-amber-100 text-amber-700',
          borderColor: 'border-amber-200',
        };
      case 'Lab Tests':
      case 'Lab Reports':
        return {
          icon: '🧪',
          bgColor: 'bg-cyan-50',
          iconColor: 'text-cyan-600',
          badgeColor: 'bg-cyan-100 text-cyan-700',
          borderColor: 'border-cyan-200',
        };
      case 'Prescriptions':
        return {
          icon: '💊',
          bgColor: 'bg-rose-50',
          iconColor: 'text-rose-600',
          badgeColor: 'bg-rose-100 text-rose-700',
          borderColor: 'border-rose-200',
        };
      case 'Medical Certificates':
        return {
          icon: '📜',
          bgColor: 'bg-indigo-50',
          iconColor: 'text-indigo-600',
          badgeColor: 'bg-indigo-100 text-indigo-700',
          borderColor: 'border-indigo-200',
        };
      case 'Growth':
        return {
          icon: '📈',
          bgColor: 'bg-teal-50',
          iconColor: 'text-teal-600',
          badgeColor: 'bg-teal-100 text-teal-700',
          borderColor: 'border-teal-200',
        };
      default:
        return {
          icon: '📄',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-600',
          badgeColor: 'bg-gray-100 text-gray-700',
          borderColor: 'border-gray-200',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading health records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Health Records Section */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Record
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search records by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                />
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">Date Range</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  <span className="text-gray-700">File Type</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-gray-200">
              {['All Records', ...CATEGORIES].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? 'border-green-500 text-green-600 bg-green-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category === 'All Records' ? category : category.replace(' Records', '').replace(' Check-ups', '')}
                  {stats && category !== 'All Records' && stats.recordsByCategory[category] && (
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {stats.recordsByCategory[category]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Records Content */}
          <div className="p-6">
            {/* Records Grid */}
            {records.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Health Records Yet</h3>
                <p className="text-gray-600 mb-6">
                  Upload prescriptions, lab reports, dental exams, and other health documents here
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Record
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {records.map((record) => {
                  const categoryConfig = getCategoryConfig(record.category);
                  return (
                    <div key={record._id} className={`bg-white border ${categoryConfig.borderColor} rounded-xl p-5 hover:shadow-lg transition-all duration-200`}>
                      {/* Document Icon & Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${categoryConfig.bgColor}`}>
                          <span className={categoryConfig.iconColor}>{categoryConfig.icon}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryConfig.badgeColor}`}>
                          {record.category.replace(' Records', '').replace(' Check-ups', '').replace(' Cards', '').replace(' Tests', '').replace(' Certificates', '')}
                        </span>
                      </div>

                      {/* Document Info */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2">
                          {record.documentName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(record.recordDate)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {record.fileType.toUpperCase()} • {formatFileSize(record.fileSize)}
                        </div>
                        {record.uploadedBy === 'ADMIN' && (
                          <span className="inline-flex items-center gap-1 mt-2 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Admin Verified
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDocument(record)}
                          className={`flex-1 ${categoryConfig.bgColor} ${categoryConfig.iconColor} px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-colors text-center flex items-center justify-center gap-2`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <a
                          href={record.fileUrl}
                          download={record.fileName}
                          className="bg-gray-100 text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                          title="Download"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </a>
                        <button
                          onClick={() => handleDeleteRecord(record._id)}
                          className="bg-red-50 text-red-600 px-3 py-2.5 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Additional Info */}
                      {(record.notes || record.doctorName) && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {record.doctorName && (
                            <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Dr. {record.doctorName}
                            </p>
                          )}
                          {record.notes && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                              {record.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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
                  className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
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
                  <iframe
                    src={currentDocument.fileUrl}
                    className="w-full h-[600px] border-0 rounded-lg"
                    title={currentDocument.documentName}
                  />
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Note:</strong> If the PDF doesn't display properly, you can download it using the button above.
                    </p>
                    <a
                      href={currentDocument.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 text-sm underline"
                    >
                      Open in new tab
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <img
                    src={currentDocument.fileUrl}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    ☁️
                  </div>
                  <h3 className="text-xl font-semibold">Upload Health Record</h3>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpload}>
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
                    dragActive
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-4xl mb-4">☁️</div>
                  <p className="text-lg font-medium mb-2">Drag & drop your file here</p>
                  <p className="text-gray-600 mb-4">or click to browse from your device</p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      📄 PDF
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      🖼️ JPG, PNG
                    </span>
                    <span>•</span>
                    <span>MAX 10MB</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Browse Files
                  </label>
                  {uploadForm.file && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        Selected: {uploadForm.file.name}
                      </p>
                      <p className="text-xs text-green-600">
                        {formatFileSize(uploadForm.file.size)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Annual Blood Report 2026"
                      value={uploadForm.documentName}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, documentName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={uploadForm.category}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Record
                      </label>
                      <input
                        type="date"
                        value={uploadForm.recordDate}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, recordDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes / Doctor's Name (Optional)
                    </label>
                    <textarea
                      placeholder="Add any relevant context here..."
                      value={uploadForm.notes}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Doctor's Name (Optional)"
                      value={uploadForm.doctorName}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, doctorName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploadLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        ☁️ Upload Document
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}