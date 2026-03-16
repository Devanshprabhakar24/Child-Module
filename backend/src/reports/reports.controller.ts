import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  BadRequestException,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ReportsService, CreateReportDto, UpdateReportDto, ReportFilters } from './reports.service';
import { ReportCategory, ReportStatus } from './schemas/report.schema';

// Configure multer for local file storage
const reportsStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'reports');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = extname(file.originalname);
    const filename = `report_${timestamp}${ext}`;
    cb(null, filename);
  },
});

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Serve uploaded files
   * GET /reports/files/:filename
   */
  @Get('files/:filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'reports', filename);
    
    if (!existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    return res.sendFile(filePath);
  }

  /**
   * Get report categories (Public endpoint)
   * GET /reports/categories
   */
  @Get('categories')
  getReportCategories() {
    return {
      success: true,
      data: Object.values(ReportCategory),
    };
  }

  /**
   * Upload report (Admin only)
   * POST /reports/upload/:registrationId
   */
  @Post('upload/:registrationId')
  @UseInterceptors(FileInterceptor('file', { storage: reportsStorage }))
  async uploadReport(
    @Param('registrationId') registrationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      title: string;
      description: string;
      category: ReportCategory;
      reportDate: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file
    this.reportsService.validateFile(file);

    try {
      // Create file URL for local storage
      const fileUrl = `/reports/files/${file.filename}`;

      // Create report (childName will be auto-populated or left empty)
      const report = await this.reportsService.createReport({
        registrationId,
        title: body.title,
        description: body.description,
        category: body.category,
        reportDate: new Date(body.reportDate),
        fileUrl: fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        uploadedBy: 'admin', // In real app, get from JWT token
        localFilePath: file.path,
      });

      return {
        success: true,
        data: report,
        message: 'Report uploaded successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload report: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Get reports for a specific child (User endpoint)
   * GET /reports/:registrationId
   */
  @Get(':registrationId')
  async getReportsForChild(
    @Param('registrationId') registrationId: string,
    @Query('category') category?: ReportCategory,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') searchTerm?: string,
    @Query('status') status?: ReportStatus,
  ) {
    const filters = {
      category,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      searchTerm,
      status,
    };

    const reports = await this.reportsService.getReportsForChild(registrationId, filters);
    const stats = await this.reportsService.getReportsStats();

    return {
      success: true,
      data: {
        reports,
        stats,
      },
    };
  }

  /**
   * Get reports by category for a specific child
   * GET /reports/:registrationId/category/:category
   */
  @Get(':registrationId/category/:category')
  async getReportsByCategory(
    @Param('registrationId') registrationId: string,
    @Param('category') category: ReportCategory,
  ) {
    const reports = await this.reportsService.getReportsByCategory(registrationId, category);

    return {
      success: true,
      data: reports,
    };
  }

  /**
   * Get report statistics
   * GET /reports/stats
   */
  @Get('stats')
  async getReportsStats() {
    const stats = await this.reportsService.getReportsStats();

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Download report (increments download count)
   * GET /reports/:reportId/download
   */
  @Get(':reportId/download')
  async downloadReport(@Param('reportId') reportId: string, @Res() res: Response) {
    const report = await this.reportsService.getReportById(reportId);
    
    // Increment download count
    await this.reportsService.incrementDownloadCount(reportId);

    const filePath = join(process.cwd(), 'uploads', 'reports', report.fileUrl.split('/').pop()!);
    
    if (!existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
    return res.sendFile(filePath);
  }

  /**
   * Update report
   * PUT /reports/:reportId
   */
  @Put(':reportId')
  async updateReport(
    @Param('reportId') reportId: string,
    @Body() body: UpdateReportDto,
  ) {
    const updatedReport = await this.reportsService.updateReport(reportId, body);

    return {
      success: true,
      data: updatedReport,
      message: 'Report updated successfully',
    };
  }

  /**
   * Delete report
   * DELETE /reports/:reportId
   */
  @Delete(':reportId')
  async deleteReport(@Param('reportId') reportId: string) {
    await this.reportsService.deleteReport(reportId);

    return {
      success: true,
      message: 'Report deleted successfully',
    };
  }

  /**
   * Archive report
   * PUT /reports/:reportId/archive
   */
  @Put(':reportId/archive')
  async archiveReport(@Param('reportId') reportId: string) {
    const archivedReport = await this.reportsService.archiveReport(reportId);

    return {
      success: true,
      data: archivedReport,
      message: 'Report archived successfully',
    };
  }

  /**
   * Get all reports (Admin only)
   * GET /reports/admin/all
   */
  @Get('admin/all')
  async getAllReportsForAdmin(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('registrationId') registrationId?: string,
    @Query('category') category?: ReportCategory,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') searchTerm?: string,
    @Query('status') status?: ReportStatus,
  ) {
    const filters = {
      registrationId,
      category,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      searchTerm,
      status,
    };

    const result = await this.reportsService.getAllReportsForAdmin(
      parseInt(page),
      parseInt(limit),
      filters,
    );

    return {
      success: true,
      data: result,
    };
  }
}