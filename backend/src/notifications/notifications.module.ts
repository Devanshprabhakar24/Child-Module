import { Module, Global, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { CertificateService } from '../registration/certificate.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [NotificationsService, EmailService, SmsService, CertificateService],
  exports: [NotificationsService, EmailService, SmsService],
})
export class NotificationsModule {}
