import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DashboardService } from './dashboard.service';
import { RemindersService } from '../reminders/reminders.service';
import { CreateMilestoneDto, UpdateMilestoneStatusDto, ReminderChannel } from '@wombto18/shared';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';
import { storage } from '../auth/multer';
import cloudinary from '../auth/cloudinary';
import * as fs from 'fs';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly remindersService: RemindersService,
  ) {}

  // ─── Full Child Dashboard ─────────────────────────────────────────────

  /**
   * Returns complete dashboard data for a child:
   * - Profile (name, age, gender, photo, parent info)
   * - Vaccination tracker with status
   * - Upcoming milestones
   * - Green Cohort status
   */
  @Get('child/:registrationId')
  async getChildDashboard(@Param('registrationId') registrationId: string) {
    const dashboard = await this.dashboardService.getChildDashboard(registrationId);
    return { success: true, data: dashboard };
  }

  // ─── Family Dashboard ────────────────────────────────────────────────

  /**
   * Returns all children under the authenticated parent's account.
   * Parents can toggle between children profiles.
   */
  @Get('family')
  async getFamilyDashboard(@Req() req: AuthenticatedRequest) {
    const family = await this.dashboardService.getFamilyDashboard(req.user.sub);
    return { success: true, data: family };
  }

  // ─── Vaccination Tracker ──────────────────────────────────────────────

  @Get('vaccination/:registrationId')
  async getVaccinationTracker(@Param('registrationId') registrationId: string) {
    const tracker = await this.dashboardService.getVaccinationTracker(registrationId);
    return { success: true, data: tracker };
  }

  @Post('vaccination/seed')
  async seedVaccinations(@Body() body: { registrationId: string; dateOfBirth: string }) {
    const milestones = await this.dashboardService.seedVaccinationMilestones(
      body.registrationId,
      new Date(body.dateOfBirth),
    );
    return { success: true, data: milestones, count: milestones.length };
  }

  // ─── Milestones ───────────────────────────────────────────────────────

  /**
   * Get development milestones for a specific age group
   */
  @Get('milestones/:registrationId')
  async getMilestonesByAgeGroup(
    @Param('registrationId') registrationId: string,
    @Req() req: any
  ) {
    const ageGroup = req.query.ageGroup;
    if (ageGroup) {
      const milestones = await this.dashboardService.getDevelopmentMilestonesByAgeGroup(
        registrationId,
        ageGroup
      );
      return { success: true, data: milestones };
    } else {
      const milestones = await this.dashboardService.getMilestonesByRegistrationId(registrationId);
      return { success: true, data: milestones };
    }
  }

  /**
   * Update milestone status with YES/NO logic
   */
  @Patch('milestones/update/:id')
  async updateDevelopmentMilestoneStatus(
    @Param('id') milestoneId: string,
    @Body() body: { status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'DELAYED'; notes?: string }
  ) {
    const updateData: any = {
      status: body.status,
      notes: body.notes,
    };

    if (body.status === 'ACHIEVED') {
      updateData.achievedDate = new Date();
    } else if (body.status === 'NOT_STARTED') {
      updateData.achievedDate = null;
    }

    const milestone = await this.dashboardService.updateDevelopmentMilestoneStatus(
      milestoneId,
      updateData.status,
      updateData.achievedDate,
      updateData.notes
    );

    return { success: true, data: milestone };
  }

  /**
   * Add notes to a milestone
   */
  @Patch('milestones/notes/:id')
  async updateMilestoneNotes(
    @Param('id') milestoneId: string,
    @Body() body: { notes: string }
  ) {
    const milestone = await this.dashboardService.updateDevelopmentMilestoneStatus(
      milestoneId,
      undefined,
      undefined,
      body.notes
    );
    return { success: true, data: milestone };
  }

  @Get('milestones/:registrationId/upcoming')
  async getUpcomingMilestones(@Param('registrationId') registrationId: string) {
    const milestones = await this.dashboardService.getUpcomingMilestones(registrationId);
    return { success: true, data: milestones };
  }

  @Post('milestones')
  async createMilestone(@Body() dto: CreateMilestoneDto) {
    const milestone = await this.dashboardService.createMilestone(dto);
    return { success: true, data: milestone };
  }

  @Patch('milestones/:milestoneId')
  async updateMilestoneStatus(
    @Param('milestoneId') milestoneId: string,
    @Body() dto: UpdateMilestoneStatusDto,
  ) {
    const milestone = await this.dashboardService.updateMilestoneStatus(milestoneId, dto);
    return { success: true, data: milestone };
  }

  // ─── Activate All Services ────────────────────────────────────────────

  /**
   * One-click activation: seeds vaccination milestones + schedules reminders.
   * Useful for children registered before auto-seeding was implemented.
   */
  @Post('activate-services')
  async activateAllServices(
    @Body() body: { registrationId: string; dateOfBirth: string },
  ) {
    const { registrationId, dateOfBirth } = body;

    // 1. Seed vaccination milestones
    const milestones = await this.dashboardService.seedVaccinationMilestones(
      registrationId,
      new Date(dateOfBirth),
    );

    // 2. Schedule reminders for all upcoming milestones
    const reminderCount = await this.remindersService.seedRemindersForRegistration(
      registrationId,
      [ReminderChannel.SMS, ReminderChannel.WHATSAPP],
    );

    return {
      success: true,
      message: 'All services activated successfully',
      data: {
        milestonesCreated: milestones.length,
        remindersScheduled: reminderCount,
      },
    };
  }

  // ─── Upload Profile Picture ───────────────────────────────────────────

  @Post('profile-picture/:registrationId')
  @UseInterceptors(FileInterceptor('profilePicture', { storage }))
  async uploadProfilePicture(
    @Param('registrationId') registrationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('=== Profile Picture Upload Request ===');
    console.log('Registration ID:', registrationId);
    console.log('File received:', file ? 'Yes' : 'No');
    
    if (!file) {
      console.error('No file in request');
      throw new BadRequestException('No file uploaded');
    }

    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    });

    try {
      // Upload to Cloudinary
      console.log('Starting Cloudinary upload...');
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'wombto18/profiles',
        public_id: `${registrationId}_${Date.now()}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      console.log('✅ Cloudinary upload successful:', result.secure_url);

      // Update child record with new URL
      await this.dashboardService.updateProfilePicture(registrationId, result.secure_url);
      console.log('✅ Database updated with new profile picture URL');

      // Clean up temp file
      try {
        fs.unlinkSync(file.path);
        console.log('✅ Temp file cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup temp file:', cleanupError);
      }

      return {
        success: true,
        message: 'Profile picture updated successfully',
        data: { profilePictureUrl: result.secure_url },
      };
    } catch (error) {
      console.error('❌ Profile picture upload error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Clean up temp file on error
      if (file?.path) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file after error:', cleanupError);
        }
      }
      
      throw new BadRequestException(
        `Failed to upload profile picture: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ─── Admin Endpoints ──────────────────────────────────────────────────

  /**
   * Admin: Get all children in the system
   */
  @Get('admin/all-children')
  async getAllChildren() {
    const children = await this.dashboardService.getAllChildren();
    return { success: true, data: children };
  }

  /**
   * Admin: Get system-wide statistics
   */
  @Get('admin/stats')
  async getAdminStats() {
    const stats = await this.dashboardService.getAdminStats();
    return { success: true, data: stats };
  }

  /**
   * Admin: Get deletion summary for a child (what would be deleted)
   */
  @Get('admin/delete-child-summary/:registrationId')
  async getChildDeletionSummary(@Param('registrationId') registrationId: string) {
    const summary = await this.dashboardService.getChildDeletionSummary(registrationId);
    return { 
      success: true, 
      data: summary,
      message: `Found ${summary.totalRecords} records that would be deleted for child ${summary.child.childName}` 
    };
  }

  /**
   * Admin: Delete a child and all associated data
   */
  @Delete('admin/delete-child/:registrationId')
  async deleteChild(@Param('registrationId') registrationId: string) {
    await this.dashboardService.deleteChild(registrationId);
    return { success: true, message: 'Child deleted successfully' };
  }

  /**
   * Admin: Get all vaccination records across all children
   */
  @Get('admin/vaccinations')
  async getAllVaccinations() {
    const vaccinations = await this.dashboardService.getAllVaccinations();
    return { success: true, data: vaccinations };
  }

  /**
   * Admin: Update vaccination status for a child
   */
  @Patch('admin/vaccination/:milestoneId')
  async updateVaccinationStatus(
    @Param('milestoneId') milestoneId: string,
    @Body() body: { 
      status: 'UPCOMING' | 'DUE' | 'COMPLETED' | 'MISSED';
      completedDate?: string;
      notes?: string;
      administeredBy?: string;
      location?: string;
    }
  ) {
    const milestone = await this.dashboardService.updateVaccinationStatus(milestoneId, {
      status: body.status as any,
      completedDate: body.completedDate ? new Date(body.completedDate) : undefined,
      notes: body.notes,
      administeredBy: body.administeredBy,
      location: body.location,
    });
    return { success: true, data: milestone };
  }

  // ─── Development Milestones ───────────────────────────────────────────

  /**
   * Get all development milestones for a child with age group info
   */
  @Get('development-milestones/:registrationId')
  async getDevelopmentMilestones(@Param('registrationId') registrationId: string) {
    const data = await this.dashboardService.getDevelopmentMilestones(registrationId);
    return { success: true, data };
  }

  /**
   * Seed development milestones for a specific age group
   */
  @Post('development-milestones/seed')
  async seedDevelopmentMilestones(
    @Body() body: { registrationId: string; ageGroup: string; templates: any[] }
  ) {
    const milestones = await this.dashboardService.seedDevelopmentMilestones(
      body.registrationId,
      body.ageGroup as any,
      body.templates
    );
    return { success: true, data: milestones, count: milestones.length };
  }

  /**
   * Update development milestone status (legacy endpoint)
   */
  @Patch('development-milestones/:milestoneId')
  async updateDevelopmentMilestone(
    @Param('milestoneId') milestoneId: string,
    @Body() body: { status: string; achievedDate?: string; notes?: string }
  ) {
    const milestone = await this.dashboardService.updateDevelopmentMilestoneStatus(
      milestoneId,
      body.status,
      body.achievedDate ? new Date(body.achievedDate) : undefined,
      body.notes
    );
    return { success: true, data: milestone };
  }
}
