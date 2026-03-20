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
  // UseGuards,
} from '@nestjs/common';
import { GrowthChartService, CreateGrowthRecordDto, UpdateGrowthRecordDto, GrowthRecordFilters } from './growth-chart.service';
import { GrowthRecordStatus } from './schemas/growth-record.schema';
import { RegistrationService } from '../registration/registration.service';
// import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('growth-chart')
// @UseGuards(AuthGuard)
export class GrowthChartController {
  constructor(
    private readonly growthChartService: GrowthChartService,
    private readonly registrationService: RegistrationService,
  ) {}

  /**
   * Add growth record
   * POST /growth-chart/:registrationId
   */
  @Post(':registrationId')
  async addGrowthRecord(
    @Param('registrationId') registrationId: string,
    @Body() body: CreateGrowthRecordDto,
  ) {
    // Validate registration exists
    const registration = await this.registrationService.findByRegistrationId(registrationId);
    if (!registration) {
      throw new BadRequestException('Registration not found');
    }

    // Validate growth data
    this.growthChartService.validateGrowthData(body.height, body.weight);

    try {
      const growthRecord = await this.growthChartService.createGrowthRecord({
        registrationId,
        height: body.height,
        weight: body.weight,
        measurementDate: new Date(body.measurementDate),
        notes: body.notes,
        uploadedByUserId: body.uploadedByUserId,
      });

      return {
        success: true,
        data: growthRecord,
        message: 'Growth record added successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to add growth record: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Get growth records for a registration
   * GET /growth-chart/:registrationId
   */
  @Get(':registrationId')
  async getGrowthRecords(
    @Param('registrationId') registrationId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: GrowthRecordStatus,
  ) {
    const filters: GrowthRecordFilters = {
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      status,
    };

    const records = await this.growthChartService.getGrowthRecords(registrationId, filters);
    const stats = await this.growthChartService.getGrowthRecordsStats(registrationId);

    return {
      success: true,
      data: {
        records,
        stats,
      },
    };
  }

  /**
   * Get growth progress for a registration
   * GET /growth-chart/:registrationId/progress
   */
  @Get(':registrationId/progress')
  async getGrowthProgress(@Param('registrationId') registrationId: string) {
    const progress = await this.growthChartService.getGrowthProgress(registrationId);

    return {
      success: true,
      data: progress,
    };
  }

  /**
   * Get latest growth record
   * GET /growth-chart/:registrationId/latest
   */
  @Get(':registrationId/latest')
  async getLatestGrowthRecord(@Param('registrationId') registrationId: string) {
    const record = await this.growthChartService.getLatestGrowthRecord(registrationId);

    return {
      success: true,
      data: record,
    };
  }

  /**
   * Get growth record by ID
   * GET /growth-chart/record/:recordId
   */
  @Get('record/:recordId')
  async getGrowthRecordById(@Param('recordId') recordId: string) {
    const record = await this.growthChartService.getGrowthRecordById(recordId);

    return {
      success: true,
      data: record,
    };
  }

  /**
   * Update growth record
   * PUT /growth-chart/record/:recordId
   */
  @Put('record/:recordId')
  async updateGrowthRecord(
    @Param('recordId') recordId: string,
    @Body() body: UpdateGrowthRecordDto,
  ) {
    // Validate if updating height/weight
    if (body.height !== undefined || body.weight !== undefined) {
      const height = body.height || (await this.growthChartService.getGrowthRecordById(recordId)).height;
      const weight = body.weight || (await this.growthChartService.getGrowthRecordById(recordId)).weight;
      this.growthChartService.validateGrowthData(height, weight);
    }

    const updatedRecord = await this.growthChartService.updateGrowthRecord(recordId, body);

    return {
      success: true,
      data: updatedRecord,
      message: 'Growth record updated successfully',
    };
  }

  /**
   * Delete growth record
   * DELETE /growth-chart/record/:recordId
   */
  @Delete('record/:recordId')
  async deleteGrowthRecord(@Param('recordId') recordId: string) {
    await this.growthChartService.deleteGrowthRecord(recordId);

    return {
      success: true,
      message: 'Growth record deleted successfully',
    };
  }

  /**
   * Archive growth record
   * PUT /growth-chart/record/:recordId/archive
   */
  @Put('record/:recordId/archive')
  async archiveGrowthRecord(@Param('recordId') recordId: string) {
    const archivedRecord = await this.growthChartService.archiveGrowthRecord(recordId);

    return {
      success: true,
      data: archivedRecord,
      message: 'Growth record archived successfully',
    };
  }

  /**
   * Get growth chart statistics
   * GET /growth-chart/:registrationId/stats
   */
  @Get(':registrationId/stats')
  async getGrowthStats(@Param('registrationId') registrationId: string) {
    const stats = await this.growthChartService.getGrowthRecordsStats(registrationId);

    return {
      success: true,
      data: stats,
    };
  }
}
