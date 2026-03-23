import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Milestone, MilestoneSchema } from './schemas/milestone.schema';
import { DevelopmentMilestone, DevelopmentMilestoneSchema } from './schemas/development-milestone.schema';
import { ChildRegistration, ChildRegistrationSchema } from '../registration/schemas/child-registration.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { HealthRecord, HealthRecordSchema } from '../health-records/schemas/health-record.schema';
import { Reminder, ReminderSchema } from '../reminders/schemas/reminder.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { GoGreenTree, GoGreenTreeSchema } from '../go-green/schemas/go-green-tree.schema';
import { AuthModule } from '../auth/auth.module';
import { RemindersModule } from '../reminders/reminders.module';
import { CloudinaryService } from '../common/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Milestone.name, schema: MilestoneSchema },
      { name: DevelopmentMilestone.name, schema: DevelopmentMilestoneSchema },
      { name: ChildRegistration.name, schema: ChildRegistrationSchema },
      { name: User.name, schema: UserSchema },
      { name: HealthRecord.name, schema: HealthRecordSchema },
      { name: Reminder.name, schema: ReminderSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: GoGreenTree.name, schema: GoGreenTreeSchema },
    ]),
    AuthModule,
    RemindersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, CloudinaryService],
  exports: [DashboardService],
})
export class DashboardModule {}
