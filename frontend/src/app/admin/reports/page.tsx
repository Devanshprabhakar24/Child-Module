'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  status: string;
  createdAt: string;
}

const CATEGORIES = [
  'Vaccination Cards',
  'Annual Check-ups',
  'Dental Records',
  'Eye Check-ups',
  'BMI Reports',
  'Lab Reports',
  'Prescriptions',
  'Medical Certificates',
  'Other',
];

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegistrationId, setSelectedRegistrationId] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    registrationId: '',
    documentName: '',
    category: '',
    recordDate: '',
    notes: '',
    doctorName: '',
    file: null as File | null,
  });

  const [dragActive, setDragActive] = useState(false);

  // Debounced search effect
  useEffect(() => {
    if (searchTerm !== '') {
      setSearchLoading(true);
    }
    const timeoutId = setTimeout(() => {
      fetchReports();
    }, 300); // 300ms delay for search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Immediate fetch for other filters
  useEffect(() => {
    fetchReports();
  }, [currentPage, selectedCategory, selectedRegistrationId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedRegistrationId.trim()) params.append('registrationId', selectedRegistrationId.trim());

      const apiUrl = `http://localhost:8000/health-records/admin/all?${params}`;
      console.log('Fetching health records from:', apiUrl);

      const response = await fetch(apiUrl);
      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        console.log('Health records found:', data.data.records.length);
        setReports(data.data.records);
        setTotalPages(data.data.totalPages);
      } else {
        console.error('Failed to fetch health records, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching health records:', error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
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
    const allowedTypes = ['application/pdf'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only PDF files are allowed for reports.');
      return false;
    }

    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 50MB.');
      return false;
    }

    return true;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file || !uploadForm.registrationId || !uploadForm.documentName || !uploadForm.category || !uploadForm.recordDate) {
      alert('Please fill in all required fields and select a file.');
      return;
    }

    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('documentName', uploadForm.documentName);
      formData.append('category', uploadForm.category);
      formData.append('recordDate', uploadForm.recordDate);
      if (uploadForm.notes) formData.append('notes', uploadForm.notes);
      if (uploadForm.doctorName) formData.append('doctorName', uploadForm.doctorName);

      const response = await fetch(`http://localhost:8000/health-records/admin/upload/${uploadForm.registrationId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Health record uploaded successfully!');
        setShowUploadModal(false);
        setUploadForm({
          registrationId: '',
          documentName: '',
          category: '',
          recordDate: '',
          notes: '',
          doctorName: '',
          file: null,
        });
        fetchReports();
      } else {
        const errorData = await response.json();
        alert(`Failed to upload: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading health record:', error);
      alert('Failed to upload health record. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this health record?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/health-records/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Health record deleted successfully!');
        fetchReports();
      } else {
        alert('Failed to delete health record.');
      }
    } catch (error) {
      console.error('Error deleting health record:', error);
      alert('Failed to delete health record.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Health Records Management</h1>
              <p className="text-gray-600 mt-1">Manage health records for all registrations</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              📤 Upload Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search reports, registration ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchTerm('');
                    }
                  }}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchLoading && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
                {!searchLoading && searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration ID</label>
              <input
                type="text"
                placeholder="CHD-XX-XXXXXXXX-XXXXXX"
                value={selectedRegistrationId}
                onChange={(e) => setSelectedRegistrationId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedRegistrationId('');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Reports ({reports.length} reports)
                {(searchTerm || selectedCategory || selectedRegistrationId) && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    - Filtered results
                  </span>
                )}
              </h3>
              
              {(searchTerm || selectedCategory || selectedRegistrationId) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Active filters:</span>
                  {searchTerm && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      Category: {selectedCategory}
                    </span>
                  )}
                  {selectedRegistrationId && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                      ID: {selectedRegistrationId}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                {(searchTerm || selectedCategory || selectedRegistrationId) ? (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Health Records Found</h3>
                    <p className="text-gray-600 mb-4">
                      No health records match your current search criteria.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                        setSelectedRegistrationId('');
                        setCurrentPage(1);
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Health Records Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Upload health records for children to get started.
                    </p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Upload Your First Health Record
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Document</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Child Info</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Uploaded By</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              📄
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{report.documentName}</p>
                              <p className="text-sm text-gray-500">
                                {report.fileName} • {formatFileSize(report.fileSize)}
                              </p>
                              {report.notes && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {report.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {report.registrationId}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {report.category}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{formatDate(report.recordDate)}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded: {formatDate(report.createdAt)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            report.uploadedBy === 'ADMIN' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {report.uploadedBy === 'ADMIN' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={`http://localhost:8000${report.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                              View
                            </a>
                            <a
                              href={`http://localhost:8000/health-records/${report._id}/download`}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                            >
                              Download
                            </a>
                            <button
                              onClick={() => handleDeleteReport(report._id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    📊
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
                {/* Registration ID Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration ID *
                  </label>
                  <input
                    type="text"
                    placeholder="CHD-XX-XXXXXXXX-XXXXXX"
                    value={uploadForm.registrationId}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, registrationId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-lg font-medium mb-2">Drag & drop your PDF here</p>
                  <p className="text-gray-600 mb-4">or click to browse from your device</p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      📄 PDF Only
                    </span>
                    <span>•</span>
                    <span>MAX 50MB</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="report-file-upload"
                  />
                  <label
                    htmlFor="report-file-upload"
                    className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Browse Files
                  </label>
                  {uploadForm.file && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        Selected: {uploadForm.file.name}
                      </p>
                      <p className="text-xs text-blue-600">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        Date of Record *
                      </label>
                      <input
                        type="date"
                        value={uploadForm.recordDate}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, recordDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Add any relevant context here..."
                      value={uploadForm.notes}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor's Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Doctor's Name"
                      value={uploadForm.doctorName}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, doctorName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploadLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        📤 Upload Health Record
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
