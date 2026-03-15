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
   * Send OTP SMS using MSG91 - Simple API (no template required)
   */
  async sendOtpSms(phone: string, otp: string): Promise<void> {
    if (!this.enabled) {
      this.logger.warn(`Cannot send OTP SMS to ${phone}: MSG91 not configured`);
      return;
    }

    try {
      // Clean phone number - remove +91 if present
      const cleanPhone = phone.replace(/^\+91/, '').replace(/\s/g, '');
      
      // MSG91 Send OTP API (v5)
      const url = `https://control.msg91.com/api/v5/otp?otp=${otp}&mobile=91${cleanPhone}`;
      
      const response = await axios.get(url, {
        headers: {
          'authkey': this.authKey!,
        },
      });

      if (response.data.type === 'success' || response.status === 200) {
        this.logger.log(`OTP SMS sent to ${phone}`);
      } else {
        this.logger.error(`Failed to send OTP SMS to ${phone}: ${JSON.stringify(response.data)}`);
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to send OTP SMS to ${phone}: ${error?.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Send transactional SMS using MSG91 - Simple API
   */
  async sendTransactionalSms(phone: string, message: string): Promise<void> {
    if (!this.enabled) {
      this.logger.warn(`Cannot send SMS to ${phone}: MSG91 not configured`);
      return;
    }

    try {
      // Clean phone number
      const cleanPhone = phone.replace(/^\+91/, '').replace(/\s/g, '');
      
      // MSG91 SMS API
      const url = 'https://api.msg91.com/api/sendhttp.php';
      
      const params = {
        authkey: this.authKey!,
        mobiles: `91${cleanPhone}`,
        message: message,
        sender: this.senderId,
        route: '4', // Transactional route
        country: '91',
      };

      const response = await axios.get(url, { params });

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
