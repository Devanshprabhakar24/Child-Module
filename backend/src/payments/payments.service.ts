import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay') as typeof import('razorpay');

import { Payment, PaymentDocument } from './schemas/payment.schema';
import {
  SUBSCRIPTION_TOTAL_PRICE,
  CURRENCY,
  RazorpayWebhookEvent,
} from '@wombto18/shared';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly razorpay: InstanceType<typeof Razorpay> | null;
  private readonly testMode: boolean;

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly configService: ConfigService,
  ) {
    this.testMode = this.configService.get<string>('PAYMENT_TEST_MODE') === 'true';

    if (this.testMode) {
      this.logger.warn('⚠ PAYMENT_TEST_MODE is ON — RazorPay calls will be mocked');
      this.razorpay = null;
    } else {
      this.razorpay = new Razorpay({
        key_id: this.configService.getOrThrow<string>('RAZORPAY_KEY_ID'),
        key_secret: this.configService.getOrThrow<string>('RAZORPAY_KEY_SECRET'),
      });
    }
  }

  // ─── Create Order ─────────────────────────────────────────────────────

  async createOrder(registrationId: string, childName: string): Promise<PaymentDocument> {
    let orderId: string;

    if (this.testMode) {
      orderId = `test_order_${Date.now()}`;
      this.logger.log(`[TEST MODE] Mock RazorPay order: ${orderId}`);
    } else {
      const order = await this.razorpay!.orders.create({
        amount: SUBSCRIPTION_TOTAL_PRICE * 100,
        currency: CURRENCY,
        receipt: registrationId,
        notes: { registrationId, childName },
      });
      orderId = order.id;
    }

    const payment = await this.paymentModel.create({
      registrationId,
      razorpayOrderId: orderId,
      amount: SUBSCRIPTION_TOTAL_PRICE,
      currency: CURRENCY,
      status: this.testMode ? 'COMPLETED' : 'PENDING',
      receipt: registrationId,
      notes: { registrationId, childName },
    });

    return payment;
  }

  // ─── Webhook Signature Verification ───────────────────────────────────

  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    if (this.testMode) {
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

  // ─── Webhook Event Handlers ───────────────────────────────────────────

  async handlePaymentCaptured(event: RazorpayWebhookEvent): Promise<void> {
    const entity = event.payload.payment.entity;

    const payment = await this.paymentModel.findOne({
      razorpayOrderId: entity.order_id,
    }).exec();

    if (!payment) {
      this.logger.warn(`No payment found for order: ${entity.order_id}`);
      return;
    }

    payment.status = 'COMPLETED';
    payment.razorpayPaymentId = entity.id;
    payment.method = entity.method;
    await payment.save();

    this.logger.log(`Payment captured: ${entity.id} for ${payment.registrationId}`);
  }

  async handlePaymentFailed(event: RazorpayWebhookEvent): Promise<void> {
    const entity = event.payload.payment.entity;

    const payment = await this.paymentModel.findOne({
      razorpayOrderId: entity.order_id,
    }).exec();

    if (!payment) {
      this.logger.warn(`No payment found for failed order: ${entity.order_id}`);
      return;
    }

    payment.status = 'FAILED';
    await payment.save();

    this.logger.warn(`Payment failed for ${payment.registrationId}`);
  }

  // ─── Lookups ──────────────────────────────────────────────────────────

  async findByRegistrationId(registrationId: string): Promise<PaymentDocument[]> {
    return this.paymentModel.find({ registrationId }).sort({ createdAt: -1 }).exec();
  }

  async findByOrderId(razorpayOrderId: string): Promise<PaymentDocument | null> {
    return this.paymentModel.findOne({ razorpayOrderId }).exec();
  }

  isTestMode(): boolean {
    return this.testMode;
  }
}
