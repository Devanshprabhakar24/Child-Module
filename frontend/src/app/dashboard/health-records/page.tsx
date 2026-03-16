'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './health-records.css';

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
    // For testing: set a test token if none exists
    const token = localStorage.getItem('wt18_token');
    if (!token) {
      // Set test admin token for development
      const testToken = 'eyJzdWIiOiI2OWI3Y2VhODQwZTE2N2JjMTE2OTVmYTQiLCJlbWFpbCI6ImFkbWluQHdvbWJ0bzE4LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc3MzY1MDkwMjMzNiwiZXhwIjoxNzczNzM3MzAyMzM2fQ';
      localStorage.setItem('wt18_token', testToken);
    }
    
    fetchHealthRecords();
  }, [selectedCategory, searchTerm]);

  const fetchHealthRecords = async () => {
    try {
      const token = localStorage.getItem('wt18_token');
      let registrationId = localStorage.getItem('currentRegistrationId');
      
      // Fallback: use test registration ID
      if (!registrationId) {
        registrationId = 'CHD-KL-20260306-000001';
        localStorage.setItem('currentRegistrationId', registrationId);
      }
      
      if (!token) {
        alert('Please login first');
        router.push('/auth/login');
        return;
      }

      const params = new URLSearchParams();
      if (selectedCategory !== 'All Records') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      console.log('Fetching health records for:', registrationId);

      const response = await fetch(`http://localhost:8000/health-records/${registrationId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Fetch response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched health records:', data);
        setRecords(data.data.records);
        setStats(data.data.stats);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch health records:', errorData);
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

    setUploadLoading(true);

    try {
      const token = localStorage.getItem('wt18_token');
      let registrationId = localStorage.getItem('currentRegistrationId');
      
      // Fallback: try to get registration ID from user data or use a test ID
      if (!registrationId) {
        registrationId = 'CHD-KL-20260306-000001'; // Use the test registration ID
        localStorage.setItem('currentRegistrationId', registrationId);
      }
      
      if (!token) {
        alert('Please login first');
        router.push('/auth/login');
        return;
      }

      console.log('Uploading file:', {
        fileName: uploadForm.file.name,
        fileSize: uploadForm.file.size,
        fileType: uploadForm.file.type,
        registrationId,
        documentName: uploadForm.documentName,
        category: uploadForm.category,
        recordDate: uploadForm.recordDate
      });

      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('documentName', uploadForm.documentName);
      formData.append('category', uploadForm.category);
      formData.append('recordDate', uploadForm.recordDate);
      if (uploadForm.notes) formData.append('notes', uploadForm.notes);
      if (uploadForm.doctorName) formData.append('doctorName', uploadForm.doctorName);

      console.log('Making API call to:', `http://localhost:8000/health-records/upload/${registrationId}`);

      const response = await fetch(`http://localhost:8000/health-records/upload/${registrationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

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

  const getDocumentIconStyle = (category: string): string => {
    switch (category) {
      case 'Vaccination Cards':
        return 'bg-red-500';
      case 'Annual Check-ups':
        return 'bg-blue-500';
      case 'Dental Records':
        return 'bg-purple-500';
      case 'Eye Check-ups':
        return 'bg-yellow-500';
      case 'BMI Reports':
        return 'bg-green-500';
      case 'Lab Reports':
        return 'bg-teal-500';
      case 'Prescriptions':
        return 'bg-pink-500';
      case 'Medical Certificates':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
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
                {records.map((record) => (
                  <div key={record._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                    {/* Document Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${getDocumentIconStyle(record.category)}`}>
                        {getDocumentIcon(record.category)}
                      </div>
                      <div className="relative">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Document Info */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                        {record.documentName}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(record.recordDate)} • {formatFileSize(record.fileSize)} • {record.fileType.toUpperCase()}
                      </p>
                      {record.uploadedBy === 'ADMIN' && (
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          Admin Upload
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDocument(record)}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                      >
                        View
                      </button>
                      <a
                        href={record.fileUrl}
                        download={record.fileName}
                        className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Download"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </a>
                    </div>

                    {/* Additional Info */}
                    {(record.notes || record.doctorName) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {record.doctorName && (
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Doctor:</span> {record.doctorName}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
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