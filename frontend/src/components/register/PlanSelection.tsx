"use client";

import { Check, Sparkles } from "lucide-react";

export type SubscriptionPlan = "ANNUAL" | "FIVE_YEAR";

interface PlanSelectionProps {
  selectedPlan: SubscriptionPlan;
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

const PLANS = {
  ANNUAL: {
    id: "ANNUAL" as const,
    name: "Annual Plan",
    duration: "1 Year",
    price: 249,
    pricePerMonth: 21,
    features: [
      "Complete vaccination tracking",
      "Development milestone monitoring",
      "Health records management",
      "Email & SMS reminders",
      "Go Green tree planting",
      "1 year access to all features",
    ],
    popular: false,
  },
  FIVE_YEAR: {
    id: "FIVE_YEAR" as const,
    name: "5-Year Plan",
    duration: "5 Years",
    price: 999,
    pricePerMonth: 17,
    originalPrice: 1245,
    savings: 246,
    savingsPercent: 20,
    features: [
      "Complete vaccination tracking",
      "Development milestone monitoring",
      "Health records management",
      "Email & SMS reminders",
      "Go Green tree planting",
      "5 years access to all features",
      "Priority support",
      "Save ₹246 (20% off)",
    ],
    popular: true,
  },
};

export default function PlanSelection({ selectedPlan, onSelectPlan }: PlanSelectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.values(PLANS).map((plan) => {
        const isSelected = selectedPlan === plan.id;
        
        return (
          <div
            key={plan.id}
            onClick={() => onSelectPlan(plan.id)}
            className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 ${
              isSelected
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                : "border-slate-200 bg-white hover:border-primary/50 hover:shadow-md"
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-xs font-bold text-white shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  <span>MOST POPULAR</span>
                </div>
              </div>
            )}

            {/* Selection Indicator */}
            <div className="absolute right-4 top-4">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isSelected && <Check className="h-4 w-4 text-white" />}
              </div>
            </div>

            {/* Plan Header */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <p className="text-sm text-slate-600">{plan.duration}</p>
            </div>

            {/* Pricing */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">₹{plan.price}</span>
                {'originalPrice' in plan && plan.originalPrice && (
                  <span className="text-lg text-slate-400 line-through">
                    ₹{plan.originalPrice}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                ₹{plan.pricePerMonth}/month
              </p>
              {'savings' in plan && plan.savings && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  <span>💰 Save ₹{plan.savings}</span>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Select Button */}
            <button
              type="button"
              className={`mt-6 w-full rounded-full py-3 font-semibold transition-all ${
                isSelected
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isSelected ? "Selected" : "Select Plan"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
