import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';

import { ChannelPartner, ChannelPartnerDocument } from './schemas/channel-partner.schema';
import {
  RegisterChannelPartnerDto,
  COMMISSION,
  COMMISSION_TARGETS,
} from '@wombto18/shared';

@Injectable()
export class ChannelPartnerService {
  private readonly logger = new Logger(ChannelPartnerService.name);
  private readonly baseUrl: string;

  constructor(
    @InjectModel(ChannelPartner.name)
    private readonly partnerModel: Model<ChannelPartnerDocument>,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('APP_BASE_URL') ?? 'https://wombto18.com';
  }

  // ─── Register Channel Partner ─────────────────────────────────────────

  async registerPartner(dto: RegisterChannelPartnerDto): Promise<ChannelPartnerDocument> {
    const existing = await this.partnerModel.findOne({ email: dto.email }).exec();
    if (existing) {
      throw new ConflictException('Channel partner with this email already exists');
    }

    const partnerId = await this.generatePartnerId();

    const partner = await this.partnerModel.create({
      partnerId,
      partnerName: dto.partnerName,
      organizationName: dto.organizationName,
      email: dto.email,
      phone: dto.phone,
      region: dto.region,
      qrCodeUrl: `${this.baseUrl}/register?partner=${partnerId}`,
    });

    this.logger.log(`Registered channel partner: ${partnerId} | QR: ${partner.qrCodeUrl}`);
    return partner;
  }

  // ─── Partner Lookup ───────────────────────────────────────────────────

  async getPartnerById(partnerId: string): Promise<ChannelPartnerDocument> {
    const partner = await this.partnerModel.findOne({ partnerId }).exec();
    if (!partner) {
      throw new NotFoundException('Channel partner not found');
    }
    return partner;
  }

  async getPartnerByEmail(email: string): Promise<ChannelPartnerDocument | null> {
    return this.partnerModel.findOne({ email }).exec();
  }

  // ─── Assign / Unassign Registrations ──────────────────────────────────

  async assignRegistration(partnerId: string, registrationId: string): Promise<ChannelPartnerDocument> {
    const partner = await this.getPartnerById(partnerId);
    if (!partner.assignedRegistrationIds.includes(registrationId)) {
      partner.assignedRegistrationIds.push(registrationId);
      await partner.save();
    }
    return partner;
  }

  async unassignRegistration(partnerId: string, registrationId: string): Promise<ChannelPartnerDocument> {
    const partner = await this.getPartnerById(partnerId);
    partner.assignedRegistrationIds = partner.assignedRegistrationIds.filter(
      (id) => id !== registrationId,
    );
    await partner.save();
    return partner;
  }

  // ─── Partner Dashboard (Contact details redacted) ─────────────────────

  /**
   * Returns assigned child registrations with parent contact info
   * REDACTED (greyed out / hidden) to prevent data misuse.
   */
  async getPartnerDashboard(partnerId: string): Promise<{
    partner: ChannelPartnerDocument;
    assignedCount: number;
    registrationIds: string[];
  }> {
    const partner = await this.getPartnerById(partnerId);

    return {
      partner,
      assignedCount: partner.assignedRegistrationIds.length,
      registrationIds: partner.assignedRegistrationIds,
    };
  }

  // ─── List Partners ────────────────────────────────────────────────────

