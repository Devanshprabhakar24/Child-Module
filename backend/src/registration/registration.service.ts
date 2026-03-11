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
} from '@wombto18/shared';
import { NotificationsService } from '../notifications/notifications.service';

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
  }> {
    const dob = new Date(dto.dateOfBirth);
    const ageGroup: AgeGroup = calculateAgeGroup(dob);
    const ageInYears: number = calculateAgeInYears(dob);

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
      paymentStatus: this.paymentTestMode ? 'COMPLETED' : 'PENDING',
      razorpayOrderId: orderId,
      greenCohort: true,
    });

    this.logger.log(`Child registered: ${registrationId} | Order: ${orderId}`);

    // If payment is auto-completed (test mode), send all notifications immediately
    if (this.paymentTestMode) {
      await this.sendPostPaymentNotifications(registration);
    }

    return { registration, razorpayOrderId: orderId };
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
