import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { CertificateService } from '../registration/certificate.service';

/**
 * Enum for notification event types.
 * Each event triggers specific messages across channels.
 */
export enum NotificationEvent {
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  WELCOME_MESSAGE = 'WELCOME_MESSAGE',
  GO_GREEN_CERTIFICATE = 'GO_GREEN_CERTIFICATE',
  DASHBOARD_LINK = 'DASHBOARD_LINK',
  VACCINATION_REMINDER_D_MINUS_2 = 'VACCINATION_REMINDER_D_MINUS_2',
  VACCINATION_REMINDER_D_DAY = 'VACCINATION_REMINDER_D_DAY',
  VACCINATION_REMINDER_D_PLUS_2 = 'VACCINATION_REMINDER_D_PLUS_2',
  PARTNER_REGISTRATION_ALERT = 'PARTNER_REGISTRATION_ALERT',
}

export interface NotificationPayload {
  event: NotificationEvent;
  recipientPhone: string;
  recipientEmail: string;
  recipientName: string;
  data: Record<string, string | number>;
}

/**
 * Central notification service for WombTo18.
 * Handles SMS, WhatsApp, Email, and IVR delivery across all modules.
 *
 * In production, integrate with:
 * - SMS: MSG91 / Twilio / AWS SNS
 * - WhatsApp: Twilio WhatsApp API / Gupshup / WATI
 * - Email: SendGrid / AWS SES / Mailgun
 * - IVR: Exotel / Knowlarity / Twilio Voice
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly testMode: boolean;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly certificateService: CertificateService,
  ) {
    this.testMode = this.configService.get<string>('NOTIFICATION_TEST_MODE') !== 'false';
    this.baseUrl = this.configService.get<string>('APP_BASE_URL') ?? 'https://wombto18.com';
  }

  // ─── High-Level Event Dispatchers ─────────────────────────────────────

  /**
   * Sends payment confirmation via SMS, WhatsApp, and Email.
   */
  async sendPaymentConfirmation(payload: {
    phone: string;
    email: string;
    parentName: string;
    childName: string;
    registrationId: string;
    amount: number;
    invoiceUrl?: string;
    invoiceBuffer?: Buffer;
  }): Promise<void> {
    const message = `Dear ${payload.parentName}, payment of ₹${payload.amount} received for ${payload.childName}'s registration (${payload.registrationId}). Thank you for choosing WombTo18!`;

    await Promise.all([
      this.sendSms(payload.phone, message),
      this.sendWhatsApp(
        payload.phone,
        message + (payload.invoiceBuffer ? ' 📄 Invoice PDF attached.' : ''),
        payload.invoiceBuffer,
      ),
      this.emailService.sendPaymentConfirmationEmail(
        payload.email,
        payload.parentName,
        payload.childName,
        payload.registrationId,
        payload.amount,
        payload.invoiceBuffer,
      ),
    ]);
  }

  /**
   * Sends welcome message with dashboard link via SMS, WhatsApp, and Email.
   */
  async sendWelcomeMessage(payload: {
    phone: string;
    email: string;
    parentName: string;
    childName: string;
    registrationId: string;
  }): Promise<void> {
    const dashboardLink = `${this.baseUrl}/dashboard?id=${payload.registrationId}`;
    const message = `Welcome to WombTo18, ${payload.parentName}! ${payload.childName} is now registered (${payload.registrationId}). Access your dashboard: ${dashboardLink}`;

    await Promise.all([
      this.sendSms(payload.phone, message),
      this.sendWhatsApp(payload.phone, message),
      this.emailService.sendWelcomeEmail(
        payload.email,
        payload.parentName,
        payload.childName,
        payload.registrationId,
      ),
    ]);
  }

  /**
   * Sends Go Green Participation Certificate via WhatsApp and Email.
   * Generates the certificate PDF with child and mother details.
   */
  async sendGoGreenCertificate(payload: {
    phone: string;
    email: string;
    parentName: string;
    childName: string;
    registrationId: string;
    state?: string;
    dateOfBirth?: string;
    treeId?: string;
  }): Promise<void> {
    const message = `🌱 Congratulations ${payload.parentName}! ${payload.childName} is now part of the WombTo18 Green Cohort. A tree has been planted in their name as part of our environmental initiative. Your Go Green Participation Certificate is attached.`;

    try {
      // Generate the certificate PDF
      const certificateBuffer = await this.certificateService.generateGoGreenCertificate({
        childName: payload.childName,
        motherName: payload.parentName,
        registrationId: payload.registrationId,
        state: payload.state || 'India',
        dateOfBirth: payload.dateOfBirth || '',
        issuedDate: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        treeId: payload.treeId,
      });

      await Promise.all([
        this.sendWhatsApp(payload.phone, message, certificateBuffer),
        this.emailService.sendGoGreenCertificateEmail(
          payload.email,
          payload.parentName,
          payload.childName,
          payload.registrationId,
          certificateBuffer,
        ),
      ]);

      this.logger.log(`Go Green certificate sent to ${payload.parentName} for ${payload.childName} (${payload.registrationId})`);
    } catch (error) {
      this.logger.error(`Failed to generate/send Go Green certificate for ${payload.registrationId}:`, error);
      
      // Fallback: send message without certificate
      await Promise.all([
        this.sendWhatsApp(payload.phone, message),
        this.sendEmail(
          payload.email,
          '🌱 WombTo18 - Go Green Participation Certificate',
          message + ' Your certificate will be available in your dashboard shortly.',
        ),
      ]);
    }
  }

  /**
   * Sends vaccination reminder via SMS, WhatsApp, Email, and optionally IVR.
   */
  async sendVaccinationReminder(payload: {
    phone: string;
    email: string;
    parentName: string;
    childName: string;
    vaccineName: string;
    dueDate: string;
    offset: number; // -2, 0, or 2
    enableIvr?: boolean;
  }): Promise<void> {
    let prefix: string;
    if (payload.offset === -2) {
      prefix = 'Upcoming';
    } else if (payload.offset === 0) {
      prefix = 'Due Today';
    } else {
      prefix = 'Overdue Reminder';
    }

    const message = `${prefix}: ${payload.childName}'s ${payload.vaccineName} vaccination is ${payload.offset === 0 ? 'due today' : payload.offset < 0 ? `due on ${payload.dueDate}` : `was due on ${payload.dueDate}`}. Please visit your doctor.`;

    await Promise.all([
      this.sendSms(payload.phone, message),
      this.sendWhatsApp(payload.phone, message),
      this.emailService.sendVaccinationReminderEmail(
        payload.email,
        payload.parentName,
        payload.childName,
        payload.vaccineName,
        payload.dueDate,
        payload.offset,
      ),
    ]);

    if (payload.enableIvr) {
      await this.sendIvrCall(payload.phone, message);
    }
  }

  /**
   * Notifies channel partner when a parent registers via their QR code.
   */
  async notifyPartnerOfRegistration(payload: {
    partnerPhone: string;
    partnerEmail: string;
    partnerName: string;
    parentName: string;
    registrationId: string;
  }): Promise<void> {
    const message = `Hi ${payload.partnerName}, ${payload.parentName} registered via your QR code (${payload.registrationId}). View your dashboard for details.`;

    await Promise.all([
      this.sendSms(payload.partnerPhone, message),
      this.sendEmail(payload.partnerEmail, 'WombTo18 - New Registration via Your QR', message),
    ]);
  }

  /**
   * Sends welcome back message for returning users via SMS, WhatsApp, and Email.
   */
  async sendWelcomeBackMessage(payload: {
    phone: string;
    email: string;
    parentName: string;
    childrenNames: string[];
    lastLoginDate?: string;
  }): Promise<void> {
    const childrenText = payload.childrenNames.length === 1 
      ? payload.childrenNames[0] 
      : payload.childrenNames.length === 2
      ? `${payload.childrenNames[0]} and ${payload.childrenNames[1]}`
      : `${payload.childrenNames.slice(0, -1).join(', ')} and ${payload.childrenNames.slice(-1)[0]}`;

    const dashboardLink = `${this.baseUrl}/dashboard`;
    const message = `Welcome back, ${payload.parentName}! We're glad to see you again. Check ${childrenText}'s latest updates on your dashboard: ${dashboardLink}`;

    await Promise.all([
      this.sendSms(payload.phone, message),
      this.sendWhatsApp(payload.phone, message),
      this.emailService.sendWelcomeBackEmail(
        payload.email,
        payload.parentName,
        payload.childrenNames,
        payload.lastLoginDate,
      ),
    ]);
  }

  /**
   * Sends enhanced registration confirmation email with detailed information
   */
  async sendRegistrationConfirmationEmail(payload: {
    email: string;
    parentName: string;
    childName: string;
    registrationId: string;
    ageGroup: string;
    state: string;
    subscriptionAmount: number;
  }): Promise<void> {
    await this.emailService.sendRegistrationConfirmationEmail(
      payload.email,
      payload.parentName,
      payload.childName,
      payload.registrationId,
      payload.ageGroup,
      payload.state,
      payload.subscriptionAmount,
    );
  }

  // ─── Channel Implementations (Placeholder → Replace with real providers) ─

  private async sendSms(phone: string, message: string): Promise<void> {
    if (this.testMode) {
      this.logger.log(`[TEST SMS] To: ${phone} | Message: ${message.substring(0, 80)}...`);
      return;
    }

    // Use SmsService for real SMS sending
    await this.smsService.sendTransactionalSms(phone, message);
  }

  private async sendWhatsApp(phone: string, message: string, pdfBuffer?: Buffer): Promise<void> {
    if (this.testMode) {
      this.logger.log(`[TEST WhatsApp] To: ${phone} | Message: ${message.substring(0, 80)}...`);
      if (pdfBuffer) {
        this.logger.log(`[TEST WhatsApp] 📎 Invoice PDF attached (${pdfBuffer.length} bytes)`);
      }
      return;
    }

    // TODO: Integrate with Twilio WhatsApp API / Gupshup / WATI
    // For production: upload PDF to cloud storage (S3/GCS) and send media URL via WhatsApp API
    this.logger.log(`[WhatsApp] Sent to ${phone}`);
  }

  private async sendEmail(
    email: string,
    subject: string,
    body: string,
    attachmentUrl?: string,
    pdfBuffer?: Buffer,
  ): Promise<void> {
    if (this.testMode) {
      this.logger.log(`[TEST Email] To: ${email} | Subject: ${subject}`);
      if (pdfBuffer) {
        this.logger.log(`[TEST Email] 📎 PDF attached (${pdfBuffer.length} bytes)`);
      }
      return;
    }

    // Use EmailService for real email sending
    // For now, just log - EmailService methods are called directly from high-level dispatchers
    this.logger.log(`[Email] Sent to ${email} | Subject: ${subject}`);
  }

  /**
   * IVR (Interactive Voice Response) call for vaccination reminders.
   *
   * Production integration: Exotel / Knowlarity / Twilio Voice
   * - Pre-record voice messages in regional Indian languages
   * - Register under TRAI DLT for outbound calling compliance
   * - Use transactional category to avoid DND blocking
   * - Support DTMF: Press 1 to confirm, Press 2 to reschedule
   *
   * Example Exotel API:
   * POST https://api.exotel.com/v1/Accounts/{sid}/Calls/connect
   * { "From": phone, "CallerId": virtualNumber, "Url": ivrScriptUrl }
   */
  private async sendIvrCall(phone: string, message: string): Promise<void> {
    if (this.testMode) {
      this.logger.log(`[TEST IVR] Call to: ${phone} | Message: ${message.substring(0, 80)}...`);
      return;
    }

    // TODO: Integrate with Exotel / Knowlarity / Twilio Voice
    // - Place outbound call to parent
    // - Play pre-recorded vaccination reminder in regional language
    // - Capture DTMF input (1=confirm, 2=reschedule)
    // - Log call result (answered/busy/unreachable)
    // - Retry logic: if missed → retry at evening hours
    this.logger.log(`[IVR] Call placed to ${phone}`);
  }
}
