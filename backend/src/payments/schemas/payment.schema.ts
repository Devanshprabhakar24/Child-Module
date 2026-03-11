import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ type: String, required: true, index: true })
  registrationId!: string;

  @Prop({ type: String, required: true, unique: true })
  razorpayOrderId!: string;

  @Prop({ type: String, default: null })
  razorpayPaymentId?: string;

  @Prop({ type: Number, required: true })
  amount!: number;

  @Prop({ type: String, required: true })
  currency!: string;

  @Prop({ type: String, enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'], default: 'PENDING' })
  status!: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

  @Prop({ type: String, default: null })
  method?: string;

  @Prop({ type: String, default: null })
  receipt?: string;

  @Prop({ type: Object, default: {} })
  notes!: Record<string, string>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
