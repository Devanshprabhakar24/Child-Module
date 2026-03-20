import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GrowthRecord, GrowthRecordDocument, GrowthRecordStatus } from './schemas/growth-record.schema';

export interface CreateGrowthRecordDto {
  registrationId: string;
  height: number;
  weight: number;
  measurementDate: Date;
  notes?: string;
  uploadedByUserId?: string;
}

export interface UpdateGrowthRecordDto {
  height?: number;
  weight?: number;
  notes?: string;
  status?: GrowthRecordStatus;
}

export interface GrowthRecordFilters {
  dateFrom?: Date;
  dateTo?: Date;
  status?: GrowthRecordStatus;
}

@Injectable()
export class GrowthChartService {
  private readonly logger = new Logger(GrowthChartService.name);

  constructor(
    @InjectModel(GrowthRecord.name)
    private readonly growthRecordModel: Model<GrowthRecordDocument>,
  ) {}

  /**
   * Calculate BMI from height and weight
   * BMI = weight (kg) / (height (m))^2
   */
  calculateBMI(heightCm: number, weightKg: number): number {
    if (heightCm <= 0 || weightKg <= 0) {
      throw new BadRequestException('Height and weight must be positive values');
    }
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return parseFloat(bmi.toFixed(2));
  }

  /**
   * Get BMI category based on BMI value
   */
  getBMICategory(bmi: number): string {
    if (bmi < 18.5) {
      return 'Underweight';
    } else if (bmi >= 18.5 && bmi < 24.9) {
      return 'Normal';
    } else if (bmi >= 25 && bmi < 29.9) {
      return 'Overweight';
    } else {
      return 'Obese';
    }
  }

  /**
   * Create a new growth record
   */
  async createGrowthRecord(dto: CreateGrowthRecordDto): Promise<GrowthRecordDocument> {
    try {
      // Calculate BMI
      const bmi = this.calculateBMI(dto.height, dto.weight);
      const bmiCategory = this.getBMICategory(bmi);

      const growthRecord = await this.growthRecordModel.create({
        registrationId: dto.registrationId,
        height: dto.height,
        weight: dto.weight,
        bmi,
        bmiCategory,
        measurementDate: dto.measurementDate,
        notes: dto.notes,
        uploadedByUserId: dto.uploadedByUserId,
      });

      this.logger.log(`Growth record created: ${growthRecord._id} for ${dto.registrationId}`);
      return growthRecord;
    } catch (error) {
      this.logger.error(`Failed to create growth record: ${error instanceof Error ? error.message : error}`);
      throw new BadRequestException('Failed to create growth record');
    }
  }

  /**
   * Get all growth records for a registration with optional filters
   */
  async getGrowthRecords(
    registrationId: string,
    filters: GrowthRecordFilters = {},
  ): Promise<GrowthRecordDocument[]> {
    const query: any = {
      registrationId,
      status: filters.status || GrowthRecordStatus.ACTIVE,
    };

    if (filters.dateFrom || filters.dateTo) {
      query.measurementDate = {};
      if (filters.dateFrom) {
        query.measurementDate.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.measurementDate.$lte = filters.dateTo;
      }
    }

    return this.growthRecordModel
      .find(query)
      .sort({ measurementDate: -1 })
      .exec();
  }

  /**
   * Get the latest growth record for a registration
   */
  async getLatestGrowthRecord(registrationId: string): Promise<GrowthRecordDocument | null> {
    return this.growthRecordModel
      .findOne({
        registrationId,
        status: GrowthRecordStatus.ACTIVE,
      })
      .sort({ measurementDate: -1 })
      .exec();
  }

  /**
   * Get growth records with progress analysis
   */
  async getGrowthProgress(registrationId: string): Promise<{
    records: GrowthRecordDocument[];
    progress: {
      heightChange: number;
      weightChange: number;
      bmiChange: number;
      percentageChange: {
        height: number;
        weight: number;
        bmi: number;
      };
    } | null;
  }> {
    const records = await this.getGrowthRecords(registrationId);

    if (records.length < 2) {
      return {
        records,
        progress: null,
      };
    }

    const latest = records[0];
    const previous = records[records.length - 1];

    const heightChange = latest.height - previous.height;
    const weightChange = latest.weight - previous.weight;
    const bmiChange = latest.bmi - previous.bmi;

    return {
      records,
      progress: {
        heightChange: parseFloat(heightChange.toFixed(2)),
        weightChange: parseFloat(weightChange.toFixed(2)),
        bmiChange: parseFloat(bmiChange.toFixed(2)),
        percentageChange: {
          height: previous.height > 0 ? parseFloat(((heightChange / previous.height) * 100).toFixed(2)) : 0,
          weight: previous.weight > 0 ? parseFloat(((weightChange / previous.weight) * 100).toFixed(2)) : 0,
          bmi: previous.bmi > 0 ? parseFloat(((bmiChange / previous.bmi) * 100).toFixed(2)) : 0,
        },
      },
    };
  }

