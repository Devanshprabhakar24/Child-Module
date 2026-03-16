import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrationModule } from './registration/registration.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RemindersModule } from './reminders/reminders.module';
import { ChannelPartnerModule } from './channel-partner/channel-partner.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CmsModule } from './cms/cms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/wombto18',
    ),
    NotificationsModule,
    RegistrationModule,
    AuthModule,
    PaymentsModule,
    DashboardModule,
    RemindersModule,
    ChannelPartnerModule,
    CmsModule,
  ],
})
export class AppModule {}
