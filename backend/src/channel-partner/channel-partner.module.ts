import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ChannelPartnerService } from './channel-partner.service';
import { ChannelPartnerController } from './channel-partner.controller';
import { ChannelPartner, ChannelPartnerSchema } from './schemas/channel-partner.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: ChannelPartner.name, schema: ChannelPartnerSchema },
    ]),
    AuthModule,
  ],
  controllers: [ChannelPartnerController],
  providers: [ChannelPartnerService],
  exports: [ChannelPartnerService],
})
export class ChannelPartnerModule {}
