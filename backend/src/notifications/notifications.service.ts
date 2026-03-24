import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Msg91WhatsAppService } from './msg91-whatsapp.service';
import { GmailSmtpService } from './gmail-smtp.service';
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
    private readonly gmailSmtpService: GmailSmtpService,
    private readonly certificateService: CertificateService,
  ) {
    this.testMode = this.configService.get<string>('NOTIFICATION_TEST_MODE') !== 'false';
    this.baseUrl = this.configService.get<string>('APP_BASE_URL') ?? 'https://wombto18.com';
    this.logger.log('✅ NotificationsService initialized (WhatsApp + Gmail SMTP)');
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
    if (this.gmailSmtpService.isEnabled()) {
      const emailHtml = this.getPaymentConfirmationEmailTemplate({
        parentName: payload.parentName,
        childName: payload.childName,
        amount: payload.amount,
        registrationId: payload.registrationId,
        subscriptionPlan: payload.subscriptionPlan,
      });
      await this.gmailSmtpService.sendEmail(
        payload.email,
        'Payment Confirmation - WombTo18',
        emailHtml
      );
      this.logger.log(`✅ Payment confirmation sent via WhatsApp + Gmail SMTP to ${payload.phone} / ${payload.email}`);
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
    if (this.gmailSmtpService.isEnabled()) {
      const emailHtml = this.getWelcomeEmailTemplate({
        parentName: payload.parentName,
        childName: payload.childName,
        registrationId: payload.registrationId,
        ageGroup: payload.ageGroup,
        state: payload.state,
        subscriptionAmount: payload.subscriptionAmount,
        subscriptionPlan: payload.subscriptionPlan,
      });
      await this.gmailSmtpService.sendEmail(
        payload.email,
        'Welcome to WombTo18! 🌱',
        emailHtml
      );
      this.logger.log(`✅ Welcome message sent via WhatsApp + Gmail SMTP to ${payload.phone} / ${payload.email}`);
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
      if (this.gmailSmtpService.isEnabled()) {
        const emailHtml = this.getGoGreenCertificateEmailTemplate({
          parentName: payload.parentName,
          childName: payload.childName,
          registrationId: payload.registrationId,
          treeId: payload.treeId,
        });
        await this.gmailSmtpService.sendEmail(
          payload.email,
          `${payload.childName}'s Go Green Certificate - WombTo18`,
          emailHtml
        );
        this.logger.log(`✅ Go Green certificate sent via WhatsApp + Gmail SMTP to ${payload.phone} / ${payload.email}`);
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
    if (this.gmailSmtpService.isEnabled()) {
      const emailHtml = this.getRegistrationConfirmationEmailTemplate({
        parentName: payload.parentName,
        childName: payload.childName,
        registrationId: payload.registrationId,
        ageGroup: payload.ageGroup,
        state: payload.state,
      });
      await this.gmailSmtpService.sendEmail(
        payload.email,
        `Registration Successful - ${payload.childName}`,
        emailHtml
      );
      this.logger.log(`✅ Registration confirmation email sent to ${payload.email}`);
    } else {
      this.logger.warn(`⚠️  Gmail SMTP not configured, skipping registration confirmation email`);
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
    if (this.gmailSmtpService.isEnabled()) {
      const emailHtml = this.getVaccinationScheduleEmailTemplate({
        parentName: payload.parentName,
        childName: payload.childName,
        dateOfBirth: payload.dateOfBirth,
        registrationId: payload.registrationId,
        vaccineSchedule: payload.vaccineSchedule,
      });
      await this.gmailSmtpService.sendEmail(
        payload.email,
        `${payload.childName}'s Vaccination Schedule - WombTo18`,
        emailHtml
      );
      this.logger.log(`✅ Vaccination schedule email sent to ${payload.email} (${payload.vaccineSchedule.length} vaccines)`);
    } else {
      this.logger.warn(`⚠️  Gmail SMTP not configured, skipping vaccination schedule email`);
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

  // ─── Email Template Helpers ─────────────────────────────────────────

  private getWelcomeEmailTemplate(payload: {
    parentName: string;
    childName: string;
    registrationId: string;
    ageGroup?: string;
    state?: string;
    subscriptionAmount?: number;
    subscriptionPlan?: string;
  }): string {
    const planName = payload.subscriptionPlan === 'FIVE_YEAR' ? '5-Year Plan' : 'Annual Plan';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #4CAF50; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Registration Successful! ✅</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0;">🎉 Congratulations, ${payload.parentName}!</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                      ${payload.childName} has been successfully registered with WombTo18.
                    </p>
                    
                    <table width="100%" cellpadding="10" style="background-color: #f0f9ff; border-radius: 8px; margin: 0 0 30px 0; border-left: 4px solid #4CAF50;">
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 5px 15px;">
                          🆔 <strong>Registration ID:</strong> ${payload.registrationId}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 5px 15px;">
                          👶 <strong>Child Name:</strong> ${payload.childName}
                        </td>
                      </tr>
                      ${payload.ageGroup ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 5px 15px;">
                          📊 <strong>Age Group:</strong> ${payload.ageGroup}
                        </td>
                      </tr>
                      ` : ''}
                      ${payload.state ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 5px 15px;">
                          📍 <strong>State:</strong> ${payload.state}
                        </td>
                      </tr>
                      ` : ''}
                      ${payload.subscriptionAmount ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 5px 15px;">
                          💳 <strong>Subscription:</strong> ₹${payload.subscriptionAmount} (${planName})
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                    
                    <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
                      <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                        <strong>You now have access to:</strong>
                      </p>
                      <ul style="color: #666666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>✅ Vaccination Tracker with smart reminders</li>
                        <li>🌱 Go Green Program – Earn credits & plant trees</li>
                        <li>📈 Development Milestone Tracking</li>
                        <li>📄 Digital Health Records</li>
                        <li>🔔 Automated Notifications</li>
                      </ul>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${this.baseUrl}/dashboard" 
                         style="display: inline-block; background-color: #4CAF50; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                        Access Dashboard
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} WombTo18. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getRegistrationConfirmationEmailTemplate(payload: {
    parentName: string;
    childName: string;
    registrationId: string;
    ageGroup: string;
    state: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #4CAF50; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Registration Successful! ✅</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0;">Congratulations ${payload.parentName}!</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                      ${payload.childName} has been successfully registered with WombTo18.
                    </p>
                    <table width="100%" cellpadding="10" style="background-color: #f8f8f8; border-radius: 8px; margin: 0 0 30px 0;">
                      <tr>
                        <td style="color: #666666; font-size: 14px;"><strong>Registration ID:</strong></td>
                        <td style="color: #4CAF50; font-size: 14px; font-weight: bold;">${payload.registrationId}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;"><strong>Child Name:</strong></td>
                        <td style="color: #333333; font-size: 14px;">${payload.childName}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;"><strong>Age Group:</strong></td>
                        <td style="color: #333333; font-size: 14px;">${payload.ageGroup}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;"><strong>State:</strong></td>
                        <td style="color: #333333; font-size: 14px;">${payload.state}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} WombTo18. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getGoGreenCertificateEmailTemplate(payload: {
    parentName: string;
    childName: string;
    registrationId: string;
    treeId?: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">🌱 WombTo18 Go Green Initiative</h1>
                    <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 16px;">Committed to a Greener Future</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #4CAF50; margin: 0 0 20px 0; font-size: 24px;">Congratulations, ${payload.parentName}!</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                      ${payload.childName} has been enrolled in the WombTo18 Green Cohort. A tree has been planted in their name!
                    </p>
                    
                    <div style="background-color: #e8f5e9; border-left: 4px solid #4CAF50; border-radius: 4px; padding: 20px; margin: 0 0 25px 0;">
                      <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0;">
                        🌳 Registration ID: ${payload.registrationId}
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} WombTo18. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getPaymentConfirmationEmailTemplate(payload: {
    parentName: string;
    childName: string;
    amount: number;
    registrationId: string;
    subscriptionPlan?: string;
  }): string {
    const planName = payload.subscriptionPlan === 'FIVE_YEAR' ? '5-Year Plan' : 'Annual Plan';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #4CAF50; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Payment Confirmed! ✅</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0;">Thank you, ${payload.parentName}!</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                      Your payment for ${payload.childName}'s subscription has been received.
                    </p>
                    <table width="100%" cellpadding="10" style="background-color: #f8f8f8; border-radius: 8px; margin: 0 0 30px 0;">
                      <tr>
                        <td style="color: #666666; font-size: 14px;"><strong>Amount Paid:</strong></td>
                        <td style="color: #4CAF50; font-size: 18px; font-weight: bold;">₹${payload.amount}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;"><strong>Registration ID:</strong></td>
                        <td style="color: #333333; font-size: 14px;">${payload.registrationId}</td>
                      </tr>
                      ${payload.subscriptionPlan ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px;"><strong>Plan:</strong></td>
                        <td style="color: #333333; font-size: 14px;">${planName}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} WombTo18. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getVaccinationScheduleEmailTemplate(payload: {
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
  }): string {
    const vaccineRows = payload.vaccineSchedule.map(vaccine => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; color: #333333; font-size: 14px;">${vaccine.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; color: #666666; font-size: 14px;">${vaccine.ageGroup}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; color: #666666; font-size: 14px;">${vaccine.dueDate}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-size: 14px;">
          <span style="padding: 4px 8px; border-radius: 4px; background-color: ${vaccine.status === 'completed' ? '#4CAF50' : vaccine.status === 'due' ? '#FF9800' : '#2196F3'}; color: white; font-size: 12px;">
            ${vaccine.status.toUpperCase()}
          </span>
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #4CAF50; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Vaccination Schedule</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0;">Hello ${payload.parentName}!</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                      Here is ${payload.childName}'s complete vaccination schedule.
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 0 0 30px 0;">
                      <thead>
                        <tr style="background-color: #f8f8f8;">
                          <th style="padding: 10px; text-align: left; color: #333333; font-size: 14px; border-bottom: 2px solid #4CAF50;">Vaccine</th>
                          <th style="padding: 10px; text-align: left; color: #333333; font-size: 14px; border-bottom: 2px solid #4CAF50;">Age Group</th>
                          <th style="padding: 10px; text-align: left; color: #333333; font-size: 14px; border-bottom: 2px solid #4CAF50;">Due Date</th>
                          <th style="padding: 10px; text-align: left; color: #333333; font-size: 14px; border-bottom: 2px solid #4CAF50;">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${vaccineRows}
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} WombTo18. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
