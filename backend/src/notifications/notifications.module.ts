import { Module, Global, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { Msg91WhatsAppService } from './msg91-whatsapp.service';
import { WatiWhatsAppService } from './wati-whatsapp.service';
import { Fast2SmsService } from './fast2sms.service';
import { ResendEmailService } from './resend-email.service';
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
    Msg91WhatsAppService,
    WatiWhatsAppService,
    Fast2SmsService,
    ResendEmailService,
    CertificateService,
    CloudinaryService,
    NotificationsGateway,
  ],
  exports: [
    NotificationsService,
    Msg91WhatsAppService,
    WatiWhatsAppService,
    Fast2SmsService,
    ResendEmailService,
    NotificationsGateway,
  ],
})
export class NotificationsModule {}
