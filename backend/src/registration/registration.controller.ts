import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  RawBodyRequest,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RegistrationService } from './registration.service';
import { CertificateService } from './certificate.service';
import { GoGreenService } from '../go-green/go-green.service';
import { RegisterChildDto, RazorpayWebhookEvent, RazorpayWebhookPayloadDto, UpdateChildDto } from '@wombto18/shared';
import { AuthGuard, AuthenticatedRequest } from '../auth/guards/auth.guard';

@Controller('registration')
export class RegistrationController {
  private readonly logger = new Logger(RegistrationController.name);

  constructor(
    private readonly registrationService: RegistrationService,
    private readonly certificateService: CertificateService,
    private readonly goGreenService: GoGreenService,
  ) {}

  // ─── Child Registration ────────────────────────────────────────────────

  @Post()
  async register(@Body() dto: RegisterChildDto) {
    const { registration, razorpayOrderId, testMode } =
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
        testMode,
      },
    };
  }

  // ─── Payment Verification ───────────────────────────────────────────

  @Post('verify-payment')
  @HttpCode(HttpStatus.OK)
  async verifyPayment(@Body() dto: RazorpayWebhookPayloadDto) {
    const registration = await this.registrationService.verifyRazorpayPayment({
      razorpay_order_id: dto.razorpay_order_id,
      razorpay_payment_id: dto.razorpay_payment_id,
      razorpay_signature: dto.razorpay_signature,
    });
    return {
      success: true,
      data: {
        registrationId: registration.registrationId,
        paymentStatus: registration.paymentStatus,
      },
    };
  }

  @Post('confirm-test-payment/:registrationId')
  @HttpCode(HttpStatus.OK)
  async confirmTestPayment(@Param('registrationId') registrationId: string) {
    const registration = await this.registrationService.confirmTestPayment(registrationId);
    return {
      success: true,
      data: {
        registrationId: registration.registrationId,
        paymentStatus: registration.paymentStatus,
        childName: registration.childName,
        ageGroup: registration.ageGroup,
        subscriptionAmount: registration.subscriptionAmount,
        greenCohort: registration.greenCohort,
      },
    };
  }

  // ─── Go Green Certificate Download ──────────────────────────────────

  @Get(':registrationId/certificate')
  async downloadCertificate(
    @Param('registrationId') registrationId: string,
    @Res() res: Response,
  ) {
    const registration = await this.registrationService.findByRegistrationId(registrationId);
    if (!registration) throw new NotFoundException('Registration not found');

    // Get tree information
    const tree = await this.goGreenService.getTreeByRegistrationId(registrationId);

    const pdfBuffer = await this.certificateService.generateGoGreenCertificate({
      childName: registration.childName,
      motherName: registration.motherName,
      registrationId: registration.registrationId,
      dateOfBirth: registration.dateOfBirth.toISOString().split('T')[0],
      state: registration.state,
      issuedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      treeId: tree?.treeId,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="WombTo18_GoGreen_${registrationId}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    });
    res.end(pdfBuffer);
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

  /**
   * Update a child's basic profile (name/photo).
   * Allowed for the owning parent (same email) or when parentUserId matches auth sub.
   */
  @Patch(':registrationId')
  @UseGuards(AuthGuard)
  async updateChild(
    @Req() req: AuthenticatedRequest,
    @Param('registrationId') registrationId: string,
    @Body() dto: UpdateChildDto,
  ) {
    const existing = await this.registrationService.findByRegistrationId(registrationId);
    if (!existing) return { success: false, message: 'Registration not found' };

    const isOwnerByEmail = (existing as any).email?.toLowerCase?.() === req.user.email.toLowerCase();
    const isOwnerByParentUserId = (existing as any).parentUserId && (existing as any).parentUserId === req.user.sub;
    if (!isOwnerByEmail && !isOwnerByParentUserId) {
      throw new ForbiddenException('Not allowed to update this child');
    }

    const updated = await this.registrationService.updateChild(registrationId, dto);
    return { success: true, data: updated };
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

  // ─── Service Activation ───────────────────────────────────────────────

  /**
   * POST /registration/:registrationId/activate-services
   * Manually activate all services for an existing registration
   * Useful for registrations created before full service activation was implemented
   */
  @Post(':registrationId/activate-services')
  @HttpCode(HttpStatus.OK)
  async activateServices(@Param('registrationId') registrationId: string) {
    const result = await this.registrationService.activateServicesForExistingRegistration(registrationId);
    return result;
  }

  /**
   * POST /registration/test-send-certificate
   * Test endpoint to manually send Go Green certificate email
   * Useful for debugging email delivery issues
   */
  @Post('test-send-certificate')
  @HttpCode(HttpStatus.OK)
  async testSendCertificate(@Body() body: {
    registrationId: string;
    email: string;
    phone: string;
    parentName: string;
    childName: string;
    state?: string;
    dateOfBirth?: string;
    treeId?: string;
  }) {
    try {
      const { NotificationsService } = await import('../notifications/notifications.service');
      const notificationsService = this.registrationService['notificationsService'] as any;
      
      await notificationsService.sendGoGreenCertificate({
        phone: body.phone,
        email: body.email,
        parentName: body.parentName,
        childName: body.childName,
        registrationId: body.registrationId,
        state: body.state,
        dateOfBirth: body.dateOfBirth,
        treeId: body.treeId,
      });

      return {
        success: true,
        message: `Go Green certificate sent to ${body.email}`,
        data: {
          registrationId: body.registrationId,
          email: body.email,
          childName: body.childName,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to send test certificate: ${error instanceof Error ? error.message : error}`);
      return {
        success: false,
        message: `Failed to send certificate: ${error instanceof Error ? error.message : error}`,
      };
    }
  }

  /**
   * POST /registration/activate-all-incomplete
   * Find and activate services for all registrations that are missing services
   * Useful for bulk activation after system updates
   */
  @Post('activate-all-incomplete')
  @HttpCode(HttpStatus.OK)
  async activateAllIncomplete() {
    const result = await this.registrationService.findAndActivateIncompleteRegistrations();
    return result;
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
