import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface NotificationPayload {
  type: 'vaccination_due' | 'health_record' | 'milestone' | 'go_green' | 'payment' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Update with your frontend URL in production
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove socket from user mapping
    for (const [userId, socketIds] of this.userSockets.entries()) {
      const index = socketIds.indexOf(client.id);
      if (index > -1) {
        socketIds.splice(index, 1);
        if (socketIds.length === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; registrationId: string },
  ) {
    const { userId, registrationId } = data;
    
    // Store socket mapping
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }
    this.userSockets.get(userId)!.push(client.id);
    
    // Join room for this user
    client.join(`user:${userId}`);
    client.join(`child:${registrationId}`);
    
    this.logger.log(`User ${userId} registered with socket ${client.id}`);
    
    return { success: true, message: 'Registered for notifications' };
  }

  /**
   * Send notification to specific user
   */
  sendToUser(userId: string, notification: NotificationPayload) {
    this.server.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date(),
    });
    this.logger.log(`Notification sent to user ${userId}: ${notification.title}`);
  }

  /**
   * Send notification to specific child (registration)
   */
  sendToChild(registrationId: string, notification: NotificationPayload) {
    this.server.to(`child:${registrationId}`).emit('notification', {
      ...notification,
      timestamp: new Date(),
    });
    this.logger.log(`Notification sent to child ${registrationId}: ${notification.title}`);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(notification: NotificationPayload) {
    this.server.emit('notification', {
      ...notification,
      timestamp: new Date(),
    });
    this.logger.log(`Broadcast notification: ${notification.title}`);
  }

  /**
   * Send vaccination reminder
   */
  sendVaccinationReminder(registrationId: string, vaccineName: string, dueDate: string) {
    this.sendToChild(registrationId, {
      type: 'vaccination_due',
      title: 'Vaccination Due',
      message: `${vaccineName} vaccine is due on ${dueDate}.`,
      data: { vaccineName, dueDate },
      timestamp: new Date(),
    });
  }

  /**
   * Send health record notification
   */
  sendHealthRecordNotification(registrationId: string, recordType: string) {
    this.sendToChild(registrationId, {
      type: 'health_record',
      title: 'New Health Record',
      message: `A new ${recordType} has been uploaded.`,
      data: { recordType },
      timestamp: new Date(),
    });
  }

  /**
   * Send milestone achievement notification
   */
  sendMilestoneNotification(registrationId: string, milestoneName: string) {
    this.sendToChild(registrationId, {
      type: 'milestone',
      title: 'Milestone Achieved!',
      message: `Congratulations! ${milestoneName} milestone achieved.`,
      data: { milestoneName },
      timestamp: new Date(),
    });
  }

  /**
   * Send Go Green notification
   */
  sendGoGreenNotification(registrationId: string, message: string) {
    this.sendToChild(registrationId, {
      type: 'go_green',
      title: 'Go Green Update',
      message,
      timestamp: new Date(),
    });
  }

  /**
   * Send payment notification
   */
  sendPaymentNotification(registrationId: string, amount: number, status: string) {
    this.sendToChild(registrationId, {
      type: 'payment',
      title: 'Payment Update',
      message: `Payment of ₹${amount} ${status}.`,
      data: { amount, status },
      timestamp: new Date(),
    });
  }

  /**
   * Send welcome notification for new registration
   */
  sendWelcomeNotification(userId: string, userName: string) {
    this.sendToUser(userId, {
      type: 'general',
      title: `Welcome ${userName}!`,
      message: `Thank you for registering with WombTo18. Your child's health journey starts here.`,
      timestamp: new Date(),
    });
  }

  /**
   * Send welcome back notification for returning users
   */
  sendWelcomeBackNotification(userId: string, userName: string) {
    this.sendToUser(userId, {
      type: 'general',
      title: `Welcome back, ${userName}!`,
      message: `We're glad to see you again. Check your dashboard for the latest updates.`,
      timestamp: new Date(),
    });
  }

  /**
   * Send email notification reminder (invoice sent)
   */
  sendEmailReminderNotification(registrationId: string, emailType: 'invoice' | 'certificate' | 'vaccine_schedule') {
    let message = '';
    let title = '';
    
    switch (emailType) {
      case 'invoice':
        title = '📧 Invoice Sent to Email';
        message = 'Your payment invoice has been sent to your registered email address. Please check your inbox.';
        break;
      case 'certificate':
        title = '📧 Go Green Certificate Sent';
        message = 'Your Go Green participation certificate has been sent to your email. Check your inbox!';
        break;
      case 'vaccine_schedule':
        title = '📧 Vaccination Schedule Sent';
        message = 'Complete vaccination schedule with all 64 vaccines has been sent to your email.';
        break;
    }
    
    this.sendToChild(registrationId, {
      type: 'general',
      title,
      message,
      data: { emailType },
      timestamp: new Date(),
    });
  }

  /**
   * Send combined post-payment notification
   */
  sendPostPaymentNotification(registrationId: string) {
    this.sendToChild(registrationId, {
      type: 'payment',
      title: '✅ Documents Sent to Email',
      message: 'Payment invoice, Go Green certificate, and vaccination schedule have been sent to your registered email address.',
      timestamp: new Date(),
    });
  }
}
