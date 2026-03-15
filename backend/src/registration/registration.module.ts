import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: ChildRegistration.name, schema: ChildRegistrationSchema },
    ]),
    AuthModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService, CertificateService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
