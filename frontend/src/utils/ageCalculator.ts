/**
 * Calculate detailed age from date of birth
 * Returns years, months, and days
 */
export function calculateDetailedAge(dateOfBirth: string | Date): {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalMonths: number;
} {
  const dob = new Date(dateOfBirth);
  const now = new Date();

  // Calculate total days
  const totalDays = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate years, months, days
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  // Calculate total months
  const totalMonths = years * 12 + months;

  return {
    years,
    months,
    days,
    totalDays,
    totalMonths,
  };
}

/**
 * Format age in a human-readable way
 * Examples:
 * - "2 Years, 3 Months, 15 Days"
 * - "6 Months, 10 Days"
 * - "15 Days"
 * - "Newborn" (for 0 days)
 */
export function formatAge(dateOfBirth: string | Date, options?: {
  showDays?: boolean;
  compact?: boolean;
}): string {
  const { years, months, days } = calculateDetailedAge(dateOfBirth);
  const showDays = options?.showDays ?? true;
  const compact = options?.compact ?? false;

  // Newborn (0 days old)
  if (years === 0 && months === 0 && days === 0) {
    return "Newborn";
  }

  const parts: string[] = [];

  if (years > 0) {
    parts.push(compact ? `${years}y` : `${years} Year${years > 1 ? 's' : ''}`);
  }

  if (months > 0) {
    parts.push(compact ? `${months}m` : `${months} Month${months > 1 ? 's' : ''}`);
  }

  if (showDays && days > 0 && years === 0) {
    // Only show days if less than 1 year old
    parts.push(compact ? `${days}d` : `${days} Day${days > 1 ? 's' : ''}`);
  }

  return parts.join(compact ? ' ' : ', ') || 'Newborn';
}

/**
 * Get age category label
 */
export function getAgeCategory(dateOfBirth: string | Date): string {
  const { years, months } = calculateDetailedAge(dateOfBirth);

  if (years === 0 && months === 0) return 'Newborn';
  if (years === 0) return 'Infant';
  if (years < 2) return 'Toddler';
  if (years < 5) return 'Preschooler';
  if (years < 13) return 'Child';
  if (years < 18) return 'Teenager';
  return 'Young Adult';
}
