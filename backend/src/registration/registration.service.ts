import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay') as typeof import('razorpay');

import {
  ChildRegistration,
  ChildRegistrationDocument,
  RegistrationType,
} from './schemas/child-registration.schema';
import {
  RegisterChildDto,
  AgeGroup,
  calculateAgeGroup,
  calculateAgeInYears,
  IndianState,
  SUBSCRIPTION_TOTAL_PRICE,
  SUBSCRIPTION_PLANS,
  DEFAULT_PLAN,
  CURRENCY,
  RazorpayWebhookEvent,
  UpdateChildDto,
  ReminderChannel,
} from '@wombto18/shared';
import type { SubscriptionPlanId } from '@wombto18/shared/constants/pricing.constants';
import { BadRequestException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { RemindersService } from '../reminders/reminders.service';
import { CmsService } from '../cms/cms.service';
import { GoGreenService } from '../go-green/go-green.service';
import { AgeGroupEnum } from '../dashboard/schemas/development-milestone.schema';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);
  private readonly razorpay: InstanceType<typeof Razorpay> | null;
  private readonly paymentTestMode: boolean;
  private readonly otpTestMode: boolean;
  private readonly otpTestCode: string;

  constructor(
    @InjectModel(ChildRegistration.name)
    private readonly childModel: Model<ChildRegistrationDocument>,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly dashboardService: DashboardService,
    private readonly remindersService: RemindersService,
    private readonly cmsService: CmsService,
    private readonly goGreenService: GoGreenService,
  ) {
    this.paymentTestMode = this.configService.get<string>('PAYMENT_TEST_MODE') === 'true';
    this.otpTestMode = this.configService.get<string>('OTP_TEST_MODE') === 'true';
    this.otpTestCode = this.configService.get<string>('OTP_TEST_CODE') ?? '123456';

    if (this.paymentTestMode) {
      this.logger.warn('⚠ PAYMENT_TEST_MODE is ON — RazorPay calls will be mocked');
      this.razorpay = null;
    } else {
      this.razorpay = new Razorpay({
        key_id: this.configService.getOrThrow<string>('RAZORPAY_KEY_ID'),
        key_secret: this.configService.getOrThrow<string>('RAZORPAY_KEY_SECRET'),
      });
    }

    if (this.otpTestMode) {
      this.logger.warn('⚠ OTP_TEST_MODE is ON — OTP verification will accept test code');
    }
  }

  // ─── Registration ID Generation ───────────────────────────────────────

  /**
   * Check if email is already registered
   */
  async isEmailRegistered(email: string): Promise<boolean> {
    const count = await this.childModel.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }

  /**
   * Generates a unique Registration ID in format: CHD-{STATE}-{DOB_YYYYMMDD}-{6_DIGIT_NUMBER}
   * Example: CHD-UP-20260311-000001 (DOB = 2026-03-11)
   */
  async generateRegistrationId(state: IndianState, dob: Date): Promise<string> {
    const dateString = this.formatDateString(dob);
    const nextSequence = await this.getNextSequenceNumber(state, dateString);
    const paddedSequence = String(nextSequence).padStart(6, '0');

    return `CHD-${state}-${dateString}-${paddedSequence}`;
  }

  private formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private async getNextSequenceNumber(state: IndianState, dateString: string): Promise<number> {
    const prefix = `CHD-${state}-${dateString}-`;

    const lastDoc = await this.childModel
      .findOne({ registrationId: { $regex: `^${prefix}` } })
      .sort({ registrationId: -1 })
      .select('registrationId')
      .lean()
      .exec();

    if (!lastDoc) {
      return 1;
    }

    const lastSequence = parseInt(lastDoc.registrationId.split('-').pop() ?? '0', 10);
    return lastSequence + 1;
  }

  // ─── Child Registration ───────────────────────────────────────────────

  async registerChild(dto: RegisterChildDto): Promise<{
    registration: ChildRegistrationDocument;
    razorpayOrderId: string;
    testMode: boolean;
  }> {
    const dob = new Date(dto.dateOfBirth);
    const ageInYears: number = calculateAgeInYears(dob);

    // Age must not exceed 18 years
    if (ageInYears > 18) {
      throw new BadRequestException('Child age cannot exceed 18 years.');
    }
    if (ageInYears < 0) {
      throw new BadRequestException('Date of birth cannot be in the future.');
    }

    // Email uniqueness rule: each email can only be used once
    const existingByEmail = await this.childModel.countDocuments({ email: dto.email }).exec();
    if (existingByEmail > 0) {
      throw new BadRequestException(
        'This email address is already registered. Each email can only be used for one registration.',
      );
    }

    // Mobile duplication rule: max 2 registrations per phone number
    const existingByPhone = await this.childModel.countDocuments({ phone: dto.phone }).exec();
    if (existingByPhone >= 2) {
      throw new BadRequestException(
        'This mobile number is already registered for 2 children. Maximum 2 registrations per mobile number allowed.',
      );
    }

    const ageGroup: AgeGroup = calculateAgeGroup(dob);

    const registrationId = await this.generateRegistrationId(dto.state, dob);

    let orderId: string;

    if (this.paymentTestMode) {
      // Test mode: generate a mock order ID, no real RazorPay call
      orderId = `test_order_${registrationId}`;
      this.logger.log(`[TEST MODE] Mock RazorPay order created: ${orderId}`);
    } else {
      const order = await this.razorpay!.orders.create({
        amount: SUBSCRIPTION_TOTAL_PRICE * 100, // RazorPay expects paise
        currency: CURRENCY,
        receipt: registrationId,
        notes: {
          registrationId,
          childName: dto.childName,
        },
      });
      orderId = order.id;
    }

    const registration = await this.childModel.create({
      registrationId,
      childName: dto.childName,
      childGender: dto.childGender,
      dateOfBirth: dob,
      ageGroup,
      ageInYears,
      state: dto.state,
      motherName: dto.motherName,
      fatherName: dto.fatherName,
      motherRegistrationId: dto.motherRegistrationId,
      email: dto.email,
      phone: dto.phone,
      phone2: dto.phone2,
      address: dto.address,
      registrationType: dto.registrationType ?? RegistrationType.DIRECT,
      channelPartnerId: dto.channelPartnerId,
      subscriptionPlan: dto.subscriptionPlan ?? DEFAULT_PLAN,
      subscriptionAmount: SUBSCRIPTION_PLANS[dto.subscriptionPlan ?? DEFAULT_PLAN].price,
      couponCode: dto.couponCode,
      paymentStatus: 'PENDING',
      razorpayOrderId: orderId,
      greenCohort: true,
    });

    // Send registration confirmation email
    try {
      await this.notificationsService.sendRegistrationConfirmationEmail({
        email: dto.email,
        parentName: dto.motherName,
        childName: dto.childName,
        registrationId,
        ageGroup,
        state: dto.state,
        subscriptionAmount: SUBSCRIPTION_PLANS[dto.subscriptionPlan ?? DEFAULT_PLAN].price,
      });
      this.logger.log(`Registration confirmation email sent for ${registrationId}`);
    } catch (error) {
      this.logger.warn(`Failed to send registration confirmation email for ${registrationId}: ${error instanceof Error ? error.message : error}`);
    }

    this.logger.log(`Child registered: ${registrationId} | Order: ${orderId}`);

    return { registration, razorpayOrderId: orderId, testMode: this.paymentTestMode };
  }

  // ─── Confirm Test Payment ────────────────────────────────────────────

  async confirmTestPayment(registrationId: string): Promise<ChildRegistrationDocument> {
    if (!this.paymentTestMode) {
      throw new BadRequestException('Test payment confirmation is only available in test mode.');
    }

    const registration = await this.childModel.findOne({ registrationId }).exec();
    if (!registration) {
      throw new BadRequestException('Registration not found.');
    }

    registration.paymentStatus = 'COMPLETED';
    registration.razorpayPaymentId = `test_pay_${Date.now()}`;
    await registration.save();

    await this.sendPostPaymentNotifications(registration);

    this.logger.log(`[TEST MODE] Payment confirmed for ${registrationId}`);
    return registration;
  }

  // ─── Verify Razorpay Payment (Production) ─────────────────────────────

  async verifyRazorpayPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<ChildRegistrationDocument> {
    // In test mode, skip signature verification
    if (!this.paymentTestMode) {
      const secret = this.configService.getOrThrow<string>('RAZORPAY_KEY_SECRET');
      const body = data.razorpay_order_id + '|' + data.razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(data.razorpay_signature, 'hex'),
      );

      if (!isValid) {
        throw new BadRequestException('Payment verification failed. Invalid signature.');
      }
    } else {
      this.logger.log('[TEST MODE] Skipping payment signature verification');
    }

    const registration = await this.childModel.findOne({
      razorpayOrderId: data.razorpay_order_id,
    }).exec();

    if (!registration) {
      throw new BadRequestException('Registration not found for this order.');
    }

    registration.paymentStatus = 'COMPLETED';
    registration.razorpayPaymentId = data.razorpay_payment_id;
    await registration.save();

    await this.sendPostPaymentNotifications(registration);

    this.logger.log(`Payment verified for ${registration.registrationId}`);
    return registration;
  }

  // ─── RazorPay Webhook Handling ────────────────────────────────────────

  /**
   * Verifies the RazorPay webhook signature using HMAC-SHA256.
   * Prevents forged webhook requests.
   */
  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    if (this.paymentTestMode) {
      this.logger.log('[TEST MODE] Skipping webhook signature verification');
      return true;
    }

    const webhookSecret = this.configService.getOrThrow<string>('RAZORPAY_WEBHOOK_SECRET');

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex'),
    );
  }

  async handlePaymentCaptured(event: RazorpayWebhookEvent): Promise<void> {
    const paymentEntity = event.payload.payment.entity;
    const { order_id: orderId, id: paymentId } = paymentEntity;

    const registration = await this.childModel.findOne({ razorpayOrderId: orderId }).exec();

    if (!registration) {
      this.logger.warn(`No registration found for order: ${orderId}`);
      return;
    }

    registration.paymentStatus = 'COMPLETED';
    registration.razorpayPaymentId = paymentId;
    await registration.save();

    this.logger.log(
      `Payment captured for ${registration.registrationId} | Payment: ${paymentId}`,
    );

    // Send payment confirmation, welcome message, and Go Green certificate
    await this.sendPostPaymentNotifications(registration);
  }

  async handlePaymentFailed(event: RazorpayWebhookEvent): Promise<void> {
    const orderId = event.payload.payment.entity.order_id;

    const registration = await this.childModel.findOne({ razorpayOrderId: orderId }).exec();

    if (!registration) {
      this.logger.warn(`No registration found for failed payment order: ${orderId}`);
      return;
    }

    registration.paymentStatus = 'FAILED';
    await registration.save();

    this.logger.warn(`Payment failed for ${registration.registrationId}`);
  }

  // ─── Lookup ───────────────────────────────────────────────────────────

  async findByRegistrationId(registrationId: string): Promise<ChildRegistrationDocument | null> {
    return this.childModel.findOne({ registrationId }).exec();
  }

  /**
   * If a mother is already registered in the maternal service,
   * returns children linked via the mother's unique registration ID.
   */
  async findByMotherRegistrationId(
    motherRegistrationId: string,
  ): Promise<ChildRegistrationDocument[]> {
    return this.childModel.find({ motherRegistrationId }).exec();
  }

  // ─── OTP Verification ─────────────────────────────────────────────────

  /**
   * Verifies the OTP code submitted by the user.
   * In test mode (OTP_TEST_MODE=true), accepts the configured test code.
   * In production, integrate with your SMS/Email OTP provider here.
   */
  async verifyOtp(email: string, otp: string): Promise<{ verified: boolean }> {
    if (this.otpTestMode) {
      const isValid = otp === this.otpTestCode;
      this.logger.log(`[TEST MODE] OTP verification for ${email}: ${isValid ? 'PASS' : 'FAIL'}`);
      return { verified: isValid };
    }

    // TODO: Replace with actual OTP provider (e.g., Twilio, MSG91, AWS SNS)
    throw new Error('OTP provider not configured. Set OTP_TEST_MODE=true for development.');
  }

  // ─── Post-Payment Notifications ──────────────────────────────────────

  /**
   * Sends all post-payment communications:
   * 1. Payment confirmation (SMS, WhatsApp, Email with invoice) - handled by PaymentsService
   * 2. Welcome message with dashboard link (SMS, WhatsApp, Email)
   * 3. Go Green Participation Certificate (WhatsApp, Email)
   */
  private async sendPostPaymentNotifications(
    registration: ChildRegistrationDocument,
  ): Promise<void> {
    const commonPayload = {
      phone: registration.phone,
      email: registration.email,
      parentName: registration.motherName,
      childName: registration.childName,
      registrationId: registration.registrationId,
    };

    this.logger.log(`📧 Starting post-payment notifications for ${registration.registrationId}`);

    try {
      // NOTE: Payment confirmation with invoice is already sent by PaymentsService
      // We only send Go Green certificate here (no welcome message to avoid duplicates)

      // 1. Plant a tree for the child BEFORE sending certificate
      let plantedTree: any = null;
      try {
        this.logger.log(`🌳 Planting tree for ${registration.registrationId}...`);
        plantedTree = await this.goGreenService.plantTree({
          registrationId: registration.registrationId,
          childName: registration.childName,
          motherName: registration.motherName,
          location: registration.state,
          plantingPartner: 'WombTo18 Green Initiative',
        });
        this.logger.log(`✅ Tree planted successfully: ${plantedTree.treeId} for ${registration.childName}`);
      } catch (treeError) {
        this.logger.error(`❌ Failed to plant tree for ${registration.registrationId}:`, treeError);
        // Continue with certificate generation even if tree planting fails
      }

      // 2. Send Go Green certificate email
      try {
        this.logger.log(`📧 Sending Go Green certificate for ${registration.registrationId}...`);
        await this.notificationsService.sendGoGreenCertificate({
          ...commonPayload,
          state: registration.state,
          dateOfBirth: registration.dateOfBirth.toISOString().split('T')[0],
          treeId: plantedTree?.treeId || `TREE-${new Date().getFullYear()}-PENDING`,
        });
        this.logger.log(`✅ Go Green certificate sent for ${registration.registrationId} with tree ID: ${plantedTree?.treeId || 'PENDING'}`);
        
        registration.goGreenCertSent = true;
        await registration.save();
      } catch (certError) {
        this.logger.error(`❌ Failed to send Go Green certificate for ${registration.registrationId}:`, certError);
        this.logger.error('Certificate error stack:', certError);
      }

      // 3. AUTO-ACTIVATE ALL SERVICES: Comprehensive service activation
      this.logger.log(`⚙️  Activating all services for ${registration.registrationId}...`);
      await this.activateAllServicesForRegistration(registration, plantedTree);

      this.logger.log(`✅ Post-payment notifications completed for ${registration.registrationId}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send notifications for ${registration.registrationId}: ${error instanceof Error ? error.message : error}`,
      );
      this.logger.error('Stack trace:', error);
    }
  }

  // ─── Family Dashboard Queries ─────────────────────────────────────────

  /**
   * Find all children registered under a parent's user ID (family dashboard).
   */
  async findByParentUserId(parentUserId: string): Promise<ChildRegistrationDocument[]> {
    return this.childModel.find({ parentUserId }).sort({ createdAt: -1 }).exec();
  }

  /**
   * Link a child registration to a parent user account.
   */
  async linkToParentUser(registrationId: string, parentUserId: string): Promise<void> {
    await this.childModel.updateOne(
      { registrationId },
      { parentUserId },
    );
  }

  /**
   * Find registrations by phone number (mobile duplication: max 2 per number).
   */
  async findByPhone(phone: string): Promise<ChildRegistrationDocument[]> {
    return this.childModel.find({ phone }).exec();
  }

  /**
   * Find registration by email (should be unique)
   */
  async findByEmail(email: string): Promise<ChildRegistrationDocument | null> {
    return this.childModel.findOne({ email }).exec();
  }

  // ─── Child Profile Update ─────────────────────────────────────────────

  async updateChild(registrationId: string, dto: UpdateChildDto): Promise<ChildRegistrationDocument> {
    const registration = await this.childModel.findOne({ registrationId }).exec();
    if (!registration) {
      throw new BadRequestException('Registration not found.');
    }

    if (dto.childName !== undefined) {
      registration.childName = dto.childName;
    }
    if (dto.motherName !== undefined) {
      registration.motherName = dto.motherName;
    }
    if (dto.fatherName !== undefined) {
      registration.fatherName = dto.fatherName;
    }
    if (dto.address !== undefined) {
      registration.address = dto.address;
    }
    if (dto.bloodGroup !== undefined) {
      registration.bloodGroup = dto.bloodGroup as any;
    }
    if (dto.heightCm !== undefined) {
      registration.heightCm = dto.heightCm;
    }
    if (dto.weightKg !== undefined) {
      registration.weightKg = dto.weightKg;
    }
    if (dto.profilePictureUrl !== undefined) {
      registration.profilePictureUrl = dto.profilePictureUrl;
    }

    await registration.save();
    this.logger.log(`✅ Child profile updated: ${registrationId}`);
    return registration;
  }

  /**
   * Returns registrations for a channel partner (with parent contact info REDACTED).
   */
  async findByChannelPartner(channelPartnerId: string): Promise<
    Array<{
      registrationId: string;
      childName: string;
      childGender: string;
      dateOfBirth: Date;
      ageGroup: string;
      state: string;
      paymentStatus: string;
      createdAt: Date;
    }>
  > {
    const registrations = await this.childModel
      .find({ channelPartnerId })
      .sort({ createdAt: -1 })
      .exec();

    // REDACT parent contact details for channel partner view
    return registrations.map((r) => ({
      registrationId: r.registrationId,
      childName: r.childName,
      childGender: r.childGender,
      dateOfBirth: r.dateOfBirth,
      ageGroup: r.ageGroup,
      state: r.state,
      paymentStatus: r.paymentStatus,
      createdAt: (r as any).createdAt,
      // email, phone, address deliberately EXCLUDED
    }));
  }

  // ─── Helper Methods ───────────────────────────────────────────────────

  /**
   * Converts dashboard service age group enum to CMS age group string format
   */
  private convertToAgeGroupString(ageGroup: AgeGroupEnum): string {
    return ageGroup; // They're already the same format (e.g., "0-1 years")
  }

  /**
   * Comprehensive service activation for new registrations
   * Activates all services: vaccination tracking, development milestones, reminders, and tree planting
   */
  private async activateAllServicesForRegistration(
    registration: ChildRegistrationDocument,
    plantedTree?: any
  ): Promise<void> {
    this.logger.log(`🚀 Auto-activating ALL services for ${registration.registrationId}...`);
    
    const activationResults = {
      vaccinationMilestones: 0,
      developmentMilestones: 0,
      reminders: 0,
      treePlanted: !!plantedTree,
      errors: [] as string[]
    };

    try {
      // 1. VACCINATION MILESTONES - Seed vaccination schedule
      try {
        this.logger.log(`📅 Seeding vaccination milestones for ${registration.registrationId}...`);
        const vaccinationMilestones = await this.dashboardService.seedVaccinationMilestones(
          registration.registrationId,
          registration.dateOfBirth,
        );
        activationResults.vaccinationMilestones = vaccinationMilestones.length;
        this.logger.log(`✅ Seeded ${vaccinationMilestones.length} vaccination milestones`);
      } catch (vacError) {
        const errorMsg = `Failed to seed vaccination milestones: ${vacError instanceof Error ? vacError.message : vacError}`;
        activationResults.errors.push(errorMsg);
        this.logger.error(`❌ ${errorMsg}`);
      }

      // 2. DEVELOPMENT MILESTONES - Seed ALL age groups (0-18 years)
      try {
        this.logger.log(`🧠 Seeding development milestones for ALL age groups for ${registration.registrationId}...`);
        
        // Define all age groups
        const allAgeGroups: AgeGroupEnum[] = [
          AgeGroupEnum.INFANT,
          AgeGroupEnum.TODDLER,
          AgeGroupEnum.PRESCHOOL,
          AgeGroupEnum.SCHOOL,
          AgeGroupEnum.TEEN
        ];
        
        let totalMilestonesSeeded = 0;
        
        // Seed milestones for each age group
        for (const ageGroup of allAgeGroups) {
          try {
            const cmsAgeGroup = this.convertToAgeGroupString(ageGroup);
            this.logger.log(`  📋 Seeding ${cmsAgeGroup} milestones...`);
            
            // Get milestone templates for this age group from CMS
            const templates = await this.cmsService.getMilestoneTemplatesByAgeGroup(cmsAgeGroup);
            
            if (templates && templates.length > 0) {
              const developmentMilestones = await this.dashboardService.seedDevelopmentMilestones(
                registration.registrationId,
                ageGroup,
                templates
              );
              totalMilestonesSeeded += developmentMilestones.length;
              this.logger.log(`  ✅ Seeded ${developmentMilestones.length} milestones for ${cmsAgeGroup}`);
            } else {
              this.logger.warn(`  ⚠️ No milestone templates found for age group: ${cmsAgeGroup}`);
            }
          } catch (ageGroupError) {
            this.logger.error(`  ❌ Failed to seed ${ageGroup}: ${ageGroupError instanceof Error ? ageGroupError.message : ageGroupError}`);
          }
        }
        
        activationResults.developmentMilestones = totalMilestonesSeeded;
        this.logger.log(`✅ Seeded ${totalMilestonesSeeded} total development milestones across all age groups`);
      } catch (devError) {
        const errorMsg = `Failed to seed development milestones: ${devError instanceof Error ? devError.message : devError}`;
        activationResults.errors.push(errorMsg);
        this.logger.error(`❌ ${errorMsg}`);
      }

      // 3. REMINDERS - Schedule vaccination and milestone reminders
      try {
        this.logger.log(`🔔 Setting up reminders for ${registration.registrationId}...`);
        const reminderCount = await this.remindersService.seedRemindersForRegistration(
          registration.registrationId,
          [ReminderChannel.SMS, ReminderChannel.WHATSAPP],
        );
        activationResults.reminders = reminderCount;
        this.logger.log(`✅ Scheduled ${reminderCount} reminders`);
      } catch (reminderError) {
        const errorMsg = `Failed to setup reminders: ${reminderError instanceof Error ? reminderError.message : reminderError}`;
        activationResults.errors.push(errorMsg);
        this.logger.error(`❌ ${errorMsg}`);
      }

      // 4. TREE PLANTING STATUS
      if (plantedTree) {
        this.logger.log(`🌳 Tree already planted: ${plantedTree.treeId}`);
      } else {
        activationResults.errors.push('Tree planting failed or not attempted');
        this.logger.warn(`⚠️ No tree was planted for ${registration.registrationId}`);
      }

      // 5. SUMMARY LOG
      const successCount = [
        activationResults.vaccinationMilestones > 0,
        activationResults.developmentMilestones > 0,
        activationResults.reminders > 0,
        activationResults.treePlanted
      ].filter(Boolean).length;

      if (activationResults.errors.length === 0) {
        this.logger.log(
          `🎉 ALL SERVICES ACTIVATED for ${registration.registrationId}: ` +
          `${activationResults.vaccinationMilestones} vaccination milestones, ` +
          `${activationResults.developmentMilestones} development milestones, ` +
          `${activationResults.reminders} reminders, ` +
          `tree planted: ${activationResults.treePlanted ? 'YES' : 'NO'}`
        );
      } else {
        this.logger.warn(
          `⚠️ PARTIAL SERVICE ACTIVATION for ${registration.registrationId} (${successCount}/4 services): ` +
          `Errors: ${activationResults.errors.join(', ')}`
        );
      }

    } catch (generalError) {
      this.logger.error(
        `💥 CRITICAL ERROR during service activation for ${registration.registrationId}: ${
          generalError instanceof Error ? generalError.message : generalError
        }`
      );
      // Don't throw - notifications already sent, services can be activated manually later
    }
  }

  isPaymentTestMode(): boolean {
    return this.paymentTestMode;
  }

  isOtpTestMode(): boolean {
    return this.otpTestMode;
  }

  /**
   * Find and activate services for registrations that might be missing services
   * This method checks for registrations that don't have vaccination milestones and activates all services
   */
  async findAndActivateIncompleteRegistrations(): Promise<{
    success: boolean;
    message: string;
    activatedRegistrations: string[];
    errors: string[];
  }> {
    const activatedRegistrations: string[] = [];
    const errors: string[] = [];

    try {
      // Find all completed registrations (payment status = COMPLETED)
      const completedRegistrations = await this.childModel.find({ 
        paymentStatus: 'COMPLETED' 
      }).exec();

      this.logger.log(`Found ${completedRegistrations.length} completed registrations to check`);

      for (const registration of completedRegistrations) {
        try {
          // Check if vaccination milestones exist for this registration
          const existingMilestones = await this.dashboardService.getMilestonesByRegistrationId(registration.registrationId);
          
          if (!existingMilestones || existingMilestones.length === 0) {
            this.logger.log(`🔧 Registration ${registration.registrationId} missing services - activating...`);
            
            // Check if tree exists, if not plant one
            let plantedTree: any = null;
            try {
              const existingTree = await this.goGreenService.getTreeByRegistrationId(registration.registrationId);
              if (!existingTree) {
                plantedTree = await this.goGreenService.plantTree({
                  registrationId: registration.registrationId,
                  childName: registration.childName,
                  motherName: registration.motherName,
                  location: registration.state,
                  plantingPartner: 'WombTo18 Green Initiative (Auto-Activation)',
                });
                this.logger.log(`🌳 Planted tree: ${plantedTree.treeId}`);
              } else {
                plantedTree = existingTree;
                this.logger.log(`🌳 Tree already exists: ${existingTree.treeId}`);
              }
            } catch (treeError) {
              this.logger.warn(`Could not plant/find tree for ${registration.registrationId}: ${treeError instanceof Error ? treeError.message : treeError}`);
            }

            // Activate all services
            await this.activateAllServicesForRegistration(registration, plantedTree);
            activatedRegistrations.push(registration.registrationId);
            
            this.logger.log(`✅ Services activated for ${registration.registrationId}`);
          } else {
            this.logger.log(`✓ Registration ${registration.registrationId} already has ${existingMilestones.length} vaccination milestones`);
          }
        } catch (error) {
          const errorMsg = `Failed to activate services for ${registration.registrationId}: ${error instanceof Error ? error.message : error}`;
          errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }

      return {
        success: true,
        message: `Processed ${completedRegistrations.length} registrations. Activated services for ${activatedRegistrations.length} registrations.`,
        activatedRegistrations,
        errors
      };

    } catch (error) {
      const errorMsg = `Failed to find and activate incomplete registrations: ${error instanceof Error ? error.message : error}`;
      this.logger.error(errorMsg);
      return {
        success: false,
        message: errorMsg,
        activatedRegistrations,
        errors: [errorMsg]
      };
    }
  }

  /**
   * Activate services for existing registrations that might be missing services
   * This can be called manually for registrations that were created before full service activation
   */
  async activateServicesForExistingRegistration(registrationId: string): Promise<{
    success: boolean;
    message: string;
    details: any;
  }> {
    try {
      const registration = await this.childModel.findOne({ registrationId }).exec();
      if (!registration) {
        return {
          success: false,
          message: 'Registration not found',
          details: null
        };
      }

      // Check if tree exists, if not plant one
      let plantedTree: any = null;
      try {
        const existingTree = await this.goGreenService.getTreeByRegistrationId(registrationId);
        if (!existingTree) {
          plantedTree = await this.goGreenService.plantTree({
            registrationId: registration.registrationId,
            childName: registration.childName,
            motherName: registration.motherName,
            location: registration.state,
            plantingPartner: 'WombTo18 Green Initiative (Retroactive)',
          });
          this.logger.log(`🌳 Retroactively planted tree: ${plantedTree.treeId}`);
        } else {
          plantedTree = existingTree;
          this.logger.log(`🌳 Tree already exists: ${existingTree.treeId}`);
        }
      } catch (treeError) {
        this.logger.warn(`Could not plant/find tree: ${treeError instanceof Error ? treeError.message : treeError}`);
      }

      // Activate all services
      await this.activateAllServicesForRegistration(registration, plantedTree);

      return {
        success: true,
        message: `Services activated for ${registrationId}`,
        details: {
          registrationId,
          childName: registration.childName,
          treeId: plantedTree?.treeId
        }
      };

    } catch (error) {
      this.logger.error(`Failed to activate services for ${registrationId}: ${error instanceof Error ? error.message : error}`);
      return {
        success: false,
        message: `Failed to activate services: ${error instanceof Error ? error.message : error}`,
        details: null
      };
    }
  }
}
