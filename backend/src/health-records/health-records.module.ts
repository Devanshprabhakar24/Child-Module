import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthRecordsController } from './health-records.controller';
import { HealthRecordsService } from './health-records.service';
import { HealthRecord, HealthRecordSchema } from './schemas/health-record.schema';
import { RegistrationModule } from '../registration/registration.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HealthRecord.name, schema: HealthRecordSchema },
    ]),
    RegistrationModule,
    AuthModule,
  ],
  controllers: [HealthRecordsController],
  providers: [HealthRecordsService],
  exports: [HealthRecordsService],
})
export class HealthRecordsModule {}