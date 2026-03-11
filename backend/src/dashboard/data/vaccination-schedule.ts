import { MilestoneCategory } from '@wombto18/shared';

/**
 * Standard Indian vaccination schedule (IAP/NIS) mapped to age in months.
 * Used to auto-seed milestones when a child is registered.
 */
export const VACCINATION_SCHEDULE: {
  vaccineName: string;
  title: string;
  ageInMonths: number;
  description: string;
}[] = [
  { vaccineName: 'BCG', title: 'BCG Vaccine', ageInMonths: 0, description: 'Bacillus Calmette-Guérin — Tuberculosis' },
  { vaccineName: 'OPV-0', title: 'OPV Zero Dose', ageInMonths: 0, description: 'Oral Polio Vaccine — Birth dose' },
  { vaccineName: 'Hep-B1', title: 'Hepatitis B — 1st Dose', ageInMonths: 0, description: 'Hepatitis B birth dose' },
  { vaccineName: 'OPV-1', title: 'OPV 1st Dose', ageInMonths: 1.5, description: 'Oral Polio Vaccine — 6 weeks' },
  { vaccineName: 'Penta-1', title: 'Pentavalent 1st Dose', ageInMonths: 1.5, description: 'DPT + Hep B + Hib — 6 weeks' },
  { vaccineName: 'Rota-1', title: 'Rotavirus 1st Dose', ageInMonths: 1.5, description: 'Rotavirus vaccine — 6 weeks' },
  { vaccineName: 'IPV-1', title: 'IPV 1st Dose', ageInMonths: 1.5, description: 'Injectable Polio Vaccine — 6 weeks' },
  { vaccineName: 'PCV-1', title: 'Pneumococcal 1st Dose', ageInMonths: 1.5, description: 'Pneumococcal Conjugate Vaccine — 6 weeks' },
  { vaccineName: 'OPV-2', title: 'OPV 2nd Dose', ageInMonths: 2.5, description: 'Oral Polio Vaccine — 10 weeks' },
  { vaccineName: 'Penta-2', title: 'Pentavalent 2nd Dose', ageInMonths: 2.5, description: 'DPT + Hep B + Hib — 10 weeks' },
  { vaccineName: 'Rota-2', title: 'Rotavirus 2nd Dose', ageInMonths: 2.5, description: 'Rotavirus vaccine — 10 weeks' },
  { vaccineName: 'OPV-3', title: 'OPV 3rd Dose', ageInMonths: 3.5, description: 'Oral Polio Vaccine — 14 weeks' },
  { vaccineName: 'Penta-3', title: 'Pentavalent 3rd Dose', ageInMonths: 3.5, description: 'DPT + Hep B + Hib — 14 weeks' },
  { vaccineName: 'Rota-3', title: 'Rotavirus 3rd Dose', ageInMonths: 3.5, description: 'Rotavirus vaccine — 14 weeks' },
  { vaccineName: 'IPV-2', title: 'IPV 2nd Dose', ageInMonths: 3.5, description: 'Injectable Polio Vaccine — 14 weeks' },
  { vaccineName: 'PCV-2', title: 'Pneumococcal 2nd Dose', ageInMonths: 3.5, description: 'Pneumococcal Conjugate Vaccine — 14 weeks' },
  { vaccineName: 'MR-1', title: 'Measles-Rubella 1st Dose', ageInMonths: 9, description: 'Measles-Rubella vaccine — 9 months' },
  { vaccineName: 'JE-1', title: 'Japanese Encephalitis 1st Dose', ageInMonths: 9, description: 'JE vaccine — 9 months (endemic areas)' },
  { vaccineName: 'PCV-Booster', title: 'Pneumococcal Booster', ageInMonths: 9, description: 'Pneumococcal Conjugate Vaccine Booster — 9 months' },
  { vaccineName: 'Vita-A1', title: 'Vitamin A — 1st Dose', ageInMonths: 9, description: 'Vitamin A supplement — 9 months' },
  { vaccineName: 'DPT-B1', title: 'DPT 1st Booster', ageInMonths: 16, description: 'DPT Booster — 16-24 months' },
  { vaccineName: 'MR-2', title: 'Measles-Rubella 2nd Dose', ageInMonths: 16, description: 'Measles-Rubella vaccine — 16-24 months' },
  { vaccineName: 'OPV-Booster', title: 'OPV Booster', ageInMonths: 16, description: 'Oral Polio Vaccine Booster — 16-24 months' },
  { vaccineName: 'JE-2', title: 'Japanese Encephalitis 2nd Dose', ageInMonths: 16, description: 'JE vaccine — 16-24 months (endemic areas)' },
  { vaccineName: 'DPT-B2', title: 'DPT 2nd Booster', ageInMonths: 60, description: 'DPT Booster — 5-6 years' },
  { vaccineName: 'TT', title: 'Tetanus Toxoid', ageInMonths: 120, description: 'Tetanus Toxoid — 10 years' },
  { vaccineName: 'Td', title: 'Td Vaccine', ageInMonths: 192, description: 'Tetanus-diphtheria — 16 years' },
];

/**
 * Calculate the due date for a vaccination milestone given the child's DOB.
 */
export function calculateDueDate(dob: Date, ageInMonths: number): Date {
  const dueDate = new Date(dob);
  const wholeMonths = Math.floor(ageInMonths);
  const fractionalDays = Math.round((ageInMonths - wholeMonths) * 30);
  dueDate.setMonth(dueDate.getMonth() + wholeMonths);
  dueDate.setDate(dueDate.getDate() + fractionalDays);
  return dueDate;
}
