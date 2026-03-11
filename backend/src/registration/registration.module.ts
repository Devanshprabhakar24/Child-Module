import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import {
  ChildRegistration,
  ChildRegistrationSchema,
} from './schemas/child-registration.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: ChildRegistration.name, schema: ChildRegistrationSchema },
    ]),
    // NotificationsModule is @Global, no need to import explicitly
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
