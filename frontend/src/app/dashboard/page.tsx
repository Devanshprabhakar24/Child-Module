'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProfileSection from '@/components/dashboard/ProfileSection';
import RemindersSection from '@/components/dashboard/RemindersSection';
import StatsGrid from '@/components/dashboard/StatsGrid';
import VaccinationTimeline from '@/components/dashboard/VaccinationTimeline';
import { useDashboardData } from '@/hooks/useDashboardData';
import { setRegistrationId } from '@/utils/registrationId';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, error, selectedChild, milestones } = useDashboardData();

  // Automatically add registration ID to URL and localStorage when child data loads
  useEffect(() => {
    if (selectedChild && !loading) {
      const currentRegId = searchParams.get('registrationId');
      
      // Always update localStorage with the correct registration ID from API
      setRegistrationId(selectedChild.registrationId);
      
      // If no registration ID in URL, add it
      if (!currentRegId) {
        router.replace(`/dashboard?registrationId=${selectedChild.registrationId}`);
      }
    }
  }, [selectedChild, loading, searchParams, router]);

  if (loading) {
    return <div className="text-sm text-slate-500">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No children are linked to your account yet. Please complete a child registration
        to view the dashboard.
      </div>
    );
  }

  return (
    <>
      <StatsGrid child={selectedChild} milestones={milestones} />
      <ProfileSection child={selectedChild} />
      <VaccinationTimeline milestones={milestones} />
      <RemindersSection milestones={milestones} />
    </>
  );
}