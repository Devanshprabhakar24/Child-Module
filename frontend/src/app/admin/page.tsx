"use client";

import { useEffect, useState } from "react";
import { Users, Syringe, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalVaccinations: 0,
    dueVaccinations: 0,
    completedVaccinations: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const token = localStorage.getItem("wt18_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Use admin stats endpoint
      const statsRes = await fetch(`${API_BASE}/dashboard/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!statsRes.ok) throw new Error("Failed to load data");

      const statsData = await statsRes.json();
      const adminStats = statsData.data;

      setStats({
        totalChildren: adminStats.totalChildren || 0,
        totalVaccinations: adminStats.totalVaccinations || 0,
        dueVaccinations: adminStats.dueVaccinations || 0,
        completedVaccinations: adminStats.completedVaccinations || 0,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: "Total Children",
      value: stats.totalChildren,
      icon: Users,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Total Vaccinations",
      value: stats.totalVaccinations,
      icon: Syringe,
      color: "bg-purple-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Due/Upcoming",
      value: stats.dueVaccinations,
      icon: AlertTriangle,
      color: "bg-amber-500",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      title: "Completed",
      value: stats.completedVaccinations,
      icon: CheckCircle,
      color: "bg-green-500",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
    },
  ];

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Overview of vaccination management system
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">
                            {card.title}
                          </p>
                          <p className="mt-2 text-3xl font-bold text-slate-900">
                            {card.value}
                          </p>
                        </div>
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgLight}`}
                        >
                          <Icon className={`h-6 w-6 ${card.textColor}`} />
                        </div>
                      </div>
                    </div>
                    <div className={`h-1 ${card.color}`} />
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Quick Actions
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  href="/admin/vaccinations"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Syringe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Manage Vaccinations
                    </p>
                    <p className="text-xs text-slate-500">
                      Mark vaccines as done
                    </p>
                  </div>
                </Link>

                <Link
                  href="/admin/children"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">View Children</p>
                    <p className="text-xs text-slate-500">
                      All registered children
                    </p>
                  </div>
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Parent Dashboard
                    </p>
                    <p className="text-xs text-slate-500">Switch to parent view</p>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
