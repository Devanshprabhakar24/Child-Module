import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ReminderChannel, ReminderStatus, ReminderOffset } from '@wombto18/shared';

export type ReminderDocument = HydratedDocument<Reminder>;

@Schema({ timestamps: true, collection: 'reminders' })
export class Reminder {
  @Prop({ type: String, required: true, index: true })
  registrationId!: string;

  @Prop({ type: String, required: true, index: true })
  milestoneId!: string;

  @Prop({ type: [String], enum: ReminderChannel, required: true })
  channels!: ReminderChannel[];

  @Prop({ type: Number, enum: [-2, 0, 2], required: true })
  offset!: ReminderOffset;

  @Prop({ type: Date, required: true, index: true })
  scheduledDate!: Date;

  @Prop({ type: String, enum: ReminderStatus, default: ReminderStatus.SCHEDULED })
  status!: ReminderStatus;

  @Prop({ type: String, default: null })
  customMessage?: string;

  @Prop({ type: Date, default: null })
  sentAt?: Date;

  @Prop({ type: String, default: null })
  failureReason?: string;
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);
