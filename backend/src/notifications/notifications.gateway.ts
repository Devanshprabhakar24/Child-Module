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
}
