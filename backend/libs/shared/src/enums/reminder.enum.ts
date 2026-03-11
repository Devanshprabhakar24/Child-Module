export enum ReminderChannel {
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  IVR = 'IVR',
  EMAIL = 'EMAIL',
}

export enum ReminderStatus {
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  FAILED = 'FAILED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

/** D-2, D (due day), D+2 offsets in days */
export enum ReminderOffset {
  D_MINUS_2 = -2,
  D_DAY = 0,
  D_PLUS_2 = 2,
}
