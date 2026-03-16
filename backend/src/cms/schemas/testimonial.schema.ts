import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TestimonialDocument = HydratedDocument<Testimonial>;

@Schema({ timestamps: true, collection: 'testimonials' })
export class Testimonial {
  @Prop({ type: String, required: true })
  quote!: string;

  @Prop({ type: String, required: true })
  author!: string;

  @Prop({ type: String, required: true })
  role!: string;

  @Prop({ type: String, default: '' })
  avatarUrl!: string;

  @Prop({ type: Number, default: 5, min: 1, max: 5 })
  rating!: number;

  @Prop({ type: Number, default: 0 })
  order!: number;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
