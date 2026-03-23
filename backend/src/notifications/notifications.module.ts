import { Module, Global, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { CertificateService } from '../registration/certificate.service';
import { CloudinaryService } from '../common/cloudinary.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { TestNotificationController } from './test-notification.controller';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    AuthModule,
  ],
  controllers: [NotificationsController, TestNotificationController],
  providers: [
    NotificationsService,
    EmailService,
    SmsService,
    CertificateService,
    CloudinaryService,
    NotificationsGateway,
  ],
  exports: [NotificationsService, EmailService, SmsService, NotificationsGateway],
})
export class NotificationsModule {}
