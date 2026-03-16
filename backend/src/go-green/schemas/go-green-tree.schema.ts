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

// Tree Growth Timeline Interface
export interface TreeGrowthStage {
  status: TreeStatus;
  date: Date;
  imageUrl?: string;
  notes?: string;
  updatedBy?: string; // Admin who updated
}

@Schema({ timestamps: true, collection: 'go_green_trees' })
export class GoGreenTree {
  @Prop({ type: String, required: true, unique: true, index: true })
  treeId!: string; // Format: TREE-YYYY-XXXXXX

  @Prop({ type: String, required: true, index: true })
  registrationId!: string; // Child's registration ID

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
  location!: string; // Planting location (state/region)

  @Prop({ type: String, default: '' })
  coordinates?: string; // GPS coordinates (optional)

  @Prop({ type: String, default: '' })
  plantingPartner?: string; // NGO/Organization that planted the tree

  @Prop({ type: Number, default: 0 })
  estimatedCO2Absorption!: number; // Estimated CO2 absorption in kg/year

  // Growth Timeline - Array of growth stages with photos
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

  // Current stage photos
  @Prop({ type: String, default: '' })
  currentImageUrl?: string; // Current stage photo

  @Prop({ type: Date, default: null })
  lastUpdatedDate?: Date;

  @Prop({ type: String, default: '' })
  lastUpdatedBy?: string; // Admin who last updated

  @Prop({ type: String, default: '' })
  notes?: string; // General notes about the tree

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  // Estimated timeline dates (calculated based on species)
  @Prop({ type: Date, default: null })
  estimatedSaplingDate?: Date;

  @Prop({ type: Date, default: null })
  estimatedGrowingDate?: Date;

  @Prop({ type: Date, default: null })
  estimatedMatureDate?: Date;
}

export const GoGreenTreeSchema = SchemaFactory.createForClass(GoGreenTree);

// Indexes for better performance
GoGreenTreeSchema.index({ registrationId: 1 });
GoGreenTreeSchema.index({ treeId: 1 });
GoGreenTreeSchema.index({ plantedDate: -1 });
GoGreenTreeSchema.index({ currentStatus: 1 });
GoGreenTreeSchema.index({ lastUpdatedDate: -1 });