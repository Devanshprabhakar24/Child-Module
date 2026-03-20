"use client";

import { useState } from "react";
import { Upload, Search } from "lucide-react";
import UploadRecordModal from "./UploadRecordModal";

interface RecordsHeaderProps {
  onUploadSuccess?: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function RecordsHeader({ onUploadSuccess, searchTerm, onSearchChange }: RecordsHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mb-6 flex flex-col gap-6">
      {/* Title & Upload */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-medium tracking-tight text-slate-900">Health Records</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-normal text-white shadow-sm transition-all hover:bg-primary/90"
        >
          <Upload className="h-5 w-5" />
          Upload Record
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-lg border-none bg-white p-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-slate-200 transition-shadow placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50"
          placeholder="Search records by name..."
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <UploadRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={() => {
          setIsModalOpen(false);
          onUploadSuccess?.();
        }}
      />
    </div>
  );
}
