import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MilestoneCategory, MilestoneStatus } from '@wombto18/shared';

export type MilestoneDocument = HydratedDocument<Milestone>;

@Schema({ timestamps: true, collection: 'milestones' })
export class Milestone {
  @Prop({ type: String, required: true, index: true })
  registrationId!: string;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, default: null })
  description?: string;

  @Prop({ type: String, enum: MilestoneCategory, required: true })
  category!: MilestoneCategory;

  @Prop({ type: String, enum: MilestoneStatus, default: MilestoneStatus.UPCOMING })
  status!: MilestoneStatus;

  @Prop({ type: Date, required: true })
  dueDate!: Date;

  @Prop({ type: Date, default: null })
  completedDate?: Date;

  /** Vaccine name for vaccination milestones (e.g., BCG, OPV, DPT) */
  @Prop({ type: String, default: null })
  vaccineName?: string;

  @Prop({ type: String, default: null })
  notes?: string;
}

export const MilestoneSchema = SchemaFactory.createForClass(Milestone);
