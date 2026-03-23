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

  /** Structured address object (new format) */
  @IsOptional()
  addressStructured?: {
    houseNo: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pinCode: string;
    addressType: 'HOME' | 'WORK' | 'OTHER';
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

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
