import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FaqDocument = HydratedDocument<Faq>;

@Schema({ timestamps: true, collection: 'faqs' })
export class Faq {
  @Prop({ type: String, required: true })
  question!: string;

  @Prop({ type: String, required: true })
  answer!: string;

  @Prop({ type: Number, default: 0 })
  order!: number;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: String, default: 'general' })
  category!: string;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
