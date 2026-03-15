import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Milestone, MilestoneDocument } from './schemas/milestone.schema';
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
}
