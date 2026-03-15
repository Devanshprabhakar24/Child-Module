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
  CURRENCY,
  RazorpayWebhookEvent,
  UpdateChildDto,
  ReminderChannel,
} from '@wombto18/shared';
import { BadRequestException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { RemindersService } from '../reminders/reminders.service';

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
      subscriptionAmount: SUBSCRIPTION_TOTAL_PRICE,
      couponCode: dto.couponCode,
      paymentStatus: 'PENDING',
      razorpayOrderId: orderId,
      greenCohort: true,
    });

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
   * 1. Payment confirmation (SMS, WhatsApp, Email with invoice)
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

    try {
      // 1. Payment confirmation + invoice
      await this.notificationsService.sendPaymentConfirmation({
        ...commonPayload,
        amount: registration.subscriptionAmount,
      });

      // 2. Welcome message with dashboard link
      await this.notificationsService.sendWelcomeMessage(commonPayload);

      // 3. Go Green Participation Certificate
      await this.notificationsService.sendGoGreenCertificate(commonPayload);

      registration.goGreenCertSent = true;
      await registration.save();

      // 4. AUTO-ACTIVATE SERVICES: Seed vaccination milestones + schedule reminders
      try {
        this.logger.log(`Auto-activating services for ${registration.registrationId}...`);
        
        // Seed vaccination milestones
        const milestones = await this.dashboardService.seedVaccinationMilestones(
          registration.registrationId,
          registration.dateOfBirth,
        );
        
        // Schedule reminders for all milestones
        const reminderCount = await this.remindersService.seedRemindersForRegistration(
          registration.registrationId,
          [ReminderChannel.SMS, ReminderChannel.WHATSAPP],
        );
        
        this.logger.log(
          `Services activated for ${registration.registrationId}: ${milestones.length} milestones, ${reminderCount} reminders`
        );
      } catch (activationError) {
        this.logger.error(
          `Failed to auto-activate services for ${registration.registrationId}: ${
            activationError instanceof Error ? activationError.message : activationError
          }`
        );
        // Don't throw - notifications already sent, services can be activated manually
      }

      this.logger.log(`All post-payment notifications sent for ${registration.registrationId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send notifications for ${registration.registrationId}: ${error instanceof Error ? error.message : error}`,
      );
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

  // ─── Child Profile Update ─────────────────────────────────────────────

  async updateChild(registrationId: string, dto: UpdateChildDto): Promise<ChildRegistrationDocument> {
    const registration = await this.childModel.findOne({ registrationId }).exec();
    if (!registration) {
      throw new BadRequestException('Registration not found.');
    }

    if (dto.childName !== undefined) {
      registration.childName = dto.childName;
    }
    if (dto.profilePictureUrl !== undefined) {
      registration.profilePictureUrl = dto.profilePictureUrl;
    }

    await registration.save();
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

  isPaymentTestMode(): boolean {
    return this.paymentTestMode;
  }

  isOtpTestMode(): boolean {
    return this.otpTestMode;
  }
}
