"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import PlanSelection, { type SubscriptionPlan } from "./PlanSelection";

interface Step3Props {
  onNext: () => void;
  onPrev: () => void;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  selectedPlan?: SubscriptionPlan;
}

export default function Step3Form({ onNext, onPrev, onSelectPlan, selectedPlan = "FIVE_YEAR" }: Step3Props) {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(selectedPlan);

  const handlePlanChange = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    onSelectPlan(plan);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-8 p-6 md:p-8">
        
        {/* Plan Selection Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Plan</h2>
          <p className="text-slate-600">Select the subscription plan that works best for your family</p>
        </div>

        {/* Plan Cards */}
        <PlanSelection 
          selectedPlan={currentPlan} 
          onSelectPlan={handlePlanChange} 
        />

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 border-t border-slate-100 pt-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Money-back Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>

      {/* Form Footer Actions */}
      <div className="flex flex-col gap-6 border-t border-slate-200 bg-slate-50 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onPrev}
            className="flex items-center gap-2 font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-white shadow-lg shadow-primary/30 transition-all hover:brightness-110 md:px-10"
          >
            Continue
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </form>
  );
}
