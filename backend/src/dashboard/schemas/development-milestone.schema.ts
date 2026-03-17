import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DevelopmentMilestoneDocument = HydratedDocument<DevelopmentMilestone>;

export enum AgeGroupEnum {
  INFANT = '0-1 years',
  TODDLER = '1-3 years',
  PRESCHOOL = '3-5 years',
  SCHOOL = '5-12 years',
  TEEN = '13-18 years',
}

export enum MilestoneType {
  PHYSICAL = 'PHYSICAL',
  COGNITIVE = 'COGNITIVE',
  SOCIAL = 'SOCIAL',
  EMOTIONAL = 'EMOTIONAL',
  LANGUAGE = 'LANGUAGE',
}

export enum MilestoneStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ACHIEVED = 'ACHIEVED',
  DELAYED = 'DELAYED',
}

@Schema({ timestamps: true, collection: 'development_milestones' })
export class DevelopmentMilestone {
  @Prop({ type: String, required: true, index: true })
  registrationId!: string;

  @Prop({ type: String, enum: AgeGroupEnum, required: true })
  ageGroup!: AgeGroupEnum;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  description!: string;

  @Prop({ type: String, enum: MilestoneType, required: true })
  type!: MilestoneType;

  @Prop({ type: String, enum: MilestoneStatus, default: MilestoneStatus.NOT_STARTED })
  status!: MilestoneStatus;

  @Prop({ type: Date, default: null })
  achievedDate?: Date;

  @Prop({ type: String, default: '' })
  notes?: string;

  @Prop({ type: Number, default: 0 })
  order!: number;

  @Prop({ type: Number, required: true })
  expectedAgeMonths!: number;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const DevelopmentMilestoneSchema = SchemaFactory.createForClass(DevelopmentMilestone);
