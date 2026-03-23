import { Controller, Get, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  /**
   * Get all notifications for authenticated user
   */
  @Get()
  async getNotifications(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const query: any = { userId: req.user.sub };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 50)
      .exec();

    const unreadCount = await this.notificationModel.countDocuments({
      userId: req.user.sub,
      read: false,
    });

    return {
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    };
  }

  /**
   * Get notifications for specific child
   */
  @Get('child/:registrationId')
  async getChildNotifications(
    @Param('registrationId') registrationId: string,
    @Query('limit') limit?: string,
  ) {
    const notifications = await this.notificationModel
      .find({ registrationId })
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 50)
      .exec();

    return {
      success: true,
      data: notifications,
    };
  }

  /**
   * Mark notification as read
   */
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    const notification = await this.notificationModel.findByIdAndUpdate(
      id,
      { read: true, readAt: new Date() },
      { new: true },
    );

    return {
      success: true,
      data: notification,
    };
  }

  /**
   * Mark all notifications as read
   */
  @Patch('mark-all-read')
  async markAllAsRead(@Req() req: AuthenticatedRequest) {
    await this.notificationModel.updateMany(
      { userId: req.user.sub, read: false },
      { read: true, readAt: new Date() },
    );

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  /**
   * Get unread count
   */
  @Get('unread-count')
  async getUnreadCount(@Req() req: AuthenticatedRequest) {
    const count = await this.notificationModel.countDocuments({
      userId: req.user.sub,
      read: false,
    });

    return {
      success: true,
      data: { count },
    };
  }
}
