"use client";

import { CheckCircle, X } from "lucide-react";

interface RequestSentModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
}

export default function RequestSentModal({ isOpen, onClose, schoolName }: RequestSentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-2xl font-semibold text-slate-900">Request Sent!</h2>

          {/* Message */}
          <p className="mb-6 text-sm text-slate-600">
            We have sent a link request to{" "}
            <span className="font-semibold text-slate-900">{schoolName}</span>
          </p>

          {/* Additional Info */}
          <div className="mb-6 rounded-lg bg-blue-50 p-4 text-left">
            <p className="text-xs text-blue-900">
              <span className="font-semibold">What happens next?</span>
            </p>
            <ul className="mt-2 space-y-1 text-xs text-blue-800">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-600">•</span>
                <span>School admin will review your request</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-600">•</span>
                <span>You'll receive an email notification once approved</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-600">•</span>
                <span>Approval typically takes 1-2 business days</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
