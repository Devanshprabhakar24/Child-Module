import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GrowthRecordDocument = HydratedDocument<GrowthRecord>;

export enum GrowthRecordStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

@Schema({ timestamps: true, collection: 'growth_records' })
export class GrowthRecord {
  @Prop({ type: String, required: true, index: true })
  registrationId!: string;

  @Prop({ type: Number, required: true, min: 0 })
  height!: number; // Height in cm

  @Prop({ type: Number, required: true, min: 0 })
  weight!: number; // Weight in kg

  @Prop({ type: Number, required: true })
  bmi!: number; // Body Mass Index (calculated)

  @Prop({ type: String, required: true })
  bmiCategory!: string; // Underweight, Normal, Overweight, Obese

  @Prop({ type: Date, required: true })
  measurementDate!: Date;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: String, enum: GrowthRecordStatus, default: GrowthRecordStatus.ACTIVE })
  status!: GrowthRecordStatus;

  @Prop({ type: String })
  uploadedByUserId?: string; // User ID who uploaded
}

export const GrowthRecordSchema = SchemaFactory.createForClass(GrowthRecord);

// Indexes for better query performance
GrowthRecordSchema.index({ registrationId: 1, measurementDate: -1 });
GrowthRecordSchema.index({ registrationId: 1, status: 1 });
