import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? '0');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    this.fromAddress =
      this.configService.get<string>('SMTP_FROM') ??
      this.configService.get<string>('SMTP_USER') ??
      'no-reply@example.com';

    if (!host || !port || !user || !pass) {
      this.logger.warn(
        'SMTP configuration is incomplete. Emails will NOT be sent. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in .env',
      );
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendOtpEmail(to: string, code: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Cannot send OTP email to ${to}: transporter not configured`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject: 'Your WombTo18 OTP Code',
        text: `Your OTP code is ${code}. It is valid for 5 minutes.`,
        html: this.getOtpEmailTemplate(code),
      });
      this.logger.log(`OTP email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send OTP email to ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async sendWelcomeEmail(to: string, parentName: string, childName: string, registrationId: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Cannot send welcome email to ${to}: transporter not configured`);
      return;
    }

    const dashboardLink = `${this.configService.get<string>('APP_BASE_URL') || 'https://wombto18.com'}/dashboard`;

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject: `Welcome to WombTo18, ${parentName}!`,
        text: `Welcome to WombTo18! ${childName} is now registered (${registrationId}). Access your dashboard: ${dashboardLink}`,
        html: this.getWelcomeEmailTemplate(parentName, childName, registrationId, dashboardLink),
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async sendPaymentConfirmationEmail(
    to: string,
    parentName: string,
    childName: string,
    registrationId: string,
    amount: number,
    pdfBuffer?: Buffer,
    subscriptionPlan?: 'ANNUAL' | 'FIVE_YEAR',
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Cannot send payment confirmation email to ${to}: transporter not configured`);
      return;
    }

    try {
      const mailOptions: any = {
        from: this.fromAddress,
        to,
        subject: 'WombTo18 - Payment Confirmation',
        text: `Dear ${parentName}, payment of ₹${amount} received for ${childName}'s registration (${registrationId}). Thank you for choosing WombTo18!`,
        html: this.getPaymentConfirmationTemplate(parentName, childName, registrationId, amount, subscriptionPlan),
      };

      if (pdfBuffer) {
        mailOptions.attachments = [
          {
            filename: `WombTo18_Invoice_${registrationId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ];
      }

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Payment confirmation email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send payment confirmation email to ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Sends Go Green Certificate email with PDF attachment
   */
  async sendGoGreenCertificateEmail(
    to: string,
    parentName: string,
    childName: string,
    registrationId: string,
    certificateBuffer: Buffer,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.error(`❌ Cannot send Go Green certificate email to ${to}: transporter not configured`);
      return;
    }

    try {
      this.logger.log(`📧 ========================================`);
      this.logger.log(`📧 SENDING GO GREEN CERTIFICATE EMAIL`);
      this.logger.log(`📧 ========================================`);
      this.logger.log(`📧 To: ${to}`);
      this.logger.log(`📧 Parent: ${parentName}`);
      this.logger.log(`📧 Child: ${childName}`);
      this.logger.log(`📧 Registration: ${registrationId}`);
      this.logger.log(`📧 From: ${this.fromAddress}`);
      this.logger.log(`📧 Subject: 🌱 ${childName}'s Go Green Participation Certificate - WombTo18`);
      this.logger.log(`📧 Attachment size: ${certificateBuffer.length} bytes`);
      this.logger.log(`📧 ========================================`);
      
      const result = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject: `🌱 ${childName}'s Go Green Participation Certificate - WombTo18`,
        text: `Congratulations ${parentName}! ${childName} is now part of the WombTo18 Green Cohort. A tree has been planted in their name as part of our environmental initiative. Please find the Go Green Participation Certificate attached.`,
        html: this.getGoGreenCertificateEmailTemplate(parentName, childName, registrationId),
        attachments: [
          {
            filename: `${childName}_GoGreen_Certificate_${registrationId}.pdf`,
            content: certificateBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
      this.logger.log(`✅ ========================================`);
      this.logger.log(`✅ GO GREEN CERTIFICATE EMAIL SENT SUCCESSFULLY`);
      this.logger.log(`✅ To: ${to}`);
      this.logger.log(`✅ Message ID: ${result.messageId}`);
      this.logger.log(`✅ Response: ${result.response}`);
      this.logger.log(`✅ ========================================`);
    } catch (error) {
      this.logger.error(`❌ ========================================`);
      this.logger.error(`❌ FAILED TO SEND GO GREEN CERTIFICATE EMAIL`);
      this.logger.error(`❌ To: ${to}`);
      this.logger.error(
        `❌ Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      if (error instanceof Error && error.stack) {
        this.logger.error(`❌ Stack: ${error.stack}`);
      }
      this.logger.error(`❌ ========================================`);
    }
  }

  async sendVaccinationReminderEmail(
    to: string,
    parentName: string,
    childName: string,
    vaccineName: string,
    dueDate: string,
    offset: number,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Cannot send vaccination reminder email to ${to}: transporter not configured`);
      return;
    }

    let prefix: string;
    if (offset === -2) {
      prefix = 'Upcoming';
    } else if (offset === 0) {
      prefix = 'Due Today';
    } else {
      prefix = 'Overdue Reminder';
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject: `WombTo18 - Vaccination ${prefix}: ${vaccineName}`,
        text: `${prefix}: ${childName}'s ${vaccineName} vaccination is ${offset === 0 ? 'due today' : offset < 0 ? `due on ${dueDate}` : `was due on ${dueDate}`}. Please visit your doctor.`,
        html: this.getVaccinationReminderTemplate(parentName, childName, vaccineName, dueDate, prefix),
      });
      this.logger.log(`Vaccination reminder email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send vaccination reminder email to ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Sends welcome back email for returning users
   */
  async sendWelcomeBackEmail(
    to: string,
    parentName: string,
    childrenNames: string[],
    lastLoginDate?: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Cannot send welcome back email to ${to}: transporter not configured`);
      return;
    }

    const dashboardLink = `${this.configService.get<string>('APP_BASE_URL') || 'https://wombto18.com'}/dashboard`;

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject: `Welcome back to WombTo18, ${parentName}! 👋`,
        text: `Welcome back, ${parentName}! We're glad to see you again. Check your children's latest updates on your dashboard: ${dashboardLink}`,
        html: this.getWelcomeBackEmailTemplate(parentName, childrenNames, lastLoginDate, dashboardLink),
      });
      this.logger.log(`Welcome back email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome back email to ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Sends enhanced registration confirmation email
   */
  async sendRegistrationConfirmationEmail(
    to: string,
    parentName: string,
    childName: string,
    registrationId: string,
    ageGroup: string,
    state: string,
    subscriptionAmount: number,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Cannot send registration confirmation email to ${to}: transporter not configured`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject: `Registration Successful - Welcome to WombTo18! 🌱`,
        text: `Dear ${parentName}, ${childName} has been successfully registered with WombTo18 (${registrationId}). Your subscription amount is ₹${subscriptionAmount}. Please complete the payment to activate all services.`,
        html: this.getRegistrationConfirmationTemplate(parentName, childName, registrationId, ageGroup, state, subscriptionAmount),
      });
      this.logger.log(`Registration confirmation email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send registration confirmation email to ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  // ─── Email Templates ──────────────────────────────────────────────────

  private getOtpEmailTemplate(code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-box { background: white; border: 2px dashed #10b981; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>WombTo18</h1>
            <p>Your Child Health Partner</p>
          </div>
          <div class="content">
            <h2>Your OTP Code</h2>
            <p>Use this code to complete your login:</p>
            <div class="otp-box">
              <div class="otp-code">${code}</div>
            </div>
            <p><strong>Valid for 5 minutes</strong></p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2026 WombTo18. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(parentName: string, childName: string, registrationId: string, dashboardLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .info-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to WombTo18! 🌱</h1>
          </div>
          <div class="content">
            <h2>Hello ${parentName},</h2>
            <p>Thank you for registering with WombTo18! We're excited to be part of ${childName}'s health journey.</p>
            
            <div class="info-box">
              <strong>Registration ID:</strong> ${registrationId}<br>
              <strong>Child Name:</strong> ${childName}
            </div>

            <p>Your dashboard is ready with:</p>
            <ul>
              <li>📅 Vaccination tracker with automated reminders</li>
              <li>🌱 Go Green tree planting certificate</li>
              <li>📊 Milestone tracking</li>
              <li>📱 SMS & WhatsApp notifications</li>
            </ul>

            <center>
              <a href="${dashboardLink}" class="button">Access Your Dashboard</a>
            </center>

            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>© 2026 WombTo18. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPaymentConfirmationTemplate(
    parentName: string, 
    childName: string, 
    registrationId: string, 
    amount: number,
    subscriptionPlan?: 'ANNUAL' | 'FIVE_YEAR',
  ): string {
    const dashboardLink = `${this.configService.get<string>('APP_BASE_URL') || 'https://wombto18.com'}/dashboard`;
    const planName = subscriptionPlan === 'ANNUAL' ? 'Annual Plan (1 Year)' : '5-Year Plan';
    const planDuration = subscriptionPlan === 'ANNUAL' ? '1 Year' : '5 Years';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          .amount-box { background: white; border: 2px solid #10b981; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .amount { font-size: 32px; font-weight: bold; color: #10b981; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .info-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to WombTo18! 🎉</h1>
            <p>Payment Confirmed</p>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <h2>Thank you, ${parentName}!</h2>
            <p>Your payment has been successfully received and ${childName}'s registration is now complete!</p>
            
            <div class="amount-box">
              <div class="amount">₹${amount}</div>
              <p style="margin: 5px 0 0 0; color: #6b7280;">${planName}</p>
              <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 14px;">Valid for ${planDuration}</p>
            </div>

            <div class="info-box">
              <strong>Registration ID:</strong> ${registrationId}<br>
              <strong>Child Name:</strong> ${childName}<br>
              <strong>Plan:</strong> ${planName}
            </div>

            <p><strong>Your invoice is attached to this email.</strong></p>

            <p>All services have been activated:</p>
            <ul>
              <li>✓ Vaccination tracker with 27 milestones</li>
              <li>✓ Automated reminders (Email)</li>
              <li>✓ Go Green tree planting initiative</li>
              <li>✓ Development milestone tracking</li>
              <li>✓ Dashboard access</li>
            </ul>

            <center>
              <a href="${dashboardLink}" class="button">Access Your Dashboard</a>
            </center>

            <p style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 6px;">
              <strong>🌱 What's Next?</strong><br>
              You'll receive your Go Green Participation Certificate in a separate email shortly. 
              A tree has been planted in ${childName}'s name as part of our environmental initiative!
            </p>
          </div>
          <div class="footer">
            <p>© 2026 WombTo18. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getGoGreenCertificateEmailTemplate(
    parentName: string,
    childName: string,
    registrationId: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4caf50, #66bb6a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0; }
          .tree-icon { font-size: 2em; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 WombTo18 Go Green Initiative</h1>
            <p>Committed to a Greener Future</p>
          </div>
          <div class="content">
            <h2>Congratulations, ${parentName}!</h2>
            <p>We are delighted to inform you that <strong>${childName}</strong> has been enrolled in the <strong>WombTo18 Green Cohort</strong>.</p>
            
            <div class="highlight">
              <div class="tree-icon">🌳</div>
              <p><strong>A tree has been planted in ${childName}'s name</strong> as part of our environmental initiative to create a greener, healthier future for our children.</p>
            </div>
            
            <p>Your child's <strong>Go Green Participation Certificate</strong> is attached to this email. This certificate recognizes ${childName}'s contribution to environmental sustainability from an early age.</p>
            
            <p><strong>Registration Details:</strong></p>
            <ul>
              <li>Child Name: ${childName}</li>
              <li>Registration ID: ${registrationId}</li>
              <li>Program: WombTo18 Green Cohort</li>
            </ul>
            
            <p>Together, we are building a sustainable future for the next generation. Thank you for being part of this meaningful initiative.</p>
            
            <div class="footer">
              <p>Best regards,<br>
              <strong>WombTo18 Team</strong><br>
              Maternal-to-Child Health Platform</p>
              <p>📧 support@wombto18.com | 🌐 www.wombto18.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getVaccinationReminderTemplate(parentName: string, childName: string, vaccineName: string, dueDate: string, prefix: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💉 Vaccination Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${parentName},</h2>
            <div class="alert-box">
              <strong>${prefix}:</strong> ${childName}'s <strong>${vaccineName}</strong> vaccination<br>
              <strong>Due Date:</strong> ${dueDate}
            </div>
            <p>Please schedule an appointment with your pediatrician to ensure ${childName} receives this important vaccination on time.</p>
            <p>You can mark this as completed in your WombTo18 dashboard once done.</p>
          </div>
          <div class="footer">
            <p>© 2026 WombTo18. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeBackEmailTemplate(
    parentName: string,
    childrenNames: string[],
    lastLoginDate: string | undefined,
    dashboardLink: string,
  ): string {
    const childrenText = childrenNames.length === 1 
      ? childrenNames[0] 
      : childrenNames.length === 2
      ? `${childrenNames[0]} and ${childrenNames[1]}`
      : `${childrenNames.slice(0, -1).join(', ')} and ${childrenNames.slice(-1)[0]}`;

    const lastLoginText = lastLoginDate 
      ? `Your last visit was on ${new Date(lastLoginDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .welcome-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .info-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome Back! 👋</h1>
          </div>
          <div class="content">
            <div class="welcome-icon">🎉</div>
            <h2>Hello ${parentName},</h2>
            <p>We're delighted to see you back on WombTo18! ${lastLoginText}</p>
            
            <div class="info-box">
              <strong>Your Children:</strong> ${childrenText}
            </div>

            <p>Here's what you can check in your dashboard:</p>
            <ul>
              <li>📅 Upcoming vaccination reminders</li>
              <li>📊 Development milestone progress</li>
              <li>🌱 Go Green tree growth updates</li>
              <li>📱 Recent notifications and alerts</li>
            </ul>

            <center>
              <a href="${dashboardLink}" class="button">Visit Your Dashboard</a>
            </center>

            <p>Thank you for continuing to trust WombTo18 with your child's health journey!</p>
          </div>
          <div class="footer">
            <p>© 2026 WombTo18. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getRegistrationConfirmationTemplate(
    parentName: string,
    childName: string,
    registrationId: string,
    ageGroup: string,
    state: string,
    subscriptionAmount: number,
  ): string {
    const dashboardLink = `${this.configService.get<string>('APP_BASE_URL') || 'https://wombto18.com'}/dashboard`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
          .info-box { background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; line-height: 2; }
          .amount-box { background: white; border: 2px solid #10b981; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .amount { font-size: 28px; font-weight: bold; color: #10b981; }
          .features { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .features ul { list-style: none; padding: 0; }
          .features li { padding: 8px 0; font-size: 15px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; padding: 20px; background: white; border-radius: 8px; }
          .tagline { text-align: center; color: #059669; font-style: italic; margin-top: 20px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Registration Successful!</h1>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <h2>🎉 Congratulations, ${parentName}!</h2>
            <p>${childName} has been successfully registered with WombTo18.</p>
            
            <div class="info-box">
              <strong>🆔 Registration ID:</strong> ${registrationId}<br>
              <strong>👶 Child Name:</strong> ${childName}<br>
              <strong>📊 Age Group:</strong> ${ageGroup}<br>
              <strong>📍 State:</strong> ${state}<br>
              <strong>💳 Subscription:</strong> ₹${subscriptionAmount} (Annual Plan)
            </div>

            <div class="features">
              <p><strong>You now have access to:</strong></p>
              <ul>
                <li>✅ Vaccination Tracker with smart reminders (SMS, WhatsApp & Email)</li>
                <li>🌱 Go Green Program – Earn credits & contribute to tree plantation</li>
                <li>📈 Development Milestone Tracking</li>
                <li>📄 Digital Health Records & Reports</li>
                <li>🔔 Automated Notifications & Alerts</li>
              </ul>
            </div>

            <center>
              <p><strong>🚀 Access your child dashboard here:</strong></p>
              <a href="${dashboardLink}" class="button">Access Dashboard</a>
            </center>

            <div class="tagline">
              <strong>Welcome to WombTo18 – Building a healthier and greener future for your child 🌿</strong>
            </div>
          </div>
          <div class="footer">
            <p>© 2026 WombTo18. All rights reserved.</p>
            <p>📧 support@wombto18.com | 🌐 www.wombto18.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Sends complete vaccination schedule email with PDF attachment
   */
  async sendVaccinationScheduleEmail(
    to: string,
    parentName: string,
    childName: string,
    dateOfBirth: string,
    registrationId: string,
    vaccineSchedule: Array<{
      name: string;
      ageGroup: string;
      dueDate: string;
      status: 'completed' | 'due' | 'upcoming';
    }>,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.error(`❌ Cannot send vaccination schedule email to ${to}: transporter not configured`);
      return;
    }

    try {
      this.logger.log(`📧 Sending vaccination schedule email to ${to}...`);

      // Generate PDF
      const pdfBuffer = await this.generateVaccinationSchedulePDF({
        childName,
        dateOfBirth,
        registrationId,
        parentName,
      }, vaccineSchedule);

      // Generate email HTML
      const emailHTML = this.getVaccinationScheduleEmailTemplate(
        parentName,
        childName,
        dateOfBirth,
        registrationId,
        vaccineSchedule,
      );

      // Send email with PDF attachment
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject: `📅 ${childName}'s Complete Vaccination Schedule - WombTo18`,
        text: `Complete Vaccination Schedule for ${childName}. Total ${vaccineSchedule.length} vaccines. Please check your email for the detailed schedule.`,
        html: emailHTML,
        attachments: [
          {
            filename: `${childName.replace(/\s+/g, '_')}_Vaccination_Schedule.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      this.logger.log(`✅ Vaccination schedule email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send vaccination schedule email to ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Generate vaccination schedule PDF using Puppeteer
   */
  private async generateVaccinationSchedulePDF(
    childData: {
      childName: string;
      dateOfBirth: string;
      registrationId: string;
      parentName: string;
    },
    vaccineSchedule: Array<{
      name: string;
      ageGroup: string;
      dueDate: string;
      status: 'completed' | 'due' | 'upcoming';
    }>,
  ): Promise<Buffer> {
    const puppeteer = await import('puppeteer');

    const pdfHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Arial', sans-serif; 
          padding: 40px;
          color: #1f2937;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #10b981;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 14px;
          color: #6b7280;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin: 20px 0 10px 0;
        }
        .info-section {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #10b981;
        }
        .info-row {
          display: flex;
          margin: 8px 0;
          font-size: 14px;
        }
        .info-label {
          font-weight: bold;
          width: 150px;
          color: #374151;
        }
        .info-value {
          color: #1f2937;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        thead {
          background: #10b981;
          color: white;
        }
        th {
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          font-size: 13px;
        }
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 12px;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        .status-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          color: white;
          display: inline-block;
        }
        .status-done { background: #10b981; }
        .status-due { background: #f59e0b; }
        .status-upcoming { background: #3b82f6; }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 11px;
          color: #6b7280;
        }
        .notes {
          background: #e0f2fe;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .notes-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #1e40af;
        }
        .notes ul {
          margin-left: 20px;
          font-size: 12px;
          line-height: 1.6;
        }
        .notes li {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">WombTo18</div>
        <div class="subtitle">Your Child's Health Partner</div>
      </div>

      <div class="title">💉 Complete Vaccination Schedule</div>

      <div class="info-section">
        <div class="info-row">
          <span class="info-label">👶 Child Name:</span>
          <span class="info-value">${childData.childName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🎂 Date of Birth:</span>
          <span class="info-value">${childData.dateOfBirth}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🆔 Registration ID:</span>
          <span class="info-value">${childData.registrationId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">👨‍👩‍👧 Parent Name:</span>
          <span class="info-value">${childData.parentName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">💉 Total Vaccines:</span>
          <span class="info-value">${vaccineSchedule.length}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📅 Generated On:</span>
          <span class="info-value">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 35%;">Vaccine Name</th>
            <th style="width: 20%; text-align: center;">Age Group</th>
            <th style="width: 20%; text-align: center;">Due Date</th>
            <th style="width: 20%; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${vaccineSchedule.map((vaccine, index) => {
        let statusClass = '';
        let statusText = '';

        if (vaccine.status === 'completed') {
          statusClass = 'status-done';
          statusText = '✅ Done';
        } else if (vaccine.status === 'due') {
          statusClass = 'status-due';
          statusText = '⏰ Due';
        } else {
          statusClass = 'status-upcoming';
          statusText = '📅 Upcoming';
        }

        return `
              <tr>
                <td>${index + 1}</td>
                <td>${vaccine.name}</td>
                <td style="text-align: center;">${vaccine.ageGroup}</td>
                <td style="text-align: center;">${vaccine.dueDate}</td>
                <td style="text-align: center;">
                  <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
              </tr>
            `;
      }).join('')}
        </tbody>
      </table>

      <div class="notes">
        <div class="notes-title">📌 Important Notes:</div>
        <ul>
          <li>Please consult your pediatrician before any vaccination</li>
          <li>Maintain proper gap between doses as recommended</li>
          <li>Keep vaccination records updated in your dashboard</li>
          <li>You'll receive email reminders before each due date</li>
          <li>Bring this schedule during doctor visits for reference</li>
        </ul>
      </div>

      <div class="footer">
        <p><strong>WombTo18</strong> - Building a healthier and greener future for your child 🌿</p>
        <p style="margin-top: 5px;">📧 support@wombto18.com | 🌐 www.wombto18.com</p>
        <p style="margin-top: 5px;">© 2026 WombTo18. All rights reserved.</p>
      </div>
    </body>
    </html>
    `;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(pdfHTML, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  }

  /**
   * Get vaccination schedule email HTML template
   */
  private getVaccinationScheduleEmailTemplate(
    parentName: string,
    childName: string,
    dateOfBirth: string,
    registrationId: string,
    vaccineSchedule: Array<{
      name: string;
      ageGroup: string;
      dueDate: string;
      status: 'completed' | 'due' | 'upcoming';
    }>,
  ): string {
    const dashboardLink = `${this.configService.get<string>('APP_BASE_URL') || 'https://wombto18.com'}/dashboard`;

    // Generate vaccine table HTML with Done/Due/Upcoming status
    const vaccineTableRows = vaccineSchedule.map(vaccine => {
      let statusBadge = '';
      let statusColor = '';

      if (vaccine.status === 'completed') {
        statusBadge = '✅ Done';
        statusColor = '#10b981';
      } else if (vaccine.status === 'due') {
        statusBadge = '⏰ Due';
        statusColor = '#f59e0b';
      } else {
        statusBadge = '📅 Upcoming';
        statusColor = '#3b82f6';
      }

      return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 8px; text-align: left;">${vaccine.name}</td>
        <td style="padding: 12px 8px; text-align: center;">${vaccine.ageGroup}</td>
        <td style="padding: 12px 8px; text-align: center;">${vaccine.dueDate}</td>
        <td style="padding: 12px 8px; text-align: center;">
          <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">
            ${statusBadge}
          </span>
        </td>
      </tr>
    `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .table-container { background: white; border-radius: 8px; overflow: hidden; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th { background: #10b981; color: white; padding: 12px 8px; text-align: left; font-weight: bold; }
        td { padding: 12px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; padding: 20px; }
        @media only screen and (max-width: 600px) {
          .container { padding: 10px; }
          .content { padding: 15px; }
          table { font-size: 12px; }
          th, td { padding: 8px 4px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💉 Complete Vaccination Schedule</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">WombTo18 Health Platform</p>
        </div>
        <div class="content">
          <h2>Hello ${parentName},</h2>
          <p>Here is the complete vaccination schedule for <strong>${childName}</strong>.</p>
          
          <div class="info-box">
            <strong>👶 Child Name:</strong> ${childName}<br>
            <strong>🎂 Date of Birth:</strong> ${dateOfBirth}<br>
            <strong>🆔 Registration ID:</strong> ${registrationId}<br>
            <strong>💉 Total Vaccines:</strong> ${vaccineSchedule.length}
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Vaccine Name</th>
                  <th style="text-align: center;">Age Group</th>
                  <th style="text-align: center;">Due Date</th>
                  <th style="text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${vaccineTableRows}
              </tbody>
            </table>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <strong>📌 Important Notes:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Please consult your pediatrician before any vaccination</li>
              <li>Maintain proper gap between doses as recommended</li>
              <li>Keep vaccination records updated in your dashboard</li>
              <li>You'll receive email reminders before each due date</li>
            </ul>
          </div>

          <center>
            <a href="${dashboardLink}" class="button">Access Your Dashboard</a>
          </center>

          <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
            You can track and update vaccination status anytime in your WombTo18 dashboard. 
            We'll send you timely reminders for upcoming vaccinations.
          </p>
        </div>
        <div class="footer">
          <p><strong>WombTo18</strong> - Your Child's Health Partner</p>
          <p>© 2026 WombTo18. All rights reserved.</p>
          <p>📧 support@wombto18.com | 🌐 www.wombto18.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
  }
}
