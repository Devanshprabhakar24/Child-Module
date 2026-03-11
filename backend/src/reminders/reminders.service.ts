import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Reminder, ReminderDocument } from './schemas/reminder.schema';
import { Milestone, MilestoneDocument } from '../dashboard/schemas/milestone.schema';
import {
  CreateReminderDto,
  UpdateReminderDto,
  ReminderChannel,
  ReminderStatus,
  ReminderOffset,
} from '@wombto18/shared';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectModel(Reminder.name) private readonly reminderModel: Model<ReminderDocument>,
    @InjectModel(Milestone.name) private readonly milestoneModel: Model<MilestoneDocument>,
  ) {}

  // ─── Create Reminders (D-2, D, D+2) ──────────────────────────────────

  /**
   * Creates 3 reminders for a milestone: D-2, D-Day, and D+2.
   */
  async createReminders(dto: CreateReminderDto): Promise<ReminderDocument[]> {
    const milestone = await this.milestoneModel.findById(dto.milestoneId).exec();
    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    const offsets = [ReminderOffset.D_MINUS_2, ReminderOffset.D_DAY, ReminderOffset.D_PLUS_2];
    const reminders: ReminderDocument[] = [];

    for (const offset of offsets) {
      const scheduledDate = new Date(milestone.dueDate);
      scheduledDate.setDate(scheduledDate.getDate() + offset);

      // Skip if the scheduled date is already in the past
      if (scheduledDate < new Date()) {
        this.logger.log(
          `Skipping D${offset >= 0 ? '+' : ''}${offset} reminder for milestone ${dto.milestoneId} — date is in the past`,
        );
        continue;
      }

      const existing = await this.reminderModel.findOne({
        milestoneId: dto.milestoneId,
        offset,
      }).exec();

      if (existing) {
        this.logger.log(`Reminder D${offset >= 0 ? '+' : ''}${offset} already exists for milestone ${dto.milestoneId}`);
        reminders.push(existing);
        continue;
      }

      const reminder = await this.reminderModel.create({
        registrationId: dto.registrationId,
        milestoneId: dto.milestoneId,
        channels: dto.channels,
        offset,
        scheduledDate,
        status: ReminderStatus.SCHEDULED,
        customMessage: dto.customMessage,
      });

      reminders.push(reminder);
    }

    this.logger.log(`Created ${reminders.length} reminders for milestone ${dto.milestoneId}`);
    return reminders;
  }

  // ─── Update Reminder ──────────────────────────────────────────────────

  async updateReminder(reminderId: string, dto: UpdateReminderDto): Promise<ReminderDocument> {
    const reminder = await this.reminderModel.findById(reminderId).exec();
    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    if (dto.channels) {
      reminder.channels = dto.channels;
    }
    if (dto.customMessage !== undefined) {
      reminder.customMessage = dto.customMessage;
    }

    await reminder.save();
    return reminder;
  }

  // ─── Queries ──────────────────────────────────────────────────────────

  async getRemindersByRegistrationId(registrationId: string): Promise<ReminderDocument[]> {
    return this.reminderModel
      .find({ registrationId })
      .sort({ scheduledDate: 1 })
      .exec();
  }

  async getRemindersByMilestone(milestoneId: string): Promise<ReminderDocument[]> {
    return this.reminderModel
      .find({ milestoneId })
      .sort({ offset: 1 })
      .exec();
  }

  // ─── Scheduler Logic ─────────────────────────────────────────────────

  /**
   * Called by a cron job or external scheduler to process reminders
   * that are due today (scheduledDate == today AND status == SCHEDULED).
   */
  async processDueReminders(): Promise<{ processed: number; failed: number }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dueReminders = await this.reminderModel
      .find({
        scheduledDate: { $gte: startOfDay, $lte: endOfDay },
        status: ReminderStatus.SCHEDULED,
      })
      .exec();

    let processed = 0;
    let failed = 0;

    for (const reminder of dueReminders) {
      try {
        await this.sendReminder(reminder);
        reminder.status = ReminderStatus.SENT;
        reminder.sentAt = new Date();
        await reminder.save();
        processed++;
      } catch (error) {
        reminder.status = ReminderStatus.FAILED;
        reminder.failureReason = error instanceof Error ? error.message : 'Unknown error';
        await reminder.save();
        failed++;
        this.logger.error(`Failed to send reminder ${reminder.id}: ${reminder.failureReason}`);
      }
    }

    this.logger.log(`Processed ${processed} reminders, ${failed} failed`);
    return { processed, failed };
  }

  /**
   * Placeholder method for actually sending a reminder via the specified channels.
   * In production, this would integrate with SMS/WhatsApp/IVR/Email providers.
   */
  private async sendReminder(reminder: ReminderDocument): Promise<void> {
    for (const channel of reminder.channels) {
      switch (channel) {
        case ReminderChannel.SMS:
          this.logger.log(`[SMS] Sending reminder to ${reminder.registrationId}: ${reminder.customMessage ?? 'Vaccination reminder'}`);
          break;
        case ReminderChannel.WHATSAPP:
          this.logger.log(`[WhatsApp] Sending reminder to ${reminder.registrationId}`);
          break;
        case ReminderChannel.IVR:
          this.logger.log(`[IVR] Queuing call for ${reminder.registrationId}`);
          break;
        case ReminderChannel.EMAIL:
          this.logger.log(`[Email] Sending reminder to ${reminder.registrationId}`);
          break;
      }
    }
  }

  // ─── Auto-Seed Reminders for all milestones of a child ────────────────

  /**
   * Auto-creates D-2, D, D+2 reminders for all upcoming vaccination milestones
   * of a given registrationId using default channels.
   */
  async seedRemindersForRegistration(
    registrationId: string,
    channels: ReminderChannel[] = [ReminderChannel.SMS, ReminderChannel.WHATSAPP],
  ): Promise<number> {
    const milestones = await this.milestoneModel
      .find({ registrationId, status: { $in: ['UPCOMING', 'DUE'] } })
      .exec();

    let totalCreated = 0;
    for (const milestone of milestones) {
      const reminders = await this.createReminders({
        registrationId,
        milestoneId: milestone.id,
        channels,
      });
      totalCreated += reminders.length;
    }

    this.logger.log(`Seeded ${totalCreated} reminders for ${registrationId}`);
    return totalCreated;
  }
}
