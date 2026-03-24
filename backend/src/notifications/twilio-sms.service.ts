import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import type { Twilio } from 'twilio';

@Injectable()
export class TwilioSmsService {
  private readonly logger = new Logger(TwilioSmsService.name);
  private readonly client: Twilio | null = null;
  private readonly fromPhone: string;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const fromPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    this.fromPhone = fromPhone || '';

    if (accountSid && authToken && fromPhone) {
      this.client = twilio(accountSid, authToken);
      this.enabled = true;
      this.logger.log(`✅ Twilio SMS service initialized (from: ${this.fromPhone})`);
      this.logger.log(`📱 Account SID: ${accountSid.substring(0, 10)}...`);
    } else {
      this.enabled = false;
      this.logger.warn('⚠️  Twilio SMS not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Send OTP SMS via Twilio
   */
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    if (!this.enabled || !this.client) {
      this.logger.warn('⚠️  Twilio SMS not configured');
      return false;
    }

    try {
      // Ensure phone number has country code
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/^\+?91?/, '')}`;

      this.logger.log(`📱 Attempting to send OTP SMS via Twilio to ${formattedPhone}`);
      this.logger.debug(`OTP Code: ${otp}`);

      const message = await this.client.messages.create({
        body: `Your OTP is ${otp}. Valid for 10 minutes. Do not share with anyone. - WombTo18`,
        from: this.fromPhone,
        to: formattedPhone,
      });

      this.logger.log(`✅ OTP SMS sent successfully via Twilio to ${formattedPhone}`);
      this.logger.debug(`Message SID: ${message.sid}`);
      this.logger.debug(`Status: ${message.status}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to send OTP SMS via Twilio: ${errorMessage}`);

      if (error && typeof error === 'object' && 'code' in error) {
        const twilioError = error as { code: number; message: string; moreInfo?: string };
        this.logger.error(`Twilio Error Code: ${twilioError.code}`);
        this.logger.error(`Twilio Error Message: ${twilioError.message}`);
        
        // Handle specific Twilio error codes
        if (twilioError.code === 21211) {
          this.logger.error('⚠️  Invalid phone number format');
        } else if (twilioError.code === 21608) {
          this.logger.error('⚠️  Phone number is not verified (Trial account restriction)');
          this.logger.error('⚠️  Add verified phone numbers at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
        } else if (twilioError.code === 20003) {
          this.logger.error('⚠️  Authentication failed - check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
        }
      }

      return false;
    }
  }

  /**
   * Send generic SMS via Twilio
   */
  async sendSMS(phone: string, message: string): Promise<boolean> {
    if (!this.enabled || !this.client) {
      this.logger.warn('⚠️  Twilio SMS not configured');
      return false;
    }

    try {
      // Ensure phone number has country code
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/^\+?91?/, '')}`;

      this.logger.log(`📱 Sending SMS via Twilio to ${formattedPhone}`);

      const twilioMessage = await this.client.messages.create({
        body: message,
        from: this.fromPhone,
        to: formattedPhone,
      });

      this.logger.log(`✅ SMS sent successfully via Twilio to ${formattedPhone}`);
      this.logger.debug(`Message SID: ${twilioMessage.sid}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to send SMS via Twilio: ${errorMessage}`);
      return false;
    }
  }
}
