import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Milestone, MilestoneDocument } from './schemas/milestone.schema';
import { DevelopmentMilestone, DevelopmentMilestoneDocument, AgeGroupEnum } from './schemas/development-milestone.schema';
import {
  ChildRegistration,
  ChildRegistrationDocument,
} from '../registration/schemas/child-registration.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import {
  CreateMilestoneDto,
  UpdateMilestoneStatusDto,
  MilestoneCategory,
  MilestoneStatus,
} from '@wombto18/shared';
import { VACCINATION_SCHEDULE, calculateDueDate } from './data/vaccination-schedule';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectModel(Milestone.name)
    private readonly milestoneModel: Model<MilestoneDocument>,
    @InjectModel(DevelopmentMilestone.name)
    private readonly devMilestoneModel: Model<DevelopmentMilestoneDocument>,
    @InjectModel(ChildRegistration.name)
    private readonly childModel: Model<ChildRegistrationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // ─── Seed Vaccination Schedule ────────────────────────────────────────

  /**
   * Auto-seeds the standard vaccination milestones for a newly registered child
   * based on the Indian NIS/IAP schedule.
   */
  async seedVaccinationMilestones(registrationId: string, dob: Date): Promise<MilestoneDocument[]> {
    const existing = await this.milestoneModel.countDocuments({
      registrationId,
      category: MilestoneCategory.VACCINATION,
    });

    if (existing > 0) {
      this.logger.log(`Vaccination milestones already seeded for ${registrationId}`);
      return this.milestoneModel.find({
        registrationId,
        category: MilestoneCategory.VACCINATION,
      }).exec();
    }

    const milestones = VACCINATION_SCHEDULE.map((vaccine) => ({
      registrationId,
      title: vaccine.title,
      description: vaccine.description,
      category: MilestoneCategory.VACCINATION,
      status: MilestoneStatus.UPCOMING,
      dueDate: calculateDueDate(dob, vaccine.ageInMonths),
      vaccineName: vaccine.vaccineName,
    }));

    const created = await this.milestoneModel.insertMany(milestones);
    this.logger.log(`Seeded ${created.length} vaccination milestones for ${registrationId}`);

    return created as MilestoneDocument[];
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────

  async createMilestone(dto: CreateMilestoneDto): Promise<MilestoneDocument> {
    return this.milestoneModel.create({
      registrationId: dto.registrationId,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      dueDate: new Date(dto.dueDate),
      vaccineName: dto.vaccineName,
      status: MilestoneStatus.UPCOMING,
    });
  }

  async updateMilestoneStatus(
    milestoneId: string,
    dto: UpdateMilestoneStatusDto,
  ): Promise<MilestoneDocument> {
    const milestone = await this.milestoneModel.findById(milestoneId).exec();
    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    milestone.status = dto.status;
    if (dto.completedDate) {
      milestone.completedDate = new Date(dto.completedDate);
    }
    if (dto.notes) {
      milestone.notes = dto.notes;
    }

    await milestone.save();
    return milestone;
  }

  // ─── Dashboard Queries ────────────────────────────────────────────────

  async getMilestonesByRegistrationId(registrationId: string): Promise<MilestoneDocument[]> {
    return this.milestoneModel
      .find({ registrationId })
      .sort({ dueDate: 1 })
      .exec();
  }

  async getUpcomingMilestones(registrationId: string): Promise<MilestoneDocument[]> {
    return this.milestoneModel
      .find({
        registrationId,
        status: { $in: [MilestoneStatus.UPCOMING, MilestoneStatus.DUE] },
      })
      .sort({ dueDate: 1 })
      .exec();
  }

  async getVaccinationTracker(registrationId: string): Promise<{
    total: number;
    completed: number;
    upcoming: number;
    missed: number;
    milestones: MilestoneDocument[];
  }> {
    const milestones = await this.milestoneModel
      .find({ registrationId, category: MilestoneCategory.VACCINATION })
      .sort({ dueDate: 1 })
      .exec();

    const now = new Date();

    // Auto-update statuses: mark overdue UPCOMING milestones as DUE or MISSED
    for (const m of milestones) {
      if (m.status === MilestoneStatus.UPCOMING && m.dueDate <= now) {
        const daysPastDue = Math.floor(
          (now.getTime() - m.dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        m.status = daysPastDue > 30 ? MilestoneStatus.MISSED : MilestoneStatus.DUE;
        await m.save();
      }
    }

    return {
      total: milestones.length,
      completed: milestones.filter((m) => m.status === MilestoneStatus.COMPLETED).length,
      upcoming: milestones.filter(
        (m) => m.status === MilestoneStatus.UPCOMING || m.status === MilestoneStatus.DUE,
      ).length,
      missed: milestones.filter((m) => m.status === MilestoneStatus.MISSED).length,
      milestones,
    };
  }

  async getDueMilestones(date: Date): Promise<MilestoneDocument[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.milestoneModel
      .find({
        dueDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: [MilestoneStatus.UPCOMING, MilestoneStatus.DUE] },
      })
      .exec();
  }

  // ─── Full Child Dashboard ─────────────────────────────────────────────

  /**
   * Returns the complete dashboard data for a child including:
   * profile, vaccination tracker, upcoming milestones, green cohort status.
   */
  async getChildDashboard(registrationId: string): Promise<{
    profile: {
      registrationId: string;
      childName: string;
      childGender: string;
      dateOfBirth: Date;
      ageGroup: string;
      ageInYears: number;
      profilePictureUrl?: string;
      motherName: string;
      fatherName?: string;
      phone: string;
      phone2?: string;
      address?: string;
      state: string;
      greenCohort: boolean;
      linkedSchoolId?: string;
    };
    vaccinationTracker: Awaited<ReturnType<DashboardService['getVaccinationTracker']>>;
    upcomingMilestones: MilestoneDocument[];
  }> {
    const child = await this.childModel.findOne({ registrationId }).exec();
    if (!child) {
      throw new NotFoundException('Child registration not found');
    }

    const [vaccinationTracker, upcomingMilestones] = await Promise.all([
      this.getVaccinationTracker(registrationId),
      this.getUpcomingMilestones(registrationId),
    ]);

    // Calculate current age dynamically
    const currentAge = Math.floor(
      (Date.now() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );

    return {
      profile: {
        registrationId: child.registrationId,
        childName: child.childName,
        childGender: child.childGender,
        dateOfBirth: child.dateOfBirth,
        ageGroup: child.ageGroup,
        ageInYears: currentAge,
        profilePictureUrl: child.profilePictureUrl,
        motherName: child.motherName,
        fatherName: child.fatherName,
        phone: child.phone,
        phone2: child.phone2,
        address: child.address,
        state: child.state,
        greenCohort: child.greenCohort,
        linkedSchoolId: child.linkedSchoolId,
      },
      vaccinationTracker,
      upcomingMilestones,
    };
  }

  // ─── Family Dashboard ────────────────────────────────────────────────

  /**
   * Returns all children under a parent's account for the family dashboard.
   * Parents can toggle between child profiles.
   */
  async getFamilyDashboard(parentUserId: string): Promise<{
    children: Array<{
      registrationId: string;
      childName: string;
      childGender: string;
      ageGroup: string;
      ageInYears: number;
      profilePictureUrl?: string;
      nextDueMilestone?: { title: string; dueDate: Date } | null;
    }>;
    totalChildren: number;
  }> {
    const user = await this.userModel.findById(parentUserId).exec();

    // Find children by registrationIds in user document OR by parentUserId on child records
    // Also fall back to email match for children registered before account linking
    const query: any[] = [{ parentUserId }];
    if (user && user.registrationIds.length > 0) {
      query.push({ registrationId: { $in: user.registrationIds } });
    }
    if (user?.email) {
      query.push({ email: user.email });
    }

    const children = await this.childModel
      .find({ $or: query })
      .exec();

    if (children.length === 0) {
      return { children: [], totalChildren: 0 };
    }

    const result = await Promise.all(
      children.map(async (child) => {
        const nextDue = await this.milestoneModel
          .findOne({
            registrationId: child.registrationId,
            status: { $in: [MilestoneStatus.UPCOMING, MilestoneStatus.DUE] },
          })
          .sort({ dueDate: 1 })
          .select('title dueDate')
          .lean()
          .exec();

        // Calculate current age dynamically
        const currentAge = Math.floor(
          (Date.now() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
        );

        return {
          registrationId: child.registrationId,
          childName: child.childName,
          childGender: child.childGender,
          dateOfBirth: child.dateOfBirth,
          ageGroup: child.ageGroup,
          ageInYears: currentAge,
          state: child.state,
          profilePictureUrl: child.profilePictureUrl,
          nextDueMilestone: nextDue ? { title: nextDue.title, dueDate: nextDue.dueDate } : null,
        };
      }),
    );

    return { children: result, totalChildren: result.length };
  }

  // ─── Update Profile Picture ───────────────────────────────────────────

  async updateProfilePicture(registrationId: string, imageUrl: string): Promise<ChildRegistrationDocument> {
    const child = await this.childModel.findOne({ registrationId }).exec();
    if (!child) {
      throw new NotFoundException('Child registration not found');
    }

    child.profilePictureUrl = imageUrl;
    await child.save();

    this.logger.log(`Profile picture updated for ${registrationId}`);
    return child;
  }

  // ─── Admin Methods ────────────────────────────────────────────────────

  /**
   * Get all children in the system (for admin)
   */
  async getAllChildren(): Promise<Array<{
    registrationId: string;
    childName: string;
    childGender: string;
    dateOfBirth: Date;
    ageGroup: string;
    state: string;
    motherName: string;
    phone: string;
    email: string;
    paymentStatus: string;
    profilePictureUrl?: string;
  }>> {
    const children = await this.childModel
      .find()
      .select('registrationId childName childGender dateOfBirth ageGroup state motherName phone email paymentStatus profilePictureUrl')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return children as any[];
  }

  /**
   * Get system-wide statistics (for admin dashboard)
   */
  async getAdminStats(): Promise<{
    totalChildren: number;
    totalVaccinations: number;
    dueVaccinations: number;
    completedVaccinations: number;
    missedVaccinations: number;
  }> {
    // Count total children
    const totalChildren = await this.childModel.countDocuments().exec();

    // Count all vaccination milestones
    const allMilestones = await this.milestoneModel
      .find({ category: MilestoneCategory.VACCINATION })
      .exec();

    const totalVaccinations = allMilestones.length;
    const completedVaccinations = allMilestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
    const dueVaccinations = allMilestones.filter(
      m => m.status === MilestoneStatus.UPCOMING || m.status === MilestoneStatus.DUE
    ).length;
    const missedVaccinations = allMilestones.filter(m => m.status === MilestoneStatus.MISSED).length;

    return {
      totalChildren,
      totalVaccinations,
      dueVaccinations,
      completedVaccinations,
      missedVaccinations,
    };
  }

  /**
   * Delete a child and all associated data (milestones, reminders, etc.)
   */
  async deleteChild(registrationId: string): Promise<void> {
    // Delete child registration
    const child = await this.childModel.findOneAndDelete({ registrationId }).exec();
    if (!child) {
      throw new NotFoundException('Child registration not found');
    }

    // Delete all milestones for this child
    await this.milestoneModel.deleteMany({ registrationId }).exec();

    // Delete all development milestones for this child
    await this.devMilestoneModel.deleteMany({ registrationId }).exec();

    // Remove registration ID from parent user
    if (child.parentUserId) {
      await this.userModel.updateOne(
        { _id: child.parentUserId },
        { $pull: { registrationIds: registrationId } }
      ).exec();
    }

    this.logger.log(`Child deleted: ${registrationId}`);
  }

  // ─── Development Milestones ───────────────────────────────────────────

  /**
   * Calculate child's current age group based on date of birth
   */
  getChildAgeGroup(dateOfBirth: Date): AgeGroupEnum {
    const ageInYears = Math.floor(
      (Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );

    if (ageInYears < 1) return AgeGroupEnum.INFANT;
    if (ageInYears < 3) return AgeGroupEnum.TODDLER;
    if (ageInYears < 5) return AgeGroupEnum.PRESCHOOL;
    if (ageInYears < 13) return AgeGroupEnum.SCHOOL;
    return AgeGroupEnum.TEEN;
  }

  /**
   * Get all age groups that are unlocked for the child (current and past)
   */
  getAvailableAgeGroups(dateOfBirth: Date): AgeGroupEnum[] {
    const currentAgeGroup = this.getChildAgeGroup(dateOfBirth);
    const allAgeGroups = [
      AgeGroupEnum.INFANT,
      AgeGroupEnum.TODDLER,
      AgeGroupEnum.PRESCHOOL,
      AgeGroupEnum.SCHOOL,
      AgeGroupEnum.TEEN,
    ];

    const currentIndex = allAgeGroups.indexOf(currentAgeGroup);
    return allAgeGroups.slice(0, currentIndex + 1);
  }

  /**
   * Get development milestones for a child
   */
  async getDevelopmentMilestones(registrationId: string): Promise<{
    currentAgeGroup: AgeGroupEnum;
    availableAgeGroups: AgeGroupEnum[];
    milestones: DevelopmentMilestoneDocument[];
  }> {
    const child = await this.childModel.findOne({ registrationId }).exec();
    if (!child) {
      throw new NotFoundException('Child registration not found');
    }

    const currentAgeGroup = this.getChildAgeGroup(child.dateOfBirth);
    const availableAgeGroups = this.getAvailableAgeGroups(child.dateOfBirth);

    const milestones = await this.devMilestoneModel
      .find({ registrationId, isActive: true })
      .sort({ ageGroup: 1, type: 1, order: 1 })
      .exec();

    return {
      currentAgeGroup,
      availableAgeGroups,
      milestones,
    };
  }

  /**
   * Seed development milestones from templates for a specific age group
   */
  async seedDevelopmentMilestones(
    registrationId: string,
    ageGroup: AgeGroupEnum,
    templates: any[]
  ): Promise<DevelopmentMilestoneDocument[]> {
    // Check if milestones already exist for this age group
    const existing = await this.devMilestoneModel.countDocuments({
      registrationId,
      ageGroup,
    });

    if (existing > 0) {
      this.logger.log(`Development milestones already seeded for ${registrationId} - ${ageGroup}`);
      return this.devMilestoneModel.find({ registrationId, ageGroup }).exec();
    }

    // Create milestones from templates
    const milestones = templates.map((template) => ({
      registrationId,
      ageGroup,
      title: template.title,
      description: template.description,
      type: template.type,
      order: template.order,
      status: 'NOT_STARTED',
    }));

    const created = await this.devMilestoneModel.insertMany(milestones);
    this.logger.log(`Seeded ${created.length} development milestones for ${registrationId} - ${ageGroup}`);

    return created as DevelopmentMilestoneDocument[];
  }

  /**
   * Update development milestone status
   */
  async updateDevelopmentMilestoneStatus(
    milestoneId: string,
    status: string,
    achievedDate?: Date,
    notes?: string
  ): Promise<DevelopmentMilestoneDocument> {
    const milestone = await this.devMilestoneModel.findById(milestoneId).exec();
    if (!milestone) {
      throw new NotFoundException('Development milestone not found');
    }

    milestone.status = status as any;
    if (achievedDate) {
      milestone.achievedDate = achievedDate;
    }
    if (notes !== undefined) {
      milestone.notes = notes;
    }

    await milestone.save();
    return milestone;
  }
}
