import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument, ReportCategory, ReportStatus } from './schemas/report.schema';

export interface CreateReportDto {
  registrationId: string;
  childName?: string;
  title: string;
  description: string;
  category: ReportCategory;
  reportDate: Date;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  localFilePath?: string;
}

export interface UpdateReportDto {
  title?: string;
  description?: string;
  category?: ReportCategory;
  reportDate?: Date;
  status?: ReportStatus;
}

export interface ReportFilters {
  registrationId?: string;
  category?: ReportCategory;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
  status?: ReportStatus;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(Report.name)
    private readonly reportModel: Model<ReportDocument>,
  ) {}

  /**
   * Create a new report
   */
  async createReport(dto: CreateReportDto): Promise<ReportDocument> {
    try {
      const report = await this.reportModel.create(dto);
      this.logger.log(`Report created: ${report._id} - ${dto.title}`);
      return report;
    } catch (error) {
      this.logger.error(`Failed to create report: ${error instanceof Error ? error.message : error}`);
      throw new BadRequestException('Failed to create report');
    }
  }

  /**
   * Get all reports with optional filters
   */
  async getReports(filters: ReportFilters = {}): Promise<ReportDocument[]> {
    const query: any = {
      status: filters.status || ReportStatus.ACTIVE,
    };

    if (filters.registrationId) {
      query.registrationId = filters.registrationId;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.reportDate = {};
      if (filters.dateFrom) {
        query.reportDate.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.reportDate.$lte = filters.dateTo;
      }
    }

    if (filters.searchTerm) {
      query.$or = [
        { title: { $regex: filters.searchTerm, $options: 'i' } },
        { description: { $regex: filters.searchTerm, $options: 'i' } },
        { registrationId: { $regex: filters.searchTerm, $options: 'i' } },
      ];
    }

    return this.reportModel
      .find(query)
      .sort({ reportDate: -1, createdAt: -1 })
      .exec();
  }

  /**
   * Get reports for a specific child (user view)
   */
  async getReportsForChild(registrationId: string, filters: Omit<ReportFilters, 'registrationId'> = {}): Promise<ReportDocument[]> {
    return this.getReports({ ...filters, registrationId });
  }

  /**
   * Get reports by category for a specific child
   */
  async getReportsByCategory(
    registrationId: string,
    category: ReportCategory,
  ): Promise<ReportDocument[]> {
    return this.reportModel
      .find({
        registrationId,
        category,
        status: ReportStatus.ACTIVE,
      })
      .sort({ reportDate: -1 })
      .exec();
  }

  /**
   * Get a single report by ID
   */
  async getReportById(reportId: string): Promise<ReportDocument> {
    const report = await this.reportModel.findById(reportId).exec();
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  /**
   * Update a report
   */
  async updateReport(
    reportId: string,
    dto: UpdateReportDto,
  ): Promise<ReportDocument> {
    const report = await this.reportModel
      .findByIdAndUpdate(reportId, dto, { new: true })
      .exec();

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    this.logger.log(`Report updated: ${reportId}`);
    return report;
  }

  /**
   * Soft delete a report (mark as deleted)
   */
  async deleteReport(reportId: string): Promise<void> {
    const result = await this.reportModel
      .findByIdAndUpdate(reportId, { status: ReportStatus.DELETED })
      .exec();

    if (!result) {
      throw new NotFoundException('Report not found');
    }

    this.logger.log(`Report deleted: ${reportId}`);
  }

  /**
   * Archive a report
   */
  async archiveReport(reportId: string): Promise<ReportDocument> {
    const report = await this.reportModel
      .findByIdAndUpdate(reportId, { status: ReportStatus.ARCHIVED }, { new: true })
      .exec();

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    this.logger.log(`Report archived: ${reportId}`);
    return report;
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(reportId: string): Promise<void> {
    await this.reportModel
      .findByIdAndUpdate(reportId, {
        $inc: { downloadCount: 1 },
        lastDownloaded: new Date(),
      })
      .exec();
  }

  /**
   * Get reports statistics
   */
  async getReportsStats(): Promise<{
    totalReports: number;
    reportsByCategory: Record<string, number>;
    recentReports: number; // Reports from last 30 days
    totalDownloads: number;
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalReports, categoryStats, recentReports, downloadStats] = await Promise.all([
      // Total active reports
      this.reportModel.countDocuments({
        status: ReportStatus.ACTIVE,
      }),

      // Reports by category
      this.reportModel.aggregate([
        {
          $match: {
            status: ReportStatus.ACTIVE,
          },
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),

      // Recent reports (last 30 days)
      this.reportModel.countDocuments({
        status: ReportStatus.ACTIVE,
        createdAt: { $gte: thirtyDaysAgo },
      }),

      // Total downloads
      this.reportModel.aggregate([
        {
          $match: {
            status: ReportStatus.ACTIVE,
          },
        },
        {
          $group: {
            _id: null,
            totalDownloads: { $sum: '$downloadCount' },
          },
        },
      ]),
    ]);

    const reportsByCategory: Record<string, number> = {};
    categoryStats.forEach((stat) => {
      reportsByCategory[stat._id] = stat.count;
    });

    return {
      totalReports,
      reportsByCategory,
      recentReports,
      totalDownloads: downloadStats[0]?.totalDownloads || 0,
    };
  }

  /**
   * Get all reports for admin view (with pagination)
   */
  async getAllReportsForAdmin(
    page: number = 1,
    limit: number = 50,
    filters: ReportFilters = {},
  ): Promise<{
    reports: ReportDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = {
      status: filters.status || ReportStatus.ACTIVE,
    };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.reportDate = {};
      if (filters.dateFrom) {
        query.reportDate.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.reportDate.$lte = filters.dateTo;
      }
    }

    if (filters.searchTerm) {
      query.$or = [
        { title: { $regex: filters.searchTerm, $options: 'i' } },
        { description: { $regex: filters.searchTerm, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.reportModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reportModel.countDocuments(query),
    ]);

    return {
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Validate file type and size
   */
  validateFile(file: Express.Multer.File): void {
    const allowedTypes = ['application/pdf'];
    const maxSize = 50 * 1024 * 1024; // 50MB for reports

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only PDF files are allowed for reports.');
    }

    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 50MB.');
    }
  }
}