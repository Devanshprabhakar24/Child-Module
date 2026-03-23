"use client";

import { useState } from "react";

import Step3Form from "./Step3Form";
import Step4Form from "./Step4Form";
import Step1Form, { ChildDetails } from "./Step1Form";
import Step2Form, { ContactDetails } from "./Step2Form";
import RegistrationProgress from "./RegistrationProgress";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RegistrationFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [childDetails, setChildDetails] = useState<ChildDetails | null>(null);
  const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'ANNUAL' | 'FIVE_YEAR'>('FIVE_YEAR');

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleCompleteRegistration = async () => {
    if (!childDetails || !contactDetails) {
      throw new Error("Please complete previous steps before submitting.");
    }

    const genderMap: Record<ChildDetails["gender"], string> = {
      male: "MALE",
      female: "FEMALE",
      other: "OTHER",
    };

    const phoneDigits = contactDetails.mobile.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      throw new Error("Please enter a valid 10-digit mobile number in Step 2.");
    }

    const payload = {
      childName: childDetails.childName,
      childGender: genderMap[childDetails.gender],
      dateOfBirth: childDetails.dateOfBirth,
      state: childDetails.stateCode.toUpperCase(),
      motherName: childDetails.motherName,
      email: contactDetails.email,
      phone: `+91${phoneDigits}`,
      addressStructured: contactDetails.address,
      registrationType: "DIRECT",
      subscriptionPlan: selectedPlan,
    };

    const res = await fetch(`${API_BASE}/registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Child registration failed. Please try again.");
    }

    const json = await res.json();
    const data = json.data || json;
    const registrationId: string = data.registrationId;

    // Check if backend is in test mode
    const testModeResponse = await fetch(`${API_BASE}/payments/test-mode-status`);
    const testModeData = await testModeResponse.json().catch(() => ({ testMode: false, demoMode: false }));
    
    if (testModeData.testMode && !testModeData.demoMode) {
      // Pure test mode - skip payment and go directly to success
      const testPaymentId = `test_pay_${Date.now()}`;
      
      // Link child to parent user account
      const token = typeof window !== "undefined" ? localStorage.getItem("wt18_token") : null;
      if (token) {
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

      // Store test payment data and redirect to success
      if (typeof window !== "undefined") {
        sessionStorage.setItem("wt18_reg_id", registrationId);
        sessionStorage.setItem("wt18_pay_id", testPaymentId);
        sessionStorage.setItem("wt18_child_name", childDetails.childName);
        sessionStorage.setItem("wt18_reg_date", new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }));
        window.location.href = "/success";
      }
      return;
    }

    // Demo mode or real payment mode - create payment order and redirect to payment
    const paymentResponse = await fetch(`/api/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId, childName: childDetails.childName }),
    });

    if (!paymentResponse.ok) {
      throw new Error("Failed to create payment order");
    }

    const paymentData = await paymentResponse.json();
    if (!paymentData.success) {
      throw new Error(paymentData.message || "Payment order creation failed");
    }

    // Store registration data for payment success handling
    if (typeof window !== "undefined") {
      sessionStorage.setItem("wt18_reg_id", registrationId);
      sessionStorage.setItem("wt18_child_name", childDetails.childName);
      sessionStorage.setItem("wt18_reg_date", new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }));
      sessionStorage.setItem("wt18_payment_data", JSON.stringify(paymentData.data));
      
      // Redirect to payment page
      window.location.href = `/payment?registrationId=${encodeURIComponent(registrationId)}`;
    }
  };

  return (
    <>
      {currentStep === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RegistrationProgress
            title="Child & Mother Details"
            subtitle="Please provide the basic information to start the health journey."
            step={1}
            totalSteps={totalSteps}
          />
          <Step1Form
            onNext={nextStep}
            onComplete={setChildDetails}
          />
        </div>
      )}

      {currentStep === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RegistrationProgress
            title="Contact & Authentication"
            step={2}
            totalSteps={totalSteps}
          />
          <Step2Form
            onNext={nextStep}
            onPrev={prevStep}
            onComplete={setContactDetails}
            motherName={childDetails?.motherName ?? ""}
            stateCode={childDetails?.stateCode}
          />
        </div>
      )}

      {/* Step 3: Multi-Card Dashboard Layout (NO Unified Wrapper!) */}
      {currentStep === 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
            <RegistrationProgress title="Subscription & Pricing" step={3} totalSteps={totalSteps} />
         
          <Step3Form 
            onNext={nextStep} 
            onPrev={prevStep} 
            onSelectPlan={setSelectedPlan}
            selectedPlan={selectedPlan}
          />
        </div>
      )}

      {/* Step 4: Final Consent & Payment */}
      {currentStep === 4 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <RegistrationProgress
              title="Consent & Terms Agreement"
              overline="Final Step"
              step={4}
              totalSteps={totalSteps}
            />
            <Step4Form
              onConfirm={handleCompleteRegistration}
              onPrev={prevStep}
              childName={childDetails?.childName ?? ""}
              selectedPlan={selectedPlan}
            />
          </div>

          {/* Compliance Footer (Only shows on the final step!) */}

        </div>
      )}
    </>
  );
}