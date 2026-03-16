import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HealthRecord, HealthRecordDocument, HealthRecordCategory, HealthRecordStatus, UploadedBy } from './schemas/health-record.schema';

export interface CreateHealthRecordDto {
  registrationId: string;
  documentName: string;
  category: HealthRecordCategory;
  recordDate: Date;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  notes?: string;
  doctorName?: string;
  uploadedBy: UploadedBy;
  uploadedByUserId?: string;
  cloudinaryPublicId?: string;
  localFilePath?: string;
}

export interface UpdateHealthRecordDto {
  documentName?: string;
  category?: HealthRecordCategory;
  recordDate?: Date;
  notes?: string;
  doctorName?: string;
  status?: HealthRecordStatus;
}

export interface HealthRecordFilters {
  category?: HealthRecordCategory;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
  status?: HealthRecordStatus;
}

@Injectable()
export class HealthRecordsService {
  private readonly logger = new Logger(HealthRecordsService.name);

  constructor(
    @InjectModel(HealthRecord.name)
    private readonly healthRecordModel: Model<HealthRecordDocument>,
  ) {}

  /**
   * Create a new health record
   */
  async createHealthRecord(dto: CreateHealthRecordDto): Promise<HealthRecordDocument> {
    try {
      const healthRecord = await this.healthRecordModel.create(dto);
      this.logger.log(`Health record created: ${healthRecord._id} for ${dto.registrationId}`);
      return healthRecord;
    } catch (error) {
      this.logger.error(`Failed to create health record: ${error instanceof Error ? error.message : error}`);
      throw new BadRequestException('Failed to create health record');
    }
  }

  /**
   * Get all health records for a registration with optional filters
   */
  async getHealthRecords(
    registrationId: string,
    filters: HealthRecordFilters = {},
  ): Promise<HealthRecordDocument[]> {
    const query: any = {
      registrationId,
      status: filters.status || HealthRecordStatus.ACTIVE,
    };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.recordDate = {};
      if (filters.dateFrom) {
        query.recordDate.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.recordDate.$lte = filters.dateTo;
      }
    }

    if (filters.searchTerm) {
      query.$or = [
        { documentName: { $regex: filters.searchTerm, $options: 'i' } },
        { notes: { $regex: filters.searchTerm, $options: 'i' } },
        { doctorName: { $regex: filters.searchTerm, $options: 'i' } },
      ];
    }

    return this.healthRecordModel
      .find(query)
      .sort({ recordDate: -1, createdAt: -1 })
      .exec();
  }

  /**
   * Get health records by category
   */
  async getHealthRecordsByCategory(
    registrationId: string,
    category: HealthRecordCategory,
  ): Promise<HealthRecordDocument[]> {
    return this.healthRecordModel
      .find({
        registrationId,
        category,
        status: HealthRecordStatus.ACTIVE,
      })
      .sort({ recordDate: -1 })
      .exec();
  }

  /**
   * Get a single health record by ID
   */
  async getHealthRecordById(recordId: string): Promise<HealthRecordDocument> {
    const record = await this.healthRecordModel.findById(recordId).exec();
    if (!record) {
      throw new NotFoundException('Health record not found');
    }
    return record;
  }

  /**
   * Update a health record
   */
  async updateHealthRecord(
    recordId: string,
    dto: UpdateHealthRecordDto,
  ): Promise<HealthRecordDocument> {
    const record = await this.healthRecordModel
      .findByIdAndUpdate(recordId, dto, { new: true })
      .exec();

    if (!record) {
      throw new NotFoundException('Health record not found');
    }

    this.logger.log(`Health record updated: ${recordId}`);
    return record;
  }

  /**
   * Soft delete a health record (mark as deleted)
   */
  async deleteHealthRecord(recordId: string): Promise<void> {
    const result = await this.healthRecordModel
      .findByIdAndUpdate(recordId, { status: HealthRecordStatus.DELETED })
      .exec();

    if (!result) {
      throw new NotFoundException('Health record not found');
    }

    this.logger.log(`Health record deleted: ${recordId}`);
  }

  /**
   * Archive a health record
   */
  async archiveHealthRecord(recordId: string): Promise<HealthRecordDocument> {
    const record = await this.healthRecordModel
      .findByIdAndUpdate(recordId, { status: HealthRecordStatus.ARCHIVED }, { new: true })
      .exec();

    if (!record) {
      throw new NotFoundException('Health record not found');
    }

    this.logger.log(`Health record archived: ${recordId}`);
    return record;
  }

  /**
   * Get health records statistics for a registration
   */
  async getHealthRecordsStats(registrationId: string): Promise<{
    totalRecords: number;
    recordsByCategory: Record<string, number>;
    recentRecords: number; // Records from last 30 days
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalRecords, categoryStats, recentRecords] = await Promise.all([
      // Total active records
      this.healthRecordModel.countDocuments({
        registrationId,
        status: HealthRecordStatus.ACTIVE,
      }),

      // Records by category
      this.healthRecordModel.aggregate([
        {
          $match: {
            registrationId,
            status: HealthRecordStatus.ACTIVE,
          },
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),

      // Recent records (last 30 days)
      this.healthRecordModel.countDocuments({
        registrationId,
        status: HealthRecordStatus.ACTIVE,
        createdAt: { $gte: thirtyDaysAgo },
      }),
    ]);

    const recordsByCategory: Record<string, number> = {};
    categoryStats.forEach((stat) => {
      recordsByCategory[stat._id] = stat.count;
    });

    return {
      totalRecords,
      recordsByCategory,
      recentRecords,
    };
  }

  /**
   * Get all health records for admin view (across all registrations)
   */
  async getAllHealthRecordsForAdmin(
    page: number = 1,
    limit: number = 50,
    filters: HealthRecordFilters & { registrationId?: string } = {},
  ): Promise<{
    records: HealthRecordDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = {
      status: filters.status || HealthRecordStatus.ACTIVE,
    };

    if (filters.registrationId) {
      query.registrationId = filters.registrationId;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.recordDate = {};
      if (filters.dateFrom) {
        query.recordDate.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.recordDate.$lte = filters.dateTo;
      }
    }

    if (filters.searchTerm) {
      query.$or = [
        { registrationId: { $regex: filters.searchTerm, $options: 'i' } },
        { documentName: { $regex: filters.searchTerm, $options: 'i' } },
        { notes: { $regex: filters.searchTerm, $options: 'i' } },
        { doctorName: { $regex: filters.searchTerm, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.healthRecordModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.healthRecordModel.countDocuments(query),
    ]);

    return {
      records,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Validate file type and size
   */
  validateFile(file: Express.Multer.File): void {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only PDF, JPG, and PNG files are allowed.');
    }

    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB.');
    }
  }

  /**
   * Get file type from mimetype
   */
  getFileType(mimetype: string): string {
    switch (mimetype) {
      case 'application/pdf':
        return 'pdf';
      case 'image/jpeg':
      case 'image/jpg':
        return 'jpg';
      case 'image/png':
        return 'png';
      default:
        return 'unknown';
    }
  }
}