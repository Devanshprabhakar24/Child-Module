import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class BrevoEmailService {
  private readonly logger = new Logger(BrevoEmailService.name);
  private readonly apiKey: string;
  private readonly enabled: boolean;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly baseUrl = 'https://api.brevo.com/v3';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY') || '';
    this.fromEmail = this.configService.get<string>('BREVO_FROM_EMAIL') || 'noreply@wombto18.com';
    this.fromName = this.configService.get<string>('APP_NAME') || 'WombTo18';

    if (this.apiKey) {
      this.enabled = true;
      this.logger.log(`✅ Brevo Email API service initialized (from: ${this.fromEmail})`);
      this.logger.log(`🔑 API Key: ${this.apiKey.substring(0, 15)}...`);
    } else {
      this.enabled = false;
      this.logger.warn('⚠️  Brevo Email API not configured. Set BREVO_API_KEY in .env');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Send OTP email via Brevo API
   */
  async sendOTP(email: string, otp: string): Promise<boolean> {
    if (!this.enabled) {
      this.logger.warn('⚠️  Brevo Email API not configured');
      return false;
    }

    try {
      this.logger.log(`📧 Attempting to send OTP email via Brevo API to ${email}`);
      this.logger.debug(`OTP Code: ${otp}`);

      const response = await axios.post(
        `${this.baseUrl}/smtp/email`,
        {
          sender: {
            name: this.fromName,
            email: this.fromEmail,
          },
          to: [
            {
              email: email,
            },
          ],
          subject: `Your ${this.fromName} OTP Code`,
          htmlContent: this.getOTPEmailTemplate(otp),
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 201) {
        this.logger.log(`✅ OTP email sent successfully via Brevo API to ${email}`);
        this.logger.debug(`Message ID: ${response.data.messageId}`);
        return true;
      } else {
        this.logger.error(`❌ Brevo API returned unexpected status: ${response.status}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to send OTP email via Brevo API: ${errorMessage}`);

      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(`Brevo Error Response: ${JSON.stringify(error.response.data)}`);
        
        // Handle specific Brevo error codes
        if (error.response.status === 401) {
          this.logger.error('⚠️  Authentication failed - check BREVO_API_KEY');
        } else if (error.response.status === 400) {
          this.logger.error('⚠️  Bad request - check email format or content');
        }
      }

      return false;
    }
  }

  /**
   * Send generic email via Brevo API with optional PDF attachment
   */
  async sendEmail(to: string, subject: string, html: string, pdfBuffer?: Buffer, pdfFilename?: string): Promise<boolean> {
    if (!this.enabled) {
      this.logger.warn('⚠️  Brevo Email API not configured');
      return false;
    }

    try {
      this.logger.log(`📧 Sending email via Brevo API to ${to}${pdfBuffer ? ' with PDF attachment' : ''}`);

      const emailData: any = {
        sender: {
          name: this.fromName,
          email: this.fromEmail,
        },
        to: [
          {
            email: to,
          },
        ],
        subject: subject,
        htmlContent: html,
      };

      // Add PDF attachment if provided
      if (pdfBuffer && pdfFilename) {
        emailData.attachment = [
          {
            content: pdfBuffer.toString('base64'),
            name: pdfFilename,
          },
        ];
        this.logger.debug(`📎 Adding PDF attachment: ${pdfFilename} (${pdfBuffer.length} bytes)`);
      }

      const response = await axios.post(
        `${this.baseUrl}/smtp/email`,
        emailData,
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 201) {
        this.logger.log(`✅ Email sent successfully via Brevo API to ${to}${pdfBuffer ? ' with PDF' : ''}`);
        this.logger.debug(`Message ID: ${response.data.messageId}`);
        return true;
      } else {
        this.logger.error(`❌ Brevo API returned unexpected status: ${response.status}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to send email via Brevo API: ${errorMessage}`);
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
