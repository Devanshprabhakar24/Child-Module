import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { MilestoneCategory, MilestoneStatus } from '../enums/milestone.enum';

export class CreateMilestoneDto {
  @IsString()
  @IsNotEmpty()
  registrationId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(MilestoneCategory)
  @IsNotEmpty()
  category!: MilestoneCategory;

  @IsDateString()
  @IsNotEmpty()
  dueDate!: string;

  /** e.g., vaccine name like BCG, OPV, DPT */
  @IsOptional()
  @IsString()
  vaccineName?: string;
}

export class UpdateMilestoneStatusDto {
  @IsEnum(MilestoneStatus)
  @IsNotEmpty()
  status!: MilestoneStatus;

  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
