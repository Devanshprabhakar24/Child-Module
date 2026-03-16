"use client";

import { useState, useEffect } from "react";
import { useChildData } from "@/hooks/useChildData";
import { Check, Circle, Clock, Loader2, Info, Lock, TrendingUp } from "lucide-react";

const AGE_GROUPS = [
  { key: '0-1 years', label: '0-1 Years', emoji: '👶' },
  { key: '1-3 years', label: '1-3 Years', emoji: '🧒' },
  { key: '3-5 years', label: '3-5 Years', emoji: '👦' },
  { key: '5-12 years', label: '5-12 Years', emoji: '🧑' },
  { key: '13-18 years', label: '13-18 Years', emoji: '👨' },
];

const MILESTONE_TYPES = {
  PHYSICAL: { label: 'Physical', color: 'bg-blue-100 text-blue-700', icon: '💪' },
  COGNITIVE: { label: 'Cognitive', color: 'bg-purple-100 text-purple-700', icon: '🧠' },
  SOCIAL: { label: 'Social', color: 'bg-green-100 text-green-700', icon: '👥' },
  EMOTIONAL: { label: 'Emotional', color: 'bg-pink-100 text-pink-700', icon: '❤️' },
  LANGUAGE: { label: 'Language', color: 'bg-amber-100 text-amber-700', icon: '💬' },
};

const STATUS_CONFIG = {
  NOT_STARTED: { icon: Circle, color: "text-slate-400", bg: "bg-slate-100", label: "Not Started" },
  IN_PROGRESS: { icon: Clock, color: "text-blue-500", bg: "bg-blue-50", label: "In Progress" },
  ACHIEVED: { icon: Check, color: "text-green-600", bg: "bg-green-50", label: "Achieved" },
  DELAYED: { icon: Clock, color: "text-red-500", bg: "bg-red-50", label: "Delayed" },
};

