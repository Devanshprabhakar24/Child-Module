"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload, X, FileText, Image as ImageIcon, Trash2, ChevronDown } from "lucide-react";

interface UploadRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
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

export default function UploadRecordModal({ isOpen, onClose, onUploadSuccess }: UploadRecordModalProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Form state
  const [uploadForm, setUploadForm] = useState({
    documentName: '',
    category: '',
    recordDate: '',
    notes: '',
  });

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setUploadForm({
        documentName: '',
        category: '',
        recordDate: '',
        notes: '',
      });
      setUploadLoading(false);
    }
  }, [isOpen]);

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
        setSelectedFile(file);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.documentName || !uploadForm.category || !uploadForm.recordDate) {
      alert('Please fill in all required fields and select a file.');
      return;
    }

    setUploadLoading(true);

    try {
      let registrationId = localStorage.getItem('currentRegistrationId');
      
      // Fallback: use test registration ID
      if (!registrationId) {
        registrationId = 'CHD-KL-20260306-000001';
        localStorage.setItem('currentRegistrationId', registrationId);
      }

      console.log('Uploading file:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        registrationId,
        ...uploadForm
      });

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentName', uploadForm.documentName);
      formData.append('category', uploadForm.category);
      formData.append('recordDate', uploadForm.recordDate);
      if (uploadForm.notes) formData.append('notes', uploadForm.notes);

      // Use regular upload endpoint (no auth required for testing)
      const uploadUrl = `http://localhost:8000/health-records/upload/${registrationId}`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      console.log('Upload response:', responseData);

      if (response.ok) {
        alert('Health record uploaded successfully!');
        onClose();
        if (onUploadSuccess) {
          onUploadSuccess();
        }
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

  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

      {/* Modal Container */}
      <div
        className="flex max-h-[90vh] w-full max-w-[550px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CloudUpload className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-medium text-slate-900">Upload Health Record</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="space-y-6 overflow-y-auto p-6">

          {/* Drag & Drop Zone */}
          <div 
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
              dragActive
                ? 'border-primary/50 bg-primary/10'
                : 'border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              onChange={handleFileSelect}
            />

            {!selectedFile ? (
              <div className="text-center pointer-events-none px-6 py-10">
                <CloudUpload className="mb-3 h-12 w-12 text-primary/60" />
                <p className="mb-1 text-sm font-normal text-slate-700">Drag & drop your file here</p>
                <p className="text-xs font-normal text-slate-500">or click to browse from your device</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-normal uppercase tracking-wider text-slate-400">
                  <FileText className="h-3 w-3" /> PDF
                  <span className="mx-1">•</span>
                  <ImageIcon className="h-3 w-3" /> JPG, PNG
                  <span className="mx-1">•</span>
                  Max 10MB
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-lg bg-white p-4 m-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-medium text-slate-900">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="z-20 ml-4 rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  title="Remove file"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Record Details Form */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Document Name *</label>
              <input
                type="text"
                placeholder="e.g. Annual Blood Report 2026"
                value={uploadForm.documentName}
                onChange={(e) => setUploadForm(prev => ({ ...prev, documentName: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Category *</label>
              <div className="relative">
                <select 
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="" disabled>Select Category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Date of Record</label>
              <input
                type="date"
                value={uploadForm.recordDate}
                onChange={(e) => setUploadForm(prev => ({ ...prev, recordDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes / Doctor's Name (Optional)</label>
              <textarea
                rows={2}
                placeholder="Add any relevant context here..."
                value={uploadForm.notes}
                onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-6 sm:flex-row">
          <button
            onClick={onClose}
            disabled={uploadLoading}
            className="rounded-lg px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !uploadForm.documentName || !uploadForm.category || !uploadForm.recordDate || uploadLoading}
            className={`flex items-center justify-center gap-2 rounded-full px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              selectedFile && uploadForm.documentName && uploadForm.category && uploadForm.recordDate && !uploadLoading
                ? "bg-primary hover:bg-primary/90 shadow-primary/20" 
                : "bg-slate-300"
            }`}
          >
            {uploadLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <CloudUpload className="h-4 w-4" />
                Upload Document
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
