import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class Fast2SmsService {
  private readonly logger = new Logger(Fast2SmsService.name);
  private readonly apiKey: string;
  private readonly enabled: boolean;
  private readonly baseUrl = 'https://www.fast2sms.com/dev/bulkV2';
  private readonly otpRoute = 'otp'; // OTP SMS route

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('FAST2SMS_API_KEY') || '';

    if (this.apiKey) {
      this.enabled = true;
      this.logger.log(`✅ Fast2SMS service initialized`);
      this.logger.log(`🔑 API Key: ${this.apiKey.substring(0, 10)}...`);
    } else {
      this.enabled = false;
      this.logger.warn('⚠️  Fast2SMS not configured. Set FAST2SMS_API_KEY in .env');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Send OTP SMS via Fast2SMS
   */
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    if (!this.enabled) {
      this.logger.warn('⚠️  Fast2SMS not configured');
      return false;
    }

    try {
      // Remove +91 prefix if present, Fast2SMS expects 10-digit numbers
      const formattedPhone = phone.replace(/^\+?91/, '');

      // Validate phone number format (should be 10 digits)
      if (!/^\d{10}$/.test(formattedPhone)) {
        this.logger.error(`❌ Invalid phone number format: ${phone}`);
        return false;
      }

      this.logger.log(`📱 Attempting to send OTP SMS via Fast2SMS to ${formattedPhone}`);
      this.logger.debug(`OTP Code: ${otp}`);

      // Fast2SMS Quick SMS route - works without DLT registration
      const message = `Your OTP is ${otp}. Valid for 10 minutes. Do not share with anyone. - WombTo18`;
      
      const response = await axios.post(
        this.baseUrl,
        {
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: formattedPhone,
        },
        {
          headers: {
            authorization: this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.return === true) {
        this.logger.log(`✅ OTP SMS sent successfully via Fast2SMS to ${formattedPhone}`);
        this.logger.debug(`Response: ${JSON.stringify(response.data)}`);
        return true;
      } else {
        this.logger.error(`❌ Fast2SMS API returned error: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to send OTP SMS via Fast2SMS: ${errorMessage}`);

      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(`Fast2SMS Error Response: ${JSON.stringify(error.response.data)}`);
        
        // Handle specific Fast2SMS error codes
        if (error.response.status === 401) {
          this.logger.error('⚠️  Authentication failed - check FAST2SMS_API_KEY');
        } else if (error.response.status === 400) {
          this.logger.error('⚠️  Bad request - check phone number format or message content');
        }
      }

      return false;
    }
  }

  /**
   * Send generic SMS via Fast2SMS
   */
  async sendSMS(phone: string, message: string): Promise<boolean> {
    if (!this.enabled) {
      this.logger.warn('⚠️  Fast2SMS not configured');
      return false;
    }

    try {
      // Remove +91 prefix if present
      const formattedPhone = phone.replace(/^\+?91/, '');

      // Validate phone number format
      if (!/^\d{10}$/.test(formattedPhone)) {
        this.logger.error(`❌ Invalid phone number format: ${phone}`);
        return false;
      }

      this.logger.log(`📱 Sending SMS via Fast2SMS to ${formattedPhone}`);

      const response = await axios.post(
        this.baseUrl,
        {
          route: 'v3',
          sender_id: 'TXTIND',
          message: message,
          language: 'english',
          flash: 0,
          numbers: formattedPhone,
        },
        {
          headers: {
            authorization: this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.return === true) {
        this.logger.log(`✅ SMS sent successfully via Fast2SMS to ${formattedPhone}`);
        return true;
      } else {
        this.logger.error(`❌ Fast2SMS API returned error: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Failed to send SMS via Fast2SMS: ${errorMessage}`);
      return false;
    }
  }
}
