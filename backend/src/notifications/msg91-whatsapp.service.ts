import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class Msg91WhatsAppService {
  private readonly logger = new Logger(Msg91WhatsAppService.name);
  private readonly authKey: string;
  private readonly whatsappNumber: string;
  private readonly namespace: string;
  private readonly enabled: boolean;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.authKey = this.configService.get<string>('MSG91_AUTH_KEY') || '';
    this.whatsappNumber = this.configService.get<string>('MSG91_WHATSAPP_NUMBER') || '';
    this.namespace = this.configService.get<string>('MSG91_WHATSAPP_NAMESPACE') || '';
    const baseUrl = this.configService.get<string>('MSG91_WHATSAPP_BASE_URL') || 'https://api.msg91.com/api/v5';
    this.apiUrl = `${baseUrl}/whatsapp/whatsapp-outbound-message/`;
    
    if (this.authKey && this.whatsappNumber) {
      this.enabled = true;
      this.logger.log('✅ MSG91 WhatsApp service initialized');
      this.logger.log(`💬 WhatsApp Number: ${this.whatsappNumber}`);
      this.logger.log(`📦 Namespace: ${this.namespace}`);
    } else {
      this.enabled = false;
      this.logger.warn('⚠️  MSG91 WhatsApp service is not configured. Set MSG91_AUTH_KEY and MSG91_WHATSAPP_NUMBER in .env');
    }
  }

  /**
   * Validate if phone number is valid for WhatsApp
   */
  private isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    
    // Valid Indian mobile number (10 digits starting with 6-9)
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      return true;
    }
    
    // Valid international format (91 + 10 digits starting with 6-9)
    if (cleaned.length === 12 && cleaned.startsWith('91') && /^91[6-9]/.test(cleaned)) {
      return true;
    }
    
    return false;
  }

  /**
   * Format phone number for MSG91 WhatsApp (without + sign)
   */
  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('91')) {
      return cleaned;
    }
    
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    
    return cleaned;
  }

  /**
   * Send WhatsApp message using MSG91
   */
  private async sendWhatsAppMessage(phone: string, message: string): Promise<void> {
    if (!this.enabled) {
      this.logger.warn(`Cannot send WhatsApp message to ${phone}: MSG91 not configured`);
      return;
    }

    if (!this.isValidPhoneNumber(phone)) {
      this.logger.warn(`Cannot send WhatsApp message to ${phone}: Invalid phone number format`);
      return;
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      const payload = {
        integrated_number: this.whatsappNumber,
        content_type: 'text',
        text: message,
        recipient_number: formattedPhone,
      };

      this.logger.log(`💬 Sending WhatsApp message to ${phone} (formatted: ${formattedPhone})`);
      this.logger.log(`📤 Payload: ${JSON.stringify(payload, null, 2)}`);

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'authkey': this.authKey,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`✅ WhatsApp message sent successfully to ${phone}. Response: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      this.logger.error(`❌ Failed to send WhatsApp message to ${phone}:`, error.response?.data || error.message);
      if (error.response) {
        this.logger.error(`   Status: ${error.response.status}`);
        this.logger.error(`   Data: ${JSON.stringify(error.response.data)}`);
      }
    }
  }

  /**
   * Send welcome WhatsApp message after registration
   */
  async sendWelcomeWhatsApp(phone: string, parentName: string, childName: string, registrationId: string): Promise<void> {
    const message = `🌱 *Welcome to WombTo18!*\n\nHello ${parentName},\n\nThank you for registering ${childName} with us!\n\n*Registration ID:* ${registrationId}\n\nYour dashboard is ready with:\n✅ Vaccination tracker\n✅ Go Green certificate\n✅ Milestone tracking\n✅ Automated reminders\n\nAccess your dashboard: wombto18.com/dashboard`;
    
    await this.sendWhatsAppMessage(phone, message);
  }

  /**
   * Send payment confirmation WhatsApp message
   */
  async sendPaymentConfirmationWhatsApp(
    phone: string,
    parentName: string,
    childName: string,
    registrationId: string,
    amount: number,
  ): Promise<void> {
    const message = `✅ *Payment Confirmed - WombTo18*\n\nDear ${parentName},\n\nPayment of ₹${amount} received for ${childName}'s registration.\n\n*Registration ID:* ${registrationId}\n\nAll services are now activated! You'll receive your Go Green certificate shortly.\n\nThank you for choosing WombTo18! 🌱`;
    
    await this.sendWhatsAppMessage(phone, message);
  }

  /**
   * Send vaccination reminder WhatsApp message
   */
  async sendVaccinationReminderWhatsApp(
    phone: string,
    childName: string,
    vaccineName: string,
    dueDate: string,
    offset: number,
  ): Promise<void> {
    let prefix: string;
    let emoji: string;
    
    if (offset === -2) {
      prefix = '📅 *Upcoming Vaccination*';
      emoji = '⏰';
    } else if (offset === 0) {
      prefix = '🚨 *Vaccination Due Today*';
      emoji = '⚠️';
    } else {
      prefix = '⚠️ *Overdue Vaccination*';
      emoji = '🔴';
    }

    const message = `${prefix}\n\n${emoji} ${childName}'s *${vaccineName}* vaccination ${offset === 0 ? 'is due today' : offset < 0 ? `is due on ${dueDate}` : `was due on ${dueDate}`}.\n\nPlease schedule an appointment with your pediatrician.\n\n- WombTo18`;
    
    await this.sendWhatsAppMessage(phone, message);
  }

  /**
   * Send Go Green certificate notification WhatsApp message
   */
  async sendGoGreenCertificateWhatsApp(
    phone: string,
    parentName: string,
    childName: string,
    registrationId: string,
  ): Promise<void> {
    const message = `🌱 *Go Green Certificate - WombTo18*\n\nCongratulations ${parentName}!\n\n${childName} is now part of the *WombTo18 Green Cohort*.\n\n🌳 A tree has been planted in ${childName}'s name!\n\n*Registration ID:* ${registrationId}\n\nYour Go Green Participation Certificate has been sent to your email.\n\nTogether, we're building a greener future! 🌍`;
    
    await this.sendWhatsAppMessage(phone, message);
  }

  /**
   * Check if WhatsApp service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
