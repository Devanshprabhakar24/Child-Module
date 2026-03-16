'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Report {
  _id: string;
  registrationId: string;
  childName?: string;
  title: string;
  description: string;
  category: string;
  reportDate: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  status: string;
  downloadCount: number;
  createdAt: string;
}

interface ReportStats {
  totalReports: number;
  reportsByCategory: Record<string, number>;
  recentReports: number;
  totalDownloads: number;
}

const CATEGORIES = [
  'Monthly Report',
  'Quarterly Report',
  'Annual Report',
  'Vaccination Report',
  'Health Report',
  'Growth Report',
  'Analytics Report',
  'Other',
];

export default function UserReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports();
  }, [selectedCategory, searchTerm]);

  const fetchReports = async () => {
    try {
      let registrationId = localStorage.getItem('currentRegistrationId');
      
      // Fallback: use test registration ID
      if (!registrationId) {
        registrationId = 'CHD-KL-20260306-000001';
        localStorage.setItem('currentRegistrationId', registrationId);
      }

      const params = new URLSearchParams();
      if (selectedCategory !== 'All Reports') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`http://localhost:8000/reports/${registrationId}?${params}`);

      if (response.ok) {
        const data = await response.json();
        setReports(data.data.reports);
        setStats(data.data.stats);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (report: Report) => {
    setCurrentDocument(report);
    setShowDocumentViewer(true);
  };

  const handleDownload = async (reportId: string, fileName: string) => {
    try {
      const response = await fetch(`http://localhost:8000/reports/${reportId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Refresh reports to update download count
        fetchReports();
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
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

  const getReportIcon = (category: string): string => {
    switch (category) {
      case 'Monthly Report':
        return '📊';
      case 'Quarterly Report':
        return '📈';
      case 'Annual Report':
        return '📋';
      case 'Vaccination Report':
        return '💉';
      case 'Health Report':
        return '🏥';
      case 'Growth Report':
        return '📏';
      case 'Analytics Report':
        return '📊';
      default:
        return '📄';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Monthly Report':
        return 'bg-blue-100 text-blue-800';
      case 'Quarterly Report':
        return 'bg-green-100 text-green-800';
      case 'Annual Report':
        return 'bg-purple-100 text-purple-800';
      case 'Vaccination Report':
        return 'bg-red-100 text-red-800';
      case 'Health Report':
        return 'bg-pink-100 text-pink-800';
      case 'Growth Report':
        return 'bg-yellow-100 text-yellow-800';
      case 'Analytics Report':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Reports Section */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">System Reports</h1>
              <div className="text-sm text-gray-600">
                {stats && (
                  <span>
                    {stats.totalReports} reports • {stats.totalDownloads} total downloads
                  </span>
                )}
              </div>
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
                  placeholder="Search reports by title..."
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
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-gray-200">
              {['All Reports', ...CATEGORIES].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? 'border-green-500 text-green-600 bg-green-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category === 'All Reports' ? category : category.replace(' Report', '')}
                  {stats && category !== 'All Reports' && stats.reportsByCategory[category] && (
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {stats.reportsByCategory[category]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Content */}
          <div className="p-6">
            {/* Reports Grid */}
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Available</h3>
                <p className="text-gray-600 mb-6">
                  System reports will appear here when they are published by administrators
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <div key={report._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                    {/* Report Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                        {getReportIcon(report.category)}
                      </div>
                      <div className="relative">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Report Info */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(report.reportDate)} • {formatFileSize(report.fileSize)} • PDF
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(report.category)}`}>
                        {report.category}
                      </span>
                      {report.downloadCount > 0 && (
                        <span className="ml-2 inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {report.downloadCount} downloads
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {report.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {report.description}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDocument(report)}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(report._id, report.fileName)}
                        className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        title="Download"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
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
                <h3 className="text-lg font-semibold text-gray-900">{currentDocument.title}</h3>
                <p className="text-sm text-gray-600">
                  {currentDocument.category} • {formatDate(currentDocument.reportDate)} • {formatFileSize(currentDocument.fileSize)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(currentDocument._id, currentDocument.fileName)}
                  className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
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
              <div className="w-full h-full">
                {/* PDF Viewer with local file support */}
                <div className="mb-4">
                  <iframe
                    src={`http://localhost:8000${currentDocument.fileUrl}`}
                    className="w-full h-[600px] border-0 rounded-lg"
                    title={currentDocument.title}
                    onError={() => console.log('PDF iframe failed to load')}
                  />
                </div>
                
                {/* PDF Action Buttons */}
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Report Options:</strong>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`http://localhost:8000${currentDocument.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm flex items-center gap-2 font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in New Tab
                    </a>
                    <button
                      onClick={() => handleDownload(currentDocument._id, currentDocument.fileName)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm flex items-center gap-2 font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Report Details */}
              {currentDocument.description && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Report Description</h4>
                  <p className="text-sm text-gray-600">
                    {currentDocument.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}