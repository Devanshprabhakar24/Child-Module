"use client";

import { useState } from "react";
import { X, Upload, FileText, Loader2, Check } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

interface MarkVaccineDoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: any;
  registrationId: string;
  token: string;
  onSuccess: () => void;
}

export default function MarkVaccineDoneModal({
  isOpen,
  onClose,
  milestone,
  registrationId,
  token,
  onSuccess,
}: MarkVaccineDoneModalProps) {
  const [completedDate, setCompletedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [documentName, setDocumentName] = useState(
    `${milestone?.vaccineName || milestone?.title} - Vaccination Record`
  );
  const [category, setCategory] = useState("VACCINATION");
  const [recordDate, setRecordDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!validTypes.includes(selectedFile.type)) {
        alert("Please upload only JPG, PNG, or PDF files");
        return;
      }
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      // 1. Mark milestone as completed
      const updateRes = await fetch(
        `${API_BASE}/dashboard/milestones/${milestone._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "COMPLETED",
            completedDate,
            notes: `${doctorName ? `Doctor: ${doctorName}. ` : ""}${notes || ""}`,
          }),
        }
      );

      if (!updateRes.ok) {
        const errorData = await updateRes.json();
        throw new Error(errorData.message || "Failed to mark vaccine as done");
      }

      // 2. Upload health record if file is provided
      if (file) {
        console.log('📤 Uploading health record for milestone:', milestone._id);
        
        // Map category to backend enum
        const categoryMap: Record<string, string> = {
          'VACCINATION': 'Vaccination Cards',
          'CHECKUP': 'Annual Check-ups',
          'LAB_REPORT': 'Lab Reports',
          'PRESCRIPTION': 'Prescriptions',
          'OTHER': 'Other',
        };
        
        const mappedCategory = categoryMap[category] || 'Vaccination Cards';
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentName", documentName.trim());
        formData.append("category", mappedCategory);
        formData.append("recordDate", recordDate);
        if (notes) formData.append("notes", notes.trim());
        if (doctorName) formData.append("doctorName", doctorName.trim());

        console.log('📋 Form data:', {
          registrationId,
          documentName: documentName.trim(),
          category: mappedCategory,
          recordDate,
          notes: notes || '',
          doctorName: doctorName || '',
          fileSize: file.size,
          fileType: file.type,
        });

        const uploadRes = await fetch(`${API_BASE}/health-records/upload/${registrationId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          console.error("❌ Failed to upload health record:", errorData);
          throw new Error(errorData.message || "Failed to upload health record");
        } else {
          const uploadData = await uploadRes.json();
          console.log("✅ Health record uploaded:", uploadData);
          
          // Store the health record ID in milestone notes for linking
          const healthRecordId = uploadData.data?._id;
          if (healthRecordId) {
            console.log("💾 Health record ID:", healthRecordId);
          }
        }
      } else {
        console.log('ℹ️ No file to upload');
      }

      alert("✅ Vaccine marked as done!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Failed to mark vaccine as done: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="sticky top-0 right-0 float-right z-10 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Mark Vaccine as Done
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {milestone.vaccineName || milestone.title}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Vaccination Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Vaccination Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* Document Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Document Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g., PCV-2 Vaccination Certificate"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* Category and Date of Record - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="VACCINATION">Vaccination</option>
                <option value="CHECKUP">Checkup</option>
                <option value="LAB_REPORT">Lab Report</option>
                <option value="PRESCRIPTION">Prescription</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date of Record
              </label>
              <input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Doctor's Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Doctor&apos;s Name (Optional)
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="e.g., Dr. Sharma"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Notes / Additional Context (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any relevant context here..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Upload Health Record (Optional)
            </label>
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-4 text-center transition-colors hover:border-primary">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="vaccine-file-upload"
              />
              <label
                htmlFor="vaccine-file-upload"
                className="flex cursor-pointer flex-col items-center gap-2"
              >
                {file ? (
                  <>
                    <FileText className="h-8 w-8 text-primary" />
                    <p className="text-sm font-medium text-slate-700">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-slate-400" />
                    <p className="text-sm font-medium text-slate-700">
                      Click to upload
                    </p>
                    <p className="text-xs text-slate-500">
                      JPG, PNG or PDF (max 5MB)
                    </p>
                  </>
                )}
              </label>
            </div>
            {file && (
              <button
                onClick={() => setFile(null)}
                className="mt-2 text-xs text-red-600 hover:text-red-700"
              >
                Remove file
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !completedDate || !documentName}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Mark as Done
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
