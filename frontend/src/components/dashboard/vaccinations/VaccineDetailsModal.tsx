"use client";

import { useEffect } from "react";
import { X, Calendar, AlertTriangle, Info, Syringe, Bell, Mail, MessageCircle, Send, Upload, CheckCircle } from "lucide-react";

interface VaccineDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VaccineDetailsModal({ isOpen, onClose }: VaccineDetailsModalProps) {
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

  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

      {/* Modal Container */}
      <div
        className="flex max-h-[90vh] w-full max-w-[500px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing modal
      >

        {/* Header Section */}
        <div className="relative border-b border-primary/10 px-6 pb-6 pt-8">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Scheduled
                </span>
              </div>
              <h2 className="text-2xl font-bold leading-tight text-slate-900">DTaP-2</h2>
              <p className="text-sm font-medium text-slate-500">Diphtheria, Tetanus, Pertussis</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 transition-colors hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-6 overflow-y-auto px-6 py-6">

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Calendar className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Due Date</span>
              </div>
              <p className="text-sm font-bold text-slate-900">20 March 2026</p>
              <p className="text-xs font-medium text-slate-500">Age: 10 weeks</p>
            </div>

            <div className="rounded-xl border border-amber-200/50 bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Status</span>
              </div>
              <p className="text-sm font-bold text-amber-700">Due in 10 days</p>
              <p className="text-xs font-medium text-amber-600/80">Action Required</p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {/* About */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Info className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-900">About this vaccine</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  Protects against Diphtheria, Tetanus, and Whooping Cough. Given as injection in thigh.
                </p>
              </div>
            </div>

            {/* Side Effects */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Syringe className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-900">Common side effects</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div> Mild fever
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div> Soreness at injection site
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div> Fussiness
                  </li>
                </ul>
              </div>
            </div>

            {/* Reminders */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex flex-1 flex-col">
                <h3 className="text-sm font-bold text-slate-900">Reminders sent</h3>
                <p className="mt-0.5 text-xs text-slate-500">Scheduled for 18 Mar</p>
                <div className="mt-3 flex gap-2">
                  <div className="flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 text-slate-600">
                    <Mail className="h-3 w-3" />
                    <span className="text-[10px] font-bold">Email</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 text-slate-600">
                    <MessageCircle className="h-3 w-3" />
                    <span className="text-[10px] font-bold">WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 text-slate-600">
                    <Send className="h-3 w-3" />
                    <span className="text-[10px] font-bold">SMS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col gap-3 border-t border-primary/10 bg-slate-50/50 p-6">
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/5">
              <Upload className="h-4 w-4" />
              Upload Certificate
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90">
              <CheckCircle className="h-4 w-4" />
              Mark Done
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
              Reschedule
            </button>
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
