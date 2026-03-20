import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GrowthChartController } from './growth-chart.controller';
import { GrowthChartService } from './growth-chart.service';
import { GrowthRecord, GrowthRecordSchema } from './schemas/growth-record.schema';
import { RegistrationModule } from '../registration/registration.module';

@Module({
  imports: [
    RegistrationModule,
    MongooseModule.forFeature([
      {
        name: GrowthRecord.name,
        schema: GrowthRecordSchema,
      },
    ]),
  ],
  controllers: [GrowthChartController],
  providers: [GrowthChartService],
  exports: [GrowthChartService],
})
export class GrowthChartModule {}
