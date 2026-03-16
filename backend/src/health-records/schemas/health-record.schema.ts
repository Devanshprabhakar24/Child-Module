import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HealthRecordDocument = HydratedDocument<HealthRecord>;

export enum HealthRecordCategory {
  VACCINATION_CARD = 'Vaccination Cards',
  ANNUAL_CHECKUP = 'Annual Check-ups',
  DENTAL_RECORD = 'Dental Records',
  EYE_CHECKUP = 'Eye Check-ups',
  BMI_REPORT = 'BMI Reports',
  LAB_REPORT = 'Lab Reports',
  PRESCRIPTION = 'Prescriptions',
  MEDICAL_CERTIFICATE = 'Medical Certificates',
  OTHER = 'Other',
}

export enum HealthRecordStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export enum UploadedBy {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Schema({ timestamps: true, collection: 'health_records' })
export class HealthRecord {
  @Prop({ type: String, required: true, index: true })
  registrationId!: string;

  @Prop({ type: String, required: true })
  documentName!: string;

  @Prop({ type: String, enum: HealthRecordCategory, required: true })
  category!: HealthRecordCategory;

  @Prop({ type: Date, required: true })
  recordDate!: Date;

  @Prop({ type: String, required: true })
  fileUrl!: string;

  @Prop({ type: String, required: true })
  fileName!: string;

  @Prop({ type: String, required: true })
  fileType!: string; // 'pdf', 'jpg', 'png'

  @Prop({ type: Number, required: true })
  fileSize!: number; // in bytes

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: String })
  doctorName?: string;

  @Prop({ type: String, enum: UploadedBy, required: true })
  uploadedBy!: UploadedBy;

  @Prop({ type: String })
  uploadedByUserId?: string; // User ID who uploaded (for admin uploads)

  @Prop({ type: String, enum: HealthRecordStatus, default: HealthRecordStatus.ACTIVE })
  status!: HealthRecordStatus;

  @Prop({ type: String })
  cloudinaryPublicId?: string; // For Cloudinary file management (deprecated)

  @Prop({ type: String })
  localFilePath?: string; // Local file system path
}

export const HealthRecordSchema = SchemaFactory.createForClass(HealthRecord);

// Indexes for better query performance
HealthRecordSchema.index({ registrationId: 1, category: 1 });
HealthRecordSchema.index({ registrationId: 1, recordDate: -1 });
HealthRecordSchema.index({ registrationId: 1, status: 1 });