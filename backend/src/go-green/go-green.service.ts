import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoGreenTree, TreeSpecies, TreeStatus, TierLevel, CertificateType } from './schemas/go-green-tree.schema';
import { CreditTransaction, CreditType } from './schemas/credit-transaction.schema';
import { TierConfig } from './schemas/tier-config.schema';
import { AwardCreditDto, RedeemTreeDto } from './dto/credit.dto';

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
  ) {}

  // ==================== CREDIT MANAGEMENT ====================

  /**
   * Award credits to a child
   */
  async generateTreeId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `TREE-${year}-`;
    
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

    return `${prefix}${String(nextSequence).padStart(6, '0')}`;
  }

  /**
   * Plants a tree for a child registration
   */
  async plantTree(dto: CreateTreeDto): Promise<GoGreenTreeDocument> {
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
    });

    this.logger.log(`Tree planted: ${treeId} for child ${dto.childName} (${dto.registrationId})`);
    return tree;
  }

  /**
   * Get tree information by registration ID
   */
  async getTreeByRegistrationId(registrationId: string): Promise<GoGreenTreeDocument | null> {
    return this.treeModel.findOne({ registrationId, isActive: true }).exec();
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
  }> {
    const session = await this.treeModel.db.startSession();
    session.startTransaction();

    try {
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

      // Create tree record
      const treeId = await this.generateTreeId();
      const tree = await this.treeModel.create([{
        treeId,
        registrationId: dto.registrationId,
        childName: dto.dedicateTo || 'Child',
        motherName: 'Mother',
        species: species as TreeSpecies,
        tier: dto.tier as TierLevel,
        creditsUsed: tierConfig.minCredits,
        certificateTier: tierConfig.certificateType,
        plantingStatus: 'PENDING',
        estimatedCO2Absorption: tierConfig.co2Absorption,
        growthTimeline: [{
          status: 'PLANTED',
          date: new Date(),
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

      // Update child credits
      await this.updateChildCredits(dto.registrationId, {
        total: credits.total,
        current: newBalance,
        level: (await this.getTierForCredits(newBalance)).level,
        nextTreeAt: this.getNextTierCredits((await this.getTierForCredits(newBalance)).level),
        treesPlanted: credits.treesPlanted + 1,
        co2Offset: credits.co2Offset + tierConfig.co2Absorption,
        lastCreditDate: credits.lastCreditDate,
      }, session);

      // Generate certificate URL (placeholder - implement actual certificate generation)
      const certificateUrl = `/certificates/${treeId}_${tierConfig.certificateType}.pdf`;

      await session.commitTransaction();

      return {
        treeId,
        tier: dto.tier,
        creditsUsed: tierConfig.minCredits,
        remainingCredits: newBalance,
        certificateUrl,
        estimatedPlantingDate: this.getEstimatedPlantingDate(),
        message: `Congratulations! A ${tierConfig.treeType} will be planted in ${dto.dedicateTo || 'your child'}'s name!`,
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
    // This would update the registration/child document
    // For now, we'll just log it
    this.logger.log(`Updating credits for ${registrationId}:`, credits);
    
    // In production, inject RegistrationService and call:
    // await this.registrationService.updateCredits(registrationId, credits, session);
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

  private async generateTreeId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.treeModel.countDocuments({
      treeId: { $regex: `^TREE-${year}-` },
    });
    const sequence = String(count + 1).padStart(6, '0');
    return `TREE-${year}-${sequence}`;
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
    const treeId = await this.generateTreeId();
    
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
}
