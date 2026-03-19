import { IsString, IsNumber, IsEnum, IsOptional, IsObject, Min } from 'class-validator';
import { CreditType } from '../schemas/credit-transaction.schema';

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

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class BulkAwardCreditDto {
  @IsString()
  registrationId!: string;

  @IsString()
  vaccines!: Array<{
    vaccineId: string;
    vaccineName: string;
    completedDate: string;
  }>;
}

export class RedeemTreeDto {
  @IsString()
  registrationId!: string;

  @IsString()
  tier!: string;

  @IsString()
  @IsOptional()
  treeSpecies?: string;

  @IsString()
  @IsOptional()
  dedicateTo?: string;
}
