import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WatiWhatsAppService {
  private readonly logger = new Logger(WatiWhatsAppService.name);
  private readonly accessToken: string;
  private readonly apiEndpoint: string;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    this.accessToken = this.configService.get<string>('WATI_ACCESS_TOKEN') || '';
    this.apiEndpoint = this.configService.get<string>('WATI_API_ENDPOINT') || '';

    if (this.accessToken && this.apiEndpoint) {
      this.enabled = true;
      this.logger.log('✅ Wati WhatsApp service initialized');
    } else {
      this.enabled = false;
      this.logger.warn('⚠️  Wati WhatsApp not configured. Set WATI_ACCESS_TOKEN and WATI_API_ENDPOINT in .env');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Format phone number for Wati (with country code, no + sign)
   */
  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 91, return as is
    if (cleaned.startsWith('91')) {
      return cleaned;
    }
    
    // If 10 digits, add 91
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    
    return cleaned;
  }

  /**
   * Send WhatsApp message using Wati
   */
  async sendMessage(phone: string, message: string): Promise<boolean> {
    if (!this.enabled) {
      this.logger.warn('Wati WhatsApp not configured');
      return false;
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      this.logger.log(`💬 Sending WhatsApp message to ${phone} (formatted: ${formattedPhone})`);

      const response = await axios.post(
        `${this.apiEndpoint}/api/v1/sendSessionMessage/${formattedPhone}`,
        {
          messageText: message,
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.result === true || response.status === 200) {
        this.logger.log(`✅ WhatsApp message sent successfully to ${phone}`);
        return true;
      } else {
        this.logger.error(`❌ Wati returned false: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send WhatsApp message via Wati: ${errorMessage}`);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: any } };
        this.logger.error(`Wati Error Response: ${JSON.stringify(axiosError.response?.data)}`);
      }
      
      return false;
    }
  }

  /**
   * Send welcome message
   */
  async sendWelcomeMessage(phone: string, parentName: string, childName: string): Promise<boolean> {
    const message = `🎉 Welcome to WombTo18!\n\nHello ${parentName}!\n\nThank you for registering ${childName} with us. We're here to support your child's health journey from 0-18 years.\n\nYou can now:\n✅ Track vaccinations\n✅ Monitor growth\n✅ Manage health records\n✅ Track development milestones\n\nLet's make this journey together! 💚`;
    
    return this.sendMessage(phone, message);
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(phone: string, parentName: string, childName: string, amount: number, orderId: string): Promise<boolean> {
    const message = `✅ Payment Successful!\n\nThank you ${parentName}!\n\nYour payment for ${childName}'s subscription has been received.\n\n💰 Amount: ₹${amount}\n📝 Order ID: ${orderId}\n\nYour subscription is now active. Access all features from your dashboard.\n\n- WombTo18 Team`;
    
    return this.sendMessage(phone, message);
  }

  /**
   * Send vaccination reminder
   */
  async sendVaccinationReminder(phone: string, parentName: string, childName: string, vaccineName: string, dueDate: string): Promise<boolean> {
    const message = `💉 Vaccination Reminder\n\nHello ${parentName}!\n\n${childName} has an upcoming vaccination:\n\n📌 Vaccine: ${vaccineName}\n📅 Due Date: ${dueDate}\n\nPlease schedule an appointment with your healthcare provider.\n\n- WombTo18 Team`;
    
    return this.sendMessage(phone, message);
  }

  /**
   * Send Go Green certificate notification
   */
  async sendGoGreenCertificate(phone: string, parentName: string, childName: string, registrationId: string): Promise<boolean> {
    const message = `🌱 Go Green Certificate\n\nCongratulations ${parentName}!\n\n${childName} has completed the Go Green program!\n\n🎖️ Registration ID: ${registrationId}\n\nYour certificate has been sent to your email.\n\nTogether, we're building a greener future! 🌍\n\n- WombTo18 Team`;
    
    return this.sendMessage(phone, message);
  }

  /**
   * Send registration confirmation
   */
  async sendRegistrationConfirmation(phone: string, parentName: string, childName: string, registrationId: string, ageGroup: string): Promise<boolean> {
    const message = `✅ Registration Successful!\n\nCongratulations ${parentName}!\n\n${childName} has been registered with WombTo18.\n\n📝 Registration ID: ${registrationId}\n👶 Age Group: ${ageGroup}\n\nYou can now access your dashboard to track vaccinations, growth, and milestones.\n\n- WombTo18 Team`;
    
    return this.sendMessage(phone, message);
  }

  /**
   * Send welcome back message
   */
  async sendWelcomeBackMessage(phone: string, parentName: string, childrenNames: string[]): Promise<boolean> {
    const childrenList = childrenNames.join(', ');
    const message = `👋 Welcome Back ${parentName}!\n\nGreat to see you again!\n\n👶 Your children: ${childrenList}\n\nCheck your dashboard for:\n✅ Upcoming vaccinations\n✅ Growth updates\n✅ Health records\n✅ Development milestones\n\n- WombTo18 Team`;
    
    return this.sendMessage(phone, message);
  }
}
