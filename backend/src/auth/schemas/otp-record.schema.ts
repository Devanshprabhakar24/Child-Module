import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpRecordDocument = HydratedDocument<OtpRecord>;

@Schema({ timestamps: true, collection: 'otp_records' })
export class OtpRecord {
  @Prop({ type: String, required: true, index: true })
  email!: string;

  @Prop({ type: String, required: true })
  code!: string;

  @Prop({ type: Date, required: true })
  expiresAt!: Date;

  @Prop({ type: Boolean, default: false })
  isUsed!: boolean;

  @Prop({ type: Number, default: 0 })
  attempts!: number;
}

export const OtpRecordSchema = SchemaFactory.createForClass(OtpRecord);

// TTL index: auto-delete expired OTPs after 10 minutes
OtpRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 600 });
