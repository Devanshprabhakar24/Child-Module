import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ChannelPartnerService } from './channel-partner.service';
import { RegisterChannelPartnerDto, UserRole } from '@wombto18/shared';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('channel-partner')
@UseGuards(AuthGuard, RolesGuard)
export class ChannelPartnerController {
  constructor(private readonly channelPartnerService: ChannelPartnerService) {}

  @Post('register')
  @Roles(UserRole.ADMIN)
  async registerPartner(@Body() dto: RegisterChannelPartnerDto) {
    const partner = await this.channelPartnerService.registerPartner(dto);
    return { success: true, data: partner };
  }

  @Get('list')
  @Roles(UserRole.ADMIN)
  async listPartners() {
    const partners = await this.channelPartnerService.listPartners();
    return { success: true, data: partners };
  }

  @Get(':partnerId')
  @Roles(UserRole.ADMIN, UserRole.CHANNEL_PARTNER)
  async getPartner(@Param('partnerId') partnerId: string) {
    const partner = await this.channelPartnerService.getPartnerById(partnerId);
    return { success: true, data: partner };
  }

  /**
   * Channel partner dashboard — parent contact details are REDACTED.
   * Partners can only see registrationIds, not emails/phones.
   * Includes commission summary and target progress.
   */
  @Get(':partnerId/dashboard')
  @Roles(UserRole.ADMIN, UserRole.CHANNEL_PARTNER)
  async getPartnerDashboard(@Param('partnerId') partnerId: string) {
    const dashboard = await this.channelPartnerService.getPartnerDashboardWithNextDue(partnerId);
    return { success: true, data: dashboard };
  }

  @Get(':partnerId/commission')
  @Roles(UserRole.ADMIN, UserRole.CHANNEL_PARTNER)
  async getCommission(@Param('partnerId') partnerId: string) {
    const commission = await this.channelPartnerService.getCommissionSummary(partnerId);
    return { success: true, data: commission };
  }

  @Post(':partnerId/assign/:registrationId')
  @Roles(UserRole.ADMIN)
  async assignRegistration(
    @Param('partnerId') partnerId: string,
    @Param('registrationId') registrationId: string,
  ) {
    const result = await this.channelPartnerService.recordChildRegistration(partnerId, registrationId);
    return { success: true, data: result };
  }

  @Delete(':partnerId/unassign/:registrationId')
  @Roles(UserRole.ADMIN)
  async unassignRegistration(
    @Param('partnerId') partnerId: string,
    @Param('registrationId') registrationId: string,
  ) {
    const partner = await this.channelPartnerService.unassignRegistration(partnerId, registrationId);
    return { success: true, data: partner };
  }
}
