import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReportDocument = HydratedDocument<Report>;

export enum ReportCategory {
  MONTHLY = 'Monthly Report',
  QUARTERLY = 'Quarterly Report',
  ANNUAL = 'Annual Report',
  VACCINATION = 'Vaccination Report',
  HEALTH = 'Health Report',
  GROWTH = 'Growth Report',
  ANALYTICS = 'Analytics Report',
  OTHER = 'Other',
}

export enum ReportStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

@Schema({ timestamps: true, collection: 'reports' })
export class Report {
  @Prop({ type: String, required: true, index: true })
  registrationId!: string; // Child registration ID

  @Prop({ type: String })
  childName?: string; // Child name for easy reference (optional)

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  description!: string;

  @Prop({ type: String, enum: ReportCategory, required: true })
  category!: ReportCategory;

  @Prop({ type: Date, required: true })
  reportDate!: Date;

  @Prop({ type: String, required: true })
  fileUrl!: string;

  @Prop({ type: String, required: true })
  fileName!: string;

  @Prop({ type: Number, required: true })
  fileSize!: number; // in bytes

  @Prop({ type: String, required: true })
  uploadedBy!: string; // Admin user ID

  @Prop({ type: String, enum: ReportStatus, default: ReportStatus.ACTIVE })
  status!: ReportStatus;

  @Prop({ type: String })
  localFilePath?: string; // Local file system path

  @Prop({ type: Number, default: 0 })
  downloadCount!: number;

  @Prop({ type: Date })
  lastDownloaded?: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

// Indexes for better query performance
ReportSchema.index({ registrationId: 1, category: 1 });
ReportSchema.index({ registrationId: 1, reportDate: -1 });
ReportSchema.index({ category: 1, reportDate: -1 });
ReportSchema.index({ status: 1, createdAt: -1 });