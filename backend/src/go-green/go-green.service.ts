import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoGreenTree, GoGreenTreeDocument, TreeStatus, TreeSpecies } from './schemas/go-green-tree.schema';

export interface CreateTreeDto {
  registrationId: string;
  childName: string;
  motherName: string;
  location: string;
  plantingPartner?: string;
}

export interface TreeStatsDto {
  totalTrees: number;
  totalCO2Absorption: number;
  treesByStatus: Record<TreeStatus, number>;
  treesBySpecies: Record<string, number>;
  recentTrees: GoGreenTreeDocument[];
}

@Injectable()
export class GoGreenService {
  private readonly logger = new Logger(GoGreenService.name);

  constructor(
    @InjectModel(GoGreenTree.name)
    private readonly treeModel: Model<GoGreenTreeDocument>,
  ) {}

  /**
   * Generates a unique tree ID in format: TREE-YYYY-XXXXXX
   */
  async generateTreeId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `TREE-${year}-`;
    
    try {
      // Find the last tree ID for this year
      const lastTree = await this.treeModel
        .findOne({ treeId: { $regex: `^${prefix}` } })
        .sort({ treeId: -1 })
        .select('treeId')
        .lean()
        .exec();

      let nextSequence = 1;
      if (lastTree) {
        const lastSequence = parseInt(lastTree.treeId.split('-').pop() || '0', 10);
        nextSequence = lastSequence + 1;
      }

      const treeId = `${prefix}${String(nextSequence).padStart(6, '0')}`;
      this.logger.log(`Generated tree ID: ${treeId}`);
      return treeId;
    } catch (error) {
      this.logger.error('Error generating tree ID:', error);
      // Fallback to timestamp-based ID
      const fallbackId = `TREE-${year}-${Date.now().toString().slice(-6)}`;
      this.logger.warn(`Using fallback tree ID: ${fallbackId}`);
      return fallbackId;
    }
  }

  /**
   * Plants a tree for a child registration
   */
  async plantTree(dto: CreateTreeDto): Promise<GoGreenTreeDocument> {
    try {
      // Check if tree already exists for this registration
      const existingTree = await this.treeModel.findOne({ 
        registrationId: dto.registrationId,
        isActive: true 
      }).exec();
      
      if (existingTree) {
        this.logger.log(`Tree already exists for ${dto.registrationId}: ${existingTree.treeId}`);
        return existingTree;
      }

      const treeId = await this.generateTreeId();
      
      // Select a random tree species (can be made more sophisticated)
      const speciesArray = Object.values(TreeSpecies);
      const randomSpecies = speciesArray[Math.floor(Math.random() * speciesArray.length)];
      
      // Calculate estimated CO2 absorption based on species
      const co2Rates: Record<string, number> = {
        [TreeSpecies.NEEM]: 48,
        [TreeSpecies.BANYAN]: 65,
        [TreeSpecies.PEEPAL]: 52,
        [TreeSpecies.MANGO]: 42,
        [TreeSpecies.TEAK]: 38,
        [TreeSpecies.BAMBOO]: 35,
        [TreeSpecies.EUCALYPTUS]: 55,
        [TreeSpecies.ASHOKA]: 40,
        [TreeSpecies.GULMOHAR]: 45,
        [TreeSpecies.COCONUT]: 30,
      };

      const tree = await this.treeModel.create({
        treeId,
        registrationId: dto.registrationId,
        childName: dto.childName,
        motherName: dto.motherName,
        species: randomSpecies,
        currentStatus: TreeStatus.PLANTED,
        location: dto.location,
        plantingPartner: dto.plantingPartner || 'WombTo18 Green Initiative',
        estimatedCO2Absorption: co2Rates[randomSpecies] || 40,
        plantedDate: new Date(),
        growthTimeline: [{
          status: TreeStatus.PLANTED,
          date: new Date(),
          imageUrl: '',
          notes: 'Tree planted as part of WombTo18 Green Initiative',
          updatedBy: 'System',
        }],
      });

      this.logger.log(`✅ Tree planted successfully: ${treeId} for child ${dto.childName} (${dto.registrationId})`);
      return tree;
    } catch (error) {
      this.logger.error(`❌ Failed to plant tree for ${dto.registrationId}:`, error);
      throw error;
    }
  }

  /**
   * Get tree information by registration ID
   */
  async getTreeByRegistrationId(registrationId: string): Promise<GoGreenTreeDocument | null> {
    return this.treeModel.findOne({ registrationId, isActive: true }).exec();
  }

  /**
   * Get tree information by tree ID
   */
  async getTreeByTreeId(treeId: string): Promise<GoGreenTreeDocument | null> {
    return this.treeModel.findOne({ treeId, isActive: true }).exec();
  }

  /**
   * Update tree status and growth timeline (for admin)
   */
  async updateTreeStatus(
    treeId: string, 
    status: TreeStatus, 
    imageUrl?: string,
    notes?: string,
    updatedBy?: string
  ): Promise<GoGreenTreeDocument> {
    const tree = await this.treeModel.findOne({ treeId }).exec();
    if (!tree) {
      throw new NotFoundException('Tree not found');
    }

    const previousStatus = tree.currentStatus;
    
    // Update current status
    tree.currentStatus = status;
    tree.lastUpdatedDate = new Date();
    tree.lastUpdatedBy = updatedBy || 'Admin';
    
    if (imageUrl) {
      tree.currentImageUrl = imageUrl;
    }
    if (notes) {
      tree.notes = notes;
    }

    // Add to growth timeline if status changed
    if (previousStatus !== status) {
      tree.growthTimeline.push({
        status,
        date: new Date(),
        imageUrl: imageUrl || '',
        notes: notes || '',
        updatedBy: updatedBy || 'Admin',
      });
    }

    await tree.save();
    this.logger.log(`Tree status updated: ${treeId} -> ${status} by ${updatedBy || 'Admin'}`);
    return tree;
  }

  /**
   * Add growth stage photo and notes (admin)
   */
  async addGrowthStage(
    treeId: string,
    imageUrl: string,
    notes?: string,
    updatedBy?: string
  ): Promise<GoGreenTreeDocument> {
    const tree = await this.treeModel.findOne({ treeId }).exec();
    if (!tree) {
      throw new NotFoundException('Tree not found');
    }

    // Add new growth stage entry
    tree.growthTimeline.push({
      status: tree.currentStatus,
      date: new Date(),
      imageUrl,
      notes: notes || '',
      updatedBy: updatedBy || 'Admin',
    });

    // Update current image
    tree.currentImageUrl = imageUrl;
    tree.lastUpdatedDate = new Date();
    tree.lastUpdatedBy = updatedBy || 'Admin';

    await tree.save();
    this.logger.log(`Growth stage added for tree: ${treeId} by ${updatedBy || 'Admin'}`);
    return tree;
  }

  /**
   * Get tree with full growth timeline (admin)
   */
  async getTreeWithTimeline(treeId: string): Promise<GoGreenTreeDocument | null> {
    return this.treeModel.findOne({ treeId, isActive: true }).exec();
  }

  /**
   * Get comprehensive Go Green statistics
   */
  async getGoGreenStats(): Promise<TreeStatsDto> {
    const [
      totalTrees,
      totalCO2,
      statusCounts,
      speciesCounts,
      recentTrees
    ] = await Promise.all([
      this.treeModel.countDocuments({ isActive: true }),
      this.treeModel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$estimatedCO2Absorption' } } }
      ]),
      this.treeModel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$currentStatus', count: { $sum: 1 } } }
      ]),
      this.treeModel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$species', count: { $sum: 1 } } }
      ]),
      this.treeModel.find({ isActive: true })
        .sort({ plantedDate: -1 })
        .limit(10)
        .exec()
    ]);

    // Format status counts
    const treesByStatus: Record<TreeStatus, number> = {
      [TreeStatus.PLANTED]: 0,
      [TreeStatus.SAPLING]: 0,
      [TreeStatus.GROWING]: 0,
      [TreeStatus.MATURE]: 0,
      [TreeStatus.VERIFIED]: 0,
    };
    statusCounts.forEach((item: any) => {
      treesByStatus[item._id as TreeStatus] = item.count;
    });

    // Format species counts
    const treesBySpecies: Record<string, number> = {};
    speciesCounts.forEach((item: any) => {
      treesBySpecies[item._id] = item.count;
    });

    return {
      totalTrees,
      totalCO2Absorption: totalCO2[0]?.total || 0,
      treesByStatus,
      treesBySpecies,
      recentTrees: recentTrees as GoGreenTreeDocument[],
    };
  }

  /**
   * Get all trees (for admin)
   */
  async getAllTrees(page: number = 1, limit: number = 50): Promise<{
    trees: GoGreenTreeDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [trees, total] = await Promise.all([
      this.treeModel.find({ isActive: true })
        .sort({ plantedDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.treeModel.countDocuments({ isActive: true })
    ]);

    return {
      trees: trees as GoGreenTreeDocument[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search trees by child name or registration ID
   */
  async searchTrees(query: string): Promise<GoGreenTreeDocument[]> {
    return this.treeModel.find({
      isActive: true,
      $or: [
        { childName: { $regex: query, $options: 'i' } },
        { registrationId: { $regex: query, $options: 'i' } },
        { treeId: { $regex: query, $options: 'i' } },
      ]
    }).sort({ plantedDate: -1 }).limit(20).exec();
  }

  /**
   * Plant trees for existing registrations that don't have trees yet
   */
  async plantTreesForExistingRegistrations(registrations: Array<{
    registrationId: string;
    childName: string;
    motherName: string;
    state: string;
  }>): Promise<GoGreenTreeDocument[]> {
    const plantedTrees: GoGreenTreeDocument[] = [];
    
    for (const registration of registrations) {
      // Check if tree already exists
      const existingTree = await this.getTreeByRegistrationId(registration.registrationId);
      if (existingTree) {
        this.logger.log(`Tree already exists for ${registration.registrationId}`);
        continue;
      }

      try {
        const tree = await this.plantTree({
          registrationId: registration.registrationId,
          childName: registration.childName,
          motherName: registration.motherName,
          location: registration.state,
          plantingPartner: 'WombTo18 Green Initiative (Retroactive)',
        });
        plantedTrees.push(tree);
        this.logger.log(`Retroactively planted tree ${tree.treeId} for ${registration.childName}`);
      } catch (error) {
        this.logger.error(`Failed to plant tree for ${registration.registrationId}: ${error instanceof Error ? error.message : error}`);
      }
    }

    return plantedTrees;
  }
}