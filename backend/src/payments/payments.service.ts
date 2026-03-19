import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay') as typeof import('razorpay');

import { Payment, PaymentDocument } from './schemas/payment.schema';
import { InvoiceService, InvoiceData } from './invoice.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  ChildRegistration,
  ChildRegistrationDocument,
} from '../registration/schemas/child-registration.schema';
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
  private readonly demoMode: boolean;

  /** In-memory cache of generated invoice PDFs keyed by registrationId */
  private readonly invoiceCache = new Map<string, Buffer>();

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(ChildRegistration.name)
    private readonly registrationModel: Model<ChildRegistrationDocument>,
    private readonly configService: ConfigService,
    private readonly invoiceService: InvoiceService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.testMode = this.configService.get<string>('PAYMENT_TEST_MODE') === 'true';
    this.demoMode = this.configService.get<string>('PAYMENT_DEMO_MODE') === 'true';

    if (this.testMode) {
      this.logger.warn('⚠ PAYMENT_TEST_MODE is ON — RazorPay calls will be mocked');
      this.razorpay = null;
    } else if (this.demoMode) {
      this.logger.warn('🎭 PAYMENT_DEMO_MODE is ON — Real RazorPay UI with auto-success');
      this.razorpay = new Razorpay({
        key_id: this.configService.getOrThrow<string>('RAZORPAY_KEY_ID'),
        key_secret: this.configService.getOrThrow<string>('RAZORPAY_KEY_SECRET'),
      });
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
      this.logger.log(`Creating Razorpay order for ${registrationId} (${childName})`);
      const order = await this.razorpay!.orders.create({
        amount: SUBSCRIPTION_TOTAL_PRICE * 100,
        currency: CURRENCY,
        receipt: registrationId,
        notes: { registrationId, childName },
      });
      orderId = order.id;
      this.logger.log(`Razorpay order created: ${orderId} for ₹${SUBSCRIPTION_TOTAL_PRICE}`);
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

    this.logger.log(`Payment record created: ${payment._id} with status ${payment.status}`);

    // In test mode the payment is immediately COMPLETED — generate invoice now
    if (this.testMode) {
      await this.generateAndSendInvoice(payment);
    }

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

    // Generate invoice & send notifications
    await this.generateAndSendInvoice(payment);
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

  // ─── Invoice Generation & Delivery ────────────────────────────────────

  private async generateAndSendInvoice(payment: PaymentDocument): Promise<void> {
    try {
      // Fetch child registration for parent info
      const registration = await this.registrationModel
        .findOne({ registrationId: payment.registrationId })
        .exec();

      const parentName = registration?.motherName ?? 'Parent';
      const childName = registration?.childName ?? payment.notes?.['childName'] ?? 'Child';
      const email = registration?.email ?? '';
      const phone = registration?.phone ?? '';

      const invoiceData: InvoiceData = {
        invoiceNumber: `INV-${Date.now()}`,
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        parentName,
        childName,
        registrationId: payment.registrationId,
        email,
        phone,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.method,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
      };

      const pdfBuffer = await this.invoiceService.generateInvoice(invoiceData);

      // Cache the PDF for download
      this.invoiceCache.set(payment.registrationId, pdfBuffer);
      this.logger.log(`Invoice generated for ${payment.registrationId} (${pdfBuffer.length} bytes)`);

      // Send welcome email with payment invoice attachment (Email 1)
      await this.notificationsService.sendWelcomeWithInvoice({
        phone,
        email,
        parentName,
        childName,
        registrationId: payment.registrationId,
        amount: payment.amount,
        invoiceBuffer: pdfBuffer,
      });
      
      this.logger.log(`✅ Welcome email with invoice sent for ${payment.registrationId}`);
    } catch (err) {
      this.logger.error(
        `Failed to generate/send invoice for ${payment.registrationId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  // ─── Invoice Download ─────────────────────────────────────────────────

  /**
   * Returns a cached invoice PDF buffer, or generates one on-the-fly if not cached.
   */
  async getInvoicePdf(registrationId: string): Promise<Buffer | null> {
    // Return from cache if available
    if (this.invoiceCache.has(registrationId)) {
      return this.invoiceCache.get(registrationId)!;
    }

    // Otherwise, try to generate from the latest COMPLETED payment
    const payment = await this.paymentModel
      .findOne({ registrationId, status: 'COMPLETED' })
      .sort({ createdAt: -1 })
      .exec();

    // Fallback: support test-mode registrations that never created a Payment document.
    const registration = await this.registrationModel
      .findOne({ registrationId })
      .exec();

    if (!payment && !registration) {
      // No data at all for this registrationId
      return null;
    }

    const baseDate =
      (payment as any)?.createdAt ??
      (registration as any)?.createdAt ??
      Date.now();

    const invoiceData: InvoiceData = {
      invoiceNumber: payment ? `INV-${payment._id}` : `INV-${registrationId}`,
      date: new Date(baseDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      parentName: registration?.motherName ?? 'Parent',
      childName: registration?.childName ?? (payment?.notes?.['childName'] ?? 'Child'),
      registrationId,
      email: registration?.email ?? '',
      phone: registration?.phone ?? '',
      amount: payment?.amount ?? SUBSCRIPTION_TOTAL_PRICE,
      currency: payment?.currency ?? CURRENCY,
      paymentMethod: payment?.method ?? (this.testMode ? 'TEST-MODE' : 'UNKNOWN'),
      razorpayOrderId: payment?.razorpayOrderId ?? '',
      razorpayPaymentId: payment?.razorpayPaymentId ?? '',
    };

    const pdfBuffer = await this.invoiceService.generateInvoice(invoiceData);
    this.invoiceCache.set(registrationId, pdfBuffer);
    return pdfBuffer;
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

  isDemoMode(): boolean {
    return this.demoMode;
  }
}

