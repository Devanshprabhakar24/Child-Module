import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class GmailSmtpService {
  private readonly logger = new Logger(GmailSmtpService.name);
  private readonly transporter: Transporter | null = null;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('EMAIL_HOST');
    const port = this.configService.get<number>('EMAIL_PORT');
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');
    
    this.fromName = this.configService.get<string>('APP_NAME') || 'WombTo18';
    this.fromEmail = user || 'noreply@wombto18.com';

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail', // Use Gmail service directly
        auth: {
          user,
          pass,
        },
      });
      
      this.enabled = true;
      this.logger.log(`✅ Gmail SMTP service initialized (from: ${this.fromEmail})`);
      this.logger.log(`📧 SMTP Host: ${host}:${port}`);
      
      // Verify connection
      this.transporter.verify((error) => {
        if (error) {
          this.logger.error(`❌ Gmail SMTP connection failed: ${error.message}`);
        } else {
          this.logger.log('✅ Gmail SMTP ready to send emails');
        }
      });
    } else {
      this.enabled = false;
      this.logger.warn('⚠️  Gmail SMTP not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in .env');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Send OTP email via Gmail SMTP
   */
  async sendOTP(email: string, otp: string): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      this.logger.warn('⚠️  Gmail SMTP not configured');
      return false;
    }

    try {
      this.logger.log(`📧 Attempting to send OTP email via Gmail SMTP to ${email}`);
      this.logger.debug(`OTP Code: ${otp}`);
      
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: email,
        subject: `Your ${this.fromName} OTP Code`,
        html: this.getOTPEmailTemplate(otp),
      });

      this.logger.log(`✅ OTP email sent successfully via Gmail SMTP to ${email}`);
      this.logger.debug(`Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to send OTP email via Gmail SMTP to ${email}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Send generic email via Gmail SMTP with optional PDF attachment
   */
  async sendEmail(to: string, subject: string, html: string, pdfBuffer?: Buffer, pdfFilename?: string): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      this.logger.warn('⚠️  Gmail SMTP not configured');
      return false;
    }

    try {
      this.logger.log(`📧 Sending email via Gmail SMTP to ${to}${pdfBuffer ? ' with PDF attachment' : ''}`);
      
      const mailOptions: any = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
      };

      // Add PDF attachment if provided
      if (pdfBuffer && pdfFilename) {
        mailOptions.attachments = [
          {
            filename: pdfFilename,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ];
        this.logger.debug(`📎 Adding PDF attachment: ${pdfFilename} (${pdfBuffer.length} bytes)`);
      }
      
      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`✅ Email sent successfully via Gmail SMTP to ${to}${pdfBuffer ? ' with PDF' : ''}`);
      this.logger.debug(`Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to send email via Gmail SMTP to ${to}: ${errorMessage}`);
      return false;
    }
  }

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
}
