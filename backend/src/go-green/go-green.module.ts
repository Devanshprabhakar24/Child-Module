import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoGreenService } from './go-green.service';
import { GoGreenController } from './go-green.controller';
import { GoGreenTree, GoGreenTreeSchema } from './schemas/go-green-tree.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GoGreenTree.name, schema: GoGreenTreeSchema },
    ]),
    AuthModule,
  ],
  controllers: [GoGreenController],
  providers: [GoGreenService],
  exports: [GoGreenService, MongooseModule],
})
export class GoGreenModule {}