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
  ForbiddenException,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { HealthRecordsService, CreateHealthRecordDto, UpdateHealthRecordDto, HealthRecordFilters } from './health-records.service';
import { HealthRecordCategory, HealthRecordStatus, UploadedBy } from './schemas/health-record.schema';
import { RegistrationService } from '../registration/registration.service';

// Configure multer for local file storage
const healthRecordsStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'health-records');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const registrationId = req.params.registrationId;
    const timestamp = Date.now();
    const ext = extname(file.originalname);
    const filename = `${registrationId}_${timestamp}${ext}`;
    cb(null, filename);
  },
});

@Controller('health-records')
export class HealthRecordsController {
  constructor(
    private readonly healthRecordsService: HealthRecordsService,
    private readonly registrationService: RegistrationService,
  ) {}

  /**
   * Serve uploaded files
   * GET /health-records/files/:filename
   */
  @Get('files/:filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'health-records', filename);
    
    if (!existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    return res.sendFile(filePath);
  }

  /**
   * Get health record categories (Public endpoint)
   * GET /health-records/categories
   */
  @Get('categories')
  getHealthRecordCategories() {
    return {
      success: true,
      data: Object.values(HealthRecordCategory),
    };
  }

  /**
   * Upload health record (User)
   * POST /health-records/upload/:registrationId
   */
  @Post('upload/:registrationId')
  @UseInterceptors(FileInterceptor('file', { storage: healthRecordsStorage }))
  async uploadHealthRecord(
    @Param('registrationId') registrationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      documentName: string;
      category: HealthRecordCategory;
      recordDate: string;
      notes?: string;
      doctorName?: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate registration exists
    const registration = await this.registrationService.findByRegistrationId(registrationId);
    if (!registration) {
      throw new BadRequestException('Registration not found');
    }

    // Validate file
    this.healthRecordsService.validateFile(file);

    try {
      // Create file URL for local storage
      const fileUrl = `/health-records/files/${file.filename}`;

      // Create health record
      const healthRecord = await this.healthRecordsService.createHealthRecord({
        registrationId,
        documentName: body.documentName,
        category: body.category,
        recordDate: new Date(body.recordDate),
        fileUrl: fileUrl,
        fileName: file.originalname,
        fileType: this.healthRecordsService.getFileType(file.mimetype),
        fileSize: file.size,
        notes: body.notes,
        doctorName: body.doctorName,
        uploadedBy: UploadedBy.USER,
        uploadedByUserId: 'test-user-id',
        localFilePath: file.path,
      });

      return {
        success: true,
        data: healthRecord,
        message: 'Health record uploaded successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload health record: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Upload health record (Admin)
   * POST /health-records/admin/upload/:registrationId
   */
  @Post('admin/upload/:registrationId')
  @UseInterceptors(FileInterceptor('file', { storage: healthRecordsStorage }))
  async adminUploadHealthRecord(
    @Param('registrationId') registrationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      documentName: string;
      category: HealthRecordCategory;
      recordDate: string;
      notes?: string;
      doctorName?: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate registration exists
    const registration = await this.registrationService.findByRegistrationId(registrationId);
    if (!registration) {
      throw new BadRequestException('Registration not found');
    }

    // Validate file
    this.healthRecordsService.validateFile(file);

    try {
      // Create file URL for local storage
      const fileUrl = `/health-records/files/${file.filename}`;

      // Create health record
      const healthRecord = await this.healthRecordsService.createHealthRecord({
        registrationId,
        documentName: body.documentName,
        category: body.category,
        recordDate: new Date(body.recordDate),
        fileUrl: fileUrl,
        fileName: file.originalname,
        fileType: this.healthRecordsService.getFileType(file.mimetype),
        fileSize: file.size,
        notes: body.notes,
        doctorName: body.doctorName,
        uploadedBy: UploadedBy.ADMIN,
        uploadedByUserId: 'admin-test-id',
        localFilePath: file.path,
      });

      return {
        success: true,
        data: healthRecord,
        message: 'Health record uploaded successfully by admin',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload health record: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Get health records for a registration
   * GET /health-records/:registrationId
   */
  @Get(':registrationId')
  async getHealthRecords(
    @Param('registrationId') registrationId: string,
    @Query('category') category?: HealthRecordCategory,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') searchTerm?: string,
    @Query('status') status?: HealthRecordStatus,
  ) {
    const filters: HealthRecordFilters = {
      category,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      searchTerm,
      status,
    };

    const records = await this.healthRecordsService.getHealthRecords(registrationId, filters);
    const stats = await this.healthRecordsService.getHealthRecordsStats(registrationId);

    return {
      success: true,
      data: {
        records,
        stats,
      },
    };
  }

  /**
   * Get health records by category
   * GET /health-records/:registrationId/category/:category
   */
  @Get(':registrationId/category/:category')
  async getHealthRecordsByCategory(
    @Param('registrationId') registrationId: string,
    @Param('category') category: HealthRecordCategory,
  ) {
    const records = await this.healthRecordsService.getHealthRecordsByCategory(registrationId, category);

    return {
      success: true,
      data: records,
    };
  }

  /**
   * Update health record
   * PUT /health-records/:recordId
   */
  @Put(':recordId')
  async updateHealthRecord(
    @Param('recordId') recordId: string,
    @Body() body: UpdateHealthRecordDto,
  ) {
    const updatedRecord = await this.healthRecordsService.updateHealthRecord(recordId, body);

    return {
      success: true,
      data: updatedRecord,
      message: 'Health record updated successfully',
    };
  }

  /**
   * Delete health record
   * DELETE /health-records/:recordId
   */
  @Delete(':recordId')
  async deleteHealthRecord(
    @Param('recordId') recordId: string,
  ) {
    await this.healthRecordsService.deleteHealthRecord(recordId);

    return {
      success: true,
      message: 'Health record deleted successfully',
    };
  }

  /**
   * Archive health record
   * PUT /health-records/:recordId/archive
   */
  @Put(':recordId/archive')
  async archiveHealthRecord(
    @Param('recordId') recordId: string,
  ) {
    const archivedRecord = await this.healthRecordsService.archiveHealthRecord(recordId);

    return {
      success: true,
      data: archivedRecord,
      message: 'Health record archived successfully',
    };
  }

  /**
   * Get all health records (Admin only)
   * GET /health-records/admin/all
   */
  @Get('admin/all')
  async getAllHealthRecordsForAdmin(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('registrationId') registrationId?: string,
    @Query('category') category?: HealthRecordCategory,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') searchTerm?: string,
    @Query('status') status?: HealthRecordStatus,
  ) {
    const filters = {
      registrationId,
      category,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      searchTerm,
      status,
    };

    const result = await this.healthRecordsService.getAllHealthRecordsForAdmin(
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