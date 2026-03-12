export const INDIAN_STATES: Record<string, string> = {
  AN: 'Andaman & Nicobar',
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CH: 'Chandigarh',
  CT: 'Chhattisgarh',
  DD: 'Daman & Diu',
  DL: 'Delhi',
  GA: 'Goa',
  GJ: 'Gujarat',
  HP: 'Himachal Pradesh',
  HR: 'Haryana',
  JH: 'Jharkhand',
  JK: 'Jammu & Kashmir',
  KA: 'Karnataka',
  KL: 'Kerala',
  LA: 'Ladakh',
  MH: 'Maharashtra',
  ML: 'Meghalaya',
  MN: 'Manipur',
  MP: 'Madhya Pradesh',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OD: 'Odisha',
  PB: 'Punjab',
  PY: 'Puducherry',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TN: 'Tamil Nadu',
  TS: 'Telangana',
  TR: 'Tripura',
  UK: 'Uttarakhand',
  UP: 'Uttar Pradesh',
  WB: 'West Bengal',
};

export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'] as const;

export const MILESTONE_STATUS = {
  UPCOMING: 'UPCOMING',
  DUE: 'DUE',
  COMPLETED: 'COMPLETED',
  MISSED: 'MISSED',
} as const;

export const MILESTONE_CATEGORY = {
  VACCINATION: 'VACCINATION',
  DEVELOPMENTAL: 'DEVELOPMENTAL',
  HEALTH_CHECKUP: 'HEALTH_CHECKUP',
} as const;
