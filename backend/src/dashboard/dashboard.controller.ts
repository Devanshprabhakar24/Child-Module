import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateMilestoneDto, UpdateMilestoneStatusDto } from '@wombto18/shared';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

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

  @Get('milestones/:registrationId')
  async getMilestones(@Param('registrationId') registrationId: string) {
    const milestones = await this.dashboardService.getMilestonesByRegistrationId(registrationId);
    return { success: true, data: milestones };
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
}
