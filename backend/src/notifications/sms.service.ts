import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly twilioClient: Twilio | null;
  private readonly fromNumber: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER') || '';
    
    if (accountSid && authToken && this.fromNumber) {
      this.twilioClient = new Twilio(accountSid, authToken);
      this.enabled = true;
      this.logger.log('Twilio SMS service initialized');
    } else {
      this.twilioClient = null;
      this.enabled = false;
      this.logger.warn(
        'Twilio SMS service is not configured. SMS will NOT be sent. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env',
      );
    }
  }

  /**
   * Validate if phone number is valid for SMS
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid Indian mobile number (10 digits starting with 6-9)
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      return true;
    }
    
    // Check if it's a valid international format (91 + 10 digits starting with 6-9)
    if (cleaned.length === 12 && cleaned.startsWith('91') && /^91[6-9]/.test(cleaned)) {
      return true;
    }
    
    return false;
  }

  /**
   * Send OTP SMS using Twilio
   */
  async sendOtpSms(phone: string, otp: string): Promise<void> {
    if (!this.enabled || !this.twilioClient) {
      this.logger.warn(`Cannot send OTP SMS to ${phone}: Twilio not configured`);
      return;
    }

    // Validate phone number before attempting to send
    if (!this.isValidPhoneNumber(phone)) {
      this.logger.warn(`Cannot send OTP SMS to ${phone}: Invalid phone number format`);
      return;
    }

    try {
      // Format phone number for international format
      const formattedPhone = this.formatPhoneNumber(phone);
      
      const message = `Your WombTo18 verification code is: ${otp}. This code will expire in 10 minutes.`;

      this.logger.log(`🔄 Sending OTP SMS to ${phone} (formatted: ${formattedPhone})`);

      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone,
      });

      this.logger.log(`✅ OTP SMS sent successfully to ${phone}. Message SID: ${result.sid}`);
    } catch (error: any) {
      this.logger.error(`❌ Failed to send OTP SMS to ${phone}:`, error.message);
      if (error.code) {
        this.logger.error(`   Twilio Error Code: ${error.code}`);
      }
    }
  }

  /**
   * Send transactional SMS using Twilio
   */
  async sendTransactionalSms(phone: string, message: string): Promise<void> {
    if (!this.enabled || !this.twilioClient) {
      this.logger.warn(`Cannot send SMS to ${phone}: Twilio not configured`);
      return;
    }

    // Validate phone number before attempting to send
    if (!this.isValidPhoneNumber(phone)) {
      this.logger.warn(`Cannot send SMS to ${phone}: Invalid phone number format`);
      return;
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phone);

      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone,
      });

      this.logger.log(`✅ SMS sent to ${phone}. Message SID: ${result.sid}`);
    } catch (error: any) {
      this.logger.error(`❌ Failed to send SMS to ${phone}:`, error.message);
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
   * Format phone number to international format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 91, assume it's already formatted
    if (cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    
    // If it's 10 digits, assume it's Indian number without country code
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    // If it already has country code but no +, add it
    if (cleaned.length > 10) {
      return `+${cleaned}`;
    }
    
    // Default: assume Indian number
    return `+91${cleaned}`;
  }

  /**
   * Check if SMS service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
