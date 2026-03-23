import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ type: String, required: true, index: true })
  userId!: string;

  @Prop({ type: String, required: true, index: true })
  registrationId!: string;

  @Prop({
    type: String,
    enum: ['vaccination_due', 'health_record', 'milestone', 'go_green', 'payment', 'general'],
    required: true,
  })
  type!: string;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  message!: string;

  @Prop({ type: Object, default: null })
  data?: any;

  @Prop({ type: Boolean, default: false })
  read!: boolean;

  @Prop({ type: Date, default: null })
  readAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ registrationId: 1, createdAt: -1 });
NotificationSchema.index({ read: 1, createdAt: -1 });
