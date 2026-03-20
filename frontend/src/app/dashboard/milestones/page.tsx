"use client";

import { useState, useEffect } from "react";
import { useChildData } from "@/hooks/useChildData";
import { 
  Check, 
  Circle, 
  Clock, 
  Loader2, 
  Info, 
  TrendingUp, 
  AlertTriangle,
  X,
  MessageSquare
} from "lucide-react";

const AGE_GROUPS = [
  { key: '0-1 years', label: '0-1 Years', emoji: '👶', order: 1 },
  { key: '1-3 years', label: '1-3 Years', emoji: '🧒', order: 2 },
  { key: '3-5 years', label: '3-5 Years', emoji: '👦', order: 3 },
  { key: '5-12 years', label: '5-12 Years', emoji: '🧑', order: 4 },
  { key: '13-18 years', label: '13-18 Years', emoji: '👨', order: 5 },
];

const MILESTONE_TYPES = {
  PHYSICAL: { label: 'Physical', color: 'bg-blue-100 text-blue-700', icon: '💪' },
  COGNITIVE: { label: 'Cognitive', color: 'bg-purple-100 text-purple-700', icon: '🧠' },
  SOCIAL: { label: 'Social', color: 'bg-green-100 text-green-700', icon: '👥' },
  EMOTIONAL: { label: 'Emotional', color: 'bg-pink-100 text-pink-700', icon: '❤️' },
  LANGUAGE: { label: 'Language', color: 'bg-amber-100 text-amber-700', icon: '💬' },
};

const STATUS_CONFIG = {
  NOT_STARTED: { 
    icon: Circle, 
    color: "text-slate-400", 
    bg: "bg-slate-100", 
    label: "Pending",
    badgeColor: "bg-slate-100 text-slate-600"
  },
  IN_PROGRESS: { 
    icon: Clock, 
    color: "text-blue-500", 
    bg: "bg-blue-50", 
    label: "In Progress",
    badgeColor: "bg-blue-100 text-blue-700"
  },
  COMPLETED: { 
    icon: Check, 
    color: "text-green-600", 
    bg: "bg-green-50", 
    label: "Completed",
    badgeColor: "bg-green-100 text-green-700"
  },
  ACHIEVED: { 
    icon: Check, 
    color: "text-green-600", 
    bg: "bg-green-50", 
    label: "Completed",
    badgeColor: "bg-green-100 text-green-700"
  },
  DELAYED: { 
    icon: AlertTriangle, 
    color: "text-red-500", 
    bg: "bg-red-50", 
    label: "Delayed ⚠️",
    badgeColor: "bg-red-100 text-red-700"
  },
};

interface Milestone {
  _id: string;
  title: string;
  description: string;
  type: keyof typeof MILESTONE_TYPES;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'DELAYED';
  achievedDate?: string;
  notes?: string;
  expectedAgeMonths: number;
  ageGroup: string;
  order: number;
}

