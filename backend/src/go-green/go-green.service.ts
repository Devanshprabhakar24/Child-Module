import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { GoGreenTree, TreeSpecies, TreeStatus, TierLevel, CertificateType } from './schemas/go-green-tree.schema';
import { CreditTransaction, CreditType } from './schemas/credit-transaction.schema';
import { TierConfig } from './schemas/tier-config.schema';
import { PlantedTree, TreeStatus as PlantedTreeStatus } from './schemas/planted-tree.schema';
import { ChildRegistration, ChildRegistrationDocument } from '../registration/schemas/child-registration.schema';
import { AwardCreditDto, RedeemTreeDto } from './dto/credit.dto';
import { TreeCertificateService } from './tree-certificate.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

// Type definitions
export type GoGreenTreeDocument = GoGreenTree & Document;
export type PlantedTreeDocument = PlantedTree & Document;

export interface CreateTreeDto {
  registrationId: string;
  childName: string;
  motherName: string;
  location: string;
  plantingPartner?: string;
}

interface GoGreenCredits {
  total: number;
  current: number;
  level: TierLevel;
  nextTreeAt: number;
  treesPlanted: number;
  co2Offset: number;
  lastCreditDate?: Date;
}

@Injectable()
export class GoGreenService {
  private readonly logger = new Logger(GoGreenService.name);

