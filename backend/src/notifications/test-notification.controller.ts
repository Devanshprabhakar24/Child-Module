import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('test-notifications')
@UseGuards(AuthGuard)
export class TestNotificationController {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  /**
   * Test endpoint to send a notification
   * POST /test-notifications/send
   */
  @Post('send')
  async sendTestNotification(
    @Body() body: { registrationId: string; userId: string; type?: string },
  ) {
    const { registrationId, userId, type = 'general' } = body;

    // Create notification in database
    const notification = await this.notificationModel.create({
      userId,
      registrationId,
      type,
      title: 'Test Notification',
      message: 'This is a test notification to verify real-time functionality!',
      data: { test: true },
      read: false,
    });

    // Send real-time notification
    this.notificationsGateway.sendToChild(registrationId, {
      type: type as any,
      title: 'Test Notification',
      message: 'This is a test notification to verify real-time functionality!',
      timestamp: new Date(),
      data: { test: true },
    });

    return {
      success: true,
      message: 'Test notification sent!',
      data: notification,
    };
  }

  /**
   * Send vaccination reminder test
   */
  @Post('vaccination-reminder')
  async sendVaccinationReminder(@Body() body: { registrationId: string }) {
    this.notificationsGateway.sendVaccinationReminder(
      body.registrationId,
      'BCG Vaccine',
      'Today',
    );

    return {
      success: true,
      message: 'Vaccination reminder sent!',
    };
  }

  /**
   * Send milestone achievement test
   */
  @Post('milestone')
  async sendMilestoneNotification(@Body() body: { registrationId: string }) {
    this.notificationsGateway.sendMilestoneNotification(
      body.registrationId,
      'First Smile',
    );

    return {
      success: true,
      message: 'Milestone notification sent!',
    };
  }

  /**
   * Send Go Green notification test
   */
  @Post('go-green')
  async sendGoGreenNotification(@Body() body: { registrationId: string }) {
    this.notificationsGateway.sendGoGreenNotification(
      body.registrationId,
      'You earned 50 Go Green credits! 🌱',
    );

    return {
      success: true,
      message: 'Go Green notification sent!',
    };
  }

  /**
   * Send payment notification test
   */
  @Post('payment')
  async sendPaymentNotification(@Body() body: { registrationId: string }) {
    this.notificationsGateway.sendPaymentNotification(
      body.registrationId,
      999,
      'successful',
    );

    return {
      success: true,
      message: 'Payment notification sent!',
    };
  }
}