export default function MilestonesPage() {
  const { profile, loading, error } = useChildData();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>(''); // Will be set to current age group
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [allMilestones, setAllMilestones] = useState<Milestone[]>([]); // Store all milestones for overall progress
  const [currentAgeGroup, setCurrentAgeGroup] = useState<string>('');
  const [availableAgeGroups, setAvailableAgeGroups] = useState<string[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [seedingMilestones, setSeedingMilestones] = useState(false);
  const [updatingMilestone, setUpdatingMilestone] = useState<string | null>(null);
  const [childAgeInMonths, setChildAgeInMonths] = useState<number>(0);
  const [showNotesModal, setShowNotesModal] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Calculate child age in months
  const calculateAgeInMonths = (dateOfBirth: Date): number => {
    const now = new Date();
    const birthDate = new Date(dateOfBirth);
    
    let months = (now.getFullYear() - birthDate.getFullYear()) * 12;
    months += now.getMonth() - birthDate.getMonth();
    
    if (now.getDate() < birthDate.getDate()) {
      months--;
    }
    
    return Math.max(0, months);
  };

  // Fetch development milestones overview
  useEffect(() => {
    if (!profile?.registrationId) return;

    const fetchMilestonesOverview = async () => {
      setLoadingMilestones(true);
      try {
        const response = await fetch(
          `http://localhost:8000/dashboard/development-milestones/${profile.registrationId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("wt18_token")}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setCurrentAgeGroup(result.data.currentAgeGroup);
          setAvailableAgeGroups(result.data.availableAgeGroups || []);
          
          // Calculate child age in months
          if (profile.dateOfBirth) {
            const ageMonths = calculateAgeInMonths(new Date(profile.dateOfBirth));
            setChildAgeInMonths(ageMonths);
          }
          
          // Set selected age group to current age group (only unlocked group)
          const defaultGroup = result.data.currentAgeGroup || result.data.availableAgeGroups?.[0] || '0-1 years';
          setSelectedAgeGroup(defaultGroup);
        }
      } catch (err) {
        console.error('Failed to fetch development milestones overview:', err);
      } finally {
        setLoadingMilestones(false);
      }
    };

    fetchMilestonesOverview();
  }, [profile?.registrationId, profile?.dateOfBirth]);
  // Fetch milestones for selected age group
  useEffect(() => {
    if (!profile?.registrationId || !selectedAgeGroup) return;

    const fetchAgeGroupMilestones = async () => {
      setLoadingMilestones(true);
      try {
        const response = await fetch(
          `http://localhost:8000/dashboard/milestones/${profile.registrationId}?ageGroup=${encodeURIComponent(selectedAgeGroup)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("wt18_token")}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setMilestones(result.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch age group milestones:', err);
      } finally {
        setLoadingMilestones(false);
      }
    };

    fetchAgeGroupMilestones();
  }, [profile?.registrationId, selectedAgeGroup]);

  // Fetch ALL milestones for overall progress calculation
  useEffect(() => {
    if (!profile?.registrationId) return;

    const fetchAllMilestones = async () => {
      try {
        // Fetch milestones for all age groups
        const allMilestonesPromises = AGE_GROUPS.map(async (group) => {
          const response = await fetch(
            `http://localhost:8000/dashboard/milestones/${profile.registrationId}?ageGroup=${encodeURIComponent(group.key)}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("wt18_token")}`,
              },
            }
          );
          if (response.ok) {
            const result = await response.json();
            return result.data || [];
          }
          return [];
        });

        const allMilestonesArrays = await Promise.all(allMilestonesPromises);
        const flattenedMilestones = allMilestonesArrays.flat();
        setAllMilestones(flattenedMilestones);
      } catch (err) {
        console.error('Failed to fetch all milestones:', err);
      }
    };

    fetchAllMilestones();
  }, [profile?.registrationId, currentAgeGroup]); // Refetch when current age group changes

  // Seed milestones for an age group
  const seedAgeGroupMilestones = async (ageGroup: string) => {
    if (!profile?.registrationId) return;

    setSeedingMilestones(true);
    try {
      // First fetch templates for this age group
      const templatesResponse = await fetch(
        `http://localhost:8000/cms/milestone-templates/${encodeURIComponent(ageGroup)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("wt18_token")}`,
          },
        }
      );

      if (!templatesResponse.ok) {
        throw new Error('Failed to fetch milestone templates');
      }

      const templatesResult = await templatesResponse.json();
      const templates = templatesResult.data || [];

      if (templates.length === 0) {
        throw new Error('No templates found for this age group');
      }

      // Add expectedAgeMonths to templates based on age group (templates already have this field)
      const templatesWithAge = templates.map((template: any) => ({
        ...template,
        expectedAgeMonths: template.expectedAgeMonths || getExpectedAgeForGroup(ageGroup)
      }));

      // Seed milestones
      const response = await fetch(
        'http://localhost:8000/dashboard/development-milestones/seed',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("wt18_token")}`,
          },
          body: JSON.stringify({
            registrationId: profile.registrationId,
            ageGroup,
            templates: templatesWithAge,
          }),
        }
      );

      if (response.ok) {
        const seedResult = await response.json();
        
        // Refresh milestones for this age group
        const refreshResponse = await fetch(
          `http://localhost:8000/dashboard/milestones/${profile.registrationId}?ageGroup=${encodeURIComponent(ageGroup)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("wt18_token")}`,
            },
          }
        );

        if (refreshResponse.ok) {
          const refreshResult = await refreshResponse.json();
          setMilestones(refreshResult.data || []);
          
          // Also refresh allMilestones for overall progress
          const allMilestonesPromises = AGE_GROUPS.map(async (group) => {
            const response = await fetch(
              `http://localhost:8000/dashboard/milestones/${profile.registrationId}?ageGroup=${encodeURIComponent(group.key)}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("wt18_token")}`,
                },
              }
            );
            if (response.ok) {
              const result = await response.json();
              return result.data || [];
            }
            return [];
          });
          const allMilestonesArrays = await Promise.all(allMilestonesPromises);
          setAllMilestones(allMilestonesArrays.flat());
        }
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to seed milestones: ${response.status}`);
      }
    } catch (err) {
      alert(`Failed to load milestones: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSeedingMilestones(false);
    }
  };

  // Get expected age for age group (fallback)
  const getExpectedAgeForGroup = (ageGroup: string): number => {
    switch (ageGroup) {
      case '0-1 years': return 6;
      case '1-3 years': return 24;
      case '3-5 years': return 48;
      case '5-12 years': return 96;
      case '13-18 years': return 180;
      default: return 12;
    }
  };

  // Update milestone status with progress flow
  const updateMilestoneStatus = async (milestoneId: string, newStatus: string) => {
    setUpdatingMilestone(milestoneId);
    try {
      const response = await fetch(
        `http://localhost:8000/dashboard/milestones/update/${milestoneId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("wt18_token")}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Update local state for current age group
        setMilestones(prev =>
          prev.map(m =>
            m._id === milestoneId
              ? { 
                  ...m, 
                  status: newStatus as 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'DELAYED',
                  achievedDate: newStatus === 'ACHIEVED' ? new Date().toISOString() : m.achievedDate
                }
              : m
          )
        );
        // Also update allMilestones for overall progress
        setAllMilestones(prev =>
          prev.map(m =>
            m._id === milestoneId
              ? { 
                  ...m, 
                  status: newStatus as 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'DELAYED',
                  achievedDate: newStatus === 'ACHIEVED' ? new Date().toISOString() : m.achievedDate
                }
              : m
          )
        );
      } else {
        const errorText = await response.text();
        alert(`Failed to update milestone: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      alert(`Error updating milestone: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUpdatingMilestone(null);
    }
  };

  // Get next status in progression
  const getNextStatus = (currentStatus: string): string => {
    switch (currentStatus) {
      case 'NOT_STARTED': return 'IN_PROGRESS';
      case 'IN_PROGRESS': return 'ACHIEVED';
      case 'ACHIEVED': return 'NOT_STARTED'; // Reset to start
      case 'DELAYED': return 'IN_PROGRESS'; // From delayed, go to in progress
      default: return 'NOT_STARTED';
    }
  };

  // Get status progress percentage
  const getStatusProgress = (status: string): number => {
    switch (status) {
      case 'NOT_STARTED': return 0;
      case 'IN_PROGRESS': return 50;
      case 'ACHIEVED': return 100;
      case 'DELAYED': return 25;
      default: return 0;
    }
  };

  // Update milestone notes
  const updateMilestoneNotes = async (milestoneId: string, notes: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/dashboard/milestones/notes/${milestoneId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("wt18_token")}`,
          },
          body: JSON.stringify({ notes }),
        }
      );

      if (response.ok) {
        // Update local state for current age group
        setMilestones(prev =>
          prev.map(m =>
            m._id === milestoneId ? { ...m, notes } : m
          )
        );
        // Also update allMilestones
        setAllMilestones(prev =>
          prev.map(m =>
            m._id === milestoneId ? { ...m, notes } : m
          )
        );
        setShowNotesModal(null);
        setNoteText('');
      } else {
        const errorText = await response.text();
        alert(`Failed to update notes: ${response.status}`);
      }
    } catch (err) {
      alert(`Error updating notes: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  // Filter milestones by selected age group
  const filteredMilestones = milestones.filter(m => m.ageGroup === selectedAgeGroup);

  // Group by type
  const groupedMilestones = filteredMilestones.reduce((acc, m) => {
    if (!acc[m.type]) acc[m.type] = [];
    acc[m.type].push(m);
    return acc;
  }, {} as Record<string, Milestone[]>);

  // Get current age group order
  const currentAgeGroupOrder = AGE_GROUPS.find(g => g.key === currentAgeGroup)?.order || 1;
  
  // Calculate if an age group is completed (all previous age groups)
  const isAgeGroupCompleted = (ageGroupKey: string): boolean => {
    const groupOrder = AGE_GROUPS.find(g => g.key === ageGroupKey)?.order || 0;
    return groupOrder < currentAgeGroupOrder;
  };

  // Calculate if an age group is locked (future age groups)
  const isAgeGroupLocked = (ageGroupKey: string): boolean => {
    const groupOrder = AGE_GROUPS.find(g => g.key === ageGroupKey)?.order || 0;
    return groupOrder > currentAgeGroupOrder;
  };

  // Calculate overall progress including completed age groups
  const calculateOverallProgress = () => {
    let totalCompleted = 0;
    let totalMilestones = 0;

    console.log('🔍 Calculating overall progress...');
    console.log('Current age group:', currentAgeGroup);
    console.log('All milestones count:', allMilestones.length);

    // Count ACTUAL completions from previous + current age groups
    // Total includes ALL age groups (0-18 years)
    AGE_GROUPS.forEach((group) => {
      const groupMilestones = allMilestones.filter(m => m.ageGroup === group.key);
      const groupCompleted = groupMilestones.filter(m => m.status === 'ACHIEVED').length;
      
      const isCompleted = isAgeGroupCompleted(group.key);
      const isCurrent = group.key === currentAgeGroup;
      const isLocked = isAgeGroupLocked(group.key);
      
      console.log(`📊 ${group.label}:`, {
        total: groupMilestones.length,
        completed: groupCompleted,
        isCompleted,
        isCurrent,
        isLocked
      });
      
      // Only process if this group has milestones loaded
      if (groupMilestones.length > 0) {
        // Add to total for ALL age groups (including future)
        totalMilestones += groupMilestones.length;
        
        // Only count completions from previous + current age groups
        if (isCompleted || isCurrent) {
          totalCompleted += groupCompleted;
        }
        // Future age groups contribute to total but not to completed count
      }
    });

    console.log('📈 Overall:', { totalCompleted, totalMilestones });

    return {
      completed: totalCompleted,
      total: totalMilestones,
      percentage: totalMilestones > 0 ? Math.round((totalCompleted / totalMilestones) * 100) : 0
    };
  };

  const overallProgress = calculateOverallProgress();

  // Calculate progress for selected age group
  const totalInGroup = filteredMilestones.length;
  const completedInGroup = filteredMilestones.filter(m => 
    m.status === 'ACHIEVED'
  ).length;
  const inProgressInGroup = filteredMilestones.filter(m => 
    m.status === 'IN_PROGRESS'
  ).length;
  const delayedInGroup = filteredMilestones.filter(m => m.status === 'DELAYED').length;
  const progressPct = totalInGroup > 0 ? Math.round((completedInGroup / totalInGroup) * 100) : 0;

  // Check if milestone is delayed
  const isMilestoneDelayed = (milestone: Milestone): boolean => {
    return milestone.status === 'DELAYED' || 
           (milestone.status !== 'ACHIEVED' && 
            childAgeInMonths > milestone.expectedAgeMonths);
  };

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

      {/* Current Age Group Progress Bar */}
      {selectedAgeGroup && selectedAgeGroup === currentAgeGroup && filteredMilestones.length > 0 && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              {AGE_GROUPS.find(g => g.key === selectedAgeGroup)?.label} Progress
            </span>
            <span className="text-2xl font-bold text-primary">{progressPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {completedInGroup} completed • {inProgressInGroup} in progress • {totalInGroup - completedInGroup - inProgressInGroup - delayedInGroup} not started
            {delayedInGroup > 0 && ` • ${delayedInGroup} delayed`}
          </div>
        </div>
      )}

      {/* Completed Age Group Notice */}
      {selectedAgeGroup && isAgeGroupCompleted(selectedAgeGroup) && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex gap-3">
            <Check className="h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">✅ Age Group Completed & Locked</p>
              <p className="mt-1 text-xs text-green-700">
                Your child has passed this developmental stage. This age group is now locked and all milestones are marked as completed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner - Only show when testing mode is disabled */}
      {false && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 shrink-0 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-blue-900">🔓 All Age Groups Unlocked (Testing Mode)</p>
              <p className="mt-1 text-xs text-blue-700">
                All age groups are temporarily unlocked for testing purposes. 
                Use YES/NO buttons to track achievements and test the milestone functionality.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Age Group Tabs */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <p className="text-sm text-slate-600">
            Select an age group to view milestones. 
            <span className="ml-1 text-xs text-slate-500">
              (✅ = Completed & Locked, 🔒 = Not Yet Available)
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {AGE_GROUPS.map((group) => {
            const isCurrent = group.key === currentAgeGroup;
            const isSelected = group.key === selectedAgeGroup;
            const isCompleted = isAgeGroupCompleted(group.key);
            const isLocked = isAgeGroupLocked(group.key);
            const isDisabled = isCompleted || isLocked; // Lock both completed and future groups

            return (
              <button
                key={group.key}
                onClick={() => !isDisabled && setSelectedAgeGroup(group.key)}
                disabled={isDisabled}
                title={
                  isCompleted
                    ? "This age group is completed and locked"
                    : isLocked 
                    ? "This age group will unlock as your child grows" 
                    : isCurrent 
                    ? "Current age group - Click to view milestones" 
                    : ""
                }
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isCompleted
                    ? "cursor-not-allowed border border-green-300 bg-green-100 text-green-600 opacity-70"
                    : isLocked
                    ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 opacity-60"
                    : isSelected
                    ? "bg-primary text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{group.emoji}</span>
                <span>{group.label}</span>
                {isCompleted && <span className="text-xs">✅</span>}
                {isCurrent && !isCompleted && <TrendingUp className="h-3 w-3" />}
                {isLocked && <span className="text-xs">🔒</span>}
              </button>
            );
          })}
        </div>
      </div>
      {/* Quick Summary - Only for current age group */}
      {selectedAgeGroup && selectedAgeGroup === currentAgeGroup && filteredMilestones.length > 0 && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{completedInGroup}</div>
            <div className="text-xs text-green-600">Achieved</div>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{inProgressInGroup}</div>
            <div className="text-xs text-blue-600">In Progress</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
            <div className="text-2xl font-bold text-slate-700">{totalInGroup - completedInGroup - inProgressInGroup - delayedInGroup}</div>
            <div className="text-xs text-slate-600">Not Started</div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{delayedInGroup}</div>
            <div className="text-xs text-red-600">Delayed</div>
          </div>
        </div>
      )}

      {/* Completed Age Group Summary */}
      {selectedAgeGroup && isAgeGroupCompleted(selectedAgeGroup) && filteredMilestones.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4">
          <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 text-center">
            <div className="mb-2 text-4xl">🎉</div>
            <div className="text-3xl font-bold text-green-700">{filteredMilestones.length}</div>
            <div className="text-sm font-medium text-green-600">Milestones Completed</div>
            <div className="mt-2 text-xs text-green-600">
              Your child has successfully passed this developmental stage!
            </div>
          </div>
        </div>
      )}

      {/* Delay Warning */}
      {delayedInGroup > 0 && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-900">⚠️ Delayed Milestones Detected</p>
              <p className="mt-1 text-xs text-red-700">
                {delayedInGroup} milestone{delayedInGroup > 1 ? 's are' : ' is'} delayed. 
                Please consult your pediatrician for guidance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State for Age Group */}
      {selectedAgeGroup && loadingMilestones && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-slate-600">Loading milestones for {selectedAgeGroup}...</p>
        </div>
      )}

      {/* Seed Button - Only show if no milestones and not locked */}
      {selectedAgeGroup && filteredMilestones.length === 0 && !loadingMilestones && !isAgeGroupCompleted(selectedAgeGroup) && !isAgeGroupLocked(selectedAgeGroup) && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Milestones Found</h3>
            <p className="text-sm text-slate-600">
              Milestones should have been automatically loaded when you registered.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              If you're seeing this message, click the button below to manually load milestones.
            </p>
          </div>
          <button
            onClick={() => seedAgeGroupMilestones(selectedAgeGroup)}
            disabled={seedingMilestones}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {seedingMilestones ? (
              <>
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                Loading Milestones...
              </>
            ) : (
              <>
                <span className="mr-2">📋</span>
                Load Milestones for {selectedAgeGroup}
              </>
            )}
          </button>
          {seedingMilestones && (
            <p className="mt-3 text-xs text-slate-500">
              This may take a few seconds while we set up your child's developmental milestones...
            </p>
          )}
        </div>
      )}

      {/* Milestones by Type */}
      {selectedAgeGroup && filteredMilestones.length > 0 && (
        <div className="space-y-6">
          {Object.entries(MILESTONE_TYPES).map(([type, config]) => {
            const typeMilestones = groupedMilestones[type] || [];
            if (typeMilestones.length === 0) return null;

            const typeCompleted = typeMilestones.filter(m => 
              m.status === 'ACHIEVED'
            ).length;
            const isGroupCompleted = isAgeGroupCompleted(selectedAgeGroup);

            return (
              <div key={type} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-2xl">{config.icon}</span>
                  <h3 className="text-lg font-medium text-slate-900">{config.label} Development</h3>
                  <span className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
                    isGroupCompleted ? 'bg-green-100 text-green-700' : config.color
                  }`}>
                    {isGroupCompleted ? `${typeMilestones.length} / ${typeMilestones.length}` : `${typeCompleted} / ${typeMilestones.length}`}
                  </span>
                </div>

                <div className="space-y-3">
                  {typeMilestones
                    .sort((a, b) => a.order - b.order)
                    .map((milestone) => {
                      const statusConfig = STATUS_CONFIG[milestone.status] || STATUS_CONFIG.NOT_STARTED;
                      const Icon = statusConfig.icon;
                      const isDelayed = isMilestoneDelayed(milestone);
                      const finalStatusConfig = isDelayed ? STATUS_CONFIG.DELAYED : statusConfig;
                      
                      // For completed age groups, show all as completed
                      const displayStatus = isGroupCompleted ? STATUS_CONFIG.COMPLETED : finalStatusConfig;
                      const DisplayIcon = isGroupCompleted ? Check : Icon;

                      return (
                        <div
                          key={milestone._id}
                          className={`flex items-start gap-4 rounded-lg border p-4 transition-all ${
                            isGroupCompleted 
                              ? 'border-green-200 bg-green-50/50' 
                              : isDelayed 
                              ? 'border-red-200 bg-red-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${displayStatus.bg}`}>
                            <DisplayIcon className={`h-5 w-5 ${displayStatus.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-900">{milestone.title}</h4>
                                <p className="mt-1 text-sm text-slate-600">{milestone.description}</p>
                                
                                {/* Progress Bar - Only show for current age group */}
                                {!isGroupCompleted && (
                                  <div className="mt-3 mb-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-slate-500">Progress</span>
                                      <span className="text-xs font-medium text-slate-700">{getStatusProgress(milestone.status)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2 cursor-pointer" 
                                         onClick={() => updateMilestoneStatus(milestone._id, getNextStatus(milestone.status))}>
                                      <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                          milestone.status === 'ACHIEVED' ? 'bg-green-500' :
                                          milestone.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                          milestone.status === 'DELAYED' ? 'bg-red-500' : 'bg-slate-300'
                                        }`}
                                        style={{ width: `${getStatusProgress(milestone.status)}%` }}
                                      />
                                    </div>
                                    <div className="flex justify-between mt-1 text-xs text-slate-400">
                                      <span>Not Started</span>
                                      <span>In Progress</span>
                                      <span>Achieved</span>
                                    </div>
                                  </div>
                                )}

                                {isGroupCompleted && (
                                  <p className="mt-2 text-xs text-green-600">
                                    ✅ Completed as part of {AGE_GROUPS.find(g => g.key === selectedAgeGroup)?.label} developmental stage
                                  </p>
                                )}

                                {!isGroupCompleted && milestone.achievedDate && (
                                  <p className="mt-1 text-xs text-green-600">
                                    ✅ Achieved on {new Date(milestone.achievedDate).toLocaleDateString('en-IN')}
                                  </p>
                                )}
                                {!isGroupCompleted && milestone.notes && (
                                  <p className="mt-1 text-xs text-slate-500 italic">
                                    📝 {milestone.notes}
                                  </p>
                                )}
                                {!isGroupCompleted && isDelayed && (
                                  <p className="mt-1 text-xs text-red-600">
                                    ⚠️ Expected by {milestone.expectedAgeMonths} months. Please consult pediatrician.
                                  </p>
                                )}
                              </div>
                              {!isGroupCompleted && (
                                <span className={`ml-4 rounded-full px-2 py-1 text-xs font-medium ${finalStatusConfig.badgeColor}`}>
                                  {finalStatusConfig.label}
                                </span>
                              )}
                              {isGroupCompleted && (
                                <span className="ml-4 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                          {!isGroupCompleted && (
                            <div className="flex flex-col gap-2">
                              {/* Status Button */}
                              <button
                                onClick={() => updateMilestoneStatus(milestone._id, getNextStatus(milestone.status))}
                                disabled={updatingMilestone === milestone._id}
                                className={`rounded-lg px-3 py-2 text-xs font-medium transition-all disabled:opacity-50 ${
                                  milestone.status === 'ACHIEVED'
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : milestone.status === 'IN_PROGRESS'
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : milestone.status === 'DELAYED'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {updatingMilestone === milestone._id ? (
                                  <Loader2 className="inline h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    {milestone.status === 'NOT_STARTED' && '▶️ Start'}
                                    {milestone.status === 'IN_PROGRESS' && '✅ Complete'}
                                    {milestone.status === 'ACHIEVED' && '🔄 Reset'}
                                    {milestone.status === 'DELAYED' && '▶️ Resume'}
                                  </>
                                )}
                              </button>
                              {/* Notes Button */}
                              <button
                                onClick={() => {
                                  setShowNotesModal(milestone._id);
                                  setNoteText(milestone.notes || '');
                                }}
                                className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                              >
                                <MessageSquare className="inline h-3 w-3 mr-1" />
                                Notes
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">Add Notes</h3>
              <button
                onClick={() => {
                  setShowNotesModal(null);
                  setNoteText('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add any observations or notes about this milestone..."
              className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              rows={4}
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => updateMilestoneNotes(showNotesModal, noteText)}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Save Notes
              </button>
              <button
                onClick={() => {
                  setShowNotesModal(null);
                  setNoteText('');
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Notice */}
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-xs leading-relaxed text-amber-800">
            Every child develops at their own pace. These milestones are general guidelines. 
            Consult your pediatrician if you have concerns about your child's development or see delayed milestones.
          </p>
        </div>
      </div>
    </div>
  );
}