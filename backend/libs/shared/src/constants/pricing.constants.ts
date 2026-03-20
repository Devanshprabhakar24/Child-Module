/** Subscription Plans */
export const SUBSCRIPTION_PLANS = {
  ANNUAL: {
    id: 'ANNUAL',
    name: 'Annual Plan',
    duration: '1 Year',
    price: 249,
    basePrice: 211.02, // Before 18% GST
    gstAmount: 37.98,
    features: [
      'Complete vaccination tracking',
      'Development milestone monitoring',
      'Health records management',
      'Email & SMS reminders',
      'Go Green tree planting',
      '1 year access to all features',
    ],
    popular: false,
  },
  FIVE_YEAR: {
    id: 'FIVE_YEAR',
    name: '5-Year Plan',
    duration: '5 Years',
    price: 999,
    basePrice: 846.61, // Before 18% GST
    gstAmount: 152.39,
    savings: 246, // Save ₹246 compared to 5 annual plans (5 × 249 = 1245)
    savingsPercent: 20,
    features: [
      'Complete vaccination tracking',
      'Development milestone monitoring',
      'Health records management',
      'Email & SMS reminders',
      'Go Green tree planting',
      '5 years access to all features',
      'Priority support',
      'Save ₹246 (20% off)',
    ],
    popular: true,
  },
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;

/** Default plan (5-Year is recommended) */
export const DEFAULT_PLAN: SubscriptionPlanId = 'FIVE_YEAR';

/** Legacy constant for backward compatibility */
export const SUBSCRIPTION_TOTAL_PRICE = SUBSCRIPTION_PLANS.FIVE_YEAR.price;
export const SUBSCRIPTION_BASE_PRICE = SUBSCRIPTION_PLANS.FIVE_YEAR.basePrice;
export const GST_RATE = 0.18; // 18% GST
export const GST_AMOUNT = SUBSCRIPTION_PLANS.FIVE_YEAR.gstAmount;
export const CURRENCY = 'INR';

/** Pricing breakdown by age group (for backward compatibility) */
export const PRICING_BREAKDOWN = {
  '0-5': { label: '0–5 Years', totalPrice: 999, basePrice: 846.61, gstAmount: 152.39 },
  '6-12': { label: '6–12 Years', totalPrice: 999, basePrice: 846.61, gstAmount: 152.39 },
  '13-18': { label: '13–18 Years', totalPrice: 999, basePrice: 846.61, gstAmount: 152.39 },
} as const;

/** Channel Partner commission rates */
export const COMMISSION = {
  CHILD_REGISTRATION: { min: 175, max: 225, flat: 200 }, // ₹175-225 per child registration
  MATERNAL_REGISTRATION: { flat: 25 }, // ₹25 per maternal registration
} as const;

/** Commission unlock targets */
export const COMMISSION_TARGETS = {
  STATE: 3000,
  DISTRICT: 1000,
  INDIVIDUAL: 300,
} as const;
