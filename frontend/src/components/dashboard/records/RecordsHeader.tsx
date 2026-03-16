"use client";

import { useState } from "react";
import { Upload, Search, Calendar, Filter, ChevronDown } from "lucide-react";
import UploadRecordModal from "./UploadRecordModal";

interface RecordsHeaderProps {
  onUploadSuccess?: () => void;
}

export default function RecordsHeader({ onUploadSuccess }: RecordsHeaderProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleUploadSuccess = () => {
      setIsModalOpen(false);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    };

  return (
    <div className="mb-6 flex flex-col gap-6">
      {/* Top Row: Title & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-medium tracking-tight text-slate-900">Health Records</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-normal text-white shadow-sm transition-all hover:bg-primary/90">
          <Upload className="h-5 w-5" />
          Upload Record
        </button>
      </div>

      {/* Bottom Row: Search & Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[300px] flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border-none bg-white p-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-slate-200 transition-shadow placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50"
            placeholder="Search records by name..."
            type="text"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50">
            <Calendar className="h-4 w-4" />
            Date Range
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50">
            <Filter className="h-4 w-4" />
            File Type
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Mount the Modal Component */}
      <UploadRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
