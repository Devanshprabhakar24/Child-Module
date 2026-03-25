import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GoGreenService } from './go-green.service';
import { CreditType } from './schemas/credit-transaction.schema';

export interface VaccinationCompletedEvent {
  registrationId: string;
  milestoneId: string;
  vaccineName: string;
  sequenceNumber: number;
  completedDate: Date;
}

@Injectable()
export class CreditAwardListener {
  private readonly logger = new Logger(CreditAwardListener.name);

  constructor(private readonly goGreenService: GoGreenService) {}

  @OnEvent('vaccination.completed')
  async handleVaccinationCompleted(payload: VaccinationCompletedEvent) {
    this.logger.log(
      `Vaccination completed event received: ${payload.vaccineName} for ${payload.registrationId}`,
    );

    try {
      // Check if credits were already awarded for this specific vaccine
      const existingTransaction = await this.goGreenService.checkIfVaccineCredited(
        payload.registrationId,
        payload.milestoneId
      );

      if (existingTransaction) {
        this.logger.warn(
          `Credits already awarded for vaccine ${payload.vaccineName} (milestone: ${payload.milestoneId}). Skipping duplicate credit award.`
        );
        return;
      }

      // Get the vaccine milestone and child registration to check dates
      const [milestone, childRegistration] = await Promise.all([
        this.goGreenService.getVaccineMilestone(payload.milestoneId),
        this.goGreenService.getChildRegistration(payload.registrationId)
      ]);
      
      if (!milestone) {
        this.logger.error(`Vaccine milestone not found: ${payload.milestoneId}`);
        return;
      }

      if (!childRegistration) {
        this.logger.error(`Child registration not found: ${payload.registrationId}`);
        return;
      }

      // Get registration date (when child was registered in the system)
      const registrationDate = new Date(childRegistration.createdAt);
      registrationDate.setHours(0, 0, 0, 0);
      
      const vaccineDueDate = new Date(milestone.dueDate);
      vaccineDueDate.setHours(0, 0, 0, 0);

      // OLD VACCINE: Due date is BEFORE registration date (past vaccine at time of registration)
      // NEW VACCINE: Due date is ON or AFTER registration date (upcoming vaccine at time of registration)
      if (vaccineDueDate < registrationDate) {
        this.logger.warn(
          `Vaccine ${payload.vaccineName} was due on ${vaccineDueDate.toDateString()} ` +
          `(BEFORE registration date ${registrationDate.toDateString()}). ` +
          `This is an OLD vaccine. Credits will NOT be awarded. ` +
          `Only NEW/UPCOMING vaccines (due on or after registration date) earn credits.`
        );
        return;
      }

      // Award credits only for NEW vaccines (due on or after registration date)
      const creditAmount = this.goGreenService.calculateVaccineCredits(payload.sequenceNumber);

      await this.goGreenService.awardCredits({
        registrationId: payload.registrationId,
        amount: creditAmount,
        type: CreditType.VACCINATION,
        description: `${payload.vaccineName} Vaccine Completed`,
        metadata: {
          vaccineId: payload.milestoneId,
          vaccineName: payload.vaccineName,
          sequenceNumber: payload.sequenceNumber,
          completedDate: payload.completedDate,
          dueDate: milestone.dueDate,
          registrationDate: childRegistration.createdAt,
        },
      });

      this.logger.log(
        `✅ Credits awarded: ${creditAmount} to ${payload.registrationId} for ${payload.vaccineName} ` +
        `(NEW vaccine - due: ${vaccineDueDate.toDateString()}, registered: ${registrationDate.toDateString()})`,
      );

      if (payload.sequenceNumber === 6) {
        this.logger.log(`Series completion bonus for ${payload.registrationId}`);
        
        await this.goGreenService.awardCredits({
          registrationId: payload.registrationId,
          amount: 200,
          type: CreditType.BONUS,
          description: 'Primary Vaccination Series Completion Bonus',
          metadata: {
            bonusType: 'SERIES_COMPLETE',
            vaccineId: payload.milestoneId,
          },
        });
      }
    } catch (error) {
      this.logger.error('Error awarding credits for vaccination:', error);
    }
  }

  @OnEvent('health-record.uploaded')
  async handleHealthRecordUploaded(payload: {
    registrationId: string;
    recordId: string;
    category: string;
  }) {
    this.logger.log(
      `Health record uploaded event received: ${payload.category} for ${payload.registrationId}`,
    );

    try {
      await this.goGreenService.awardCredits({
        registrationId: payload.registrationId,
        amount: 10,
        type: CreditType.HEALTH_RECORD,
        description: `Health Record Uploaded: ${payload.category}`,
        metadata: {
          recordId: payload.recordId,
          category: payload.category,
        },
      });
    } catch (error) {
      this.logger.error('Error awarding credits for health record:', error);
    }
  }

  @OnEvent('profile.completed')
  async handleProfileCompleted(payload: { registrationId: string }) {
    this.logger.log(`Profile completed event received: ${payload.registrationId}`);

    try {
      await this.goGreenService.awardCredits({
        registrationId: payload.registrationId,
        amount: 50,
        type: CreditType.ENGAGEMENT,
        description: 'Profile Completed',
        metadata: {
          milestoneType: 'PROFILE_COMPLETE',
        },
      });
    } catch (error) {
      this.logger.error('Error awarding credits for profile completion:', error);
    }
  }
}