  /**
   * Get a single growth record by ID
   */
  async getGrowthRecordById(recordId: string): Promise<GrowthRecordDocument> {
    const record = await this.growthRecordModel.findById(recordId).exec();
    if (!record) {
      throw new NotFoundException('Growth record not found');
    }
    return record;
  }

  /**
   * Update a growth record
   */
  async updateGrowthRecord(
    recordId: string,
    dto: UpdateGrowthRecordDto,
  ): Promise<GrowthRecordDocument> {
    const updateData: any = { ...dto };

    // Recalculate BMI if height or weight is updated
    if (dto.height !== undefined || dto.weight !== undefined) {
      const record = await this.getGrowthRecordById(recordId);
      const height = dto.height !== undefined ? dto.height : record.height;
      const weight = dto.weight !== undefined ? dto.weight : record.weight;
      
      updateData.bmi = this.calculateBMI(height, weight);
      updateData.bmiCategory = this.getBMICategory(updateData.bmi);
    }

    const updatedRecord = await this.growthRecordModel
      .findByIdAndUpdate(recordId, updateData, { new: true })
      .exec();

    if (!updatedRecord) {
      throw new NotFoundException('Growth record not found');
    }

    this.logger.log(`Growth record updated: ${recordId}`);
    return updatedRecord;
  }

  /**
   * Soft delete a growth record (mark as deleted)
   */
  async deleteGrowthRecord(recordId: string): Promise<void> {
    const result = await this.growthRecordModel
      .findByIdAndUpdate(recordId, { status: GrowthRecordStatus.DELETED })
      .exec();

    if (!result) {
      throw new NotFoundException('Growth record not found');
    }

    this.logger.log(`Growth record deleted: ${recordId}`);
  }

  /**
   * Archive a growth record
   */
  async archiveGrowthRecord(recordId: string): Promise<GrowthRecordDocument> {
    const record = await this.growthRecordModel
      .findByIdAndUpdate(recordId, { status: GrowthRecordStatus.ARCHIVED }, { new: true })
      .exec();

    if (!record) {
      throw new NotFoundException('Growth record not found');
    }

    this.logger.log(`Growth record archived: ${recordId}`);
    return record;
  }

  /**
   * Get growth records statistics for a registration
   */
  async getGrowthRecordsStats(registrationId: string): Promise<{
    totalRecords: number;
    averageBMI: number;
    averageHeight: number;
    averageWeight: number;
    currentBMICategory: string;
  }> {
    const records = await this.getGrowthRecords(registrationId);

    if (records.length === 0) {
      return {
        totalRecords: 0,
        averageBMI: 0,
        averageHeight: 0,
        averageWeight: 0,
        currentBMICategory: 'N/A',
      };
    }

    const totalBMI = records.reduce((sum, record) => sum + record.bmi, 0);
    const totalHeight = records.reduce((sum, record) => sum + record.height, 0);
    const totalWeight = records.reduce((sum, record) => sum + record.weight, 0);

    return {
      totalRecords: records.length,
      averageBMI: parseFloat((totalBMI / records.length).toFixed(2)),
      averageHeight: parseFloat((totalHeight / records.length).toFixed(2)),
      averageWeight: parseFloat((totalWeight / records.length).toFixed(2)),
      currentBMICategory: records[0].bmiCategory,
    };
  }

  /**
   * Validate growth data
   */
  validateGrowthData(height: number, weight: number): void {
    if (height <= 0 || height > 300) {
      throw new BadRequestException('Height must be between 0 and 300 cm');
    }
    if (weight <= 0 || weight > 500) {
      throw new BadRequestException('Weight must be between 0 and 500 kg');
    }
  }
}
