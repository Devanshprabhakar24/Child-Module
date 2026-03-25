"use client";

import { useState } from "react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

interface RazorpayCheckoutProps {
  registrationId: string;
  childName: string;
  amount: number;
  currency: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayCheckout({
  registrationId,
  childName,
  amount,
  currency,
  onSuccess,
  onError,
}: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      // Get the order ID from registration (already created during registration)
      const registrationResponse = await fetch(`${API_BASE}/registration/${registrationId}`);
      
      if (!registrationResponse.ok) {
        throw new Error("Failed to fetch registration details");
      }

      const registrationData = await registrationResponse.json();
      
      // Check if response is successful and has data
      if (!registrationData.success || !registrationData.data) {
        throw new Error("Registration not found or invalid response");
      }
      
      const razorpayOrderId = registrationData.data.razorpayOrderId;

      if (!razorpayOrderId) {
        throw new Error("No Razorpay order ID found. Please complete registration first.");
      }

      console.log("🔑 Using Razorpay Order ID:", razorpayOrderId);

      // Razorpay checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SQSUtij8FkBpFV",
        amount: amount * 100, // Amount in paise
        currency: currency,
        name: "WombTo18",
        description: `Health Subscription for ${childName}`,
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          // Payment successful
          console.log("✅ Payment successful:", response);
          
          // Verify payment on backend
          try {
            const verifyResponse = await fetch(`${API_BASE}/registration/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              console.log("✅ Payment verified successfully");
              onSuccess(response.razorpay_payment_id);
            } else {
              console.error("❌ Payment verification failed:", verifyData);
              throw new Error(verifyData.message || "Payment verification failed");
            }
          } catch (verifyError) {
            console.error("Verification error:", verifyError);
            setIsLoading(false);
            onError(verifyError instanceof Error ? verifyError.message : "Payment verification failed");
          }
        },
        prefill: {
          name: childName,
        },
        theme: {
          color: "#10B981", // Primary green color
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            onError("Payment cancelled by user");
          },
        },
        notes: {
          registrationId: registrationId,
          childName: childName,
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        console.error("❌ Payment failed:", response.error);
        setIsLoading(false);
        onError(response.error.description || "Payment failed");
      });

      razorpay.open();

    } catch (error: any) {
      console.error("Payment error:", error);
      onError(error.message || "Payment failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-semibold text-slate-900 mb-2">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Child Name:</span>
            <span className="font-medium">{childName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Registration ID:</span>
            <span className="font-mono text-xs">{registrationId}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2">
            <span className="font-semibold text-slate-900">Total Amount:</span>
            <span className="font-bold text-primary">₹{amount}</span>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`w-full h-14 rounded-full font-semibold text-white shadow-lg transition-all duration-200 ${
          isLoading
            ? "bg-slate-400 cursor-not-allowed"
            : "bg-primary hover:bg-primary/90 hover:-translate-y-0.5 shadow-primary/20"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">payment</span>
            <span>Pay ₹{amount} with Razorpay</span>
          </div>
        )}
      </button>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 opacity-70">
        <div className="flex items-center gap-2">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" 
            alt="Razorpay" 
            className="h-6 w-auto"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-slate-300 px-2 py-1 bg-white">
          <span className="material-symbols-outlined text-sm text-slate-700">verified_user</span>
          <span className="text-[10px] font-bold uppercase tracking-tight text-slate-700">Secure</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-slate-300 px-2 py-1 bg-white">
          <span className="material-symbols-outlined text-sm text-slate-700">security</span>
          <span className="text-[10px] font-bold uppercase tracking-tight text-slate-700">PCI DSS</span>
        </div>
      </div>
    </div>
  );
}