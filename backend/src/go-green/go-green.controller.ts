import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { GoGreenService } from './go-green.service';
import { AwardCreditDto, BulkAwardCreditsDto, RedeemTreeDto } from './dto/credit.dto';

@Controller('go-green')
export class GoGreenController {
  private readonly logger = new Logger(GoGreenController.name);

  constructor(private readonly goGreenService: GoGreenService) {}

  // ==================== CREDIT MANAGEMENT ====================

  /**
   * GET /go-green/credits/:registrationId
   * Get credit balance, level, and transaction history
   */
  @Get('credits/:registrationId')
  async getCredits(@Param('registrationId') registrationId: string) {
    try {
      const credits = await this.goGreenService.getCredits(registrationId);
      const history = await this.goGreenService.getCreditHistory(registrationId, 20, 0);
      const tier = await this.goGreenService.getTierForCredits(credits.current);
      const nextTier = await this.goGreenService.getTierForCredits(credits.current + 1);
      
      // Calculate progress to next tier
      const progressPercentage = Math.round(
        ((credits.current - tier.minCredits) / (tier.maxCredits - tier.minCredits)) * 100
      );

      return {
        success: true,
        data: {
          registrationId,
          credits: {
            total: credits.total,
            current: credits.current,
            level: credits.level,
            nextTreeAt: credits.nextTreeAt,
            treesPlanted: credits.treesPlanted,
            co2Offset: credits.co2Offset,
            lastCreditDate: credits.lastCreditDate,
          },
          tier: {
            current: tier.level,
            next: nextTier.level !== tier.level ? nextTier.level : null,
            progress: progressPercentage,
            creditsForNextTier: tier.maxCredits - credits.current,
          },
          transactions: history.transactions,
        },
      };
    } catch (error) {
      this.logger.error('Error getting credits:', error);
      throw new BadRequestException('Failed to get credits');
    }
  }

  /**
   * GET /go-green/credits/:registrationId/history
   * Get detailed credit transaction history with pagination
   */
  @Get('credits/:registrationId/history')
  async getCreditHistory(
    @Param('registrationId') registrationId: string,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
    @Query('type') type?: string,
  ) {
    try {
      const history = await this.goGreenService.getCreditHistory(
        registrationId,
        parseInt(limit),
        parseInt(offset),
      );

      return {
        success: true,
        data: history,
      };
    } catch (error) {
      this.logger.error('Error getting credit history:', error);
      throw new BadRequestException('Failed to get credit history');
    }
  }

  /**
   * POST /go-green/credits/award
   * Award credits (admin/system triggered)
   */
  @Post('credits/award')
  async awardCredits(@Body() dto: AwardCreditDto) {
    try {
      const result = await this.goGreenService.awardCredits(dto);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error awarding credits:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to award credits');
    }
  }

  /**
   * POST /go-green/credits/bulk-award
   * Award credits for multiple past vaccinations (migration tool)
   */
  @Post('credits/bulk-award')
  async bulkAwardCredits(@Body() dto: BulkAwardCreditsDto) {
    try {
      const results = [];
      let totalCredits = 0;
      
      for (const vaccine of dto.vaccines) {
        // Determine sequence number from vaccine name or order
        const sequenceNumber = this.getVaccineSequence(vaccine.vaccineName);
        const credits = this.goGreenService.calculateVaccineCredits(sequenceNumber);
        totalCredits += credits;

        const result = await this.goGreenService.awardCredits({
          registrationId: dto.registrationId,
          amount: credits,
          type: 'VACCINATION' as any,
          description: `${vaccine.vaccineName} Vaccine Completed`,
          metadata: {
            vaccineId: vaccine.vaccineId,
            vaccineName: vaccine.vaccineName,
            sequenceNumber,
          },
        });

        results.push(result);
      }

      return {
        success: true,
        data: {
          totalTransactions: results.length,
          totalCreditsAwarded: totalCredits,
          transactions: results,
        },
      };
    } catch (error) {
      this.logger.error('Error bulk awarding credits:', error);
      throw new BadRequestException('Failed to award credits');
    }
  }

  // ==================== TREE REDEMPTION ====================

