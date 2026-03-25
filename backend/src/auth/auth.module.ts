import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from './schemas/user.schema';
import { OtpRecord, OtpRecordSchema } from './schemas/otp-record.schema';
import {
  ChildRegistration,
  ChildRegistrationSchema,
} from '../registration/schemas/child-registration.schema';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Fast2SmsService } from '../notifications/fast2sms.service';
import { BrevoEmailService } from '../notifications/brevo-email.service';
import { GmailSmtpService } from '../notifications/gmail-smtp.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { Msg91WhatsAppService } from '../notifications/msg91-whatsapp.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: OtpRecord.name, schema: OtpRecordSchema },
      { name: ChildRegistration.name, schema: ChildRegistrationSchema },
    ]),
    forwardRef(() => require('../registration/registration.module').RegistrationModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    AuthGuard, 
    RolesGuard, 
    Fast2SmsService, 
    BrevoEmailService,
    GmailSmtpService, 
    Msg91WhatsAppService,
    NotificationsGateway, 
    NotificationsService
  ],
  exports: [AuthService, AuthGuard, RolesGuard],
})
export class AuthModule {}
