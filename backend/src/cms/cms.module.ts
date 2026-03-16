import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CmsService } from './cms.service';
import { CmsController } from './cms.controller';
import { Faq, FaqSchema } from './schemas/faq.schema';
import { Testimonial, TestimonialSchema } from './schemas/testimonial.schema';
import { VaccineTemplate, VaccineTemplateSchema } from './schemas/vaccine-template.schema';
import { MilestoneTemplate, MilestoneTemplateSchema } from './schemas/milestone-template.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Faq.name, schema: FaqSchema },
      { name: Testimonial.name, schema: TestimonialSchema },
      { name: VaccineTemplate.name, schema: VaccineTemplateSchema },
      { name: MilestoneTemplate.name, schema: MilestoneTemplateSchema },
    ]),
    AuthModule,
  ],
  controllers: [CmsController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}