  /**
   * GET /go-green/tree/options
   * Get available tree options for redemption
   */
  @Get('tree/options')
  async getTreeOptions(@Query('registrationId') registrationId: string) {
    try {
      const options = await this.goGreenService.getTreeOptions(registrationId);

      return {
        success: true,
        data: options,
      };
    } catch (error) {
      this.logger.error('Error getting tree options:', error);
      throw new BadRequestException('Failed to get tree options');
    }
  }

  /**
   * POST /go-green/tree/redeem
   * Exchange credits for tree planting
   */
  @Post('tree/redeem')
  async redeemTree(@Body() dto: RedeemTreeDto) {
    try {
      const result = await this.goGreenService.redeemTree(dto);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error redeeming tree:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to redeem tree');
    }
  }

  // ==================== TIER INFORMATION ====================

  /**
   * GET /go-green/levels
   * Get all tier information
   */
  @Get('levels')
  async getAllTiers() {
    try {
      const tiers = await this.goGreenService.getAllTiers();

      return {
        success: true,
        data: tiers,
      };
    } catch (error) {
      this.logger.error('Error getting tiers:', error);
      throw new BadRequestException('Failed to get tiers');
    }
  }

  /**
   * GET /go-green/config
   * Get credit configuration (earning rates)
   */
  @Get('config')
  async getCreditConfig() {
    try {
      const config = this.goGreenService.getCreditConfig();

      return {
        success: true,
        data: config,
      };
    } catch (error) {
      this.logger.error('Error getting credit config:', error);
      throw new BadRequestException('Failed to get credit config');
    }
  }

  // ==================== LEADERBOARD (OPTIONAL) ====================

  /**
   * GET /go-green/leaderboard
   * Top children by credits
   */
  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit') limit: string = '10',
    @Query('timeframe') timeframe: string = 'all-time',
    @Query('region') region?: string,
  ) {
    try {
      // This would require aggregation from registration service
      // Placeholder implementation
      return {
        success: true,
        data: {
          leaderboard: [],
          message: 'Leaderboard coming soon',
        },
      };
    } catch (error) {
      this.logger.error('Error getting leaderboard:', error);
      throw new BadRequestException('Failed to get leaderboard');
    }
  }

  // ==================== HELPER METHODS ====================

  private getVaccineSequence(vaccineName: string): number {
    const vaccineMap: Record<string, number> = {
      'BCG': 1,
      'OPV-0': 1,
      'HepB': 1,
      'OPV-1': 2,
      'Pentavalent-1': 2,
      'OPV-2': 3,
      'Pentavalent-2': 3,
      'OPV-3': 4,
      'Pentavalent-3': 4,
      'Measles-1': 5,
      'MMR': 6,
      'Measles-2': 6,
    };

    // Find matching vaccine
    for (const [key, sequence] of Object.entries(vaccineMap)) {
      if (vaccineName.toUpperCase().includes(key)) {
        return sequence;
      }
    }

    // Default based on order in array
    return 1;
  }

  // ==================== ADMIN TREE MANAGEMENT ====================

  /**
   * GET /go-green/tree/:treeId/certificate
   * Download tree planting certificate PDF
   */
  @Get('tree/:treeId/certificate')
  async downloadTreeCertificate(
    @Param('treeId') treeId: string,
    @Res() res: Response,
  ) {
    try {
      const certificate = await this.goGreenService.generateTreeCertificatePDF(treeId);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${treeId}_Certificate.pdf"`,
        'Content-Length': certificate.length,
      });
      
      res.send(certificate);
    } catch (error) {
      this.logger.error('Error generating certificate:', error);
      throw new BadRequestException('Failed to generate certificate');
    }
  }

  /**
   * POST /go-green/admin/tree/:treeId/upload-image
   * Upload tree image (admin)
   */
  @Post('admin/tree/:treeId/upload-image')
  async uploadTreeImage(
    @Param('treeId') treeId: string,
    @Body() body: { imageUrl: string; updatedBy: string },
  ) {
    try {
      const tree = await this.goGreenService.uploadTreeImage(
        treeId,
        body.imageUrl,
        body.updatedBy,
      );

      return {
        success: true,
        data: tree,
      };
    } catch (error) {
      this.logger.error('Error uploading tree image:', error);
      throw new BadRequestException('Failed to upload tree image');
    }
  }
}

