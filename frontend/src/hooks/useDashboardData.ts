"use client";

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface DashboardChild {
  registrationId: string;
  childName: string;
  childGender: string;
  ageGroup: string;
  ageInYears: number;
  state?: string;
  profilePictureUrl?: string;
  nextDueMilestone?: {
    title: string;
    dueDate: string;
  } | null;
}

export interface DashboardMilestone {
  _id: string;
  title: string;
  description?: string;
  vaccineName?: string;
  category: string;
  status: string;
  dueDate: string;
  completedDate?: string;
  notes?: string;
}

interface UseDashboardDataResult {
  loading: boolean;
  error: string | null;
  children: DashboardChild[];
  selectedChild?: DashboardChild;
  milestones: DashboardMilestone[];
}

export function useDashboardData(): UseDashboardDataResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [children, setChildren] = useState<DashboardChild[]>([]);
  const [selectedRegId, setSelectedRegId] = useState<string | undefined>(undefined);
  const [milestones, setMilestones] = useState<DashboardMilestone[]>([]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("wt18_token") : null;
    if (!token) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Get registration ID from URL parameter first
        let regId: string | null = null;
        
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          regId = params.get("id");
          console.log("Dashboard - URL parameter ID:", regId);
        }

        // 1) Family children
        const familyRes = await fetch(`${API_BASE}/dashboard/family`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (familyRes.status === 401) {
          localStorage.removeItem("wt18_token");
          localStorage.removeItem("wt18_user");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return;
        }

        const familyJson = await familyRes.json().catch(() => ({}));
        const familyData = familyJson.data || familyJson;
        const kids: DashboardChild[] = familyData.children || familyData || [];

        setChildren(kids);
        
        // If no ID in URL, fall back to first child
        if (!regId) {
          regId = kids[0]?.registrationId;
          console.log("Dashboard - No URL ID, using first child:", regId);
        }
        
        if (!regId) {
          setMilestones([]);
          return;
        }
        
        console.log("Dashboard - Using registration ID:", regId);
        setSelectedRegId(regId);

        // 2) Milestones for selected child
        const milRes = await fetch(
          `${API_BASE}/dashboard/milestones/${encodeURIComponent(regId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );

        if (!milRes.ok) {
          // If the registration ID doesn't exist, fall back to first child
          if (milRes.status === 404 && kids.length > 0) {
            const fallbackId = kids[0]?.registrationId;
            console.log("Dashboard - Registration not found, falling back to:", fallbackId);
            
            if (fallbackId && typeof window !== "undefined") {
              // Update URL to correct registration ID
              const newUrl = `${window.location.pathname}?id=${fallbackId}`;
              window.history.replaceState({}, '', newUrl);
              setSelectedRegId(fallbackId);
              
              // Fetch milestones for fallback child
              const fallbackMilRes = await fetch(
                `${API_BASE}/dashboard/milestones/${encodeURIComponent(fallbackId)}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  signal: controller.signal,
                },
              );
              
              if (fallbackMilRes.ok) {
                const milJson = await fallbackMilRes.json().catch(() => ({}));
                const milData = milJson.data || milJson;
                setMilestones(Array.isArray(milData) ? milData : []);
              }
            }
            return;
          }
          
          const mErr = await milRes.json().catch(() => ({}));
          throw new Error(mErr.message || "Failed to load milestones");
        }

        const milJson = await milRes.json().catch(() => ({}));
        const milData = milJson.data || milJson;
        setMilestones(Array.isArray(milData) ? milData : []);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, []);

  const selectedChild =
    children.find((c) => c.registrationId === selectedRegId) || children[0];

  return { loading, error, children, selectedChild, milestones };
}

