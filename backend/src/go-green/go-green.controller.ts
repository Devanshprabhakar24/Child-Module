import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { GoGreenService } from './go-green.service';

@Controller('go-green')
export class GoGreenController {
  private readonly logger = new Logger(GoGreenController.name);

  constructor(private readonly goGreenService: GoGreenService) {}

  // ==================== TREE MANAGEMENT ====================

  /**
   * GET /go-green/tree/:registrationId
   * Get tree information for a child
   */
  @Get('tree/:registrationId')
  async getTree(@Param('registrationId') registrationId: string) {
    try {
      const tree = await this.goGreenService.getTreeByRegistrationId(registrationId);
      
      if (!tree) {
        return {
          success: false,
          message: 'No tree found for this registration',
        };
      }

      return {
        success: true,
        data: tree,
      };
    } catch (error) {
      this.logger.error('Error getting tree:', error);
      throw new BadRequestException('Failed to get tree information');
    }
  }

  /**
   * GET /go-green/stats
   * Get Go Green statistics
   */
  @Get('stats')
  async getStats() {
    try {
      const stats = await this.goGreenService.getGoGreenStats();

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error('Error getting Go Green stats:', error);
      throw new BadRequestException('Failed to get statistics');
    }
  }

  /**
   * GET /go-green/trees
   * Get all trees (admin)
   */
  @Get('trees')
  async getAllTrees(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    try {
      const result = await this.goGreenService.getAllTrees(
        parseInt(page),
        parseInt(limit)
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error getting all trees:', error);
      throw new BadRequestException('Failed to get trees');
    }
  }

  /**
   * GET /go-green/search
   * Search trees by child name or registration ID
   */
  @Get('search')
  async searchTrees(@Query('q') query: string) {
    try {
      if (!query || query.trim().length < 2) {
        throw new BadRequestException('Search query must be at least 2 characters');
      }

      const trees = await this.goGreenService.searchTrees(query.trim());

      return {
        success: true,
        data: trees,
      };
    } catch (error) {
      this.logger.error('Error searching trees:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to search trees');
    }
  }

  /**
   * GET /go-green/config
   * Get credit configuration (earning rates)
   */
  @Get('config')
  async getCreditConfig() {
    try {
      const config = {
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

      return {
        success: true,
        data: config,
      };
    } catch (error) {
      this.logger.error('Error getting credit config:', error);
      throw new BadRequestException('Failed to get credit config');
    }
  }
}
