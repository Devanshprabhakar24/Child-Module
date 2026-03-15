import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [NotificationsService, EmailService, SmsService],
  exports: [NotificationsService, EmailService, SmsService],
})
export class NotificationsModule {}
