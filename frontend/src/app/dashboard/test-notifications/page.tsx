"use client";

import { useState } from "react";
import { useChildData } from "@/hooks/useChildData";
import { Bell, Syringe, Award, Leaf, CreditCard, Send } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

// Prevent prerendering
export const dynamic = 'force-dynamic';

export default function TestNotificationsPage() {
  const { registrationId, token } = useChildData();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const sendTestNotification = async (type: string) => {
    if (!registrationId || !token) {
      setMessage("Please log in first!");
      return;
    }

    setLoading(type);
    setMessage("");

    try {
      // Get userId from token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub;

      let endpoint = "";
      let body: any = { registrationId, userId };

      switch (type) {
        case "general":
          endpoint = "/test-notifications/send";
          body.type = "general";
          break;
        case "vaccination":
          endpoint = "/test-notifications/vaccination-reminder";
          break;
        case "milestone":
          endpoint = "/test-notifications/milestone";
          break;
        case "go-green":
          endpoint = "/test-notifications/go-green";
          break;
        case "payment":
          endpoint = "/test-notifications/payment";
          break;
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Failed to send notification`);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Test Notifications</h1>
        <p className="mt-2 text-slate-600">
          Click any button below to test real-time notifications. Check the notification bell in the header!
        </p>
      </div>

      {message && (
        <div className={`mb-6 rounded-lg p-4 ${message.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* General Notification */}
        <button
          onClick={() => sendTestNotification("general")}
          disabled={loading === "general"}
          className="flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-primary hover:shadow-lg disabled:opacity-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Bell className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">General Notification</h3>
            <p className="text-sm text-slate-600">Test basic notification</p>
          </div>
        </button>

        {/* Vaccination Reminder */}
        <button
          onClick={() => sendTestNotification("vaccination")}
          disabled={loading === "vaccination"}
          className="flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-primary hover:shadow-lg disabled:opacity-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Syringe className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Vaccination Reminder</h3>
            <p className="text-sm text-slate-600">BCG vaccine due today</p>
          </div>
        </button>

        {/* Milestone Achievement */}
        <button
          onClick={() => sendTestNotification("milestone")}
          disabled={loading === "milestone"}
          className="flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-primary hover:shadow-lg disabled:opacity-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <Award className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Milestone Achievement</h3>
            <p className="text-sm text-slate-600">First smile milestone</p>
          </div>
        </button>

        {/* Go Green Update */}
        <button
          onClick={() => sendTestNotification("go-green")}
          disabled={loading === "go-green"}
          className="flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-primary hover:shadow-lg disabled:opacity-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Leaf className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Go Green Update</h3>
            <p className="text-sm text-slate-600">Earned 50 credits</p>
          </div>
        </button>

        {/* Payment Notification */}
        <button
          onClick={() => sendTestNotification("payment")}
          disabled={loading === "payment"}
          className="flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-primary hover:shadow-lg disabled:opacity-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Payment Success</h3>
            <p className="text-sm text-slate-600">₹999 payment successful</p>
          </div>
        </button>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="mb-3 font-semibold text-slate-900">How to Test:</h3>
        <ol className="space-y-2 text-sm text-slate-600">
          <li>1. Make sure you're logged in</li>
          <li>2. Look at the notification bell icon in the header (top right)</li>
          <li>3. Click any button above to send a test notification</li>
          <li>4. You should see:
            <ul className="ml-6 mt-1 list-disc">
              <li>Red badge with count on the bell icon</li>
              <li>Browser notification (if you allowed permissions)</li>
              <li>Notification sound (if enabled)</li>
            </ul>
          </li>
          <li>5. Click the bell icon to see all notifications</li>
        </ol>
      </div>

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-2 font-semibold text-blue-900">Real Notifications:</h3>
        <p className="text-sm text-blue-800">
          In production, you'll automatically receive notifications when:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-blue-700">
          <li>• Vaccinations are due (7 days before, 1 day before, on due date)</li>
          <li>• Health records are uploaded</li>
          <li>• Milestones are achieved</li>
          <li>• Go Green credits are earned</li>
          <li>• Payments are processed</li>
        </ul>
      </div>
    </div>
  );
}
