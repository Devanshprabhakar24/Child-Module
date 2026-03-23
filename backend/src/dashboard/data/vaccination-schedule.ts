import { MilestoneCategory } from '@wombto18/shared';

/**
 * Comprehensive Indian vaccination schedule (IAP/NIS) mapped to age in months.
 * Updated with complete vaccine list including optional vaccines.
 * Used to auto-seed milestones when a child is registered.
 */
export const VACCINATION_SCHEDULE: {
  vaccineName: string;
  title: string;
  ageInMonths: number;
  description: string;
  isOptional?: boolean;
}[] = [
  // ===== AT BIRTH =====
  { vaccineName: 'OPV-0', title: 'OPV Zero Dose', ageInMonths: 0, description: 'Oral Polio Vaccine — Birth dose' },
  { vaccineName: 'Hep-B1', title: 'Hepatitis B — 1st Dose', ageInMonths: 0, description: 'Hepatitis B birth dose' },
  { vaccineName: 'BCG', title: 'BCG Vaccine', ageInMonths: 0, description: 'Bacillus Calmette-Guérin — Tuberculosis protection' },

  // ===== 6-8 WEEKS (1.5 months) =====
  { vaccineName: 'DTP-1', title: 'DTP/DTaP 1st Dose', ageInMonths: 1.5, description: 'Diphtheria, Tetanus, Pertussis — 6 weeks' },
  { vaccineName: 'Hep-B2', title: 'Hepatitis B — 2nd Dose', ageInMonths: 1.5, description: 'Hepatitis B — 6 weeks' },
  { vaccineName: 'Hib-1', title: 'H. Influenzae Type B — 1st Dose', ageInMonths: 1.5, description: 'Haemophilus influenzae type B (Hib) — 6 weeks' },
  { vaccineName: 'IPV-1', title: 'IPV 1st Dose', ageInMonths: 1.5, description: 'Injectable Polio Vaccine — 6 weeks' },
  { vaccineName: 'Rota-1', title: 'Rotavirus 1st Dose', ageInMonths: 1.5, description: 'Rotavirus vaccine — 6 weeks' },
  { vaccineName: 'PCV-1', title: 'Pneumococcal 1st Dose', ageInMonths: 1.5, description: 'Pneumococcal Conjugate Vaccine (PCV) — 6 weeks' },

  // ===== 10-12 WEEKS (2.5 months) =====
  { vaccineName: 'DTP-2', title: 'DTP/DTaP 2nd Dose', ageInMonths: 2.5, description: 'Diphtheria, Tetanus, Pertussis — 10 weeks' },
  { vaccineName: 'Hib-2', title: 'H. Influenzae Type B — 2nd Dose', ageInMonths: 2.5, description: 'Haemophilus influenzae type B (Hib) — 10 weeks' },
  { vaccineName: 'Hep-B3', title: 'Hepatitis B — 3rd Dose', ageInMonths: 2.5, description: 'Hepatitis B — 10 weeks' },
  { vaccineName: 'IPV-2', title: 'IPV 2nd Dose', ageInMonths: 2.5, description: 'Injectable Polio Vaccine — 10 weeks' },
  { vaccineName: 'Rota-2', title: 'Rotavirus 2nd Dose', ageInMonths: 2.5, description: 'Rotavirus vaccine — 10 weeks' },
  { vaccineName: 'PCV-2', title: 'Pneumococcal 2nd Dose', ageInMonths: 2.5, description: 'Pneumococcal Conjugate Vaccine (PCV) — 10 weeks' },

  // ===== 14-16 WEEKS (3.5 months) =====
  { vaccineName: 'DTP-3', title: 'DTP/DTaP 3rd Dose', ageInMonths: 3.5, description: 'Diphtheria, Tetanus, Pertussis — 14 weeks' },
  { vaccineName: 'Hep-B4', title: 'Hepatitis B — 4th Dose', ageInMonths: 3.5, description: 'Hepatitis B — 14 weeks' },
  { vaccineName: 'Hib-3', title: 'H. Influenzae Type B — 3rd Dose', ageInMonths: 3.5, description: 'Haemophilus influenzae type B (Hib) — 14 weeks' },
  { vaccineName: 'IPV-3', title: 'IPV 3rd Dose', ageInMonths: 3.5, description: 'Injectable Polio Vaccine — 14 weeks' },
  { vaccineName: 'Rota-3', title: 'Rotavirus 3rd Dose', ageInMonths: 3.5, description: 'Rotavirus vaccine — 14 weeks' },
  { vaccineName: 'PCV-3', title: 'Pneumococcal 3rd Dose', ageInMonths: 3.5, description: 'Pneumococcal Conjugate Vaccine (PCV) — 14 weeks' },

  // ===== 6 MONTHS =====
  { vaccineName: 'Flu-1', title: 'Influenza Vaccine — 1st Dose', ageInMonths: 6, description: 'Seasonal Influenza vaccine — 6 months', isOptional: true },

  // ===== 6-9 MONTHS =====
  { vaccineName: 'TCV', title: 'Typhoid Conjugate Vaccine', ageInMonths: 7, description: 'Typhoid (TCV) — 6-9 months', isOptional: true },

  // ===== 7 MONTHS =====
  { vaccineName: 'Flu-2', title: 'Influenza Vaccine — 2nd Dose', ageInMonths: 7, description: 'Seasonal Influenza vaccine — 7 months', isOptional: true },

  // ===== 9 MONTHS =====
  { vaccineName: 'MR-1', title: 'MR/MMR 1st Dose', ageInMonths: 9, description: 'Measles-Rubella or Measles-Mumps-Rubella — 9 months' },
  { vaccineName: 'Meningo-1', title: 'Meningococcal 1st Dose', ageInMonths: 9, description: 'Meningococcal vaccine — 9 months', isOptional: true },

  // ===== 12 MONTHS (1 YEAR) =====
  { vaccineName: 'Hep-A1', title: 'Hepatitis A — 1st Dose', ageInMonths: 12, description: 'Hepatitis A vaccine — 12 months', isOptional: true },
  { vaccineName: 'JE-1', title: 'Japanese Encephalitis — 1st Dose', ageInMonths: 12, description: 'JE vaccine — 12 months (endemic areas)', isOptional: true },
  { vaccineName: 'Meningo-2', title: 'Meningococcal 2nd Dose', ageInMonths: 12, description: 'Meningococcal vaccine — 12 months', isOptional: true },

  // ===== 13 MONTHS =====
  { vaccineName: 'JE-2', title: 'Japanese Encephalitis — 2nd Dose', ageInMonths: 13, description: 'JE vaccine — 13 months (endemic areas)', isOptional: true },

  // ===== 15 MONTHS =====
  { vaccineName: 'MR-2', title: 'MR/MMR 2nd Dose', ageInMonths: 15, description: 'Measles-Rubella or Measles-Mumps-Rubella — 15 months' },
  { vaccineName: 'Varicella-1', title: 'Chicken Pox Vaccine — 1st Dose', ageInMonths: 15, description: 'Varicella (Chicken Pox) vaccine — 15 months', isOptional: true },
  { vaccineName: 'PCV-4', title: 'Pneumococcal Booster', ageInMonths: 15, description: 'Pneumococcal Conjugate Vaccine (PCV) Booster — 15 months' },

  // ===== 18 MONTHS =====
  { vaccineName: 'DTP-B1', title: 'DTP/DTaP 1st Booster', ageInMonths: 18, description: 'DPT Booster — 18 months' },
  { vaccineName: 'Hib-B', title: 'H. Influenzae Booster', ageInMonths: 18, description: 'Haemophilus influenzae type B (Hib) Booster — 18 months' },
  { vaccineName: 'IPV-B', title: 'IPV Booster', ageInMonths: 18, description: 'Injectable Polio Vaccine Booster — 18 months' },
  { vaccineName: 'Hep-A2', title: 'Hepatitis A — 2nd Dose', ageInMonths: 18, description: 'Hepatitis A vaccine — 18 months', isOptional: true },
  { vaccineName: 'Varicella-2', title: 'Chicken Pox Vaccine — 2nd Dose', ageInMonths: 18, description: 'Varicella (Chicken Pox) vaccine — 18 months', isOptional: true },
  { vaccineName: 'Meningo-B', title: 'Meningococcal Booster', ageInMonths: 18, description: 'Meningococcal vaccine (if not taken earlier) — 18 months', isOptional: true },

  // ===== 24 MONTHS (2 YEARS) =====
  { vaccineName: 'MCV', title: 'Meningococcal Conjugate Vaccine', ageInMonths: 24, description: 'MCV single dose (if not given earlier) — 24 months', isOptional: true },

  // ===== ANNUAL FLU VACCINES (Starting from 19 months to 18 years) =====
  { vaccineName: 'Flu-Annual-Y2', title: 'Annual Flu Vaccine — Year 2', ageInMonths: 19, description: 'Yearly Influenza vaccine — 19 months', isOptional: true },
  { vaccineName: 'Flu-Annual-Y3', title: 'Annual Flu Vaccine — Year 3', ageInMonths: 31, description: 'Yearly Influenza vaccine — 31 months', isOptional: true },
  { vaccineName: 'Flu-Annual-Y4', title: 'Annual Flu Vaccine — Year 4', ageInMonths: 43, description: 'Yearly Influenza vaccine — 43 months', isOptional: true },
  { vaccineName: 'Flu-Annual-Y5', title: 'Annual Flu Vaccine — Year 5', ageInMonths: 55, description: 'Yearly Influenza vaccine — 55 months', isOptional: true },

  // ===== 4-5 YEARS (60 MONTHS) =====
  { vaccineName: 'DTP-B2', title: 'DTP/DTaP + IPV Booster', ageInMonths: 60, description: 'DPT + IPV Booster — 4-5 years' },
  { vaccineName: 'OPV-B2', title: 'OPV 2nd Booster', ageInMonths: 60, description: 'Oral Polio Vaccine 2nd Booster — 4-5 years' },
  { vaccineName: 'MMR-B', title: 'MMR Booster', ageInMonths: 60, description: 'Measles-Mumps-Rubella Booster — 4-5 years' },
  { vaccineName: 'Flu-Annual-Y6', title: 'Annual Flu Vaccine — Year 6', ageInMonths: 67, description: 'Yearly Influenza vaccine — 67 months', isOptional: true },
  { vaccineName: 'Flu-Annual-Y7', title: 'Annual Flu Vaccine — Year 7', ageInMonths: 79, description: 'Yearly Influenza vaccine — 79 months', isOptional: true },
  { vaccineName: 'Flu-Annual-Y8', title: 'Annual Flu Vaccine — Year 8', ageInMonths: 91, description: 'Yearly Influenza vaccine — 91 months', isOptional: true },
  { vaccineName: 'Flu-Annual-Y9', title: 'Annual Flu Vaccine — Year 9', ageInMonths: 103, description: 'Yearly Influenza vaccine — 103 months', isOptional: true },

  // ===== 9 YEARS (108 MONTHS) =====
  { vaccineName: 'HPV-1', title: 'HPV Vaccine — 1st Dose', ageInMonths: 108, description: 'Human Papillomavirus vaccine — 9 years (after completion)', isOptional: true },
  { vaccineName: 'Flu-Annual-Y10', title: 'Annual Flu Vaccine — Year 10', ageInMonths: 115, description: 'Yearly Influenza vaccine — 115 months', isOptional: true },

  // ===== 9.5 YEARS (114 MONTHS) =====
  { vaccineName: 'HPV-2', title: 'HPV Vaccine — 2nd Dose', ageInMonths: 114, description: 'Human Papillomavirus vaccine — 6 months after 1st dose', isOptional: true },

  // ===== 10 YEARS (120 MONTHS) =====
  { vaccineName: 'Td-10Y', title: 'Td/Tdap Vaccine', ageInMonths: 120, description: 'Tetanus-diphtheria or Tdap — 10 years' },
  { vaccineName: 'Flu-Annual-Y11', title: 'Annual Flu Vaccine — Year 11', ageInMonths: 127, description: 'Yearly Influenza vaccine — 127 months', isOptional: true },
  { vaccineName: 'Flu-Annual-Y12', title: 'Annual Flu Vaccine — Year 12', ageInMonths: 139, description: 'Yearly Influenza vaccine — 139 months', isOptional: true },
  { vaccineName: 'Flu-Annual-Y13', title: 'Annual Flu Vaccine — Year 13', ageInMonths: 151, description: 'Yearly Influenza vaccine — 151 months', isOptional: true },

  // ===== 14 YEARS (168 MONTHS) =====
  { vaccineName: 'HPV-3', title: 'HPV Vaccine — 3rd Dose', ageInMonths: 168, description: 'Human Papillomavirus vaccine (if not taken earlier) — 14 years', isOptional: true },
  { vaccineName: 'Flu-Annual-Y14', title: 'Annual Flu Vaccine — Year 14', ageInMonths: 163, description: 'Yearly Influenza vaccine — 163 months', isOptional: true },
  { vaccineName: 'Flu-Annual-Y15', title: 'Annual Flu Vaccine — Year 15', ageInMonths: 175, description: 'Yearly Influenza vaccine — 175 months', isOptional: true },

  // ===== 16 YEARS (192 MONTHS) =====
  { vaccineName: 'Flu-Annual-Y16', title: 'Annual Flu Vaccine — Year 16', ageInMonths: 187, description: 'Yearly Influenza vaccine — 187 months', isOptional: true },
  { vaccineName: 'Flu-Annual-Y17', title: 'Annual Flu Vaccine — Year 17', ageInMonths: 199, description: 'Yearly Influenza vaccine — 199 months', isOptional: true },

  // ===== 18 YEARS (216 MONTHS) =====
  { vaccineName: 'Flu-Annual-Y18', title: 'Annual Flu Vaccine — Year 18', ageInMonths: 211, description: 'Yearly Influenza vaccine — 211 months', isOptional: true },
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
