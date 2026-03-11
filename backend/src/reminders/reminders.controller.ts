import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto, UpdateReminderDto, ReminderChannel } from '@wombto18/shared';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('reminders')
@UseGuards(AuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  async createReminders(@Body() dto: CreateReminderDto) {
    const reminders = await this.remindersService.createReminders(dto);
    return { success: true, data: reminders, count: reminders.length };
  }

  @Post('seed/:registrationId')
  async seedReminders(@Param('registrationId') registrationId: string) {
    const count = await this.remindersService.seedRemindersForRegistration(
      registrationId,
      [ReminderChannel.SMS, ReminderChannel.WHATSAPP],
    );
    return { success: true, message: `Seeded ${count} reminders`, count };
  }

  @Get(':registrationId')
  async getReminders(@Param('registrationId') registrationId: string) {
    const reminders = await this.remindersService.getRemindersByRegistrationId(registrationId);
    return { success: true, data: reminders };
  }

  @Get('milestone/:milestoneId')
  async getRemindersByMilestone(@Param('milestoneId') milestoneId: string) {
    const reminders = await this.remindersService.getRemindersByMilestone(milestoneId);
    return { success: true, data: reminders };
  }

  @Patch(':reminderId')
  async updateReminder(
    @Param('reminderId') reminderId: string,
    @Body() dto: UpdateReminderDto,
  ) {
    const reminder = await this.remindersService.updateReminder(reminderId, dto);
    return { success: true, data: reminder };
  }

  @Post('process-due')
  async processDueReminders() {
    const result = await this.remindersService.processDueReminders();
    return { success: true, data: result };
  }
}
