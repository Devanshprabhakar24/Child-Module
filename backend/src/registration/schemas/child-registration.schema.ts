import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AgeGroup } from '@wombto18/shared';
import { IndianState } from '@wombto18/shared';

export type ChildRegistrationDocument = HydratedDocument<ChildRegistration>;

export enum RegistrationType {
  DIRECT = 'DIRECT',
  HOSPITAL = 'HOSPITAL',
  CHANNEL_PARTNER = 'CHANNEL_PARTNER',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

@Schema({ timestamps: true, collection: 'child_registrations' })
export class ChildRegistration {
  @Prop({ type: String, required: true, unique: true, index: true })
  registrationId!: string;

  @Prop({ type: String, required: true })
  childName!: string;

  @Prop({ type: String, enum: Gender, required: true })
  childGender!: Gender;

  @Prop({ type: Date, required: true })
  dateOfBirth!: Date;

  @Prop({ type: String, enum: AgeGroup, required: true })
  ageGroup!: AgeGroup;

  @Prop({ type: Number, required: true })
  ageInYears!: number;

  @Prop({ type: String, enum: IndianState, required: true })
  state!: IndianState;

  @Prop({ type: String, required: true })
  motherName!: string;

  @Prop({ type: String, default: null })
  fatherName?: string;

  @Prop({ type: String, default: null })
  motherRegistrationId?: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  email!: string;

  @Prop({ type: String, required: true })
  phone!: string;

  /** Secondary mobile number (optional) */
  @Prop({ type: String, default: null })
  phone2?: string;

  @Prop({ type: String, default: null })
  address?: string;

  // ─── Health Information ─────────────────────────────────────────────

  @Prop({ type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], default: null })
  bloodGroup?: string;

  @Prop({ type: Number, default: null })
  heightCm?: number;

  @Prop({ type: Number, default: null })
  weightKg?: number;

  @Prop({ type: String, default: null })
  profilePictureUrl?: string;

  // ─── Registration Source ────────────────────────────────────────────

  @Prop({ type: String, enum: RegistrationType, default: RegistrationType.DIRECT })
  registrationType!: RegistrationType;

  /** Channel partner ID if registered via hospital/clinic/partner QR code */
  @Prop({ type: String, default: null, index: true })
  channelPartnerId?: string;

  // ─── Payment ────────────────────────────────────────────────────────

  @Prop({ type: Number, default: 999 })
  subscriptionAmount!: number;

  @Prop({ type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' })
  paymentStatus!: 'PENDING' | 'COMPLETED' | 'FAILED';

  @Prop({ type: String, default: null })
  razorpayOrderId?: string;

  @Prop({ type: String, default: null })
  razorpayPaymentId?: string;

  @Prop({ type: String, default: null })
  couponCode?: string;

  // ─── Green Cohort ───────────────────────────────────────────────────

  @Prop({ type: Boolean, default: true })
  greenCohort!: boolean;

  @Prop({ type: Boolean, default: false })
  goGreenCertSent!: boolean;

  /** Linked school ID if the school is onboarded */
  @Prop({ type: String, default: null })
  linkedSchoolId?: string;

  /** Parent user ID (for family dashboard linking) */
  @Prop({ type: String, default: null, index: true })
  parentUserId?: string;

  // ─── Go Green Credits ───────────────────────────────────────────────

  @Prop({
    type: {
      total: { type: Number, default: 0 },
      current: { type: Number, default: 0 },
      level: { type: String, default: 'SEEDLING' },
      nextTreeAt: { type: Number, default: 500 },
      treesPlanted: { type: Number, default: 0 },
      co2Offset: { type: Number, default: 0 },
      lastCreditDate: { type: Date, default: null },
    },
    default: {
      total: 0,
      current: 0,
      level: 'SEEDLING',
      nextTreeAt: 500,
      treesPlanted: 0,
      co2Offset: 0,
      lastCreditDate: null,
    },
  })
  goGreenCredits?: {
    total: number;
    current: number;
    level: string;
    nextTreeAt: number;
    treesPlanted: number;
    co2Offset: number;
    lastCreditDate?: Date;
  };

  // ─── Planted Trees ──────────────────────────────────────────────────

  @Prop({
    type: [{
      treeId: { type: String, required: true },
      species: { type: String, required: true },
      location: { type: String, required: true },
      plantedDate: { type: Date, required: true },
      creditsUsed: { type: Number, required: true },
      status: { type: String, default: 'PLANTED' },
      imageUrl: { type: String, default: null },
      co2Offset: { type: Number, default: 0 },
    }],
    default: [],
  })
  plantedTrees?: Array<{
    treeId: string;
    species: string;
    location: string;
    plantedDate: Date;
    creditsUsed: number;
    status: string;
    imageUrl?: string;
    co2Offset: number;
  }>;
}

export const ChildRegistrationSchema = SchemaFactory.createForClass(ChildRegistration);

// Explicit indexes for better performance and constraints
ChildRegistrationSchema.index({ registrationId: 1 }, { unique: true });
ChildRegistrationSchema.index({ email: 1 }, { unique: true });
ChildRegistrationSchema.index({ phone: 1 }); // Not unique - allows up to 2 registrations per phone
ChildRegistrationSchema.index({ channelPartnerId: 1 });
ChildRegistrationSchema.index({ parentUserId: 1 });
ChildRegistrationSchema.index({ paymentStatus: 1 });
ChildRegistrationSchema.index({ createdAt: -1 });
