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
        html: this.getPaymentConfirmationTemplate(parentName, childName, registrationId, amount),
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
      this.logger.warn(`Cannot send Go Green certificate email to ${to}: transporter not configured`);
      return;
    }

    try {
      await this.transporter.sendMail({
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
      this.logger.log(`Go Green certificate email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send Go Green certificate email to ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
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

  private getPaymentConfirmationTemplate(parentName: string, childName: string, registrationId: string, amount: number): string {
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
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed ✓</h1>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <h2>Thank you, ${parentName}!</h2>
            <p>Your payment has been successfully received.</p>
            
            <div class="amount-box">
              <div class="amount">₹${amount}</div>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Annual Subscription</p>
            </div>

            <p><strong>Registration ID:</strong> ${registrationId}<br>
            <strong>Child Name:</strong> ${childName}</p>

            <p>Your invoice is attached to this email. All services have been activated:</p>
            <ul>
              <li>✓ Vaccination tracker with 27 milestones</li>
              <li>✓ Automated reminders (SMS & WhatsApp)</li>
              <li>✓ Go Green tree planting</li>
              <li>✓ Dashboard access</li>
            </ul>
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
}
