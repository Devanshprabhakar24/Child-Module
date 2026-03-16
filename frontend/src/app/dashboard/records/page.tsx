"use client";

import { useState } from "react";
import RecordsHeader from "@/components/dashboard/records/RecordsHeader";
import RecordsTabs from "@/components/dashboard/records/RecordsTabs";
import RecordsGrid from "@/components/dashboard/records/RecordsGrid";

export default function HealthRecordsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="mx-auto max-w-8xl">
      <RecordsHeader onUploadSuccess={handleUploadSuccess} />
      <RecordsTabs />
      <RecordsGrid refreshTrigger={refreshTrigger} />
    </div>
  );
}