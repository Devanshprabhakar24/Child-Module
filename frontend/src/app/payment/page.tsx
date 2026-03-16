"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RazorpayCheckout from "@/components/payment/RazorpayCheckout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get("registrationId");
  
  const [paymentData, setPaymentData] = useState<any>(null);
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkTestModeAndLoad = async () => {
      if (typeof window !== "undefined") {
        const storedChildName = sessionStorage.getItem("wt18_child_name");
        const storedPaymentData = sessionStorage.getItem("wt18_payment_data");
        
        if (storedChildName) setChildName(storedChildName);
        if (storedPaymentData) {
          try {
            setPaymentData(JSON.parse(storedPaymentData));
          } catch (e) {
            console.error("Failed to parse payment data:", e);
          }
        }

        // Check if backend is in test mode
        try {
          const testModeResponse = await fetch(`${API_BASE}/payments/test-mode-status`);
          const testModeData = await testModeResponse.json();
          
          if (testModeData.testMode && !testModeData.demoMode && registrationId) {
            // Pure test mode - auto complete
            const testPaymentId = `test_pay_${Date.now()}`;
            setTimeout(() => {
              handlePaymentSuccess(testPaymentId);
            }, 2000); // 2 second delay to show the page briefly
            return;
          }
          // If demoMode is true, let the RazorpayCheckout component handle it
        } catch (error) {
          console.error("Failed to check test mode:", error);
        }
        
        setLoading(false);
      }
    };

    checkTestModeAndLoad();
  }, [registrationId]);

  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      // Link child to parent user account
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

      // Store payment ID and redirect to success
      if (typeof window !== "undefined") {
        sessionStorage.setItem("wt18_pay_id", paymentId);
        window.location.href = "/success";
      }
    } catch (error) {
      console.error("Post-payment processing error:", error);
      // Still redirect to success since payment was successful
      if (typeof window !== "undefined") {
        sessionStorage.setItem("wt18_pay_id", paymentId);
        window.location.href = "/success";
      }
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    console.error("Payment error:", error);
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

  if (!registrationId || !paymentData || !childName) {
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Payment</h1>
            <p className="text-slate-600">
              Secure your child's health journey with our comprehensive subscription
            </p>
          </div>

          {/* Payment Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8">
            
            {/* Registration Details */}
            <div className="mb-6 pb-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Registration Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Child Name:</span>
                  <span className="font-medium">{childName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Registration ID:</span>
                  <span className="font-mono text-xs">{registrationId}</span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
                  <span className="text-red-800 font-medium">Payment Failed</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Razorpay Checkout */}
            <RazorpayCheckout
              registrationId={registrationId}
              childName={childName}
              amount={paymentData.amount}
              currency={paymentData.currency}
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