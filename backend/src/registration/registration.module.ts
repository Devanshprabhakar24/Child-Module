import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { CertificateService } from './certificate.service';
import {
  ChildRegistration,
  ChildRegistrationSchema,
} from './schemas/child-registration.schema';
import { AuthModule } from '../auth/auth.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { RemindersModule } from '../reminders/reminders.module';
import { CmsModule } from '../cms/cms.module';
import { GoGreenModule } from '../go-green/go-green.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: ChildRegistration.name, schema: ChildRegistrationSchema },
    ]),
    AuthModule,
    DashboardModule,
    RemindersModule,
    CmsModule,
    GoGreenModule,
    forwardRef(() => PaymentsModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService, CertificateService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
