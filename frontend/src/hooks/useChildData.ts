"use client";

import { useEffect, useState } from "react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export interface ChildProfile {
  registrationId: string;
  childName: string;
  childGender: string;
  dateOfBirth: string;
  ageGroup: string;
  ageInYears: number;
  motherName: string;
  fatherName?: string;
  phone: string;
  state: string;
  address?: string;
  bloodGroup?: string;
  heightCm?: number;
  weightKg?: number;
  greenCohort: boolean;
  profilePictureUrl?: string;
}

export interface VaccineMilestone {
  _id: string;
  registrationId: string;
  title: string;
  description?: string;
  vaccineName?: string;
  category: string;
  status: "UPCOMING" | "DUE" | "COMPLETED" | "MISSED";
  dueDate: string;
  completedDate?: string;
  notes?: string;
}

export interface VaccinationTracker {
  total: number;
  completed: number;
  upcoming: number;
  missed: number;
  milestones: VaccineMilestone[];
}

interface UseChildDataResult {
  loading: boolean;
  error: string | null;
  profile: ChildProfile | null;
  vaccination: VaccinationTracker | null;
  milestones: VaccineMilestone[];
  registrationId: string | null;
  token: string | null;
  refetch: () => void;
}

export function useChildData(): UseChildDataResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [vaccination, setVaccination] = useState<VaccinationTracker | null>(null);
  const [milestones, setMilestones] = useState<VaccineMilestone[]>([]);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const tok = localStorage.getItem("wt18_token");
    if (!tok) {
      window.location.href = "/login";
      return;
    }
    setToken(tok);

    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 1) Get family to find first child's registrationId
        const familyRes = await fetch(`${API_BASE}/dashboard/family`, {
          headers: { Authorization: `Bearer ${tok}` },
          signal: controller.signal,
        });

        if (familyRes.status === 401) {
          localStorage.removeItem("wt18_token");
          localStorage.removeItem("wt18_user");
          window.location.href = "/login";
          return;
        }

        const familyJson = await familyRes.json().catch(() => ({}));
        const kids = familyJson.data?.children || familyJson.data || [];
        const regId: string = kids[0]?.registrationId;

        if (!regId) {
          setLoading(false);
          return;
        }
        setRegistrationId(regId);

        // 2) Full child dashboard (profile + vaccination + milestones)
        const [childRes, vacRes, milRes] = await Promise.all([
          fetch(`${API_BASE}/dashboard/child/${encodeURIComponent(regId)}`, {
            headers: { Authorization: `Bearer ${tok}` },
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/dashboard/vaccination/${encodeURIComponent(regId)}`, {
            headers: { Authorization: `Bearer ${tok}` },
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/dashboard/milestones/${encodeURIComponent(regId)}`, {
            headers: { Authorization: `Bearer ${tok}` },
            signal: controller.signal,
          }),
        ]);

        if (childRes.ok) {
          const childJson = await childRes.json();
          setProfile(childJson.data?.profile || null);
        }

        if (vacRes.ok) {
          const vacJson = await vacRes.json();
          setVaccination(vacJson.data || null);
        }

        if (milRes.ok) {
          const milJson = await milRes.json();
          setMilestones(Array.isArray(milJson.data) ? milJson.data : []);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Child data error:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [refreshTrigger]);

  return { loading, error, profile, vaccination, milestones, registrationId, token, refetch };
}
