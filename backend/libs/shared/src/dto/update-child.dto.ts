import { IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { BloodGroup } from '../enums/blood-group.enum';

export class UpdateChildDto {
  @IsOptional()
  @IsString()
  childName?: string;

  @IsOptional()
  @IsString()
  motherName?: string;

  @IsOptional()
  @IsString()
  fatherName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(BloodGroup, { message: 'bloodGroup must be a valid blood group' })
  bloodGroup?: BloodGroup;

  @IsOptional()
  @IsNumber()
  @Min(0)
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;
}
