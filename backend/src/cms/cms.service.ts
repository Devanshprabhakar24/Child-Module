import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq, FaqDocument } from './schemas/faq.schema';
import { Testimonial, TestimonialDocument } from './schemas/testimonial.schema';
import { VaccineTemplate, VaccineTemplateDocument } from './schemas/vaccine-template.schema';
import { MilestoneTemplate, MilestoneTemplateDocument } from './schemas/milestone-template.schema';

@Injectable()
export class CmsService {
  constructor(
    @InjectModel(Faq.name) private faqModel: Model<FaqDocument>,
    @InjectModel(Testimonial.name) private testimonialModel: Model<TestimonialDocument>,
    @InjectModel(VaccineTemplate.name) private vaccineTemplateModel: Model<VaccineTemplateDocument>,
    @InjectModel(MilestoneTemplate.name) private milestoneTemplateModel: Model<MilestoneTemplateDocument>,
  ) {}

  // ─── FAQs ─────────────────────────────────────────────────────────────

  async getAllFaqs() {
    return this.faqModel.find({ isActive: true }).sort({ order: 1 }).exec();
  }

  async createFaq(data: Partial<Faq>) {
    return this.faqModel.create(data);
  }

  async updateFaq(id: string, data: Partial<Faq>) {
    const faq = await this.faqModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async deleteFaq(id: string) {
    const result = await this.faqModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('FAQ not found');
    return result;
  }

  // ─── Testimonials ─────────────────────────────────────────────────────

  async getAllTestimonials() {
    return this.testimonialModel.find({ isActive: true }).sort({ order: 1 }).exec();
  }

  async createTestimonial(data: Partial<Testimonial>) {
    return this.testimonialModel.create(data);
  }

  async updateTestimonial(id: string, data: Partial<Testimonial>) {
    const testimonial = await this.testimonialModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    return testimonial;
  }

  async deleteTestimonial(id: string) {
    const result = await this.testimonialModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Testimonial not found');
    return result;
  }

  // ─── Vaccine Templates ────────────────────────────────────────────────

  async getAllVaccineTemplates() {
    return this.vaccineTemplateModel.find({ isActive: true }).sort({ ageInMonths: 1, order: 1 }).exec();
  }

  async createVaccineTemplate(data: Partial<VaccineTemplate>) {
    return this.vaccineTemplateModel.create(data);
  }

  async updateVaccineTemplate(id: string, data: Partial<VaccineTemplate>) {
    const template = await this.vaccineTemplateModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!template) throw new NotFoundException('Vaccine template not found');
    return template;
  }

  async deleteVaccineTemplate(id: string) {
    const result = await this.vaccineTemplateModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Vaccine template not found');
    return result;
  }

  // ─── Milestone Templates ──────────────────────────────────────────────

  async getAllMilestoneTemplates() {
    return this.milestoneTemplateModel.find({ isActive: true }).sort({ ageGroup: 1, order: 1 }).exec();
  }

  async getMilestoneTemplatesByAgeGroup(ageGroup: string) {
    return this.milestoneTemplateModel.find({ ageGroup, isActive: true }).sort({ order: 1 }).exec();
  }

  async createMilestoneTemplate(data: Partial<MilestoneTemplate>) {
    return this.milestoneTemplateModel.create(data);
  }

