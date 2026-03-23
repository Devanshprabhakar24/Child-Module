import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { InvoiceService } from './invoice.service';
import {
  ChildRegistration,
  ChildRegistrationSchema,
} from '../registration/schemas/child-registration.schema';
import { Milestone, MilestoneSchema } from '../dashboard/schemas/milestone.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { GoGreenModule } from '../go-green/go-green.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { RemindersModule } from '../reminders/reminders.module';
import { CmsModule } from '../cms/cms.module';
import { CloudinaryService } from '../common/cloudinary.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: ChildRegistration.name, schema: ChildRegistrationSchema },
      { name: Milestone.name, schema: MilestoneSchema },
    ]),
    NotificationsModule,
    GoGreenModule,
    DashboardModule,
    RemindersModule,
    CmsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, InvoiceService, CloudinaryService],
  exports: [PaymentsService, InvoiceService],
})
export class PaymentsModule {}
