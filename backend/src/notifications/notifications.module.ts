import { Module, Global, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { Msg91WhatsAppService } from './msg91-whatsapp.service';
import { WatiWhatsAppService } from './wati-whatsapp.service';
import { Fast2SmsService } from './fast2sms.service';
import { BrevoEmailService } from './brevo-email.service';
import { GmailSmtpService } from './gmail-smtp.service';
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
    BrevoEmailService,
    GmailSmtpService,
    CertificateService,
    CloudinaryService,
    NotificationsGateway,
  ],
  exports: [
    NotificationsService,
    Msg91WhatsAppService,
    WatiWhatsAppService,
    Fast2SmsService,
    BrevoEmailService,
    GmailSmtpService,
    NotificationsGateway,
  ],
})
export class NotificationsModule {}
