"use client";

import { X, FileText, Calendar, Download } from "lucide-react";

interface ViewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
}

export default function ViewRecordModal({
  isOpen,
  onClose,
  record,
}: ViewRecordModalProps) {
  if (!isOpen) return null;

  console.log('🔍 ViewRecordModal - Full record:', record);

  // Handle both health record and milestone data
  const title = record?.documentName || record?.title || "Vaccine Details";
  const recordDate = record?.recordDate || record?.completedDate;
  const category = record?.category || "VACCINATION";
  const description = record?.description;
  const notes = record?.notes;
  const doctorName = record?.doctorName;
  const fileUrl = record?.fileUrl;

  console.log('📋 Parsed data:', { title, recordDate, category, fileUrl });

  const isPDF = fileUrl?.toLowerCase().endsWith(".pdf");
  const isImage = fileUrl?.match(/\.(jpg|jpeg|png)$/i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
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
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            {title}
          </h2>
          {recordDate && (
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(recordDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {category}
              </span>
            </div>
          )}
        </div>

        {/* Doctor Name */}
        {doctorName && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-slate-700">
              Doctor&apos;s Name
            </h3>
            <p className="text-sm text-slate-600">{doctorName}</p>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-slate-700">
              Description
            </h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        )}

        {/* File Preview */}
        {fileUrl ? (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-slate-700">
              Attached Document
            </h3>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              {isImage && (
                <img
                  src={fileUrl}
                  alt={title}
                  className="w-full"
                  onError={(e) => {
                    console.error('❌ Failed to load image:', fileUrl);
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f1f5f9" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%2364748b" font-size="14"%3EImage not available%3C/text%3E%3C/svg%3E';
                  }}
                />
              )}
              {isPDF && (
                <div className="h-[500px] w-full bg-slate-50">
                  <iframe
                    src={fileUrl}
                    className="h-full w-full"
                    title="PDF Document"
                    onError={() => {
                      console.error('❌ Failed to load PDF:', fileUrl);
                    }}
                  />
                </div>
              )}
              {!isImage && !isPDF && (
                <div className="p-4 text-center">
                  <p className="text-sm text-slate-500">
                    File type not supported for preview
                  </p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Download className="h-4 w-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-sm text-slate-500">No health record attached</p>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-slate-700">Notes</h3>
            <p className="text-sm text-slate-600">{notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary bg-white px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          )}
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
