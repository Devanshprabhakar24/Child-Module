"use client";

import { useState } from "react";
import RecordsHeader from "@/components/dashboard/records/RecordsHeader";
import RecordsTabs from "@/components/dashboard/records/RecordsTabs";
import RecordsGrid from "@/components/dashboard/records/RecordsGrid";

export default function HealthRecordsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Records");

  return (
    <div className="mx-auto max-w-8xl">
      <RecordsHeader
        onUploadSuccess={() => setRefreshTrigger((p) => p + 1)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <RecordsTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <RecordsGrid
        refreshTrigger={refreshTrigger}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
      />
    </div>
  );
}
