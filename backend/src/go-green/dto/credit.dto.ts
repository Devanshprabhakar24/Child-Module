import { IsString, IsNumber, IsEnum, IsOptional, IsObject, Min } from 'class-validator';

export enum CreditType {
  VACCINATION = 'VACCINATION',
  HEALTH_RECORD = 'HEALTH_RECORD',
  ENGAGEMENT = 'ENGAGEMENT',
  BONUS = 'BONUS',
  REDEMPTION = 'REDEMPTION',
}

export class AwardCreditDto {
  @IsString()
  registrationId!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsEnum(CreditType)
  type!: CreditType;

  @IsString()
  description!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class RedeemTreeDto {
  @IsString()
  registrationId!: string;

  @IsString()
  tier!: string;

  @IsOptional()
  @IsString()
  treeSpecies?: string;

  @IsOptional()
  @IsString()
  dedicateTo?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class BulkAwardCreditsDto {
  @IsString()
  registrationId!: string;

  vaccines!: Array<{
    vaccineId: string;
    vaccineName: string;
    completedDate: string;
    sequenceNumber: number;
  }>;
}
