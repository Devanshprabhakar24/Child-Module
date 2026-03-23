"use client";

import { useState, useEffect } from "react";

/**
 * Razorpay Payment Component
 * 
 * A clean, reusable component for Razorpay payment integration
 * Handles order creation, payment processing, and verification
 */

interface RazorpayPaymentProps {
  registrationId: string;
  childName: string;
  amount: number;
  isUpgrade?: boolean;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export default function RazorpayPayment({
  registrationId,
  childName,
  amount,
  isUpgrade = false,
  onSuccess,
  onError,
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  /**
   * Load Razorpay checkout script
   */
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise<boolean>((resolve) => {
        // Check if already loaded
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }

        // Load script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error("Failed to load Razorpay SDK");
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  /**
   * STEP 1: Create Razorpay Order
   * Calls backend to create order and get order_id
   */
  const createOrder = async (): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }> => {
    try {
      console.log("📦 Creating Razorpay order...");

      const response = await fetch(`${API_BASE}/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          registrationId: registrationId,
          childName: childName,
          isUpgrade: isUpgrade,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      console.log("✅ Order created:", data.data.orderId);
      return data.data;
    } catch (error: any) {
      console.error("❌ Order creation failed:", error);
      throw new Error(error.message || "Failed to create order");
    }
  };

  /**
   * STEP 2: Verify Payment
   * Sends payment details to backend for verification
   */
  const verifyPayment = async (
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<boolean> => {
    try {
      console.log("🔍 Verifying payment...");

      const response = await fetch(`${API_BASE}/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Payment verification failed");
      }

      console.log("✅ Payment verified successfully");
      return true;
    } catch (error: any) {
      console.error("❌ Payment verification failed:", error);
      throw new Error(error.message || "Payment verification failed");
    }
  };

  /**
   * STEP 3: Handle Payment Process
   * Main payment flow: Create order → Open Razorpay → Verify payment
   */
  const handlePayment = async () => {
    if (!razorpayLoaded) {
      onError("Razorpay SDK not loaded. Please refresh the page.");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create order
      const orderData = await createOrder();

      // Step 2: Configure Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "WombTo18",
        description: `Health Subscription for ${childName}`,
        order_id: orderData.orderId,
        
        // Success handler
        handler: async function (response: any) {
          console.log("💳 Payment successful:", response);

          try {
            // Step 3: Verify payment on backend
            await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            // Success callback
            setIsLoading(false);
            onSuccess(response.razorpay_payment_id);
          } catch (error: any) {
            setIsLoading(false);
            onError(error.message || "Payment verification failed");
          }
        },

        // Prefill customer details
        prefill: {
          name: childName,
        },

        // Theme customization
        theme: {
          color: "#10B981", // Primary green color
        },

        // Modal settings
        modal: {
          ondismiss: function () {
            console.log("⚠️ Payment cancelled by user");
            setIsLoading(false);
            onError("Payment cancelled");
          },
        },

        // Additional notes
        notes: {
          registrationId: registrationId,
          childName: childName,
        },
      };

      // Step 4: Open Razorpay checkout
      const razorpay = new window.Razorpay(options);

      // Handle payment failure
      razorpay.on("payment.failed", function (response: any) {
        console.error("❌ Payment failed:", response.error);
        setIsLoading(false);
        onError(
          response.error.description || 
          response.error.reason || 
          "Payment failed"
        );
      });

      // Open payment modal
      razorpay.open();
    } catch (error: any) {
      console.error("💥 Payment process error:", error);
      setIsLoading(false);
      onError(error.message || "Payment failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Child Name:</span>
            <span className="font-medium">{childName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Registration ID:</span>
            <span className="font-mono text-xs">{registrationId}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
            <span className="font-semibold text-slate-900">Total Amount:</span>
            <span className="font-bold text-primary text-lg">₹{amount}</span>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={isLoading || !razorpayLoaded}
        className={`w-full h-14 rounded-full font-semibold text-white shadow-lg transition-all duration-200 ${
          isLoading || !razorpayLoaded
            ? "bg-slate-400 cursor-not-allowed"
            : "bg-primary hover:bg-primary/90 hover:-translate-y-0.5 shadow-primary/20"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : !razorpayLoaded ? (
          <span>Loading Payment Gateway...</span>
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
          <span className="material-symbols-outlined text-sm text-slate-700">
            verified_user
          </span>
          <span className="text-[10px] font-bold uppercase tracking-tight text-slate-700">
            Secure
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-slate-300 px-2 py-1 bg-white">
          <span className="material-symbols-outlined text-sm text-slate-700">
            security
          </span>
          <span className="text-[10px] font-bold uppercase tracking-tight text-slate-700">
            PCI DSS
          </span>
        </div>
      </div>
    </div>
  );
}
