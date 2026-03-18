import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GoGreenTreeDocument = HydratedDocument<GoGreenTree>;

export enum TreeStatus {
  PLANTED = 'PLANTED',
  SAPLING = 'SAPLING',
  GROWING = 'GROWING',
  MATURE = 'MATURE',
  VERIFIED = 'VERIFIED',
}

export enum TreeSpecies {
  NEEM = 'Neem (Azadirachta indica)',
  BANYAN = 'Banyan (Ficus benghalensis)',
  PEEPAL = 'Peepal (Ficus religiosa)',
  MANGO = 'Mango (Mangifera indica)',
  TEAK = 'Teak (Tectona grandis)',
  BAMBOO = 'Bamboo (Bambuseae)',
  EUCALYPTUS = 'Eucalyptus (Eucalyptus globulus)',
  ASHOKA = 'Ashoka (Saraca asoca)',
  GULMOHAR = 'Gulmohar (Delonix regia)',
  COCONUT = 'Coconut (Cocos nucifera)',
}

export enum TierLevel {
  SEEDLING = 'SEEDLING',
  SAPLING = 'SAPLING',
  YOUNG = 'YOUNG',
  MATURE = 'MATURE',
  GUARDIAN = 'GUARDIAN',
  FOREST = 'FOREST',
}

export enum CertificateType {
  DIGITAL_BADGE = 'DIGITAL_BADGE',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

// Tree Growth Timeline Interface
export interface TreeGrowthStage {
  status: TreeStatus;
  date: Date;
  imageUrl?: string;
  notes?: string;
  updatedBy?: string;
}

@Schema({ timestamps: true, collection: 'go_green_trees' })
export class GoGreenTree {
  @Prop({ type: String, required: true, unique: true, index: true })
  treeId!: string;

  @Prop({ type: String, required: true, index: true })
  registrationId!: string;

  @Prop({ type: String, required: true })
  childName!: string;

  @Prop({ type: String, required: true })
  motherName!: string;

  @Prop({ type: String, enum: TreeSpecies, required: true })
  species!: TreeSpecies;

  @Prop({ type: String, enum: TreeStatus, default: TreeStatus.PLANTED })
  currentStatus!: TreeStatus;

  @Prop({ type: Date, default: Date.now })
  plantedDate!: Date;

  @Prop({ type: String, required: true })
  location!: string;

  @Prop({ type: String, default: '' })
  coordinates?: string;

  @Prop({ type: String, default: '' })
  plantingPartner?: string;

  @Prop({ type: Number, default: 0 })
  estimatedCO2Absorption!: number;

  @Prop({
    type: [{
      status: { type: String, enum: TreeStatus, required: true },
      date: { type: Date, required: true },
      imageUrl: { type: String, default: '' },
      notes: { type: String, default: '' },
      updatedBy: { type: String, default: '' },
    }],
    default: []
  })
  growthTimeline!: TreeGrowthStage[];

  @Prop({ type: String, default: '' })
  currentImageUrl?: string;

  @Prop({ type: Date, default: null })
  lastUpdatedDate?: Date;

  @Prop({ type: String, default: '' })
  lastUpdatedBy?: string;

  @Prop({ type: String, default: '' })
  notes?: string;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: Date, default: null })
  estimatedSaplingDate?: Date;

  @Prop({ type: Date, default: null })
  estimatedGrowingDate?: Date;

  @Prop({ type: Date, default: null })
  estimatedMatureDate?: Date;

  // Credit System Fields
  @Prop({ type: String, enum: TierLevel, default: TierLevel.SAPLING })
  tier!: TierLevel;

  @Prop({ type: Number, default: 500 })
  creditsUsed!: number;

  @Prop({ type: String, enum: CertificateType, default: CertificateType.BRONZE })
  certificateTier!: CertificateType;

  @Prop({ type: String, default: '' })
  certificateUrl?: string;

  @Prop({ type: String, default: 'PENDING' })
  plantingStatus!: 'PENDING' | 'SCHEDULED' | 'PLANTED' | 'VERIFIED';

  @Prop({ type: Date, default: null })
  actualPlantedDate?: Date;

  @Prop({ type: Object, default: null })
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

export const GoGreenTreeSchema = SchemaFactory.createForClass(GoGreenTree);

GoGreenTreeSchema.index({ registrationId: 1 });
GoGreenTreeSchema.index({ treeId: 1 });
GoGreenTreeSchema.index({ plantedDate: -1 });
GoGreenTreeSchema.index({ currentStatus: 1 });
GoGreenTreeSchema.index({ lastUpdatedDate: -1 });