export default function MilestonesPage() {
  const { profile, loading, error } = useChildData();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('');
  const [milestones, setMilestones] = useState<any[]>([]);
  const [currentAgeGroup, setCurrentAgeGroup] = useState<string>('');
  const [availableAgeGroups, setAvailableAgeGroups] = useState<string[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [seedingMilestones, setSeedingMilestones] = useState(false);
  const [updatingMilestone, setUpdatingMilestone] = useState<string | null>(null);

  // Fetch development milestones
  useEffect(() => {
    if (!profile?.registrationId) return;

    const fetchMilestones = async () => {
      setLoadingMilestones(true);
      try {
        const response = await fetch(
          `http://localhost:8000/dashboard/development-milestones/${profile.registrationId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setMilestones(result.data.milestones || []);
          setCurrentAgeGroup(result.data.currentAgeGroup);
          setAvailableAgeGroups(result.data.availableAgeGroups || []);
          
          // Set selected age group to current age group
          if (!selectedAgeGroup && result.data.currentAgeGroup) {
            setSelectedAgeGroup(result.data.currentAgeGroup);
          }
        }
      } catch (err) {
        console.error('Failed to fetch development milestones:', err);
      } finally {
        setLoadingMilestones(false);
      }
    };

    fetchMilestones();
  }, [profile?.registrationId]);

  // Seed milestones for an age group
  const seedAgeGroupMilestones = async (ageGroup: string) => {
    if (!profile?.registrationId) return;

    setSeedingMilestones(true);
    try {
      // First fetch templates for this age group
      const templatesResponse = await fetch(
        `http://localhost:8000/cms/milestone-templates/${encodeURIComponent(ageGroup)}`
      );

      if (!templatesResponse.ok) {
        throw new Error('Failed to fetch milestone templates');
      }

      const templatesResult = await templatesResponse.json();
      const templates = templatesResult.data || [];

      // Seed milestones
      const response = await fetch(
        'http://localhost:8000/dashboard/development-milestones/seed',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            registrationId: profile.registrationId,
            ageGroup,
            templates,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Refresh milestones
        const refreshResponse = await fetch(
          `http://localhost:8000/dashboard/development-milestones/${profile.registrationId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (refreshResponse.ok) {
          const refreshResult = await refreshResponse.json();
          setMilestones(refreshResult.data.milestones || []);
        }
      }
    } catch (err) {
      console.error('Failed to seed milestones:', err);
    } finally {
      setSeedingMilestones(false);
    }
  };

  // Update milestone status
  const updateMilestoneStatus = async (milestoneId: string, status: string) => {
    setUpdatingMilestone(milestoneId);
    try {
      const response = await fetch(
        `http://localhost:8000/dashboard/development-milestones/${milestoneId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            status,
            achievedDate: status === 'ACHIEVED' ? new Date().toISOString() : undefined,
          }),
        }
      );

      if (response.ok) {
        // Update local state
        setMilestones(prev =>
          prev.map(m =>
            m._id === milestoneId
              ? { ...m, status, achievedDate: status === 'ACHIEVED' ? new Date() : m.achievedDate }
              : m
          )
        );
      }
    } catch (err) {
      console.error('Failed to update milestone:', err);
    } finally {
      setUpdatingMilestone(null);
    }
  };

  // Filter milestones by selected age group
  const filteredMilestones = milestones.filter(m => m.ageGroup === selectedAgeGroup);

  // Group by type
  const groupedMilestones = filteredMilestones.reduce((acc, m) => {
    if (!acc[m.type]) acc[m.type] = [];
    acc[m.type].push(m);
    return acc;
  }, {} as Record<string, any[]>);

  // Calculate progress for selected age group
  const totalInGroup = filteredMilestones.length;
  const achievedInGroup = filteredMilestones.filter(m => m.status === 'ACHIEVED').length;
  const progressPct = totalInGroup > 0 ? Math.round((achievedInGroup / totalInGroup) * 100) : 0;

  if (loading || loadingMilestones) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading milestones...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-8xl">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-medium tracking-tight text-slate-900">Development Milestones</h1>
      </div>

      {/* Info Banner */}
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-900">Age-Based Milestone Tracking</p>
            <p className="mt-1 text-xs text-blue-700">
              Milestones are organized by age groups. Only age groups your child has reached or passed are unlocked. 
              Track your child's development across physical, cognitive, social, emotional, and language domains.
            </p>
          </div>
        </div>
      </div>

      {/* Age Group Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {AGE_GROUPS.map((group) => {
          const isAvailable = availableAgeGroups.includes(group.key);
          const isCurrent = group.key === currentAgeGroup;
          const isSelected = group.key === selectedAgeGroup;

          return (
            <button
              key={group.key}
              onClick={() => isAvailable && setSelectedAgeGroup(group.key)}
              disabled={!isAvailable}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? "bg-primary text-white shadow-md"
                  : isAvailable
                  ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <span>{group.emoji}</span>
              <span>{group.label}</span>
              {isCurrent && <TrendingUp className="h-3 w-3" />}
              {!isAvailable && <Lock className="h-3 w-3" />}
            </button>
          );
        })}
      </div>

      {/* Progress Card */}
      {selectedAgeGroup && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-slate-900">
                {AGE_GROUPS.find(g => g.key === selectedAgeGroup)?.label} Progress
              </h3>
              <p className="text-sm text-slate-500">
                {achievedInGroup} of {totalInGroup} milestones achieved
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{progressPct}%</div>
              <div className="text-xs text-slate-500">Complete</div>
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Seed Button */}
      {selectedAgeGroup && filteredMilestones.length === 0 && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="mb-4 text-sm text-slate-600">
            No milestones found for this age group. Click below to load default milestones.
          </p>
          <button
            onClick={() => seedAgeGroupMilestones(selectedAgeGroup)}
            disabled={seedingMilestones}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {seedingMilestones ? (
              <>
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                Loading Milestones...
              </>
            ) : (
              'Load Milestones'
            )}
          </button>
        </div>
      )}

      {/* Milestones by Type */}
      {selectedAgeGroup && filteredMilestones.length > 0 && (
        <div className="space-y-6">
          {Object.entries(MILESTONE_TYPES).map(([type, config]) => {
            const typeMilestones = groupedMilestones[type] || [];
            if (typeMilestones.length === 0) return null;

            return (
              <div key={type} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-2xl">{config.icon}</span>
                  <h3 className="text-lg font-medium text-slate-900">{config.label} Development</h3>
                  <span className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
                    {typeMilestones.filter((m: any) => m.status === 'ACHIEVED').length} / {typeMilestones.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {typeMilestones.map((milestone: any) => {
                    const statusConfig = STATUS_CONFIG[milestone.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.NOT_STARTED;
                    const Icon = statusConfig.icon;

                    return (
                      <div
                        key={milestone._id}
                        className="flex items-start gap-4 rounded-lg border border-slate-200 p-4 transition-all hover:border-slate-300"
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${statusConfig.bg}`}>
                          <Icon className={`h-5 w-5 ${statusConfig.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{milestone.title}</h4>
                          <p className="mt-1 text-sm text-slate-600">{milestone.description}</p>
                          {milestone.achievedDate && (
                            <p className="mt-1 text-xs text-green-600">
                              Achieved on {new Date(milestone.achievedDate).toLocaleDateString('en-IN')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {milestone.status !== 'ACHIEVED' && (
                            <button
                              onClick={() => updateMilestoneStatus(milestone._id, 'ACHIEVED')}
                              disabled={updatingMilestone === milestone._id}
                              className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                            >
                              {updatingMilestone === milestone._id ? (
                                <>
                                  <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                                  Updating...
                                </>
                              ) : (
                                'Mark Achieved'
                              )}
                            </button>
                          )}
                          {milestone.status === 'ACHIEVED' && (
                            <button
                              onClick={() => updateMilestoneStatus(milestone._id, 'NOT_STARTED')}
                              disabled={updatingMilestone === milestone._id}
                              className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                            >
                              {updatingMilestone === milestone._id ? (
                                <>
                                  <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                                  Updating...
                                </>
                              ) : (
                                'Undo'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Consultation Notice */}
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-xs leading-relaxed text-amber-800">
            Every child develops at their own pace. These milestones are general guidelines. 
            Consult your pediatrician if you have concerns about your child's development.
          </p>
        </div>
      </div>
    </div>
  );
}
