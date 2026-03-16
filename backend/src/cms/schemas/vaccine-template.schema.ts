import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VaccineTemplateDocument = HydratedDocument<VaccineTemplate>;

@Schema({ timestamps: true, collection: 'vaccine_templates' })
export class VaccineTemplate {
  @Prop({ type: String, required: true, unique: true })
  vaccineName!: string;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: Number, required: true })
  ageInMonths!: number;

  @Prop({ type: String, required: true })
  description!: string;

  @Prop({ type: Number, default: 0 })
  order!: number;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: String, default: 'routine' })
  category!: string; // routine, booster, optional
}

export const VaccineTemplateSchema = SchemaFactory.createForClass(VaccineTemplate);
