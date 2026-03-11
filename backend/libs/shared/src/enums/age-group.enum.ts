export enum AgeGroup {
  EARLY_CHILDHOOD = '0-5',
  MIDDLE_CHILDHOOD = '6-12',
  ADOLESCENCE = '13-18',
}

export function calculateAgeGroup(dob: Date): AgeGroup {
  const now = new Date();
  let ageYears = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    ageYears--;
  }

  if (ageYears >= 0 && ageYears <= 5) return AgeGroup.EARLY_CHILDHOOD;
  if (ageYears >= 6 && ageYears <= 12) return AgeGroup.MIDDLE_CHILDHOOD;
  return AgeGroup.ADOLESCENCE;
}

export function calculateAgeInYears(dob: Date): number {
  const now = new Date();
  let ageYears = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    ageYears--;
  }
  return ageYears;
}
