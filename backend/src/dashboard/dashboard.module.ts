import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Milestone, MilestoneSchema } from './schemas/milestone.schema';
import { DevelopmentMilestone, DevelopmentMilestoneSchema } from './schemas/development-milestone.schema';
import { ChildRegistration, ChildRegistrationSchema } from '../registration/schemas/child-registration.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Milestone.name, schema: MilestoneSchema },
      { name: DevelopmentMilestone.name, schema: DevelopmentMilestoneSchema },
      { name: ChildRegistration.name, schema: ChildRegistrationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    RemindersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
