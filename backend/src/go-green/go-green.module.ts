import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoGreenService } from './go-green.service';
import { GoGreenController } from './go-green.controller';
import { TreeCertificateService } from './tree-certificate.service';
import { CreditAwardListener } from './credit-award.listener';
import { GoGreenTree, GoGreenTreeSchema } from './schemas/go-green-tree.schema';
import { CreditTransaction, CreditTransactionSchema } from './schemas/credit-transaction.schema';
import { TierConfig, TierConfigSchema } from './schemas/tier-config.schema';
import { PlantedTree, PlantedTreeSchema } from './schemas/planted-tree.schema';
import { ChildRegistration, ChildRegistrationSchema } from '../registration/schemas/child-registration.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GoGreenTree.name, schema: GoGreenTreeSchema },
      { name: CreditTransaction.name, schema: CreditTransactionSchema },
      { name: TierConfig.name, schema: TierConfigSchema },
      { name: PlantedTree.name, schema: PlantedTreeSchema },
      { name: ChildRegistration.name, schema: ChildRegistrationSchema },
    ]),
    AuthModule,
  ],
  controllers: [GoGreenController],
  providers: [GoGreenService, TreeCertificateService, CreditAwardListener],
  exports: [GoGreenService, MongooseModule],
})
export class GoGreenModule {}