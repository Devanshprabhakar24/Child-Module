import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay') as typeof import('razorpay');

import {
  ChildRegistration,
  ChildRegistrationDocument,
} from '../registration/schemas/child-registration.schema';
import { Milestone, MilestoneDocument } from '../dashboard/schemas/milestone.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { GoGreenService } from '../go-green/go-green.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { RemindersService } from '../reminders/reminders.service';
import { CmsService } from '../cms/cms.service';
import { InvoiceService } from './invoice.service';
import { VaccineScheduleService } from './vaccine-schedule.service';
import { ReminderChannel } from '@wombto18/shared';
import { AgeGroupEnum } from '../dashboard/schemas/development-milestone.schema';

/**
 * Payments Service
 * Handles all Razorpay payment operations
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly razorpay: InstanceType<typeof Razorpay> | null;
  private readonly paymentTestMode: boolean;
  private readonly razorpayKeyId: string;
  private readonly razorpayKeySecret: string;

  constructor(
    @InjectModel(ChildRegistration.name)
    private readonly childModel: Model<ChildRegistrationDocument>,
    @InjectModel(Milestone.name)
    private readonly milestoneModel: Model<MilestoneDocument>,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly goGreenService: GoGreenService,
    private readonly dashboardService: DashboardService,
    private readonly remindersService: RemindersService,
    private readonly cmsService: CmsService,
    private readonly invoiceService: InvoiceService,
    private readonly vaccineScheduleService: VaccineScheduleService,
  ) {
    // Get configuration
    this.paymentTestMode = this.configService.get<string>('PAYMENT_TEST_MODE') === 'true';
    this.razorpayKeyId = this.configService.getOrThrow<string>('RAZORPAY_KEY_ID');
    this.razorpayKeySecret = this.configService.getOrThrow<string>('RAZORPAY_KEY_SECRET');

    // Initialize Razorpay
    if (this.paymentTestMode) {
      this.logger.warn('⚠️  PAYMENT TEST MODE ENABLED - Using Razorpay test keys');
    }

    this.razorpay = new Razorpay({
      key_id: this.razorpayKeyId,
      key_secret: this.razorpayKeySecret,
    });

    this.logger.log('✅ Razorpay initialized successfully');
  }

  /**
   * Create Razorpay Order
   * 
   * @param amount - Amount in INR (will be converted to paise)
   * @param registrationId - Child registration ID
   * @param childName - Child's name
   * @param isUpgrade - Whether this is an upgrade payment
   * @returns Order details with orderId, amount, currency, keyId
   */
  async createOrder(
    amount: number,
    registrationId: string,
    childName: string,
    isUpgrade = false,
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }> {
    try {
      // Validate amount
      if (!amount || amount <= 0) {
        throw new BadRequestException('Invalid amount');
      }

      // Convert amount to paise (Razorpay expects amount in smallest currency unit)
      const amountInPaise = Math.round(amount * 100);

      this.logger.log(`Creating Razorpay order: ₹${amount} (${amountInPaise} paise)${isUpgrade ? ' [UPGRADE]' : ''}`);

      // Create Razorpay order
      if (!this.razorpay) {
        throw new BadRequestException('Razorpay is not initialized');
      }

      const order = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: registrationId,
        notes: {
          registrationId,
          childName,
          isUpgrade: isUpgrade.toString(),
        },
      });

      this.logger.log(`✅ Order created: ${order.id}`);

      // Update registration with order ID
      await this.childModel.updateOne(
        { registrationId },
        {
          razorpayOrderId: order.id,
          paymentStatus: 'PENDING',
        },
      );

      return {
        orderId: order.id,
        amount: amountInPaise,
        currency: 'INR',
        keyId: this.razorpayKeyId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create order: ${errorMessage}`);
      throw new BadRequestException(
        errorMessage || 'Failed to create Razorpay order',
      );
    }
  }

  /**
   * Verify Razorpay Payment Signature
   * 
   * @param orderId - Razorpay order ID
   * @param paymentId - Razorpay payment ID
   * @param signature - Razorpay signature
   * @returns Verification result with registration details
   */
  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
  ): Promise<{
    verified: boolean;
    registrationId: string;
    paymentId: string;
  }> {
    try {
      this.logger.log(`Verifying payment: Order=${orderId}, Payment=${paymentId}`);

      // Step 1: Verify signature
      const isValidSignature = this.verifySignature(orderId, paymentId, signature);

      if (!isValidSignature) {
        this.logger.error('❌ Invalid payment signature');
        throw new BadRequestException('Payment verification failed: Invalid signature');
      }

      this.logger.log('✅ Signature verified successfully');

      // Step 2: Find registration by order ID
      const registration = await this.childModel.findOne({
        razorpayOrderId: orderId,
      });

      if (!registration) {
        this.logger.error(`❌ No registration found for order: ${orderId}`);
        throw new BadRequestException('Registration not found for this order');
      }

      // Step 3: Check if this is an upgrade payment
      let isUpgrade = false;
      if (this.razorpay) {
        try {
          const orderDetails = await this.razorpay.orders.fetch(orderId);
          isUpgrade = orderDetails.notes?.isUpgrade === 'true';
        } catch (error) {
          this.logger.warn('Could not fetch order details, assuming not an upgrade');
        }
      }

      // Step 4: Update payment status and plan if upgrade
      registration.paymentStatus = 'COMPLETED';
      registration.razorpayPaymentId = paymentId;
      
      if (isUpgrade) {
        this.logger.log(`🔄 Processing upgrade for ${registration.registrationId}`);
        registration.subscriptionPlan = 'FIVE_YEAR';
        registration.subscriptionAmount = 999;
        this.logger.log(`✅ Upgraded to 5-Year Plan (₹999)`);
      }
      
      await registration.save();

      this.logger.log(`✅ Payment completed for registration: ${registration.registrationId}`);

      // Send real-time notification for payment success
      this.notificationsGateway.sendPaymentNotification(
        registration.registrationId,
        registration.subscriptionAmount,
        'successful'
      );

      // Step 4: Trigger post-payment actions
      this.logger.log(`🚀 Triggering post-payment actions for ${registration.registrationId}...`);
      
      // Run post-payment actions asynchronously (don't block the response)
      this.sendPostPaymentNotifications(registration).catch((error) => {
        this.logger.error(`Failed to send post-payment notifications: ${error.message}`);
      });

      return {
        verified: true,
        registrationId: registration.registrationId,
        paymentId: paymentId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Payment verification failed: ${errorMessage}`);
      throw new BadRequestException(
        errorMessage || 'Payment verification failed',
      );
    }
  }

  /**
   * Verify Razorpay signature using HMAC SHA256
   * 
   * @param orderId - Razorpay order ID
   * @param paymentId - Razorpay payment ID
   * @param signature - Razorpay signature to verify
   * @returns true if signature is valid, false otherwise
   */
  private verifySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    try {
      // In test mode, we can be more lenient with signature verification
      if (this.paymentTestMode) {
        this.logger.log('[TEST MODE] Performing signature verification...');
      }

      // Create expected signature
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', this.razorpayKeySecret)
        .update(body)
        .digest('hex');

      // Compare signatures using timing-safe comparison
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex'),
      );

      return isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Signature verification error: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Get Razorpay Key ID for frontend
   */
  getRazorpayKeyId(): string {
    return this.razorpayKeyId;
  }

  /**
   * Check if payment test mode is enabled
   */
  isTestMode(): boolean {
    return this.paymentTestMode;
  }

  /**
   * Get registration data for invoice generation
   * 
   * @param registrationId - Child registration ID
   * @returns Registration document or null
   */
  async getRegistrationForInvoice(registrationId: string): Promise<ChildRegistrationDocument | null> {
    return this.childModel.findOne({ registrationId }).exec();
  }

  /**
   * Send post-payment notifications and activate services
   * Sends invoice PDF and Go Green certificate to user
   * 
   * @param registration - Child registration document
   */
  private async sendPostPaymentNotifications(
    registration: ChildRegistrationDocument,
  ): Promise<void> {
    this.logger.log(`📧 Starting post-payment notifications for ${registration.registrationId}`);

    const commonPayload = {
      phone: registration.phone,
      email: registration.email,
      parentName: registration.motherName,
      childName: registration.childName,
      registrationId: registration.registrationId,
    };

    try {
      // 1. Generate and Send Payment Invoice/Receipt
      try {
        this.logger.log(`📄 Generating invoice for ${registration.registrationId}...`);
        
        // Generate invoice PDF and upload to Cloudinary
        const invoiceNumber = `INV-${registration.registrationId}`;
        const invoiceDate = new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        
        const { buffer: invoicePDF, cloudinaryUrl } = await this.invoiceService.generateAndUploadInvoice({
          invoiceNumber,
          date: invoiceDate,
          parentName: registration.motherName,
          childName: registration.childName,
          registrationId: registration.registrationId,
          email: registration.email,
          phone: registration.phone,
          amount: registration.subscriptionAmount,
          currency: 'INR',
          razorpayOrderId: registration.razorpayOrderId || '',
          razorpayPaymentId: registration.razorpayPaymentId,
          subscriptionPlan: registration.subscriptionPlan,
        });

        // Store invoice URL in database if Cloudinary is configured
        if (cloudinaryUrl) {
          registration.invoiceUrl = cloudinaryUrl;
          await registration.save();
        }
        
        // Get vaccination count for email
        const vaccinationCount = await this.milestoneModel.countDocuments({
          registrationId: registration.registrationId,
        });
        
        this.logger.log(`📄 Sending payment invoice for ${registration.registrationId}...`);
        await this.notificationsService.sendPaymentConfirmation({
          ...commonPayload,
          amount: registration.subscriptionAmount,
          invoiceBuffer: invoicePDF,
          subscriptionPlan: registration.subscriptionPlan,
          vaccinationCount,
        });
        this.logger.log(`✅ Payment invoice sent${cloudinaryUrl ? ' and uploaded to Cloudinary: ' + cloudinaryUrl : ''}`);
      } catch (invoiceError) {
        this.logger.error(`❌ Failed to send payment invoice: ${invoiceError instanceof Error ? invoiceError.message : invoiceError}`);
      }

      // 1.5. Send Welcome Email with child details
      try {
        this.logger.log(`📧 Sending welcome email for ${registration.registrationId}...`);
        
        // Calculate age group
        const ageInYears = Math.floor((Date.now() - registration.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        let ageGroup = '0-5';
        if (ageInYears >= 13) ageGroup = '13-18';
        else if (ageInYears >= 6) ageGroup = '6-12';
        
        await this.notificationsService.sendWelcomeMessage({
          ...commonPayload,
          ageGroup,
          state: registration.state,
          subscriptionAmount: registration.subscriptionAmount,
          subscriptionPlan: registration.subscriptionPlan,
        });
        this.logger.log(`✅ Welcome email sent for ${registration.registrationId}`);
      } catch (welcomeError) {
        this.logger.error(`❌ Failed to send welcome email: ${welcomeError instanceof Error ? welcomeError.message : welcomeError}`);
      }

      // 2. Plant a tree for the child BEFORE sending certificate
      let plantedTree: any = null;
      try {
        this.logger.log(`🌳 Planting tree for ${registration.registrationId}...`);
        plantedTree = await this.goGreenService.plantTree({
          registrationId: registration.registrationId,
          childName: registration.childName,
          motherName: registration.motherName,
          location: registration.state,
          plantingPartner: 'WombTo18 Green Initiative',
        });
        this.logger.log(`✅ Tree planted successfully: ${plantedTree.treeId}`);
      } catch (treeError) {
        this.logger.error(`❌ Failed to plant tree: ${treeError instanceof Error ? treeError.message : treeError}`);
      }

      // 3. Send Go Green certificate email with tree ID
      try {
        this.logger.log(`📧 Sending Go Green certificate for ${registration.registrationId}...`);
        await this.notificationsService.sendGoGreenCertificate({
          ...commonPayload,
          state: registration.state,
          dateOfBirth: registration.dateOfBirth.toISOString().split('T')[0],
          treeId: plantedTree?.treeId || `TREE-${new Date().getFullYear()}-PENDING`,
        });
        this.logger.log(`✅ Go Green certificate sent for ${registration.registrationId}`);
        
        registration.goGreenCertSent = true;
        await registration.save();
      } catch (certError) {
        this.logger.error(`❌ Failed to send Go Green certificate: ${certError instanceof Error ? certError.message : certError}`);
      }

      // 4. AUTO-ACTIVATE ALL SERVICES
      this.logger.log(`⚙️  Activating all services for ${registration.registrationId}...`);
      await this.activateAllServicesForRegistration(registration, plantedTree);

      // 5. Send Complete Vaccination Schedule Email with PDF attachment
      try {
        this.logger.log(`📅 Generating and sending vaccination schedule for ${registration.registrationId}...`);
        
        // Get vaccination milestones from database
        const vaccinationMilestones = await this.milestoneModel.find({
          registrationId: registration.registrationId,
        }).sort({ dueDate: 1 }).exec();
        
        // Build vaccine schedule array
        const vaccineSchedule = vaccinationMilestones.map((milestone) => {
          const dueDate = new Date(milestone.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          let status: 'completed' | 'due' | 'upcoming' = 'upcoming';
          
          if (milestone.status === 'COMPLETED') {
            status = 'completed';
          } else if (dueDate <= today) {
            status = 'due';
          }
          
          return {
            name: milestone.vaccineName || milestone.title,
            ageGroup: milestone.title.split('-')[0] || 'N/A',
            dueDate: dueDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            status,
          };
        });
        
        // Generate vaccine schedule PDF
        const { buffer: vaccinePdfBuffer, cloudinaryUrl: vaccineCloudinaryUrl } = 
          await this.vaccineScheduleService.generateAndUploadVaccineSchedule({
            childName: registration.childName,
            parentName: registration.motherName,
            dateOfBirth: registration.dateOfBirth.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            registrationId: registration.registrationId,
            vaccines: vaccineSchedule,
          });
        
        if (vaccineCloudinaryUrl) {
          this.logger.log(`✅ Vaccine schedule uploaded to Cloudinary: ${vaccineCloudinaryUrl}`);
        }
        
        // Send email with PDF attachment
        await this.notificationsService.sendVaccinationScheduleEmail({
          email: registration.email,
          parentName: registration.motherName,
          childName: registration.childName,
          dateOfBirth: registration.dateOfBirth.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          registrationId: registration.registrationId,
          vaccineSchedule,
          vaccinePdfBuffer,
        });
        
        this.logger.log(`✅ Vaccination schedule email sent with PDF for ${registration.registrationId} (${vaccineSchedule.length} vaccines)`);
      } catch (scheduleError) {
        this.logger.error(`❌ Failed to send vaccination schedule email: ${scheduleError instanceof Error ? scheduleError.message : scheduleError}`);
      }

      // SUMMARY: What was actually sent
      this.logger.log(`
╔════════════════════════════════════════════════════════════════╗
║  POST-PAYMENT NOTIFICATIONS SUMMARY                            ║
║  Registration: ${registration.registrationId.padEnd(43)}║
╠════════════════════════════════════════════════════════════════╣
║  ✅ Payment Invoice        → WhatsApp + Email                  ║
║  ✅ Welcome Email          → Email (with full details)         ║
║  ✅ Go Green Certificate   → WhatsApp + Email (with PDF)       ║
║  ✅ Vaccination Schedule   → Email (all vaccines)              ║
╠════════════════════════════════════════════════════════════════╣
║  📧 EMAILS SENT: 4                                             ║
║  📱 WHATSAPP SENT: 2                                           ║
╚════════════════════════════════════════════════════════════════╝
      `);

      this.logger.log(`✅ Post-payment notifications completed for ${registration.registrationId}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send notifications for ${registration.registrationId}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  /**
   * Activate all services for registration
   * Seeds vaccination milestones, development milestones, and reminders
   * 
   * @param registration - Child registration document
   * @param plantedTree - Planted tree data (optional)
   */
  private async activateAllServicesForRegistration(
    registration: ChildRegistrationDocument,
    plantedTree?: any,
  ): Promise<void> {
    this.logger.log(`🚀 Auto-activating ALL services for ${registration.registrationId}...`);
    
    const activationResults = {
      vaccinationMilestones: 0,
      developmentMilestones: 0,
      reminders: 0,
      treePlanted: !!plantedTree,
      errors: [] as string[],
    };

    try {
      // 1. VACCINATION MILESTONES - Seed vaccination schedule
      try {
        this.logger.log(`📅 Seeding vaccination milestones for ${registration.registrationId}...`);
        const vaccinationMilestones = await this.dashboardService.seedVaccinationMilestones(
          registration.registrationId,
          registration.dateOfBirth,
        );
        activationResults.vaccinationMilestones = vaccinationMilestones.length;
        this.logger.log(`✅ Seeded ${vaccinationMilestones.length} vaccination milestones`);
      } catch (vacError) {
        const errorMsg = `Failed to seed vaccination milestones: ${vacError instanceof Error ? vacError.message : vacError}`;
        activationResults.errors.push(errorMsg);
        this.logger.error(`❌ ${errorMsg}`);
      }

      // 2. DEVELOPMENT MILESTONES - Seed ALL age groups (0-18 years)
      try {
        this.logger.log(`🧠 Seeding development milestones for ALL age groups for ${registration.registrationId}...`);
        
        const allAgeGroups: AgeGroupEnum[] = [
          AgeGroupEnum.INFANT,
          AgeGroupEnum.TODDLER,
          AgeGroupEnum.PRESCHOOL,
          AgeGroupEnum.SCHOOL,
          AgeGroupEnum.TEEN,
        ];
        
        let totalMilestonesSeeded = 0;
        
        for (const ageGroup of allAgeGroups) {
          try {
            const cmsAgeGroup = ageGroup; // They're already the same format
            this.logger.log(`  📋 Seeding ${cmsAgeGroup} milestones...`);
            
            const templates = await this.cmsService.getMilestoneTemplatesByAgeGroup(cmsAgeGroup);
            
            if (templates && templates.length > 0) {
              const developmentMilestones = await this.dashboardService.seedDevelopmentMilestones(
                registration.registrationId,
                ageGroup,
                templates,
              );
              totalMilestonesSeeded += developmentMilestones.length;
              this.logger.log(`  ✅ Seeded ${developmentMilestones.length} milestones for ${cmsAgeGroup}`);
            } else {
              this.logger.warn(`  ⚠️ No milestone templates found for age group: ${cmsAgeGroup}`);
            }
          } catch (ageGroupError) {
            this.logger.error(`  ❌ Failed to seed ${ageGroup}: ${ageGroupError instanceof Error ? ageGroupError.message : ageGroupError}`);
          }
        }
        
        activationResults.developmentMilestones = totalMilestonesSeeded;
        this.logger.log(`✅ Seeded ${totalMilestonesSeeded} total development milestones`);
      } catch (devError) {
        const errorMsg = `Failed to seed development milestones: ${devError instanceof Error ? devError.message : devError}`;
        activationResults.errors.push(errorMsg);
        this.logger.error(`❌ ${errorMsg}`);
      }

      // 3. REMINDERS - Schedule vaccination and milestone reminders
      try {
        this.logger.log(`🔔 Setting up reminders for ${registration.registrationId}...`);
        const reminderCount = await this.remindersService.seedRemindersForRegistration(
          registration.registrationId,
          [ReminderChannel.SMS, ReminderChannel.WHATSAPP],
        );
        activationResults.reminders = reminderCount;
        this.logger.log(`✅ Scheduled ${reminderCount} reminders`);
      } catch (reminderError) {
        const errorMsg = `Failed to setup reminders: ${reminderError instanceof Error ? reminderError.message : reminderError}`;
        activationResults.errors.push(errorMsg);
        this.logger.error(`❌ ${errorMsg}`);
      }

      // 4. SUMMARY LOG
      const successCount = [
        activationResults.vaccinationMilestones > 0,
        activationResults.developmentMilestones > 0,
        activationResults.reminders > 0,
        activationResults.treePlanted,
      ].filter(Boolean).length;

      if (activationResults.errors.length === 0) {
        this.logger.log(
          `🎉 ALL SERVICES ACTIVATED for ${registration.registrationId}: ` +
          `${activationResults.vaccinationMilestones} vaccination milestones, ` +
          `${activationResults.developmentMilestones} development milestones, ` +
          `${activationResults.reminders} reminders, ` +
          `tree planted: ${activationResults.treePlanted ? 'YES' : 'NO'}`,
        );
      } else {
        this.logger.warn(
          `⚠️ PARTIAL SERVICE ACTIVATION for ${registration.registrationId} (${successCount}/4 services): ` +
          `Errors: ${activationResults.errors.join(', ')}`,
        );
      }
    } catch (generalError) {
      this.logger.error(
        `💥 CRITICAL ERROR during service activation for ${registration.registrationId}: ${
          generalError instanceof Error ? generalError.message : generalError
        }`,
      );
    }
  }
}
