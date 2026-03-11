import { AgeGroup } from '../enums/age-group.enum';
import { IndianState } from '../enums/indian-state.enum';

export interface IChildRegistration {
  registrationId: string;
  childName: string;
  childGender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: Date;
  ageGroup: AgeGroup;
  ageInYears: number;
  state: IndianState;
  motherName: string;
  fatherName?: string;
  motherRegistrationId?: string;
  email: string;
  phone: string;
  phone2?: string;
  address?: string;
  profilePictureUrl?: string;
  registrationType: 'DIRECT' | 'HOSPITAL' | 'CHANNEL_PARTNER';
  channelPartnerId?: string;
  subscriptionAmount: number;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  couponCode?: string;
  greenCohort: boolean;
  goGreenCertSent: boolean;
  linkedSchoolId?: string;
  parentUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRegistrationIdComponents {
  prefix: 'CHD';
  state: IndianState;
  dateString: string; // YYYYMMDD
  sequenceNumber: string; // 6-digit zero-padded
}