  async updateMilestoneTemplate(id: string, data: Partial<MilestoneTemplate>) {
    const template = await this.milestoneTemplateModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!template) throw new NotFoundException('Milestone template not found');
    return template;
  }

  async deleteMilestoneTemplate(id: string) {
    const result = await this.milestoneTemplateModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Milestone template not found');
    return result;
  }

  // ─── Seed Default Data ────────────────────────────────────────────────

  async seedDefaultData() {
    const faqCount = await this.faqModel.countDocuments().exec();
    const testimonialCount = await this.testimonialModel.countDocuments().exec();
    const vaccineCount = await this.vaccineTemplateModel.countDocuments().exec();
    const milestoneCount = await this.milestoneTemplateModel.countDocuments().exec();

    const results = {
      faqs: 0,
      testimonials: 0,
      vaccines: 0,
      milestones: 0,
    };

    // Seed FAQs
    if (faqCount === 0) {
      const defaultFaqs = [
        {
          question: 'Is my child\'s medical data secure and private?',
          answer: 'Yes, absolutely. We use bank-grade encryption and comply with healthcare data protection standards. Your child\'s information is never shared without your explicit consent.',
          order: 1,
          category: 'security',
        },
        {
          question: 'How do vaccination reminders work?',
          answer: 'Our system automatically calculates due dates based on your child\'s age and sends timely reminders via SMS, email, and in-app notifications 7 days before each vaccination is due.',
          order: 2,
          category: 'features',
        },
        {
          question: 'Can I track multiple children under one account?',
          answer: 'Yes! You can register and manage health records for multiple children from a single parent account. Simply add each child during registration.',
          order: 3,
          category: 'account',
        },
      ];
      await this.faqModel.insertMany(defaultFaqs);
      results.faqs = defaultFaqs.length;
    }

    // Seed Testimonials
    if (testimonialCount === 0) {
      const defaultTestimonials = [
        {
          quote: 'Managing vaccination schedules used to be a nightmare. WombTo18 has made it so simple and stress-free. The reminders are a lifesaver!',
          author: 'Priya Sharma',
          role: 'Mother of 2',
          rating: 5,
          order: 1,
        },
        {
          quote: 'The milestone tracking feature helps me understand my child\'s development better. I feel more confident as a first-time parent.',
          author: 'Rajesh Kumar',
          role: 'New Parent',
          rating: 5,
          order: 2,
        },
      ];
      await this.testimonialModel.insertMany(defaultTestimonials);
      results.testimonials = defaultTestimonials.length;
    }

    // Seed Vaccine Templates
    if (vaccineCount === 0) {
      const defaultVaccines = [
        { vaccineName: 'BCG', title: 'BCG Vaccine', ageInMonths: 0, description: 'Bacillus Calmette-Guérin — Tuberculosis', order: 1, category: 'routine' },
        { vaccineName: 'OPV-0', title: 'OPV Zero Dose', ageInMonths: 0, description: 'Oral Polio Vaccine — Birth dose', order: 2, category: 'routine' },
        { vaccineName: 'Hep-B1', title: 'Hepatitis B — 1st Dose', ageInMonths: 0, description: 'Hepatitis B birth dose', order: 3, category: 'routine' },
        { vaccineName: 'OPV-1', title: 'OPV 1st Dose', ageInMonths: 1.5, description: 'Oral Polio Vaccine — 6 weeks', order: 4, category: 'routine' },
        { vaccineName: 'Penta-1', title: 'Pentavalent 1st Dose', ageInMonths: 1.5, description: 'DPT + Hep B + Hib — 6 weeks', order: 5, category: 'routine' },
      ];
      await this.vaccineTemplateModel.insertMany(defaultVaccines);
      results.vaccines = defaultVaccines.length;
    }

    // Seed Milestone Templates
    if (milestoneCount === 0) {
      const defaultMilestones = [
        // 0-1 years
        { ageGroup: '0-1 years', title: 'Lifts head when on tummy', description: 'Baby can lift head briefly when lying on stomach', type: 'PHYSICAL', order: 1, tips: 'Give plenty of supervised tummy time' },
        { ageGroup: '0-1 years', title: 'Follows objects with eyes', description: 'Tracks moving objects with eyes', type: 'COGNITIVE', order: 2, tips: 'Use colorful toys to encourage tracking' },
        { ageGroup: '0-1 years', title: 'Smiles at people', description: 'Social smile in response to interaction', type: 'SOCIAL', order: 3, tips: 'Engage with baby through smiling and talking' },
        { ageGroup: '0-1 years', title: 'Coos and babbles', description: 'Makes cooing sounds and babbles', type: 'LANGUAGE', order: 4, tips: 'Talk to baby frequently and respond to sounds' },
        { ageGroup: '0-1 years', title: 'Sits without support', description: 'Can sit independently without falling', type: 'PHYSICAL', order: 5, tips: 'Practice sitting with pillow support initially' },
        
        // 1-3 years
        { ageGroup: '1-3 years', title: 'Walks independently', description: 'Walks without support', type: 'PHYSICAL', order: 1, tips: 'Provide safe space for walking practice' },
        { ageGroup: '1-3 years', title: 'Says 2-3 words', description: 'Uses simple words like mama, dada', type: 'LANGUAGE', order: 2, tips: 'Name objects and repeat words clearly' },
        { ageGroup: '1-3 years', title: 'Points to objects', description: 'Points to things when named', type: 'COGNITIVE', order: 3, tips: 'Play naming games with everyday objects' },
        { ageGroup: '1-3 years', title: 'Shows affection', description: 'Hugs, kisses, shows emotions', type: 'EMOTIONAL', order: 4, tips: 'Model affectionate behavior' },
        { ageGroup: '1-3 years', title: 'Runs and climbs', description: 'Runs well and climbs furniture', type: 'PHYSICAL', order: 5, tips: 'Supervise active play and climbing' },
        
        // 3-5 years
        { ageGroup: '3-5 years', title: 'Hops on one foot', description: 'Can hop on one foot multiple times', type: 'PHYSICAL', order: 1, tips: 'Practice hopping games' },
        { ageGroup: '3-5 years', title: 'Speaks in sentences', description: 'Uses 4-5 word sentences', type: 'LANGUAGE', order: 2, tips: 'Have conversations and read books together' },
        { ageGroup: '3-5 years', title: 'Plays with other children', description: 'Engages in cooperative play', type: 'SOCIAL', order: 3, tips: 'Arrange playdates with peers' },
        { ageGroup: '3-5 years', title: 'Draws simple shapes', description: 'Can draw circles and squares', type: 'COGNITIVE', order: 4, tips: 'Provide drawing materials and practice' },
        { ageGroup: '3-5 years', title: 'Shows independence', description: 'Wants to do things independently', type: 'EMOTIONAL', order: 5, tips: 'Allow safe opportunities for independence' },
        
        // 5-12 years
        { ageGroup: '5-12 years', title: 'Rides bicycle', description: 'Can ride a bicycle with or without training wheels', type: 'PHYSICAL', order: 1, tips: 'Practice in safe areas with supervision' },
        { ageGroup: '5-12 years', title: 'Reads simple books', description: 'Can read age-appropriate books', type: 'COGNITIVE', order: 2, tips: 'Read together daily' },
        { ageGroup: '5-12 years', title: 'Makes friends easily', description: 'Forms friendships with peers', type: 'SOCIAL', order: 3, tips: 'Encourage social activities' },
        { ageGroup: '5-12 years', title: 'Expresses feelings', description: 'Can identify and express emotions', type: 'EMOTIONAL', order: 4, tips: 'Discuss feelings openly' },
        { ageGroup: '5-12 years', title: 'Follows complex instructions', description: 'Can follow multi-step directions', type: 'COGNITIVE', order: 5, tips: 'Give clear, step-by-step instructions' },
        
        // 13-18 years
        { ageGroup: '13-18 years', title: 'Develops abstract thinking', description: 'Can think abstractly and reason logically', type: 'COGNITIVE', order: 1, tips: 'Encourage critical thinking discussions' },
        { ageGroup: '13-18 years', title: 'Forms identity', description: 'Develops sense of self and values', type: 'EMOTIONAL', order: 2, tips: 'Support exploration of interests' },
        { ageGroup: '13-18 years', title: 'Peer relationships deepen', description: 'Forms deeper friendships', type: 'SOCIAL', order: 3, tips: 'Respect privacy while staying connected' },
        { ageGroup: '13-18 years', title: 'Plans for future', description: 'Thinks about career and life goals', type: 'COGNITIVE', order: 4, tips: 'Discuss goals and provide guidance' },
        { ageGroup: '13-18 years', title: 'Manages emotions', description: 'Better emotional regulation', type: 'EMOTIONAL', order: 5, tips: 'Model healthy coping strategies' },
      ];
      await this.milestoneTemplateModel.insertMany(defaultMilestones);
      results.milestones = defaultMilestones.length;
    }

    return results;
  }
}
