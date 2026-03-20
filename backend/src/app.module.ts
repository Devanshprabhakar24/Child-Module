import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RegistrationModule } from './registration/registration.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RemindersModule } from './reminders/reminders.module';
import { ChannelPartnerModule } from './channel-partner/channel-partner.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CmsModule } from './cms/cms.module';
import { GoGreenModule } from './go-green/go-green.module';
import { HealthRecordsModule } from './health-records/health-records.module';
import { GrowthChartModule } from './growth-chart/growth-chart.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(
      process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/wombto18',
      {
        retryAttempts: 3,
        retryDelay: 1000,
        connectionFactory: (connection) => {
          console.log('✅ MongoDB connected successfully');
          return connection;
        },
      }
    ),
    NotificationsModule,
    RegistrationModule,
    AuthModule,
    PaymentsModule,
    DashboardModule,
    RemindersModule,
    ChannelPartnerModule,
    CmsModule,
    GoGreenModule,
    HealthRecordsModule,
    GrowthChartModule,
  ],
})
export class AppModule {}
