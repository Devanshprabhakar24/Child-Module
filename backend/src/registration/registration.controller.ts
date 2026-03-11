import {
  Body,
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
} from '@nestjs/common';
import { Request } from 'express';
import { RegistrationService } from './registration.service';
import { RegisterChildDto, RazorpayWebhookEvent } from '@wombto18/shared';

@Controller('registration')
export class RegistrationController {
  private readonly logger = new Logger(RegistrationController.name);

  constructor(private readonly registrationService: RegistrationService) {}

  // ─── Child Registration ────────────────────────────────────────────────

  @Post()
  async register(@Body() dto: RegisterChildDto) {
    const { registration, razorpayOrderId } =
      await this.registrationService.registerChild(dto);

    return {
      success: true,
      data: {
        registrationId: registration.registrationId,
        childName: registration.childName,
        childGender: registration.childGender,
        ageGroup: registration.ageGroup,
        ageInYears: registration.ageInYears,
        registrationType: registration.registrationType,
        channelPartnerId: registration.channelPartnerId,
        subscriptionAmount: registration.subscriptionAmount,
        paymentStatus: registration.paymentStatus,
        greenCohort: registration.greenCohort,
        razorpayOrderId,
      },
    };
  }

  // ─── Lookup ────────────────────────────────────────────────────────────

  @Get(':registrationId')
  async findByRegistrationId(@Param('registrationId') registrationId: string) {
    const registration =
      await this.registrationService.findByRegistrationId(registrationId);

    if (!registration) {
      return { success: false, message: 'Registration not found' };
    }

    return { success: true, data: registration };
  }

  @Get('mother/:motherRegistrationId')
  async findByMotherRegistrationId(
    @Param('motherRegistrationId') motherRegistrationId: string,
  ) {
    const registrations =
      await this.registrationService.findByMotherRegistrationId(motherRegistrationId);

    return { success: true, data: registrations };
  }

  // ─── Family Dashboard ────────────────────────────────────────────────

  @Get('family/:parentUserId')
  async findByParentUserId(@Param('parentUserId') parentUserId: string) {
    const children = await this.registrationService.findByParentUserId(parentUserId);
    return { success: true, data: children, count: children.length };
  }

  @Post(':registrationId/link-parent/:parentUserId')
  @HttpCode(HttpStatus.OK)
  async linkToParent(
    @Param('registrationId') registrationId: string,
    @Param('parentUserId') parentUserId: string,
  ) {
    await this.registrationService.linkToParentUser(registrationId, parentUserId);
    return { success: true, message: 'Child linked to parent account' };
  }

  // ─── Channel Partner View (Redacted) ──────────────────────────────────

  @Get('partner/:channelPartnerId')
  async findByChannelPartner(@Param('channelPartnerId') channelPartnerId: string) {
    const registrations = await this.registrationService.findByChannelPartner(channelPartnerId);
    return { success: true, data: registrations, count: registrations.length };
  }

  // ─── RazorPay Webhook ──────────────────────────────────────────────────

  /**
   * POST /registration/verify-otp
   * Verifies OTP for email authentication.
   * In test mode, accepts the configured test code (default: 123456).
   */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    const result = await this.registrationService.verifyOtp(body.email, body.otp);
    return {
      success: result.verified,
      testMode: this.registrationService.isOtpTestMode(),
    };
  }

  // ─── Test Mode Status ─────────────────────────────────────────────────

  @Get('config/test-mode')
  getTestModeStatus() {
    return {
      paymentTestMode: this.registrationService.isPaymentTestMode(),
      otpTestMode: this.registrationService.isOtpTestMode(),
    };
  }

  /**
   * POST /registration/webhook/razorpay
   *
   * RazorPay sends webhook events here. We verify the signature using the
   * raw request body + the X-Razorpay-Signature header, then process
   * payment.captured or payment.failed events.
   */
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

    const isValid = this.registrationService.verifyWebhookSignature(
      rawBody,
      signature,
    );

    if (!isValid) {
      this.logger.warn('Invalid RazorPay webhook signature');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const event: RazorpayWebhookEvent = JSON.parse(rawBody.toString('utf-8')) as RazorpayWebhookEvent;

    switch (event.event) {
      case 'payment.captured':
        await this.registrationService.handlePaymentCaptured(event);
        break;
      case 'payment.failed':
        await this.registrationService.handlePaymentFailed(event);
        break;
      default:
        this.logger.log(`Unhandled webhook event: ${event.event}`);
    }

    return { status: 'ok' };
  }
}
