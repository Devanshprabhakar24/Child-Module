/** Flat subscription pricing for all age groups — ₹999 incl. GST */
export const SUBSCRIPTION_TOTAL_PRICE = 999;
export const SUBSCRIPTION_BASE_PRICE = 846.61; // ₹846.61 before GST
export const GST_RATE = 0.18; // 18% GST
export const GST_AMOUNT = 152.39; // ₹152.39
export const CURRENCY = 'INR';

/** Pricing breakdown by age group (identical pricing for all groups) */
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
