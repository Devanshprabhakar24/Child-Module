import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CreditTransactionDocument = HydratedDocument<CreditTransaction>;

export enum CreditType {
  VACCINATION = 'VACCINATION',
  HEALTH_RECORD = 'HEALTH_RECORD',
  ENGAGEMENT = 'ENGAGEMENT',
  BONUS = 'BONUS',
  REDEMPTION = 'REDEMPTION',
}

@Schema({ timestamps: true, collection: 'credit_transactions' })
export class CreditTransaction {
  @Prop({ type: String, required: true, index: true })
  registrationId!: string; // Child's registration ID

  @Prop({ type: Number, required: true })
  amount!: number; // Positive for earning, negative for redemption

  @Prop({ type: String, enum: CreditType, required: true, index: true })
  type!: CreditType;

  @Prop({ type: String, required: true })
  description!: string; // e.g., "BCG Vaccine Completed"

  @Prop({ type: Number, required: true })
  balanceAfter!: number; // Total credits after this transaction

  @Prop({ type: Object, default: {} })
  metadata!: {
    vaccineId?: string;
    vaccineName?: string;
    sequenceNumber?: number;
    recordId?: string;
    milestoneName?: string;
    treeId?: string;
    treeTier?: string;
    bonusType?: string;
  };

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export const CreditTransactionSchema = SchemaFactory.createForClass(CreditTransaction);

// Indexes for better performance
CreditTransactionSchema.index({ registrationId: 1, createdAt: -1 });
CreditTransactionSchema.index({ type: 1 });
CreditTransactionSchema.index({ createdAt: -1 });