  constructor(
    @InjectModel(GoGreenTree.name)
    private readonly treeModel: Model<GoGreenTree>,
    @InjectModel(CreditTransaction.name)
    private readonly creditTransactionModel: Model<CreditTransaction>,
    @InjectModel(TierConfig.name)
    private readonly tierConfigModel: Model<TierConfig>,
    @InjectModel(PlantedTree.name)
    private readonly plantedTreeModel: Model<PlantedTree>,
    @InjectModel(ChildRegistration.name)
    private readonly childModel: Model<ChildRegistrationDocument>,
    private readonly treeCertificateService: TreeCertificateService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // ==================== CREDIT MANAGEMENT ====================

  /**
   * Award credits to a child
   */
  async awardCredits(dto: AwardCreditDto): Promise<{
    success: boolean;
    newBalance: number;
    tier: TierConfig;
    tierChanged: boolean;
    message: string;
  }> {
    const session = await this.treeModel.db.startSession();
    session.startTransaction();

    try {
      // Get current credits
      const credits = await this.getCredits(dto.registrationId, session);
      const previousTier = await this.getTierForCredits(credits.current);

      // Calculate new balance
      const newBalance = credits.current + dto.amount;
      const newTier = await this.getTierForCredits(newBalance);
      const tierChanged = previousTier.level !== newTier.level;

      // Create transaction record
      await this.creditTransactionModel.create([{
        registrationId: dto.registrationId,
        amount: dto.amount,
        type: dto.type,
        description: dto.description,
        balanceAfter: newBalance,
        metadata: dto.metadata,
      }], { session });

      // Update child credits
      await this.updateChildCredits(dto.registrationId, {
        total: credits.total + dto.amount,
        current: newBalance,
        level: newTier.level,
        nextTreeAt: this.getNextTierCredits(newTier.level),
        treesPlanted: credits.treesPlanted,
        co2Offset: credits.co2Offset,
        lastCreditDate: new Date(),
      }, session);

      await session.commitTransaction();

      // Send real-time notification for credit earning
      this.notificationsGateway.sendGoGreenNotification(
        dto.registrationId,
        `You earned ${dto.amount} Go Green credits! 🌱 New balance: ${newBalance}`
      );

      return {
        success: true,
        newBalance,
        tier: newTier,
        tierChanged,
        message: this.getCreditAwardMessage(dto.amount, newBalance, newTier, tierChanged),
      };
    } catch (error) {
      await session.abortTransaction();
      this.logger.error('Error awarding credits:', error);
      throw new BadRequestException('Failed to award credits');
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get credits for a child
   */
  async getCredits(registrationId: string, session?: any): Promise<GoGreenCredits> {
    const transactions = await this.creditTransactionModel
      .find({ registrationId })
      .session(session || null);

    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const current = transactions.length > 0 
      ? transactions[transactions.length - 1].balanceAfter 
      : 0;

    const tier = await this.getTierForCredits(current);
    const trees = await this.treeModel.countDocuments({ registrationId });

    return {
      total,
      current,
      level: tier.level,
      nextTreeAt: this.getNextTierCredits(tier.level),
      treesPlanted: trees,
      co2Offset: tier.co2Absorption * trees,
      lastCreditDate: transactions.length > 0 ? transactions[transactions.length - 1].createdAt : undefined,
    };
  }

  /**
   * Check if credits were already awarded for a specific vaccine
   * Prevents duplicate credit awards when vaccines are marked/unmarked multiple times
   */
  async checkIfVaccineCredited(registrationId: string, milestoneId: string): Promise<boolean> {
    const existingTransaction = await this.creditTransactionModel.findOne({
      registrationId,
      type: CreditType.VACCINATION,
      'metadata.vaccineId': milestoneId,
    }).exec();

    return !!existingTransaction;
  }

  /**
   * Get vaccine milestone by ID to check due date
   */
  async getVaccineMilestone(milestoneId: string): Promise<{ dueDate: Date } | null> {
    try {
      const Milestone = this.treeModel.db.model('Milestone');
      const milestone = await Milestone.findById(milestoneId).select('dueDate').lean().exec();
      return milestone;
    } catch (error) {
      this.logger.error(`Error fetching vaccine milestone ${milestoneId}:`, error);
      return null;
    }
  }

  /**
   * Get child registration to check registration date
   */
  async getChildRegistration(registrationId: string): Promise<{ createdAt: Date } | null> {
    try {
      const child = await this.childModel.findOne({ registrationId })
        .select('createdAt')
        .lean()
        .exec();
      return child;
    } catch (error) {
      this.logger.error(`Error fetching child registration ${registrationId}:`, error);
      return null;
    }
  }

  /**
   * Get credit transaction history
   */
  async getCreditHistory(registrationId: string, limit: number = 50, offset: number = 0) {
    const transactions = await this.creditTransactionModel
      .find({ registrationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    const total = await this.creditTransactionModel.countDocuments({ registrationId });

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }

  // ==================== TREE REDEMPTION ====================

  /**
   * Redeem credits for a tree
   */
  async redeemTree(dto: RedeemTreeDto): Promise<{
    treeId: string;
    tier: string;
    creditsUsed: number;
    remainingCredits: number;
    certificateUrl: string;
    estimatedPlantingDate: Date;
    message: string;
    treeDetails: any;
  }> {
    const session = await this.treeModel.db.startSession();
    session.startTransaction();

    try {
      // Get child registration
      const child = await this.childModel.findOne({ registrationId: dto.registrationId }).session(session);
      if (!child) {
        throw new NotFoundException('Child registration not found');
      }

      // Get current credits
      const credits = await this.getCredits(dto.registrationId, session);

      // Get tier config
      const tierConfig = await this.tierConfigModel.findOne({ 
        level: dto.tier as TierLevel,
        isActive: true 
      }).session(session);

      if (!tierConfig) {
        throw new NotFoundException('Invalid tier selected');
      }

      // Check if enough credits
      if (credits.current < tierConfig.minCredits) {
        throw new BadRequestException(
          `Insufficient credits. Need ${tierConfig.minCredits} credits, you have ${credits.current}`
        );
      }

      // Determine species based on tier if not provided
      let species = dto.treeSpecies;
      if (!species) {
        species = this.getDefaultSpeciesForTier(dto.tier as TierLevel);
      }

      // Generate tree ID based on registration ID
      const treeId = await this.generateTreeId(dto.registrationId);
      const plantedDate = new Date();

      // Determine location with proper fallback
      const treeLocation = dto.location || (child.state ? String(child.state) : null) || 'India';
      
      this.logger.log(`🌍 Tree location determined: ${treeLocation} (dto: ${dto.location}, state: ${child.state})`);
      this.logger.log(`📝 Creating PlantedTree with data:`, {
        treeId,
        registrationId: dto.registrationId,
        location: treeLocation,
        species,
      });

      // Create PlantedTree record
      const plantedTree = await this.plantedTreeModel.create([{
        treeId,
        registrationId: dto.registrationId,
        childName: child.childName,
        motherName: child.motherName,
        species,
        location: treeLocation,
        plantingPartner: 'WombTo18 Green Initiative',
        plantedDate,
        creditsUsed: tierConfig.minCredits,
        status: PlantedTreeStatus.PLANTED,
        co2OffsetKg: tierConfig.co2Absorption,
        heightCm: 0,
        ageMonths: 0,
        growthTimeline: [{
          date: plantedDate,
          heightCm: 0,
          notes: `Tree redeemed using ${tierConfig.minCredits} credits - ${tierConfig.treeType}`,
          updatedBy: 'SYSTEM',
        }],
      }], { session });
      
      this.logger.log(`✅ PlantedTree created successfully: ${treeId}`);

      // Create GoGreenTree record (for backward compatibility)
      await this.treeModel.create([{
        treeId,
        registrationId: dto.registrationId,
        childName: child.childName,
        motherName: child.motherName,
        species: species as TreeSpecies,
        location: treeLocation,
        tier: dto.tier as TierLevel,
        creditsUsed: tierConfig.minCredits,
        certificateTier: tierConfig.certificateType,
        plantingStatus: 'PENDING',
        estimatedCO2Absorption: tierConfig.co2Absorption,
        growthTimeline: [{
          status: 'PLANTED',
          date: plantedDate,
          notes: 'Tree redemption initiated',
        }],
      }], { session });

      // Deduct credits
      const newBalance = credits.current - tierConfig.minCredits;
      
      await this.creditTransactionModel.create([{
        registrationId: dto.registrationId,
        amount: -tierConfig.minCredits,
        type: CreditType.REDEMPTION,
        description: `Redeemed for ${tierConfig.treeType}`,
        balanceAfter: newBalance,
        metadata: {
          treeId,
          treeTier: dto.tier,
        },
      }], { session });

      // Update child credits and add tree to plantedTrees array
      const newTier = await this.getTierForCredits(newBalance);
      await this.updateChildCredits(dto.registrationId, {
        total: credits.total,
        current: newBalance,
        level: newTier.level,
        nextTreeAt: this.getNextTierCredits(newTier.level),
        treesPlanted: credits.treesPlanted + 1,
        co2Offset: credits.co2Offset + tierConfig.co2Absorption,
        lastCreditDate: credits.lastCreditDate,
      }, session);

      // Add tree to child's plantedTrees array
      await this.childModel.updateOne(
        { registrationId: dto.registrationId },
        {
          $push: {
            plantedTrees: {
              treeId,
              species,
              location: treeLocation,
              plantedDate,
              creditsUsed: tierConfig.minCredits,
              status: 'PLANTED',
              imageUrl: null,
              co2Offset: tierConfig.co2Absorption,
            },
          },
        },
        { session }
      );

      // Generate certificate URL (placeholder - implement actual certificate generation)
      const certificateUrl = `/certificates/${treeId}_${tierConfig.certificateType}.pdf`;

      await session.commitTransaction();

      this.logger.log(`✅ Tree redeemed: ${treeId} for ${dto.registrationId} - ${tierConfig.minCredits} credits used, ${newBalance} remaining`);

      return {
        treeId,
        tier: dto.tier,
        creditsUsed: tierConfig.minCredits,
        remainingCredits: newBalance,
        certificateUrl,
        estimatedPlantingDate: this.getEstimatedPlantingDate(),
        message: `Congratulations! A ${tierConfig.treeType} will be planted in ${child.childName}'s name!`,
        treeDetails: {
          treeId,
          species,
          location: treeLocation,
          plantedDate,
          status: 'PLANTED',
          co2OffsetKg: tierConfig.co2Absorption,
          tier: dto.tier,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      this.logger.error('Error redeeming tree:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to redeem tree');
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get available tree options for redemption
   */
  async getTreeOptions(registrationId: string) {
    const credits = await this.getCredits(registrationId);
    const tierConfigs = await this.tierConfigModel.find({ isActive: true }).sort({ minCredits: 1 });

    const availableTrees = tierConfigs
      .filter(tc => tc.level !== TierLevel.SEEDLING && tc.level !== TierLevel.FOREST)
      .map(tc => ({
        tier: tc.level,
        treeType: tc.treeType,
        creditsRequired: tc.minCredits,
        co2Absorption: tc.co2Absorption,
        certificate: tc.certificateType,
        canRedeem: credits.current >= tc.minCredits,
        creditsNeeded: Math.max(0, tc.minCredits - credits.current),
      }));

    return {
      currentCredits: credits.current,
      availableTrees,
    };
  }

  // ==================== TIER MANAGEMENT ====================

  /**
   * Get tier configuration for a credit amount
   */
  async getTierForCredits(credits: number): Promise<TierConfig> {
    const tier = await this.tierConfigModel.findOne({
      minCredits: { $lte: credits },
      maxCredits: { $gte: credits },
      isActive: true,
    });

    if (!tier) {
      // Default to SEEDLING if no tier found
      return {
        level: TierLevel.SEEDLING,
        minCredits: 0,
        maxCredits: 499,
        treeType: 'Virtual Tree',
        co2Absorption: 0,
        certificateType: CertificateType.DIGITAL_BADGE,
        badgeIcon: '🌱',
        color: '#94a3b8',
        benefits: ['Digital badge', 'Progress tracking'],
        isActive: true,
      } as TierConfig;
    }

    return tier;
  }

  /**
   * Get all tier configurations
   */
  async getAllTiers() {
    return await this.tierConfigModel.find({ isActive: true }).sort({ minCredits: 1 });
  }

  // ==================== HELPER METHODS ====================

  private async updateChildCredits(registrationId: string, credits: GoGreenCredits, session: any) {
    // Update the child registration document with new credit values
    await this.childModel.updateOne(
      { registrationId },
      {
        $set: {
          goGreenCredits: {
            total: credits.total,
            current: credits.current,
            level: credits.level,
            nextTreeAt: credits.nextTreeAt,
            treesPlanted: credits.treesPlanted,
            co2Offset: credits.co2Offset,
            lastCreditDate: credits.lastCreditDate,
          },
        },
      },
      { session },
    ).exec();
  }

  private getCreditAwardMessage(amount: number, balance: number, tier: TierConfig, tierChanged: boolean): string {
    if (tierChanged) {
      return `🎉 Congratulations! You've reached ${tier.badgeIcon} ${tier.level} tier!`;
    }
    
    const nextTreeCredits = 500 - (balance % 500);
    if (nextTreeCredits <= 0) {
      return `🌳 You have enough credits to plant a tree!`;
    }
    
    return `${amount} credits awarded! You're ${nextTreeCredits} credits away from planting your first tree!`;
  }

  private async generateTreeId(registrationId: string): Promise<string> {
    // Extract parts from registration ID: CHD-GJ-20230120-000001
    // Tree ID format: TREE-GJ-20230120-XXXXXX (with unique sequence)
    const parts = registrationId.split('-');
    
    if (parts.length !== 4 || parts[0] !== 'CHD') {
      throw new BadRequestException('Invalid registration ID format');
    }
    
    const state = parts[1];      // GJ
    const date = parts[2];       // 20230120
    
    // Find the highest tree sequence number for this state and date
    const prefix = `TREE-${state}-${date}-`;
    const lastTree = await this.treeModel
      .findOne({ treeId: { $regex: `^${prefix}` } })
      .sort({ treeId: -1 })
      .select('treeId')
      .lean()
      .exec();
    
    let sequence = 1;
    if (lastTree) {
      const lastSequence = parseInt(lastTree.treeId.split('-').pop() || '0', 10);
      sequence = lastSequence + 1;
    }
    
    const paddedSequence = String(sequence).padStart(6, '0');
    const treeId = `TREE-${state}-${date}-${paddedSequence}`;
    
    this.logger.log(`🆔 Generated tree ID: ${treeId} (sequence: ${sequence}) for registration: ${registrationId}`);
    
    return treeId;
  }

  private getDefaultSpeciesForTier(tier: TierLevel): string {
    const speciesMap: Record<TierLevel, string> = {
      [TierLevel.SEEDLING]: TreeSpecies.NEEM,
      [TierLevel.SAPLING]: TreeSpecies.NEEM,
      [TierLevel.YOUNG]: TreeSpecies.PEEPAL,
      [TierLevel.MATURE]: TreeSpecies.BANYAN,
      [TierLevel.GUARDIAN]: TreeSpecies.GULMOHAR,
      [TierLevel.FOREST]: TreeSpecies.MANGO,
    };
    return speciesMap[tier] || TreeSpecies.NEEM;
  }

  private getCO2ForTier(tier: string): number {
    const co2Map: Record<string, number> = {
      SAPLING: 15,
      YOUNG: 30,
      MATURE: 50,
      GUARDIAN: 100,
      FOREST: 200,
    };
    return co2Map[tier] || 0;
  }

  private getNextTierCredits(currentTier: TierLevel): number {
    const nextTierMap: Record<TierLevel, number> = {
      [TierLevel.SEEDLING]: 500,
      [TierLevel.SAPLING]: 1000,
      [TierLevel.YOUNG]: 2000,
      [TierLevel.MATURE]: 3500,
      [TierLevel.GUARDIAN]: 5000,
      [TierLevel.FOREST]: 999999,
    };
    return nextTierMap[currentTier] || 500;
  }

  private getEstimatedPlantingDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days from now
    return date;
  }

  // ==================== VACCINATION CREDIT CALCULATION ====================

  /**
   * Calculate credits for a vaccine based on sequence number
   */
  calculateVaccineCredits(sequenceNumber: number): number {
    const baseCredits: Record<number, number> = {
      1: 50,
      2: 100,
      3: 100,
      4: 100,
      5: 150,
      6: 150,
    };

    const seriesBonus = sequenceNumber === 6 ? 200 : 0;
    return (baseCredits[sequenceNumber] || 50) + seriesBonus;
  }

  /**
   * Get credit configuration for UI display
   */
  getCreditConfig() {
    return {
      vaccination: {
        1: { credits: 50, name: 'Birth Dose' },
        2: { credits: 100, name: '6 Weeks' },
        3: { credits: 100, name: '10 Weeks' },
        4: { credits: 100, name: '14 Weeks' },
        5: { credits: 150, name: '9 Months' },
        6: { credits: 350, name: '12-18 Months (includes 200 bonus)' },
      },
      healthRecords: {
        upload: 10,
        growthCheck: 25,
        annualCheckup: 50,
      },
      engagement: {
        share: 5,
        profileComplete: 50,
        referral: 100,
        loginStreak: 25,
      },
    };
  }

  // ==================== TREE MANAGEMENT (for registration service) ====================

  /**
   * Get tree by registration ID
   */
  async getTreeByRegistrationId(registrationId: string): Promise<GoGreenTree | null> {
    return await this.treeModel.findOne({ registrationId }).exec();
  }

  /**
   * Plant a tree (for registration service)
   */
  async plantTree(data: {
    registrationId: string;
    childName: string;
    motherName: string;
    state?: string;
    location?: string;
    plantingPartner?: string;
  }): Promise<GoGreenTree> {
    const treeId = await this.generateTreeId(data.registrationId);
    
    const tree = await this.treeModel.create({
      treeId,
      registrationId: data.registrationId,
      childName: data.childName,
      motherName: data.motherName,
      species: TreeSpecies.NEEM,
      currentStatus: TreeStatus.PLANTED,
      plantedDate: new Date(),
      location: data.location || data.state || '',
      plantingPartner: data.plantingPartner,
      estimatedCO2Absorption: 15,
      tier: TierLevel.SAPLING,
      creditsUsed: 0,
      certificateTier: CertificateType.BRONZE,
      plantingStatus: 'PENDING',
      growthTimeline: [{
        status: TreeStatus.PLANTED,
        date: new Date(),
        notes: 'Tree planted for newborn',
      }],
    });

    return tree;
  }

  async uploadTreeImage(
    treeId: string,
    imageUrl: string,
    updatedBy: string,
  ): Promise<GoGreenTree> {
    const tree = await this.treeModel.findOne({ treeId }).exec();
    if (!tree) {
      throw new NotFoundException(`Tree with ID ${treeId} not found`);
    }

    // Update current image
    tree.currentImageUrl = imageUrl;
    tree.lastUpdatedDate = new Date();
    tree.lastUpdatedBy = updatedBy;

    // Add to growth timeline
    tree.growthTimeline.push({
      status: tree.currentStatus,
      date: new Date(),
      imageUrl,
      notes: 'Image uploaded',
      updatedBy,
    });

    await tree.save();
    this.logger.log(`Image uploaded for tree ${treeId}`);

    return tree;
  }

  /**
   * Generate tree planting certificate PDF
   */
  async generateTreeCertificatePDF(treeId: string): Promise<Buffer> {
    // Find tree in both collections
    let tree = await this.treeModel.findOne({ treeId }).exec();
    let plantedTree = await this.plantedTreeModel.findOne({ treeId }).exec();
    
    if (!tree && !plantedTree) {
      throw new NotFoundException(`Tree with ID ${treeId} not found`);
    }

    // Get child registration for additional details
    const registrationId = tree?.registrationId || plantedTree?.registrationId;
    const child = await this.childModel.findOne({ registrationId }).exec();
    
    if (!child) {
      throw new NotFoundException('Child registration not found');
    }

    // Prepare certificate data
    const certificateData = {
      treeId,
      childName: child.childName,
      motherName: child.motherName,
      species: tree?.species || plantedTree?.species || 'Neem',
      plantedDate: tree?.plantedDate || plantedTree?.plantedDate || new Date(),
      registrationId: registrationId || '',
      tier: tree?.tier || 'SAPLING',
      co2Offset: tree?.estimatedCO2Absorption || plantedTree?.co2OffsetKg || 15,
    };

    this.logger.log(`📜 Generating PDF certificate for tree ${treeId}`);

    // Generate PDF using TreeCertificateService
    const pdfBuffer = await this.treeCertificateService.generateTreeCertificate(certificateData);

    return pdfBuffer;
  }

  /**
   * Generate tree planting certificate (legacy - returns data only)
   */
  async generateTreeCertificate(treeId: string): Promise<{
    certificateUrl: string;
    treeData: any;
  }> {
    // Find tree in both collections
    let tree = await this.treeModel.findOne({ treeId }).exec();
    let plantedTree = await this.plantedTreeModel.findOne({ treeId }).exec();
    
    if (!tree && !plantedTree) {
      throw new NotFoundException(`Tree with ID ${treeId} not found`);
    }

    // Get child registration for additional details
    const registrationId = tree?.registrationId || plantedTree?.registrationId;
    const child = await this.childModel.findOne({ registrationId }).exec();
    
    if (!child) {
      throw new NotFoundException('Child registration not found');
    }

    // Prepare certificate data
    const certificateData = {
      treeId,
      childName: child.childName,
      motherName: child.motherName,
      species: tree?.species || plantedTree?.species || 'Neem',
      plantedDate: tree?.plantedDate || plantedTree?.plantedDate || new Date(),
      location: tree?.location || plantedTree?.location || child.state,
      tier: tree?.tier || 'SAPLING',
      certificateType: tree?.certificateTier || 'BRONZE',
      co2Offset: tree?.estimatedCO2Absorption || plantedTree?.co2OffsetKg || 15,
      creditsUsed: tree?.creditsUsed || plantedTree?.creditsUsed || 500,
    };

    // Certificate URL for download
    const certificateUrl = `/go-green/tree/${treeId}/certificate`;

    this.logger.log(`📜 Certificate data prepared for tree ${treeId}`);

    return {
      certificateUrl,
      treeData: certificateData,
    };
  }

}
