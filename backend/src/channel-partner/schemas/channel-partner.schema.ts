import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChannelPartnerDocument = HydratedDocument<ChannelPartner>;

export enum PartnerType {
  HOSPITAL = 'HOSPITAL',
  CLINIC = 'CLINIC',
  DOCTOR = 'DOCTOR',
  SCHOOL = 'SCHOOL',
  INDIVIDUAL = 'INDIVIDUAL',
}

@Schema({ timestamps: true, collection: 'channel_partners' })
export class ChannelPartner {
  @Prop({ type: String, required: true, unique: true, index: true })
  partnerId!: string;

  @Prop({ type: String, required: true })
  partnerName!: string;

  @Prop({ type: String, required: true })
  organizationName!: string;

  @Prop({ type: String, required: true, unique: true })
  email!: string;

  @Prop({ type: String, required: true })
  phone!: string;

  @Prop({ type: String, enum: PartnerType, default: PartnerType.INDIVIDUAL })
  partnerType!: PartnerType;

  @Prop({ type: String, default: null })
  region?: string;

  @Prop({ type: String, default: null })
  district?: string;

  @Prop({ type: String, default: null })
  state?: string;

  /** QR code URL for this partner — parents scan to register via their link */
  @Prop({ type: String, default: null })
  qrCodeUrl?: string;

  /** White-label branding: partner logo URL */
  @Prop({ type: String, default: null })
  logoUrl?: string;

  /** Registration IDs assigned to this channel partner */
  @Prop({ type: [String], default: [] })
  assignedRegistrationIds!: string[];

  // ─── Commission Tracking ──────────────────────────────────────────────

  /** Total child registrations via this partner */
  @Prop({ type: Number, default: 0 })
  totalChildRegistrations!: number;

  /** Total maternal registrations via this partner */
  @Prop({ type: Number, default: 0 })
  totalMaternalRegistrations!: number;

  /** Commission rate for child registration (₹175-225 flat) */
  @Prop({ type: Number, default: 200 })
  childCommissionRate!: number;

  /** Commission rate for maternal registration (₹25 flat) */
  @Prop({ type: Number, default: 25 })
  maternalCommissionRate!: number;

  /** Total earned commission (accumulated) */
  @Prop({ type: Number, default: 0 })
  totalEarnedCommission!: number;

  /** Commission already claimed/paid out */
  @Prop({ type: Number, default: 0 })
  claimedCommission!: number;

  /** Whether commission targets have been unlocked */
  @Prop({ type: Boolean, default: false })
  commissionUnlocked!: boolean;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const ChannelPartnerSchema = SchemaFactory.createForClass(ChannelPartner);
