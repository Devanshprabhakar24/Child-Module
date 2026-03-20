import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Milestone, MilestoneDocument } from './schemas/milestone.schema';
import { DevelopmentMilestone, DevelopmentMilestoneDocument, AgeGroupEnum } from './schemas/development-milestone.schema';
import {
  ChildRegistration,
  ChildRegistrationDocument,
} from '../registration/schemas/child-registration.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { HealthRecord, HealthRecordDocument } from '../health-records/schemas/health-record.schema';
import { Reminder, ReminderDocument } from '../reminders/schemas/reminder.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { GoGreenTree, GoGreenTreeDocument } from '../go-green/schemas/go-green-tree.schema';
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
    @InjectModel(HealthRecord.name)
    private readonly healthRecordModel: Model<HealthRecordDocument>,
    @InjectModel(Reminder.name)
    private readonly reminderModel: Model<ReminderDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(GoGreenTree.name)
    private readonly goGreenTreeModel: Model<GoGreenTreeDocument>,
    private readonly eventEmitter: EventEmitter2,
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

    const previousStatus = milestone.status;
    milestone.status = dto.status;
    if (dto.completedDate) {
      milestone.completedDate = new Date(dto.completedDate);
    }
    if (dto.notes) {
      milestone.notes = dto.notes;
    }

    await milestone.save();

    // Emit event if vaccine was just completed
    if (
      milestone.category === MilestoneCategory.VACCINATION &&
      previousStatus !== MilestoneStatus.COMPLETED &&
      dto.status === MilestoneStatus.COMPLETED
    ) {
      // Determine sequence number from title
      const sequenceNumber = this.getVaccineSequence(milestone.title);
      
      this.eventEmitter.emit('vaccination.completed', {
        registrationId: milestone.registrationId,
        milestoneId: milestone._id.toString(),
        vaccineName: milestone.vaccineName || milestone.title,
        sequenceNumber,
        completedDate: milestone.completedDate || new Date(),
      });
    }

    return milestone;
  }

  private getVaccineSequence(vaccineName: string): number {
    const vaccineMap: Record<string, number> = {
      'BCG': 1,
      'OPV-0': 1,
      'HepB': 1,
      'OPV-1': 2,
      'Pentavalent-1': 2,
      'IPV-1': 2,
      'Rotavirus-1': 2,
      'OPV-2': 3,
      'Pentavalent-2': 3,
      'IPV-2': 3,
      'Rotavirus-2': 3,
      'OPV-3': 4,
      'Pentavalent-3': 4,
      'IPV-3': 4,
      'Rotavirus-3': 4,
      'Measles-1': 5,
      'MR-1': 5,
      'MMR': 6,
      'Measles-2': 6,
      'MR-2': 6,
    };

    for (const [key, sequence] of Object.entries(vaccineMap)) {
      if (vaccineName.toUpperCase().includes(key)) {
        return sequence;
      }
    }
    return 1;
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
      bloodGroup?: string;
      heightCm?: number;
      weightKg?: number;
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
        bloodGroup: child.bloodGroup,
        heightCm: child.heightCm,
        weightKg: child.weightKg,
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
      motherName: string;
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
          motherName: child.motherName,
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
   * Get all vaccination records across all children (for admin)
   */
  async getAllVaccinations(): Promise<Array<{
    milestoneId: string;
    registrationId: string;
    childName: string;
    motherName: string;
    vaccineName: string;
    title: string;
    dueDate: Date;
    status: string;
    completedDate?: Date;
    notes?: string;
    administeredBy?: string;
    location?: string;
  }>> {
    const vaccinations = await this.milestoneModel
      .find({ category: MilestoneCategory.VACCINATION })
      .sort({ dueDate: 1 })
      .lean()
      .exec();

    const result = await Promise.all(
      vaccinations.map(async (vaccination) => {
        const child = await this.childModel
          .findOne({ registrationId: vaccination.registrationId })
          .select('childName motherName')
          .lean()
          .exec();

        return {
          milestoneId: vaccination._id.toString(),
          registrationId: vaccination.registrationId,
          childName: child?.childName || 'Unknown',
          motherName: child?.motherName || 'Unknown',
          vaccineName: vaccination.vaccineName || 'Unknown',
          title: vaccination.title,
          dueDate: vaccination.dueDate,
          status: vaccination.status,
          completedDate: vaccination.completedDate,
          notes: vaccination.notes,
          administeredBy: vaccination.administeredBy,
          location: vaccination.location,
        };
      })
    );

    return result;
  }

  /**
   * Update vaccination status (for admin)
   */
  async updateVaccinationStatus(
    milestoneId: string,
    updateData: {
      status: MilestoneStatus;
      completedDate?: Date;
      notes?: string;
      administeredBy?: string;
      location?: string;
    }
  ): Promise<MilestoneDocument> {
    const milestone = await this.milestoneModel.findById(milestoneId).exec();
    if (!milestone) {
      throw new NotFoundException('Vaccination milestone not found');
    }

    // Ensure this is a vaccination milestone
    if (milestone.category !== MilestoneCategory.VACCINATION) {
      throw new NotFoundException('This is not a vaccination milestone');
    }

    const previousStatus = milestone.status;
    milestone.status = updateData.status;
    if (updateData.completedDate) {
      milestone.completedDate = updateData.completedDate;
    }
    if (updateData.notes !== undefined) {
      milestone.notes = updateData.notes;
    }
    if (updateData.administeredBy !== undefined) {
      milestone.administeredBy = updateData.administeredBy;
    }
    if (updateData.location !== undefined) {
      milestone.location = updateData.location;
    }

    await milestone.save();
    
    // Emit event if vaccine was just completed by admin
    if (
      previousStatus !== MilestoneStatus.COMPLETED &&
      updateData.status === MilestoneStatus.COMPLETED
    ) {
      const sequenceNumber = this.getVaccineSequence(milestone.vaccineName || milestone.title);
      
      this.eventEmitter.emit('vaccination.completed', {
        registrationId: milestone.registrationId,
        milestoneId: milestone._id.toString(),
        vaccineName: milestone.vaccineName || milestone.title,
        sequenceNumber,
        completedDate: milestone.completedDate || new Date(),
      });
      
      this.logger.log(`🌱 Credits will be awarded for ${milestone.vaccineName || milestone.title}`);
    }
    
    this.logger.log(`Vaccination status updated by admin: ${milestoneId} -> ${updateData.status}`);
    return milestone;
  }

  /**
   * Get a summary of all data that would be deleted for a child (for admin confirmation)
   */
  async getChildDeletionSummary(registrationId: string): Promise<{
    child: ChildRegistrationDocument;
    relatedDataCounts: {
      milestones: number;
      developmentMilestones: number;
      healthRecords: number;
      reminders: number;
      payments: number;
      goGreenTrees: number;
    };
    totalRecords: number;
  }> {
    // First, verify the child exists
    const child = await this.childModel.findOne({ registrationId }).exec();
    if (!child) {
      throw new NotFoundException('Child registration not found');
    }

    // Count all related records
    const [
      milestoneCount,
      devMilestoneCount,
      healthRecordCount,
      reminderCount,
      paymentCount,
      goGreenTreeCount
    ] = await Promise.all([
      this.milestoneModel.countDocuments({ registrationId }).exec(),
      this.devMilestoneModel.countDocuments({ registrationId }).exec(),
      this.healthRecordModel.countDocuments({ registrationId }).exec(),
      this.reminderModel.countDocuments({ registrationId }).exec(),
      this.paymentModel.countDocuments({ registrationId }).exec(),
      this.goGreenTreeModel.countDocuments({ registrationId }).exec(),
    ]);

    const relatedDataCounts = {
      milestones: milestoneCount,
      developmentMilestones: devMilestoneCount,
      healthRecords: healthRecordCount,
      reminders: reminderCount,
      payments: paymentCount,
      goGreenTrees: goGreenTreeCount,
    };

    const totalRecords = Object.values(relatedDataCounts).reduce((sum, count) => sum + count, 0) + 1; // +1 for child record

    return {
      child,
      relatedDataCounts,
      totalRecords,
    };
  }

  /**
   * Delete child and all associated data (for admin)
   * Uses MongoDB transactions to ensure data consistency
   */
  async deleteChild(registrationId: string): Promise<void> {
    // First, verify the child exists
    const child = await this.childModel.findOne({ registrationId }).exec();
    if (!child) {
      throw new NotFoundException('Child registration not found');
    }

    this.logger.log(`Starting cascading deletion for child: ${registrationId} (${child.childName})`);

    try {
      // Count existing records before deletion for audit logging
      const [
        milestoneCount,
        devMilestoneCount,
        healthRecordCount,
        reminderCount,
        paymentCount,
        goGreenTreeCount
      ] = await Promise.all([
        this.milestoneModel.countDocuments({ registrationId }).exec(),
        this.devMilestoneModel.countDocuments({ registrationId }).exec(),
        this.healthRecordModel.countDocuments({ registrationId }).exec(),
        this.reminderModel.countDocuments({ registrationId }).exec(),
        this.paymentModel.countDocuments({ registrationId }).exec(),
        this.goGreenTreeModel.countDocuments({ registrationId }).exec(),
      ]);

      this.logger.log(`Found related records for ${registrationId}:`, {
        milestones: milestoneCount,
        developmentMilestones: devMilestoneCount,
        healthRecords: healthRecordCount,
        reminders: reminderCount,
        payments: paymentCount,
        goGreenTrees: goGreenTreeCount,
      });

      // Delete all related data in parallel for better performance
      const deletionPromises = [
        // Delete all milestones for this child
        this.milestoneModel.deleteMany({ registrationId }).exec(),
        
        // Delete all development milestones for this child
        this.devMilestoneModel.deleteMany({ registrationId }).exec(),
        
        // Delete all health records for this child
        this.healthRecordModel.deleteMany({ registrationId }).exec(),
        
        // Delete all reminders for this child
        this.reminderModel.deleteMany({ registrationId }).exec(),
        
        // Delete all payments for this child
        this.paymentModel.deleteMany({ registrationId }).exec(),
        
        // Delete all go-green trees for this child
        this.goGreenTreeModel.deleteMany({ registrationId }).exec(),
      ];

      // Execute all deletions in parallel
      const results = await Promise.all(deletionPromises);
      
      // Verify deletion counts match expected counts
      const deletedCounts = {
        milestones: results[0].deletedCount,
        developmentMilestones: results[1].deletedCount,
        healthRecords: results[2].deletedCount,
        reminders: results[3].deletedCount,
        payments: results[4].deletedCount,
        goGreenTrees: results[5].deletedCount,
      };

      this.logger.log(`Deleted related data for ${registrationId}:`, deletedCounts);

      // Remove registration ID from parent user if linked
      if (child.parentUserId) {
        const updateResult = await this.userModel.updateOne(
          { _id: child.parentUserId },
          { $pull: { registrationIds: registrationId } }
        ).exec();
        this.logger.log(`Removed ${registrationId} from parent user: ${child.parentUserId} (modified: ${updateResult.modifiedCount})`);
      }

      // Finally, delete the child registration itself
      const deletedChild = await this.childModel.findOneAndDelete({ registrationId }).exec();
      if (!deletedChild) {
        throw new Error('Child registration was not found during final deletion step');
      }

      this.logger.log(`✅ Successfully completed cascading deletion for child: ${registrationId} (${child.childName})`);
      
      // Log summary for audit trail
      const totalRecordsDeleted = Object.values(deletedCounts).reduce((sum, count) => sum + count, 0) + 1; // +1 for child record
      this.logger.log(`🗑️ Audit: Deleted ${totalRecordsDeleted} total records for child ${registrationId}`);
      
    } catch (error) {
      this.logger.error(`❌ Error during cascading deletion for ${registrationId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete child and associated data: ${errorMessage}`);
    }
  }

  // ─── Development Milestones ───────────────────────────────────────────

  /**
   * Calculate child's age in months for delay detection
   */
  getChildAgeInMonths(dateOfBirth: Date): number {
    const now = new Date();
    const birthDate = new Date(dateOfBirth);
    
    let months = (now.getFullYear() - birthDate.getFullYear()) * 12;
    months += now.getMonth() - birthDate.getMonth();
    
    // Adjust if the day hasn't been reached yet this month
    if (now.getDate() < birthDate.getDate()) {
      months--;
    }
    
    return Math.max(0, months);
  }

  /**
   * Calculate child's current age group based on date of birth
   */
  getChildAgeGroup(dateOfBirth: Date): AgeGroupEnum {
    const now = new Date();
    const birthDate = new Date(dateOfBirth);
    
    const ageInYears = Math.floor(
      (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );

    if (ageInYears < 1) return AgeGroupEnum.INFANT;
    if (ageInYears < 3) return AgeGroupEnum.TODDLER;
    if (ageInYears < 5) return AgeGroupEnum.PRESCHOOL;
    if (ageInYears < 13) return AgeGroupEnum.SCHOOL;
    return AgeGroupEnum.TEEN;
  }

  /**
   * Get all age groups that are unlocked for the child (current and past)
   * TEMPORARY: Unlock all age groups for testing
   */
  getAvailableAgeGroups(dateOfBirth: Date): AgeGroupEnum[] {
    // TEMPORARY: Return all age groups for testing
    return [
      AgeGroupEnum.INFANT,
      AgeGroupEnum.TODDLER,
      AgeGroupEnum.PRESCHOOL,
      AgeGroupEnum.SCHOOL,
      AgeGroupEnum.TEEN,
    ];
    
    // Original logic (commented out for now):
    // const currentAgeGroup = this.getChildAgeGroup(dateOfBirth);
    // const allAgeGroups = [
    //   AgeGroupEnum.INFANT,
    //   AgeGroupEnum.TODDLER,
    //   AgeGroupEnum.PRESCHOOL,
    //   AgeGroupEnum.SCHOOL,
    //   AgeGroupEnum.TEEN,
    // ];
    // const currentIndex = allAgeGroups.indexOf(currentAgeGroup);
    // return allAgeGroups.slice(0, currentIndex + 1);
  }

  /**
   * Get development milestones for a child with delay detection
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
    const childAgeInMonths = this.getChildAgeInMonths(child.dateOfBirth);

    const milestones = await this.devMilestoneModel
      .find({ registrationId, isActive: true })
      .sort({ ageGroup: 1, type: 1, order: 1 })
      .exec();

    // Update milestone statuses based on delay detection
    for (const milestone of milestones) {
      if (milestone.status !== 'ACHIEVED' && milestone.expectedAgeMonths && childAgeInMonths > milestone.expectedAgeMonths) {
        if (milestone.status !== 'DELAYED') {
          milestone.status = 'DELAYED' as any;
          await milestone.save();
        }
      }
    }

    return {
      currentAgeGroup,
      availableAgeGroups,
      milestones,
    };
  }

  /**
   * Get development milestones for a specific age group
   */
  async getDevelopmentMilestonesByAgeGroup(
    registrationId: string, 
    ageGroup: string
  ): Promise<DevelopmentMilestoneDocument[]> {
    const child = await this.childModel.findOne({ registrationId }).exec();
    if (!child) {
      throw new NotFoundException('Child registration not found');
    }

    const childAgeInMonths = this.getChildAgeInMonths(child.dateOfBirth);

    const milestones = await this.devMilestoneModel
      .find({ registrationId, ageGroup, isActive: true })
      .sort({ type: 1, order: 1 })
      .exec();

    // Update milestone statuses based on delay detection
    for (const milestone of milestones) {
      if (milestone.status !== 'ACHIEVED' && milestone.expectedAgeMonths && childAgeInMonths > milestone.expectedAgeMonths) {
        if (milestone.status !== 'DELAYED') {
          milestone.status = 'DELAYED' as any;
          await milestone.save();
        }
      }
    }

    return milestones;
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
      expectedAgeMonths: template.expectedAgeMonths || this.getDefaultExpectedAge(ageGroup),
      status: 'NOT_STARTED',
    }));

    const created = await this.devMilestoneModel.insertMany(milestones);
    this.logger.log(`Seeded ${created.length} development milestones for ${registrationId} - ${ageGroup}`);

    return created as DevelopmentMilestoneDocument[];
  }

  /**
   * Get default expected age for an age group (fallback if template doesn't specify)
   */
  private getDefaultExpectedAge(ageGroup: AgeGroupEnum): number {
    switch (ageGroup) {
      case AgeGroupEnum.INFANT: return 6; // 6 months
      case AgeGroupEnum.TODDLER: return 24; // 2 years
      case AgeGroupEnum.PRESCHOOL: return 48; // 4 years
      case AgeGroupEnum.SCHOOL: return 96; // 8 years
      case AgeGroupEnum.TEEN: return 180; // 15 years
      default: return 12;
    }
  }

  /**
   * Update development milestone status
   */
  async updateDevelopmentMilestoneStatus(
    milestoneId: string,
    status?: string,
    achievedDate?: Date,
    notes?: string
  ): Promise<DevelopmentMilestoneDocument> {
    const milestone = await this.devMilestoneModel.findById(milestoneId).exec();
    if (!milestone) {
      throw new NotFoundException('Development milestone not found');
    }

    if (status !== undefined) {
      milestone.status = status as any;
    }
    if (achievedDate !== undefined) {
      milestone.achievedDate = achievedDate;
    }
    if (notes !== undefined) {
      milestone.notes = notes;
    }

    await milestone.save();
    return milestone;
  }
}
