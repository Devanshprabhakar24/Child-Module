import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MilestoneTemplateDocument = HydratedDocument<MilestoneTemplate>;

@Schema({ timestamps: true, collection: 'milestone_templates' })
export class MilestoneTemplate {
  @Prop({ type: String, required: true })
  ageGroup!: string; // '0-1 years', '1-3 years', etc.

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  description!: string;

  @Prop({ type: String, required: true })
  type!: string; // PHYSICAL, COGNITIVE, SOCIAL, EMOTIONAL, LANGUAGE

  @Prop({ type: Number, default: 0 })
  order!: number;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: String, default: '' })
  tips?: string; // Tips for parents
}

export const MilestoneTemplateSchema = SchemaFactory.createForClass(MilestoneTemplate);
