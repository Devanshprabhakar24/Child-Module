"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RecordsHeader from "@/components/dashboard/records/RecordsHeader";
import RecordsTabs from "@/components/dashboard/records/RecordsTabs";
import RecordsGrid from "@/components/dashboard/records/RecordsGrid";

export default function HealthRecordsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCheckingId, setIsCheckingId] = useState(true);
  const router = useRouter();

  // Check for registration ID on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let registrationId = params.get('id');

    if (!registrationId) {
      // Try to get from localStorage or user data
      registrationId = localStorage.getItem('currentRegistrationId');
      
      if (!registrationId) {
        const user = JSON.parse(localStorage.getItem('wt18_user') || '{}');
        registrationId = user.registrationId || user.registrationIds?.[0];
      }

      if (registrationId) {
        // Redirect to same page with ID parameter
        router.replace(`/dashboard/records?id=${registrationId}`);
      } else {
        // No registration ID found, redirect to main dashboard
        alert('Please select a child from the dashboard first.');
        router.replace('/dashboard');
      }
    } else {
      setIsCheckingId(false);
    }
  }, [router]);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isCheckingId) {
    return (
      <div className="mx-auto max-w-8xl flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-8xl">
      <RecordsHeader onUploadSuccess={handleUploadSuccess} />
      <RecordsTabs />
      <RecordsGrid refreshTrigger={refreshTrigger} />
    </div>
  );
}