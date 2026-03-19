import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { InvoiceService } from './invoice.service';
import {
  ChildRegistration,
  ChildRegistrationSchema,
} from '../registration/schemas/child-registration.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: ChildRegistration.name, schema: ChildRegistrationSchema },
    ]),
    AuthModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, InvoiceService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

