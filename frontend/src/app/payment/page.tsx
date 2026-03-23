"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RazorpayPayment from "@/components/payment/RazorpayPayment";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

function PaymentContent() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get("registrationId");
  const isUpgrade = searchParams.get("upgrade") === "true";
  const upgradeAmount = searchParams.get("amount");
  
  const [childName, setChildName] = useState("");
  const [amount, setAmount] = useState(999);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPaymentData = async () => {
      // Check if this is an upgrade payment
      if (isUpgrade && upgradeAmount) {
        const upgradeAmountNum = parseInt(upgradeAmount, 10);
        if (!isNaN(upgradeAmountNum)) {
          setAmount(upgradeAmountNum);
        }

        // Fetch child name from registration for upgrade
        if (registrationId) {
          try {
            const response = await fetch(`${API_BASE}/registration/${registrationId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.data?.childName) {
                setChildName(data.data.childName);
              }
            }
          } catch (error) {
            console.error("Failed to fetch registration data:", error);
          }
        }
      }

      // Load payment data from session storage
      if (typeof window !== "undefined") {
        const storedChildName = sessionStorage.getItem("wt18_child_name");
        const storedPaymentData = sessionStorage.getItem("wt18_payment_data");
        
        if (storedChildName && !isUpgrade) {
          setChildName(storedChildName);
        }
        
        // Only use stored payment data if not an upgrade
        if (!isUpgrade && storedPaymentData) {
          try {
            const paymentData = JSON.parse(storedPaymentData);
            if (paymentData.amount) {
              // Convert paise to rupees (Razorpay returns amount in paise)
              const amountInRupees = Math.round(paymentData.amount / 100);
              setAmount(amountInRupees);
            }
          } catch (e) {
            console.error("Failed to parse payment data:", e);
          }
        }
      }
      
      setLoading(false);
    };

    loadPaymentData();
  }, [isUpgrade, upgradeAmount, registrationId]);

  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      console.log("✅ Payment successful:", paymentId);

      // Store payment ID
      if (typeof window !== "undefined") {
        sessionStorage.setItem("wt18_pay_id", paymentId);
      }

      // For upgrades, redirect to dashboard settings
      if (isUpgrade) {
        if (typeof window !== "undefined") {
          // Clear any cached data to force refresh
          sessionStorage.removeItem("wt18_payment_data");
          window.location.href = "/dashboard/settings?upgraded=true";
        }
        return;
      }

      // Link child to parent user account (for new registrations)
      const token = typeof window !== "undefined" ? localStorage.getItem("wt18_token") : null;
      if (token && registrationId) {
        try {
          const tokenPayload = JSON.parse(atob(token.replace(/-/g, "+").replace(/_/g, "/")));
          const parentUserId: string = tokenPayload.sub;
          if (parentUserId) {
            await fetch(
              `${API_BASE}/registration/${encodeURIComponent(registrationId)}/link-parent/${encodeURIComponent(parentUserId)}`,
              { method: "POST" },
            );
          }
        } catch {
          // non-fatal — dashboard will still work via email match
        }
      }

      // Redirect to success page for new registrations
      if (typeof window !== "undefined") {
        window.location.href = "/success";
      }
    } catch (error) {
      console.error("Post-payment processing error:", error);
      // Still redirect since payment was successful
      if (typeof window !== "undefined") {
        if (isUpgrade) {
          window.location.href = "/dashboard/settings?upgraded=true";
        } else {
          window.location.href = "/success";
        }
      }
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    console.error("Payment error:", errorMessage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!registrationId || !childName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-600 text-2xl">error</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Payment Session Expired</h1>
          <p className="text-slate-600 mb-6">
            Your payment session has expired or is invalid. Please start the registration process again.
          </p>
          <a 
            href="/register" 
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">restart_alt</span>
            Start Registration
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {isUpgrade ? "Upgrade Your Plan" : "Complete Payment"}
            </h1>
            <p className="text-slate-600">
              {isUpgrade 
                ? "Upgrade to 5-Year Plan and extend your coverage" 
                : "Secure your child's health journey with our comprehensive subscription"}
            </p>
          </div>

          {/* Payment Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8">
            
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
                  <span className="text-red-800 font-medium">Payment Failed</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={() => setError("")}
                  className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Razorpay Payment Component */}
            <RazorpayPayment
              registrationId={registrationId}
              childName={childName}
              amount={amount}
              isUpgrade={isUpgrade}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            {/* Back Link */}
            <div className="mt-6 text-center">
              <a 
                href="/register" 
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                ← Back to Registration
              </a>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center text-xs text-slate-500">
            <p>🔒 Your payment is secured by Razorpay with 256-bit SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading payment details...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
