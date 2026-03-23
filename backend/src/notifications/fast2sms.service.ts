import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class Fast2SmsService {
  private readonly logger = new Logger(Fast2SmsService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://www.fast2sms.com/dev/bulkV2';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('FAST2SMS_API_KEY') || '';
  }

  async sendOTP(phone: string, otp: string): Promise<boolean> {
    try {
      if (!this.apiKey) {
        this.logger.error('Fast2SMS API key not configured');
        return false;
      }

      // Remove +91 prefix if present, Fast2SMS expects 10-digit number
      const cleanPhone = phone.replace(/^\+91/, '').replace(/^91/, '');

      this.logger.log(`Sending OTP SMS to ${cleanPhone} via Fast2SMS`);

      const response = await axios.post(
        this.apiUrl,
        {
          route: 'q', // Quick SMS route (no DLT required for testing)
          message: `Your OTP is ${otp}. Valid for 10 minutes. Do not share with anyone. - WombTo18`,
          language: 'english',
          flash: 0,
          numbers: cleanPhone,
        },
        {
          headers: {
            authorization: this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.return === true) {
        this.logger.log(`OTP SMS sent successfully to ${cleanPhone}`);
        this.logger.debug(`Fast2SMS Response: ${JSON.stringify(response.data)}`);
        return true;
      } else {
        this.logger.error(`Fast2SMS API returned false: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send OTP SMS via Fast2SMS: ${errorMessage}`);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { status_code?: number } } };
        this.logger.error(`Fast2SMS Error Response: ${JSON.stringify(axiosError.response?.data)}`);
        
        // Handle specific error codes
        if (axiosError.response?.data?.status_code === 416) {
          this.logger.error('Insufficient wallet balance in Fast2SMS account');
        }
      }
      
      return false;
    }
  }

  async sendSMS(phone: string, message: string): Promise<boolean> {
    try {
      if (!this.apiKey) {
        this.logger.error('Fast2SMS API key not configured');
        return false;
      }

      // Remove +91 prefix if present
      const cleanPhone = phone.replace(/^\+91/, '').replace(/^91/, '');

      this.logger.log(`Sending SMS to ${cleanPhone} via Fast2SMS`);

      const response = await axios.post(
        this.apiUrl,
        {
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: cleanPhone,
        },
        {
          headers: {
            authorization: this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.return === true) {
        this.logger.log(`SMS sent successfully to ${cleanPhone}`);
        return true;
      } else {
        this.logger.error(`Fast2SMS API returned false: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send SMS via Fast2SMS: ${errorMessage}`);
      return false;
    }
  }
}
