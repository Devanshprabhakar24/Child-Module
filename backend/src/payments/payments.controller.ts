import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { RazorpayWebhookEvent } from '@wombto18/shared';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(':registrationId')
  @UseGuards(AuthGuard)
  async getPayments(@Param('registrationId') registrationId: string) {
    const payments = await this.paymentsService.findByRegistrationId(registrationId);
    return { success: true, data: payments };
  }

  @Get('order/:orderId')
  @UseGuards(AuthGuard)
  async getPaymentByOrderId(@Param('orderId') orderId: string) {
    const payment = await this.paymentsService.findByOrderId(orderId);
    if (!payment) {
      return { success: false, message: 'Payment not found' };
    }
    return { success: true, data: payment };
  }

  @Post('webhook/razorpay')
  @HttpCode(HttpStatus.OK)
  async handleRazorpayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = req.rawBody;

    if (!rawBody || !signature) {
      throw new UnauthorizedException('Missing webhook signature or body');
    }

    const isValid = this.paymentsService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      this.logger.warn('Invalid RazorPay webhook signature');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody.toString('utf-8')) as RazorpayWebhookEvent;

    switch (event.event) {
      case 'payment.captured':
        await this.paymentsService.handlePaymentCaptured(event);
        break;
      case 'payment.failed':
        await this.paymentsService.handlePaymentFailed(event);
        break;
      default:
        this.logger.log(`Unhandled webhook event: ${event.event}`);
    }

    return { status: 'ok' };
  }
}
