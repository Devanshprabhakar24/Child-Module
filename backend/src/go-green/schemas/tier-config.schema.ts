import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TierConfigDocument = HydratedDocument<TierConfig>;

export enum TierLevel {
  SEEDLING = 'SEEDLING',
  SAPLING = 'SAPLING',
  YOUNG = 'YOUNG',
  MATURE = 'MATURE',
  GUARDIAN = 'GUARDIAN',
  FOREST = 'FOREST',
}

export enum CertificateType {
  DIGITAL_BADGE = 'DIGITAL_BADGE',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

@Schema({ collection: 'tier_configs' })
export class TierConfig {
  @Prop({ type: String, required: true, unique: true, enum: TierLevel })
  level!: TierLevel;

  @Prop({ type: Number, required: true })
  minCredits!: number;

  @Prop({ type: Number, required: true })
  maxCredits!: number;

  @Prop({ type: String, required: true })
  treeType!: string; // e.g., "Neem (Azadirachta indica)"

  @Prop({ type: Number, required: true, default: 0 })
  co2Absorption!: number; // kg/year

  @Prop({ type: String, required: true, enum: CertificateType })
  certificateType!: CertificateType;

  @Prop({ type: String, required: true })
  badgeIcon!: string; // Emoji icon

  @Prop({ type: String, required: true })
  color!: string; // Hex color code

  @Prop({ type: [String], default: [] })
  benefits!: string[];

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const TierConfigSchema = SchemaFactory.createForClass(TierConfig);
