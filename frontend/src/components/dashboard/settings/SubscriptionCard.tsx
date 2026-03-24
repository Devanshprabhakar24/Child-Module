"use client";

import { useState, useEffect } from "react";
import { CreditCard, Receipt, BadgeCheck, Download, Loader2, FileText, TrendingUp, Sparkles } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

interface SubscriptionData {
  plan: 'ANNUAL' | 'FIVE_YEAR';
  amount: number;
  registrationId: string;
  registrationDate: string;
  renewalDate?: string;
}

const PLAN_DETAILS = {
  ANNUAL: {
    name: 'Annual Plan',
    duration: '1 Year',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  FIVE_YEAR: {
    name: '5-Year Plan',
    duration: '5 Years',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
  },
};

export default function SubscriptionCard() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const token = localStorage.getItem("wt18_token");
      if (!token) {
        console.warn("No auth token found");
        setLoading(false);
        return;
      }

      // First, try to get registration ID from storage
      let registrationId = sessionStorage.getItem("wt18_reg_id") || localStorage.getItem("wt18_reg_id");
      
      // If no registration ID in storage, fetch from family dashboard
      if (!registrationId) {
        console.log("No registration ID in storage, fetching from family dashboard...");
        
        try {
          // Fetch family dashboard to get children (uses auth token to identify user)
          const familyResponse = await fetch(`${API_BASE}/dashboard/family`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (familyResponse.ok) {
            const familyData = await familyResponse.json();
            console.log("Family dashboard data:", familyData);
            
            if (familyData.success && familyData.data.children && familyData.data.children.length > 0) {
              registrationId = familyData.data.children[0].registrationId;
              // Store it for future use
              sessionStorage.setItem("wt18_reg_id", registrationId);
              localStorage.setItem("wt18_reg_id", registrationId);
              console.log("Got registration ID from family dashboard:", registrationId);
            }
          } else {
            console.error("Family dashboard request failed:", familyResponse.status);
          }
        } catch (e) {
          console.error("Failed to fetch from family dashboard:", e);
        }
      }
      
      if (!registrationId) {
        console.warn("No registration ID found after all attempts");
        setLoading(false);
        return;
      }

      console.log("Fetching subscription for registration ID:", registrationId);

      // Fetch registration details from the backend
      const response = await fetch(`${API_BASE}/registration/${registrationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        console.error("Failed to fetch subscription data:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Failed to fetch subscription data");
      }

      const data = await response.json();
      console.log("Registration data received:", data);
      
      if (!data.success || !data.data) {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format");
      }
      
      const registration = data.data;

      // Check if payment is completed
      if (registration.paymentStatus !== 'COMPLETED') {
        console.warn("Payment not completed for this registration:", registration.paymentStatus);
        setLoading(false);
        return;
      }

      // Calculate renewal date
      const regDate = new Date(registration.createdAt);
      const renewalDate = new Date(regDate);
      if (registration.subscriptionPlan === 'ANNUAL') {
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      } else {
        renewalDate.setFullYear(renewalDate.getFullYear() + 5);
      }

      setSubscription({
        plan: registration.subscriptionPlan || 'FIVE_YEAR',
        amount: registration.subscriptionAmount || 999,
        registrationId: registration.registrationId,
        registrationDate: regDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        renewalDate: renewalDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      });
      
      console.log("Subscription data loaded successfully");
    } catch (error) {
      console.error("Failed to load subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!subscription) return;

    setDownloading(true);
    try {
      const response = await fetch(`${API_BASE}/payments/invoice/${subscription.registrationId}`);
      
      if (!response.ok) {
        throw new Error("Failed to download invoice");
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `WombTo18-Invoice-${subscription.registrationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice:", error);
      alert("Failed to download invoice. Please try again or contact support.");
    } finally {
      setDownloading(false);
    }
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const handleUpgradeConfirm = () => {
    // Calculate upgrade amount: 5-Year Plan (999) - Annual Plan (249) = 750
    const upgradeAmount = 999 - 249;
    
    // Redirect to payment page with upgrade parameters
    window.location.href = `/payment?upgrade=true&registrationId=${subscription?.registrationId}&amount=${upgradeAmount}`;
  };

  if (loading) {
    return (
      <section>
        <h3 className="mb-4 flex items-center gap-3 text-lg font-medium text-slate-900">
          <CreditCard className="h-6 w-6 text-primary" />
          Subscription
        </h3>
        <div className="flex items-center justify-center rounded-2xl bg-slate-100 p-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </section>
    );
  }

  if (!subscription) {
    return (
      <section>
        <h3 className="mb-4 flex items-center gap-3 text-lg font-medium text-slate-900">
          <CreditCard className="h-6 w-6 text-primary" />
          Subscription
        </h3>
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-600">No active subscription found</p>
          <p className="mt-2 text-xs text-slate-500">
            Please complete payment to activate your subscription
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>
      </section>
    );
  }

  const planDetails = PLAN_DETAILS[subscription.plan];
  const isAnnualPlan = subscription.plan === 'ANNUAL';
  const upgradeSavings = 999 - 249; // Difference between 5-Year and Annual

  return (
    <section>
      <h3 className="mb-4 flex items-center gap-3 text-lg font-medium text-slate-900">
        <CreditCard className="h-6 w-6 text-primary" />
        Subscription
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Plan Header */}
        <div className={`${planDetails.bgColor} border-b ${planDetails.borderColor} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${planDetails.textColor}`}>
                {planDetails.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-600">{planDetails.duration} Subscription</p>
            </div>
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Active
            </div>
          </div>
        </div>

        {/* Amount Display */}
        <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white px-6 py-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900">₹{subscription.amount}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Total amount paid (including GST)
          </p>
        </div>

        {/* Upgrade Banner for Annual Plan Users */}
        {isAnnualPlan && (
          <div className="border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900">Upgrade to 5-Year Plan</h4>
                <p className="mt-1 text-xs text-slate-600">
                  Save ₹246 and get 4 more years of coverage for just ₹{upgradeSavings}
                </p>
                <button
                  onClick={handleUpgrade}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:from-amber-600 hover:to-orange-600"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Details */}
        <div className="space-y-3 px-6 py-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Registration ID:</span>
            <span className="font-medium text-slate-900">{subscription.registrationId}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Registered on:</span>
            <span className="font-medium text-slate-900">{subscription.registrationDate}</span>
          </div>
          {subscription.renewalDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Renews on:</span>
              <span className="font-medium text-slate-900">{subscription.renewalDate}</span>
            </div>
          )}
        </div>

        {/* Download Invoice Button */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading Invoice...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Download Invoice
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Upgrade to 5-Year Plan</h3>
                <p className="text-sm text-slate-600">Extend your coverage and save</p>
              </div>
            </div>

            <div className="mb-6 space-y-3 rounded-xl bg-slate-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Current Plan:</span>
                <span className="font-medium text-slate-900">Annual Plan (₹249)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Upgrade to:</span>
                <span className="font-medium text-slate-900">5-Year Plan (₹999)</span>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Amount already paid:</span>
                  <span className="font-medium text-slate-900">₹249</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="font-semibold text-slate-900">Upgrade amount:</span>
                  <span className="text-lg font-bold text-primary">₹{upgradeSavings}</span>
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <p className="text-xs font-medium text-emerald-700">
                  🎉 You'll save ₹246 compared to buying 5 annual plans!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgradeConfirm}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-amber-600 hover:to-orange-600"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
