import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendEmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly resend: Resend | null = null;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromName = this.configService.get<string>('APP_NAME') || 'WombTo18';
    // Use test domain if RESEND_FROM_EMAIL is not set or is the default unverified domain
    const configuredEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'noreply@wombto18.com';
    this.fromEmail = configuredEmail === 'noreply@wombto18.com' ? 'onboarding@resend.dev' : configuredEmail;

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.enabled = true;
      this.logger.log(`✅ Resend Email service initialized (from: ${this.fromEmail})`);
    } else {
      this.enabled = false;
      this.logger.warn('⚠️  Resend Email not configured. Set RESEND_API_KEY in .env');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Send OTP email
   */
  async sendOTP(email: string, otp: string): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      this.logger.warn('Resend Email not configured');
      return false;
    }

    try {
      await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: email,
        subject: `Your ${this.fromName} OTP Code`,
        html: this.getOTPEmailTemplate(otp),
      });

      this.logger.log(`OTP email sent to ${email}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send OTP email to ${email}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Send welcome email with full registration details
   */
  async sendWelcome(
    email: string, 
    name: string, 
    childName?: string,
    registrationId?: string,
    ageGroup?: string,
    state?: string,
    subscriptionAmount?: number,
    subscriptionPlan?: string
  ): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      this.logger.warn('Resend Email not configured');
      return false;
    }

    try {
      await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: email,
        subject: `Registration Successful - Welcome to ${this.fromName}! 🌱`,
        html: this.getWelcomeEmailTemplate(name, childName, registrationId, ageGroup, state, subscriptionAmount, subscriptionPlan),
      });

      this.logger.log(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send welcome email to ${email}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Send registration confirmation email
   */
  async sendRegistrationConfirmation(payload: {
    email: string;
    parentName: string;
    childName: string;
    registrationId: string;
    ageGroup: string;
    state: string;
  }): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      this.logger.warn('Resend Email not configured');
      return false;
    }

    try {
      await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: payload.email,
        subject: `Registration Successful - ${payload.childName}`,
        html: this.getRegistrationConfirmationTemplate(payload),
      });

      this.logger.log(`Registration confirmation email sent to ${payload.email}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send registration confirmation email: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Send vaccination reminder email
   */
  async sendVaccinationReminder(payload: {
    email: string;
    parentName: string;
    childName: string;
    vaccineName: string;
    dueDate: string;
  }): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      this.logger.warn('Resend Email not configured');
      return false;
    }

    try {
      await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: payload.email,
        subject: `Vaccination Reminder: ${payload.vaccineName} for ${payload.childName}`,
        html: this.getVaccinationReminderTemplate(payload),
      });

      this.logger.log(`Vaccination reminder email sent to ${payload.email}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send vaccination reminder email: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Send payment confirmation email with invoice PDF attachment
   */
  async sendPaymentConfirmation(payload: {
    email: string;
    parentName: string;
    childName: string;
    amount: number;
    orderId: string;
    paymentId: string;
    registrationId?: string;
    subscriptionPlan?: string;
    vaccinationCount?: number;
    invoicePdfBuffer?: Buffer;
  }): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      this.logger.warn('Resend Email not configured');
      return false;
    }

    try {
      const emailData: any = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: payload.email,
        subject: `${this.fromName} - Payment Confirmation`,
        html: this.getPaymentConfirmationTemplate(payload),
      };

      // Add invoice PDF attachment if provided
      if (payload.invoicePdfBuffer) {
        emailData.attachments = [
          {
            filename: `${this.fromName}-Invoice-${payload.registrationId || payload.orderId}.pdf`,
            content: payload.invoicePdfBuffer,
          },
        ];
      }

      await this.resend.emails.send(emailData);

      this.logger.log(`Payment confirmation email sent to ${payload.email}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send payment confirmation email: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Send complete vaccination schedule email with optional PDF attachment
   */
  async sendVaccinationSchedule(payload: {
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
  }): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      this.logger.warn('Resend Email not configured');
      return false;
    }

    try {
      const emailData: any = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: payload.email,
        subject: `${payload.childName}'s Complete Vaccination Schedule - ${this.fromName}`,
        html: this.getVaccinationScheduleTemplate(payload),
      };

      // Add vaccine schedule PDF attachment if provided
      if (payload.vaccinePdfBuffer) {
        emailData.attachments = [
          {
            filename: `${payload.childName}-Vaccination-Schedule.pdf`,
            content: payload.vaccinePdfBuffer,
          },
        ];
      }

      await this.resend.emails.send(emailData);

      this.logger.log(`Vaccination schedule email sent to ${payload.email}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send vaccination schedule email: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Send Go Green certificate email with PDF attachment
   */
  async sendGoGreenCertificate(payload: {
    email: string;
    parentName: string;
    childName: string;
    registrationId: string;
    treeId?: string;
    certificatePdfBuffer?: Buffer;
  }): Promise<boolean> {
    if (!this.enabled || !this.resend) {
      this.logger.warn('Resend Email not configured');
      return false;
    }

    try {
      const emailData: any = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: payload.email,
        subject: `${payload.childName}'s Go Green Participation Certificate - ${this.fromName}`,
        html: this.getGoGreenCertificateTemplate(payload),
      };

      // Add PDF attachment if provided
      if (payload.certificatePdfBuffer) {
        emailData.attachments = [
          {
            filename: `${payload.childName}-GoGreen-Certificate.pdf`,
            content: payload.certificatePdfBuffer,
          },
        ];
      }

      await this.resend.emails.send(emailData);

      this.logger.log(`Go Green certificate email sent to ${payload.email}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send Go Green certificate email: ${errorMessage}`);
      return false;
    }
  }

  // ─── Email Templates ──────────────────────────────────────────────────

  private getOTPEmailTemplate(otp: string): string {
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
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${this.fromName}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0;">Your OTP Code</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                      Use this code to complete your login:
                    </p>
                    <div style="background-color: #f8f8f8; border: 2px dashed #4CAF50; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 30px 0;">
                      <span style="font-size: 36px; font-weight: bold; color: #4CAF50; letter-spacing: 8px;">${otp}</span>
                    </div>
                    <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">
                      This code is valid for <strong>10 minutes</strong>.<br>
                      If you didn't request this code, please ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} ${this.fromName}. All rights reserved.
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

  private getWelcomeEmailTemplate(
    name: string, 
    childName?: string,
    registrationId?: string,
    ageGroup?: string,
    state?: string,
    subscriptionAmount?: number,
    subscriptionPlan?: string
  ): string {
    const planName = subscriptionPlan === 'FIVE_YEAR' ? '5-Year Plan' : 'Annual Plan';
    
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
                    <h2 style="color: #333333; margin: 0 0 20px 0;">🎉 Congratulations, ${name}!</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                      ${childName || 'Your child'} has been successfully registered with ${this.fromName}.
                    </p>
                    
                    ${registrationId ? `
                    <table width="100%" cellpadding="10" style="background-color: #f0f9ff; border-radius: 8px; margin: 0 0 30px 0; border-left: 4px solid #4CAF50;">
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 5px 15px;">
                          🆔 <strong>Registration ID:</strong> ${registrationId}
                        </td>
                      </tr>
                      ${childName ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 5px 15px;">
                          👶 <strong>Child Name:</strong> ${childName}
                        </td>
                      </tr>
                      ` : ''}
                      ${ageGroup ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 5px 15px;">
                          📊 <strong>Age Group:</strong> ${ageGroup}
                        </td>
                      </tr>
                      ` : ''}
                      ${state ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 5px 15px;">
                          📍 <strong>State:</strong> ${state}
                        </td>
                      </tr>
                      ` : ''}
                      ${subscriptionAmount ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 5px 15px;">
                          💳 <strong>Subscription:</strong> ₹${subscriptionAmount} (${planName})
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                    ` : ''}
                    
                    <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
                      <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                        <strong>You now have access to:</strong>
                      </p>
                      <ul style="color: #666666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>✅ Vaccination Tracker with smart reminders (SMS, WhatsApp & Email)</li>
                        <li>🌱 Go Green Program – Earn credits & contribute to tree plantation</li>
                        <li>📈 Development Milestone Tracking</li>
                        <li>📄 Digital Health Records & Reports</li>
                        <li>🔔 Automated Notifications & Alerts</li>
                      </ul>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                      <p style="color: #666666; font-size: 14px; margin: 0 0 15px 0;">
                        🚀 <strong>Access your child dashboard here:</strong>
                      </p>
                      <a href="${this.configService.get<string>('APP_BASE_URL') || 'https://wombto18.com'}/dashboard" 
                         style="display: inline-block; background-color: #4CAF50; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                        Access Dashboard
                      </a>
                    </div>

                    <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0; text-align: center;">
                      Welcome to ${this.fromName} – Building a healthier and greener future for your child 🌿
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} ${this.fromName}. All rights reserved.<br>
                      📧 support@wombto18.com | 🌐 www.wombto18.com
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

  private getRegistrationConfirmationTemplate(payload: {
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
                      ${payload.childName} has been successfully registered with ${this.fromName}.
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
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0;">
                      You can now access your dashboard to track vaccinations, growth, and milestones.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} ${this.fromName}. All rights reserved.
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

  private getGoGreenCertificateTemplate(payload: {
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
                    <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">🌱 ${this.fromName} Go Green Initiative</h1>
                    <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 16px;">Committed to a Greener Future</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #4CAF50; margin: 0 0 20px 0; font-size: 24px;">Congratulations, ${payload.parentName}!</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                      We are delighted to inform you that <strong>${payload.childName}</strong> has been enrolled in the <strong>${this.fromName} Green Cohort</strong>.
                    </p>
                    
                    <div style="background-color: #e8f5e9; border-left: 4px solid #4CAF50; border-radius: 4px; padding: 20px; margin: 0 0 25px 0;">
                      <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0;">
                        🌳 A tree has been planted in <strong>${payload.childName}'s</strong> name as part of our environmental initiative to create a greener, healthier future for our children.
                      </p>
                    </div>

                    <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                      Your child's <strong>Go Green Participation Certificate</strong> is attached to this email. This certificate recognizes <strong>${payload.childName}'s</strong> contribution to environmental sustainability from an early age.
                    </p>

                    <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
                      <p style="color: #333333; font-size: 14px; font-weight: bold; margin: 0 0 15px 0;">
                        Registration Details:
                      </p>
                      <table width="100%" cellpadding="8" style="border-collapse: collapse;">
                        <tr>
                          <td style="color: #666666; font-size: 14px; padding: 8px 0;">
                            <strong>Child Name:</strong>
                          </td>
                          <td style="color: #333333; font-size: 14px; padding: 8px 0; text-align: right;">
                            ${payload.childName}
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #666666; font-size: 14px; padding: 8px 0;">
                            <strong>Registration ID:</strong>
                          </td>
                          <td style="color: #333333; font-size: 14px; padding: 8px 0; text-align: right;">
                            ${payload.registrationId}
                          </td>
                        </tr>
                        ${payload.treeId ? `
                        <tr>
                          <td style="color: #666666; font-size: 14px; padding: 8px 0;">
                            <strong>Tree ID:</strong>
                          </td>
                          <td style="color: #4CAF50; font-size: 14px; font-weight: bold; padding: 8px 0; text-align: right;">
                            ${payload.treeId}
                          </td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="color: #666666; font-size: 14px; padding: 8px 0;">
                            <strong>Program:</strong>
                          </td>
                          <td style="color: #333333; font-size: 14px; padding: 8px 0; text-align: right;">
                            ${this.fromName} Green Cohort
                          </td>
                        </tr>
                      </table>
                    </div>

                    <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0; text-align: center;">
                      Together, we are building a sustainable future for the next generation.
                    </p>
                    <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0; text-align: center;">
                      Thank you for being part of this meaningful initiative.
                    </p>

                    <div style="text-align: center; margin: 30px 0 0 0;">
                      <p style="color: #333333; font-size: 14px; margin: 0 0 5px 0;">
                        <strong>Best regards,</strong>
                      </p>
                      <p style="color: #4CAF50; font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">
                        ${this.fromName} Team
                      </p>
                      <p style="color: #999999; font-size: 13px; margin: 0;">
                        Maternal-to-Child Health Platform
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} ${this.fromName}. All rights reserved.<br>
                      📧 support@wombto18.com | 🌐 www.wombto18.com
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

  private getVaccinationReminderTemplate(payload: {
    parentName: string;
    childName: string;
    vaccineName: string;
    dueDate: string;
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
                  <td style="background-color: #FF9800; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Vaccination Reminder 💉</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0;">Hello ${payload.parentName}!</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                      This is a reminder that ${payload.childName} has an upcoming vaccination:
                    </p>
                    <div style="background-color: #fff3e0; border-left: 4px solid #FF9800; padding: 20px; margin: 0 0 20px 0;">
                      <p style="color: #333333; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">
                        ${payload.vaccineName}
                      </p>
                      <p style="color: #666666; font-size: 14px; margin: 0;">
                        Due Date: <strong>${payload.dueDate}</strong>
                      </p>
                    </div>
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0;">
                      Please schedule an appointment with your healthcare provider.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} ${this.fromName}. All rights reserved.
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

  private getPaymentConfirmationTemplate(payload: {
    parentName: string;
    childName: string;
    amount: number;
    orderId: string;
    paymentId: string;
    registrationId?: string;
    subscriptionPlan?: string;
    vaccinationCount?: number;
  }): string {
    const planName = payload.subscriptionPlan === 'FIVE_YEAR' ? '5-Year Plan' : 'Annual Plan (1 Year)';
    const validity = payload.subscriptionPlan === 'FIVE_YEAR' ? '5 Years' : '1 Year';
    
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
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to ${this.fromName}! 🎉</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #4CAF50; margin: 0 0 10px 0; font-size: 24px;">Payment Confirmed ✅</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                      Thank you, <strong>${payload.parentName}</strong>!
                    </p>
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                      Your payment has been successfully received and <strong>${payload.childName}'s</strong> registration is now complete!
                    </p>
                    
                    <!-- Payment Amount Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); border-radius: 12px; padding: 30px; text-align: center;">
                          <div style="color: #ffffff; font-size: 48px; font-weight: bold; margin: 0 0 10px 0;">
                            ₹${payload.amount}
                          </div>
                          <div style="color: #ffffff; font-size: 18px; margin: 0 0 5px 0;">
                            ${planName}
                          </div>
                          <div style="color: rgba(255,255,255,0.9); font-size: 14px;">
                            Valid for ${validity}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Registration Details -->
                    <table width="100%" cellpadding="12" style="background-color: #f8f8f8; border-radius: 8px; margin: 0 0 30px 0;">
                      ${payload.registrationId ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">
                          <strong>Registration ID:</strong>
                        </td>
                        <td style="color: #333333; font-size: 14px; border-bottom: 1px solid #e0e0e0; text-align: right;">
                          ${payload.registrationId}
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">
                          <strong>Child Name:</strong>
                        </td>
                        <td style="color: #333333; font-size: 14px; border-bottom: 1px solid #e0e0e0; text-align: right;">
                          ${payload.childName}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;">
                          <strong>Plan:</strong>
                        </td>
                        <td style="color: #333333; font-size: 14px; text-align: right;">
                          ${planName}
                        </td>
                      </tr>
                    </table>

                    <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
                      Your invoice is attached to this email.
                    </p>

                    <!-- Services Activated -->
                    <div style="background-color: #e8f5e9; border-left: 4px solid #4CAF50; border-radius: 4px; padding: 20px; margin: 0 0 30px 0;">
                      <p style="color: #333333; font-size: 16px; font-weight: bold; margin: 0 0 15px 0;">
                        All services have been activated:
                      </p>
                      <ul style="color: #666666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>✓ Vaccination tracker${payload.vaccinationCount ? ` with ${payload.vaccinationCount} milestones` : ''}</li>
                        <li>✓ Automated reminders (SMS, WhatsApp & Email)</li>
                        <li>✓ Go Green tree planting initiative</li>
                        <li>✓ Development milestone tracking</li>
                        <li>✓ Dashboard access with invoice PDF</li>
                      </ul>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${this.configService.get<string>('APP_BASE_URL') || 'https://wombto18.com'}/dashboard" 
                         style="display: inline-block; background-color: #4CAF50; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                        Access Dashboard
                      </a>
                    </div>

                    <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 30px 0 0 0; text-align: center;">
                      Order ID: ${payload.orderId}<br>
                      Payment ID: ${payload.paymentId}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} ${this.fromName}. All rights reserved.<br>
                      📧 support@wombto18.com | 🌐 www.wombto18.com
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

  private getVaccinationScheduleTemplate(payload: {
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
    // Render all vaccines in a single table
    const renderAllVaccines = () => {
      return payload.vaccineSchedule.map(v => {
        const statusIcon = v.status === 'completed' ? '✅ Done' : '📅 Upcoming';
        const statusColor = v.status === 'completed' ? '#4CAF50' : '#2196F3';
        
        return `
        <tr>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; color: #333333; font-size: 14px;">
            <strong>${v.name}</strong>
          </td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; color: #666666; font-size: 13px;">
            ${v.ageGroup}
          </td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; color: #666666; font-size: 13px;">
            ${v.dueDate}
          </td>
          <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; color: ${statusColor}; font-size: 13px; font-weight: bold;">
            ${statusIcon}
          </td>
        </tr>
      `;
      }).join('');
    };

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
              <table width="750" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">💉 Complete Vaccination Schedule</h1>
                    <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 16px;">${this.fromName} Health Platform</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 20px;">Hello ${payload.parentName},</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                      Here is the complete vaccination schedule for <strong>${payload.childName}</strong>.
                    </p>
                    
                    <!-- Child Details Box -->
                    <table width="100%" cellpadding="12" style="background-color: #f0f7ff; border-radius: 8px; margin: 0 0 30px 0; border-left: 4px solid #2196F3;">
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 15px;">
                          👶 <strong>Child Name:</strong>
                        </td>
                        <td style="color: #333333; font-size: 14px; padding: 8px 15px; text-align: right;">
                          ${payload.childName}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 15px;">
                          🎂 <strong>Date of Birth:</strong>
                        </td>
                        <td style="color: #333333; font-size: 14px; padding: 8px 15px; text-align: right;">
                          ${payload.dateOfBirth}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 15px;">
                          🆔 <strong>Registration ID:</strong>
                        </td>
                        <td style="color: #2196F3; font-size: 14px; font-weight: bold; padding: 8px 15px; text-align: right;">
                          ${payload.registrationId}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 15px;">
                          💉 <strong>Total Vaccines:</strong>
                        </td>
                        <td style="color: #333333; font-size: 14px; font-weight: bold; padding: 8px 15px; text-align: right;">
                          ${payload.vaccineSchedule.length}
                        </td>
                      </tr>
                    </table>

                    <!-- Vaccination Schedule Table -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; margin: 0 0 30px 0;">
                      <thead>
                        <tr style="background-color: #f5f5f5;">
                          <th style="padding: 15px; text-align: left; color: #333333; font-size: 14px; font-weight: bold; border-bottom: 2px solid #2196F3;">
                            Vaccine Name
                          </th>
                          <th style="padding: 15px; text-align: left; color: #333333; font-size: 14px; font-weight: bold; border-bottom: 2px solid #2196F3;">
                            Age Group
                          </th>
                          <th style="padding: 15px; text-align: left; color: #333333; font-size: 14px; font-weight: bold; border-bottom: 2px solid #2196F3;">
                            Due Date
                          </th>
                          <th style="padding: 15px; text-align: left; color: #333333; font-size: 14px; font-weight: bold; border-bottom: 2px solid #2196F3;">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        ${renderAllVaccines()}
                      </tbody>
                    </table>

                    <div style="background-color: #fff3e0; border-left: 4px solid #FF9800; border-radius: 4px; padding: 20px; margin: 0 0 20px 0;">
                      <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0;">
                        <strong>📌 Important Note:</strong> You will receive automatic reminders 2 days before each vaccination is due. Please consult with your healthcare provider for any questions about the vaccination schedule.
                      </p>
                    </div>

                    <div style="text-align: center; margin: 20px 0 0 0;">
                      <a href="${this.configService.get<string>('APP_BASE_URL') || 'https://wombto18.com'}/dashboard" 
                         style="display: inline-block; background-color: #2196F3; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                        View Dashboard
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} ${this.fromName}. All rights reserved.<br>
                      📧 support@wombto18.com | 🌐 www.wombto18.com
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
