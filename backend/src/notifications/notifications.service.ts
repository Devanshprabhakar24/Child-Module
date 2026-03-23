import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Msg91WhatsAppService } from './msg91-whatsapp.service';
import { ResendEmailService } from './resend-email.service';
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
 * Currently handles WhatsApp delivery only.
 * SMS and Email can be added later when needed.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly testMode: boolean;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly whatsappService: Msg91WhatsAppService,
    private readonly resendEmailService: ResendEmailService,
    private readonly certificateService: CertificateService,
  ) {
    this.testMode = this.configService.get<string>('NOTIFICATION_TEST_MODE') !== 'false';
    this.baseUrl = this.configService.get<string>('APP_BASE_URL') ?? 'https://wombto18.com';
    this.logger.log('✅ NotificationsService initialized (WhatsApp + Email)');
  }

  // ─── High-Level Event Dispatchers ─────────────────────────────────────

  /**
   * Sends payment confirmation via WhatsApp and Email with invoice PDF
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
    subscriptionPlan?: 'ANNUAL' | 'FIVE_YEAR';
    vaccinationCount?: number;
  }): Promise<void> {
    // Send WhatsApp
    await this.whatsappService.sendPaymentConfirmationWhatsApp(
      payload.phone,
      payload.parentName,
      payload.childName,
      payload.registrationId,
      payload.amount,
    );
    
    // Send Email with invoice PDF attachment
    if (this.resendEmailService.isEnabled()) {
      await this.resendEmailService.sendPaymentConfirmation({
        email: payload.email,
        parentName: payload.parentName,
        childName: payload.childName,
        amount: payload.amount,
        orderId: payload.registrationId,
        paymentId: payload.registrationId,
        registrationId: payload.registrationId,
        subscriptionPlan: payload.subscriptionPlan,
        vaccinationCount: payload.vaccinationCount,
        invoicePdfBuffer: payload.invoiceBuffer,
      });
      this.logger.log(`✅ Payment confirmation sent via WhatsApp + Email (with invoice PDF) to ${payload.phone} / ${payload.email}`);
    } else {
      this.logger.log(`✅ Payment confirmation sent via WhatsApp to ${payload.phone}`);
    }
  }

  /**
   * Sends welcome message with dashboard link via WhatsApp and Email
   */
  async sendWelcomeMessage(payload: {
    phone: string;
    email: string;
    parentName: string;
    childName: string;
    registrationId: string;
    ageGroup?: string;
    state?: string;
    subscriptionAmount?: number;
    subscriptionPlan?: 'ANNUAL' | 'FIVE_YEAR';
  }): Promise<void> {
    // Send WhatsApp
    await this.whatsappService.sendWelcomeWhatsApp(
      payload.phone,
      payload.parentName,
      payload.childName,
      payload.registrationId,
    );
    
    // Send Email with full details
    if (this.resendEmailService.isEnabled()) {
      await this.resendEmailService.sendWelcome(
        payload.email,
        payload.parentName,
        payload.childName,
        payload.registrationId,
        payload.ageGroup,
        payload.state,
        payload.subscriptionAmount,
        payload.subscriptionPlan,
      );
      this.logger.log(`✅ Welcome message sent via WhatsApp + Email to ${payload.phone} / ${payload.email}`);
    } else {
      this.logger.log(`✅ Welcome message sent via WhatsApp to ${payload.phone}`);
    }
  }

  /**
   * Sends Go Green Participation Certificate via WhatsApp and Email
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
    try {
      // Generate the certificate PDF and upload to Cloudinary
      const { buffer: certificateBuffer, cloudinaryUrl } = await this.certificateService.generateAndUploadCertificate({
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

      if (cloudinaryUrl) {
        this.logger.log(`✅ Go Green certificate uploaded to Cloudinary: ${cloudinaryUrl}`);
      }

      // Send via WhatsApp
      await this.whatsappService.sendGoGreenCertificateWhatsApp(
        payload.phone,
        payload.parentName,
        payload.childName,
        payload.registrationId,
      );

      // Send via Email with PDF attachment
      if (this.resendEmailService.isEnabled()) {
        await this.resendEmailService.sendGoGreenCertificate({
          email: payload.email,
          parentName: payload.parentName,
          childName: payload.childName,
          registrationId: payload.registrationId,
          treeId: payload.treeId,
          certificatePdfBuffer: certificateBuffer,
        });
        this.logger.log(`✅ Go Green certificate sent via WhatsApp + Email to ${payload.phone} / ${payload.email}`);
      } else {
        this.logger.log(`✅ Go Green certificate sent via WhatsApp to ${payload.phone}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to generate/send Go Green certificate for ${payload.registrationId}:`, error);
    }
  }

  /**
   * Sends vaccination reminder via WhatsApp
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
    await this.whatsappService.sendVaccinationReminderWhatsApp(
      payload.phone,
      payload.childName,
      payload.vaccineName,
      payload.dueDate,
      payload.offset,
    );

    this.logger.log(`✅ Vaccination reminder sent via WhatsApp to ${payload.phone} for ${payload.vaccineName}`);
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
    await this.sendWhatsApp(payload.partnerPhone, message);
  }

  /**
   * Sends welcome back message for returning users via WhatsApp
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

    await this.sendWhatsApp(payload.phone, message);
  }

  /**
   * Sends enhanced registration confirmation via Email
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
    if (this.resendEmailService.isEnabled()) {
      await this.resendEmailService.sendRegistrationConfirmation({
        email: payload.email,
        parentName: payload.parentName,
        childName: payload.childName,
        registrationId: payload.registrationId,
        ageGroup: payload.ageGroup,
        state: payload.state,
      });
      this.logger.log(`✅ Registration confirmation email sent to ${payload.email}`);
    } else {
      this.logger.warn(`⚠️  Resend Email not configured, skipping registration confirmation email`);
    }
  }

  /**
   * Sends complete vaccination schedule via Email with PDF attachment
   */
  async sendVaccinationScheduleEmail(payload: {
    email: string;
    parentName: string;
    childName: string;
    dateOfBirth: string;
    registrationId: string;
    vaccineSchedule: Array<{
      name: string;
      ageGroup: string;
      dueDate: string;
      status: 'completed' | 'due' | 'upcoming';
    }>;
    vaccinePdfBuffer?: Buffer;
  }): Promise<void> {
    if (this.resendEmailService.isEnabled()) {
      await this.resendEmailService.sendVaccinationSchedule(payload);
      this.logger.log(`✅ Vaccination schedule email sent to ${payload.email} (${payload.vaccineSchedule.length} vaccines)${payload.vaccinePdfBuffer ? ' with PDF attachment' : ''}`);
    } else {
      this.logger.warn(`⚠️  Resend Email not configured, skipping vaccination schedule email`);
    }
  }

  // ─── Channel Implementations ─────────────────────────────────────────

  private async sendWhatsApp(phone: string, message: string, pdfBuffer?: Buffer): Promise<void> {
    if (this.testMode) {
      this.logger.log(`[TEST WhatsApp] To: ${phone} | Message: ${message.substring(0, 80)}...`);
      if (pdfBuffer) {
        this.logger.log(`[TEST WhatsApp] 📎 PDF attached (${pdfBuffer.length} bytes)`);
      }
      return;
    }

    this.logger.log(`[WhatsApp] Sending to ${phone} via MSG91`);
  }
}
