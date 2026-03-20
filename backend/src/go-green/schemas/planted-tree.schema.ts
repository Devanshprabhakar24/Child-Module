import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlantedTreeDocument = HydratedDocument<PlantedTree>;

export enum TreeStatus {
  PENDING = 'PENDING',
  PLANTED = 'PLANTED',
  GROWING = 'GROWING',
  MATURE = 'MATURE',
  VERIFIED = 'VERIFIED',
}

@Schema({ timestamps: true, collection: 'planted_trees' })
export class PlantedTree {
  @Prop({ type: String, required: true, unique: true, index: true })
  treeId!: string;

  @Prop({ type: String, required: true, index: true })
  registrationId!: string;

  @Prop({ type: String, required: true })
  childName!: string;

  @Prop({ type: String, required: true })
  motherName!: string;

  @Prop({ type: String, required: true })
  species!: string;

  @Prop({ type: String, required: true })
  location!: string;

  @Prop({ type: String, default: null })
  plantingPartner?: string;

  @Prop({ type: Date, required: true })
  plantedDate!: Date;

  @Prop({ type: Number, required: true })
  creditsUsed!: number;

  @Prop({ type: String, enum: TreeStatus, default: TreeStatus.PLANTED })
  status!: TreeStatus;

  @Prop({ type: String, default: null })
  currentImageUrl?: string;

  @Prop({ type: Number, default: 0 })
  co2OffsetKg!: number;

  @Prop({ type: Number, default: 0 })
  heightCm!: number;

  @Prop({ type: Number, default: 0 })
  ageMonths!: number;

  @Prop({
    type: [{
      date: { type: Date, required: true },
      imageUrl: { type: String, required: false, default: '' },
      heightCm: { type: Number, default: 0 },
      notes: { type: String, default: null },
      updatedBy: { type: String, default: null },
    }],
    default: [],
  })
  growthTimeline!: Array<{
    date: Date;
    imageUrl: string;
    heightCm: number;
    notes?: string;
    updatedBy?: string;
  }>;

  @Prop({ type: Object, default: {} })
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };

  @Prop({ type: String, default: null })
  certificateUrl?: string;

  @Prop({ type: Boolean, default: false })
  isVerified!: boolean;

  @Prop({ type: Date, default: null })
  verifiedDate?: Date;

  @Prop({ type: String, default: null })
  verifiedBy?: string;
}

export const PlantedTreeSchema = SchemaFactory.createForClass(PlantedTree);

// Indexes
PlantedTreeSchema.index({ treeId: 1 }, { unique: true });
PlantedTreeSchema.index({ registrationId: 1 });
PlantedTreeSchema.index({ status: 1 });
PlantedTreeSchema.index({ plantedDate: -1 });
PlantedTreeSchema.index({ createdAt: -1 });
