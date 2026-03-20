import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus, Logger, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { InvoiceService } from './invoice.service';

/**
 * Payment Controller
 * Handles Razorpay payment operations
 */
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly invoiceService: InvoiceService,
  ) {}

  /**
   * Create Razorpay Order
   * POST /payments/create-order
   * 
   * @param body - { amount: number, registrationId: string, childName: string, isUpgrade?: boolean }
   * @returns { orderId, amount, currency, keyId }
   */
  @Post('create-order')
  @HttpCode(HttpStatus.OK)
  async createOrder(
    @Body() body: { amount: number; registrationId: string; childName: string; isUpgrade?: boolean },
  ) {
    try {
      this.logger.log(`Creating order for registration: ${body.registrationId}${body.isUpgrade ? ' [UPGRADE]' : ''}`);
      
      const order = await this.paymentsService.createOrder(
        body.amount,
        body.registrationId,
        body.childName,
        body.isUpgrade || false,
      );

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create order: ${errorMessage}`);
      return {
        success: false,
        message: errorMessage || 'Failed to create order',
      };
    }
  }

  /**
   * Verify Razorpay Payment
   * POST /payments/verify
   * 
   * @param body - { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   * @returns { success: boolean, registrationId?: string }
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyPayment(
    @Body()
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    try {
      this.logger.log(`Verifying payment for order: ${body.razorpay_order_id}`);

      const result = await this.paymentsService.verifyPayment(
        body.razorpay_order_id,
        body.razorpay_payment_id,
        body.razorpay_signature,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Payment verification failed: ${errorMessage}`);
      return {
        success: false,
        message: errorMessage || 'Payment verification failed',
      };
    }
  }

  /**
   * Get Razorpay Key ID for frontend
   * GET /payments/config
   */
  @Post('config')
  @HttpCode(HttpStatus.OK)
  getConfig() {
    return {
      success: true,
      data: {
        keyId: this.paymentsService.getRazorpayKeyId(),
      },
    };
  }

  /**
   * Get test mode status
   * GET /payments/test-mode-status
   */
  @Post('test-mode-status')
  @HttpCode(HttpStatus.OK)
  getTestModeStatus() {
    return {
      success: true,
      testMode: this.paymentsService.isTestMode(),
      demoMode: false, // Set to true if you want to show Razorpay UI in test mode
    };
  }

  /**
   * Download Invoice PDF
   * GET /payments/invoice/:registrationId
   * 
   * @param registrationId - Child registration ID
   * @param res - Express response object
   */
  @Get('invoice/:registrationId')
  async downloadInvoice(
    @Param('registrationId') registrationId: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(`Downloading invoice for registration: ${registrationId}`);

      // Get registration data
      const registration = await this.paymentsService.getRegistrationForInvoice(registrationId);

      if (!registration) {
        throw new NotFoundException(`Registration not found: ${registrationId}`);
      }

      if (registration.paymentStatus !== 'COMPLETED') {
        throw new NotFoundException(`Payment not completed for registration: ${registrationId}`);
      }

      // Generate invoice
      const invoiceNumber = `INV-${registration.registrationId}`;
      const invoiceDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const invoicePDF = await this.invoiceService.generateInvoice({
        invoiceNumber,
        date: invoiceDate,
        parentName: registration.motherName,
        childName: registration.childName,
        registrationId: registration.registrationId,
        email: registration.email,
        phone: registration.phone,
        amount: registration.subscriptionAmount,
        currency: 'INR',
        razorpayOrderId: registration.razorpayOrderId || '',
        razorpayPaymentId: registration.razorpayPaymentId,
        subscriptionPlan: registration.subscriptionPlan,
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="WombTo18-Invoice-${registrationId}.pdf"`,
      );
      res.setHeader('Content-Length', invoicePDF.length);

      // Send PDF
      res.send(invoicePDF);

      this.logger.log(`✅ Invoice downloaded for registration: ${registrationId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to download invoice: ${errorMessage}`);
      
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: errorMessage,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Failed to generate invoice',
        });
      }
    }
  }
}
