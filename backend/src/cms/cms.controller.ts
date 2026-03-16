import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ─── Public Endpoints ─────────────────────────────────────────────────

  @Get('faqs')
  async getFaqs() {
    const faqs = await this.cmsService.getAllFaqs();
    return { success: true, data: faqs };
  }

  @Get('testimonials')
  async getTestimonials() {
    const testimonials = await this.cmsService.getAllTestimonials();
    return { success: true, data: testimonials };
  }

  @Get('vaccine-templates')
  async getVaccineTemplates() {
    const templates = await this.cmsService.getAllVaccineTemplates();
    return { success: true, data: templates };
  }

  @Get('milestone-templates')
  async getMilestoneTemplates() {
    const templates = await this.cmsService.getAllMilestoneTemplates();
    return { success: true, data: templates };
  }

  @Get('milestone-templates/:ageGroup')
  async getMilestoneTemplatesByAgeGroup(@Param('ageGroup') ageGroup: string) {
    const templates = await this.cmsService.getMilestoneTemplatesByAgeGroup(ageGroup);
    return { success: true, data: templates };
  }

  // ─── Admin Endpoints ──────────────────────────────────────────────────

  @Post('faqs')
  @UseGuards(AuthGuard)
  async createFaq(@Body() data: any) {
    const faq = await this.cmsService.createFaq(data);
    return { success: true, data: faq };
  }

  @Patch('faqs/:id')
  @UseGuards(AuthGuard)
  async updateFaq(@Param('id') id: string, @Body() data: any) {
    const faq = await this.cmsService.updateFaq(id, data);
    return { success: true, data: faq };
  }

  @Delete('faqs/:id')
  @UseGuards(AuthGuard)
  async deleteFaq(@Param('id') id: string) {
    await this.cmsService.deleteFaq(id);
    return { success: true, message: 'FAQ deleted' };
  }

  @Post('testimonials')
  @UseGuards(AuthGuard)
  async createTestimonial(@Body() data: any) {
    const testimonial = await this.cmsService.createTestimonial(data);
    return { success: true, data: testimonial };
  }

  @Patch('testimonials/:id')
  @UseGuards(AuthGuard)
  async updateTestimonial(@Param('id') id: string, @Body() data: any) {
    const testimonial = await this.cmsService.updateTestimonial(id, data);
    return { success: true, data: testimonial };
  }

  @Delete('testimonials/:id')
  @UseGuards(AuthGuard)
  async deleteTestimonial(@Param('id') id: string) {
    await this.cmsService.deleteTestimonial(id);
    return { success: true, message: 'Testimonial deleted' };
  }

  @Post('vaccine-templates')
  @UseGuards(AuthGuard)
  async createVaccineTemplate(@Body() data: any) {
    const template = await this.cmsService.createVaccineTemplate(data);
    return { success: true, data: template };
  }

  @Patch('vaccine-templates/:id')
  @UseGuards(AuthGuard)
  async updateVaccineTemplate(@Param('id') id: string, @Body() data: any) {
    const template = await this.cmsService.updateVaccineTemplate(id, data);
    return { success: true, data: template };
  }

  @Delete('vaccine-templates/:id')
  @UseGuards(AuthGuard)
  async deleteVaccineTemplate(@Param('id') id: string) {
    await this.cmsService.deleteVaccineTemplate(id);
    return { success: true, message: 'Vaccine template deleted' };
  }

  @Post('milestone-templates')
  @UseGuards(AuthGuard)
  async createMilestoneTemplate(@Body() data: any) {
    const template = await this.cmsService.createMilestoneTemplate(data);
    return { success: true, data: template };
  }

  @Patch('milestone-templates/:id')
  @UseGuards(AuthGuard)
  async updateMilestoneTemplate(@Param('id') id: string, @Body() data: any) {
    const template = await this.cmsService.updateMilestoneTemplate(id, data);
    return { success: true, data: template };
  }

  @Delete('milestone-templates/:id')
  @UseGuards(AuthGuard)
  async deleteMilestoneTemplate(@Param('id') id: string) {
    await this.cmsService.deleteMilestoneTemplate(id);
    return { success: true, message: 'Milestone template deleted' };
  }

  @Post('seed')
  @UseGuards(AuthGuard)
  async seedDefaultData() {
    const results = await this.cmsService.seedDefaultData();
    return { success: true, data: results };
  }
}