  async listPartners(): Promise<ChannelPartnerDocument[]> {
    return this.partnerModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  // ─── ID Generation ────────────────────────────────────────────────────

  private async generatePartnerId(): Promise<string> {
    const today = new Date();
    const dateStr =
      String(today.getFullYear()) +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0');

    const prefix = `CP-${dateStr}`;

    const lastPartner = await this.partnerModel
      .findOne({ partnerId: { $regex: `^${prefix}` } })
      .sort({ partnerId: -1 })
      .exec();

    let seq = 1;
    if (lastPartner) {
      const lastSeq = parseInt(lastPartner.partnerId.split('-').pop() ?? '0', 10);
      seq = lastSeq + 1;
    }

    return `${prefix}-${String(seq).padStart(4, '0')}`;
  }

  // ─── Commission Tracking ──────────────────────────────────────────────

  /**
   * Records a child registration and calculates commission.
   * Commission is unlocked based on target tiers:
   * - State: 3000 registrations
   * - District: 1000 registrations
   * - Individual: 300 registrations
   * Flat commission: ₹175-225 per child, ₹25 per maternal
   */
  async recordChildRegistration(
    partnerId: string,
    registrationId: string,
  ): Promise<{ commission: number; targetReached: boolean }> {
    const partner = await this.getPartnerById(partnerId);

    if (!partner.assignedRegistrationIds.includes(registrationId)) {
      partner.assignedRegistrationIds.push(registrationId);
    }

    partner.totalChildRegistrations += 1;

    // Check if commission target is reached
    const individualTarget = partner.totalChildRegistrations >= COMMISSION_TARGETS.INDIVIDUAL;
    if (individualTarget && !partner.commissionUnlocked) {
      partner.commissionUnlocked = true;
      this.logger.log(
        `Commission unlocked for partner ${partnerId} — reached ${COMMISSION_TARGETS.INDIVIDUAL} registrations`,
      );
    }

    // Add commission if unlocked
    const commissionAmount = partner.commissionUnlocked
      ? (partner.childCommissionRate || COMMISSION.CHILD_REGISTRATION.flat)
      : 0;

    partner.totalEarnedCommission += commissionAmount;
    await partner.save();

    return {
      commission: commissionAmount,
      targetReached: partner.commissionUnlocked,
    };
  }

  async recordMaternalRegistration(
    partnerId: string,
  ): Promise<{ commission: number }> {
    const partner = await this.getPartnerById(partnerId);
    partner.totalMaternalRegistrations += 1;

    const commissionAmount = partner.commissionUnlocked
      ? COMMISSION.MATERNAL_REGISTRATION.flat
      : 0;

    partner.totalEarnedCommission += commissionAmount;
    await partner.save();

    return { commission: commissionAmount };
  }

  /**
   * Returns commission summary for a partner.
   */
  async getCommissionSummary(partnerId: string): Promise<{
    totalChildRegistrations: number;
    totalMaternalRegistrations: number;
    commissionUnlocked: boolean;
    totalEarned: number;
    claimed: number;
    pending: number;
    targetProgress: {
      individual: { target: number; current: number; reached: boolean };
      district: { target: number; current: number; reached: boolean };
      state: { target: number; current: number; reached: boolean };
    };
  }> {
    const partner = await this.getPartnerById(partnerId);
    const total = partner.totalChildRegistrations;

    return {
      totalChildRegistrations: total,
      totalMaternalRegistrations: partner.totalMaternalRegistrations,
      commissionUnlocked: partner.commissionUnlocked,
      totalEarned: partner.totalEarnedCommission,
      claimed: partner.claimedCommission,
      pending: partner.totalEarnedCommission - partner.claimedCommission,
      targetProgress: {
        individual: {
          target: COMMISSION_TARGETS.INDIVIDUAL,
          current: total,
          reached: total >= COMMISSION_TARGETS.INDIVIDUAL,
        },
        district: {
          target: COMMISSION_TARGETS.DISTRICT,
          current: total,
          reached: total >= COMMISSION_TARGETS.DISTRICT,
        },
        state: {
          target: COMMISSION_TARGETS.STATE,
          current: total,
          reached: total >= COMMISSION_TARGETS.STATE,
        },
      },
    };
  }

  /**
   * Returns partner dashboard data with child details redacted (no email/phone).
   */
  async getPartnerDashboardWithNextDue(partnerId: string): Promise<{
    partner: { partnerId: string; partnerName: string; organizationName: string; qrCodeUrl?: string };
    assignedCount: number;
    registrationIds: string[];
    commissionSummary: Awaited<ReturnType<ChannelPartnerService['getCommissionSummary']>>;
  }> {
    const partner = await this.getPartnerById(partnerId);
    const commissionSummary = await this.getCommissionSummary(partnerId);

    return {
      partner: {
        partnerId: partner.partnerId,
        partnerName: partner.partnerName,
        organizationName: partner.organizationName,
        qrCodeUrl: partner.qrCodeUrl,
      },
      assignedCount: partner.assignedRegistrationIds.length,
      registrationIds: partner.assignedRegistrationIds,
      commissionSummary,
    };
  }
}
