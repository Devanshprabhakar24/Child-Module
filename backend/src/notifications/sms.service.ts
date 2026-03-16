import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly authKey: string | null;
  private readonly senderId: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.authKey = this.configService.get<string>('MSG91_AUTH_KEY') || null;
    this.senderId = this.configService.get<string>('MSG91_SENDER_ID') || 'WOMBTO';
    this.enabled = !!this.authKey;

    if (!this.enabled) {
      this.logger.warn(
        'MSG91 SMS service is not configured. SMS will NOT be sent. Set MSG91_AUTH_KEY in .env',
      );
    } else {
      this.logger.log('MSG91 SMS service initialized');
    }
  }

  /**
   * Send OTP SMS using MSG91 - Correct API format
   */
  async sendOtpSms(phone: string, otp: string): Promise<void> {
    if (!this.enabled) {
      this.logger.warn(`Cannot send OTP SMS to ${phone}: MSG91 not configured`);
      return;
    }

    try {
      // Clean phone number - remove +91 and spaces
      const cleanPhone = phone.replace(/^\+91/, '').replace(/\s/g, '').replace(/^91/, '');
      
      // MSG91 SMS API - Correct format
      const url = 'https://control.msg91.com/api/v5/flow/';
      
      const payload = {
        flow_id: '673e0e0cd6fc054b4b3e0e0c', // Default OTP flow ID
        sender: this.senderId,
        mobiles: `91${cleanPhone}`,
        OTP: otp, // Variable name for OTP in template
      };

      this.logger.log(`🔄 Sending OTP SMS to ${phone} (clean: ${cleanPhone})`);
      this.logger.log(`📋 Payload: ${JSON.stringify(payload)}`);

      const response = await axios.post(url, payload, {
        headers: {
          'authkey': this.authKey!,
          'content-type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      this.logger.log(`📡 MSG91 Response Status: ${response.status}`);
      this.logger.log(`📡 MSG91 Response Data: ${JSON.stringify(response.data)}`);

      if (response.data.type === 'success' || response.status === 200) {
        this.logger.log(`✅ OTP SMS sent successfully to ${phone}`);
      } else {
        this.logger.error(`❌ Failed to send OTP SMS to ${phone}: ${JSON.stringify(response.data)}`);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message;
      const errorCode = error?.response?.status;
      const errorData = error?.response?.data;
      
      this.logger.error(`❌ SMS Error Details:`);
      this.logger.error(`   Phone: ${phone}`);
      this.logger.error(`   Status Code: ${errorCode}`);
      this.logger.error(`   Error Message: ${errorMsg}`);
      this.logger.error(`   Full Error Data: ${JSON.stringify(errorData)}`);
      this.logger.error(`   Auth Key: ${this.authKey ? 'Present' : 'Missing'}`);
      
      if (errorCode === 418) {
        this.logger.error(`   💡 Solution: Whitelist IP in MSG91 dashboard`);
      }
    }
  }

  /**
   * Send transactional SMS using MSG91 - Promotional route
   */
  async sendTransactionalSms(phone: string, message: string): Promise<void> {
    if (!this.enabled) {
      this.logger.warn(`Cannot send SMS to ${phone}: MSG91 not configured`);
      return;
    }

    try {
      // Clean phone number
      const cleanPhone = phone.replace(/^\+91/, '').replace(/\s/g, '').replace(/^91/, '');
      
      // MSG91 SMS API - Simple format
      const url = 'https://control.msg91.com/api/v5/flow/';
      
      const payload = {
        sender: this.senderId,
        route: '1', // Promotional route (doesn't require DLT for testing)
        country: '91',
        sms: [
          {
            message: message,
            to: [cleanPhone],
          },
        ],
      };

      const response = await axios.post(url, payload, {
        headers: {
          'authkey': this.authKey!,
          'content-type': 'application/json',
        },
      });

      if (response.data.type === 'success' || response.status === 200) {
        this.logger.log(`SMS sent to ${phone}`);
      } else {
        this.logger.error(`Failed to send SMS to ${phone}: ${JSON.stringify(response.data)}`);
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to send SMS to ${phone}: ${error?.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Send welcome SMS after registration
   */
  async sendWelcomeSms(phone: string, parentName: string, childName: string, registrationId: string): Promise<void> {
    const message = `Welcome to WombTo18, ${parentName}! ${childName} is registered (${registrationId}). Login at wombto18.com`;
    await this.sendTransactionalSms(phone, message);
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmationSms(
    phone: string,
    parentName: string,
    childName: string,
    registrationId: string,
    amount: number,
  ): Promise<void> {
    const message = `Dear ${parentName}, payment of Rs.${amount} received for ${childName} (${registrationId}). Thank you! - WombTo18`;
    await this.sendTransactionalSms(phone, message);
  }

  /**
   * Send vaccination reminder SMS
   */
  async sendVaccinationReminderSms(
    phone: string,
    childName: string,
    vaccineName: string,
    dueDate: string,
    offset: number,
  ): Promise<void> {
    let prefix: string;
    if (offset === -2) {
      prefix = 'Reminder';
    } else if (offset === 0) {
      prefix = 'Due Today';
    } else {
      prefix = 'Overdue';
    }

    const message = `${prefix}: ${childName}'s ${vaccineName} vaccination ${offset === 0 ? 'is due today' : offset < 0 ? `due on ${dueDate}` : `was due ${dueDate}`}. Visit doctor. - WombTo18`;
    await this.sendTransactionalSms(phone, message);
  }

  /**
   * Check if SMS service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
