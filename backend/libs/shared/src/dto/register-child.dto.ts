import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { IndianState } from '../enums/indian-state.enum';
import { BloodGroup } from '../enums/blood-group.enum';
import { Gender } from '../enums/gender.enum';
import { RegistrationType } from '../enums/registration-type.enum';

export class RegisterChildDto {
  @IsString()
  @IsNotEmpty()
  childName!: string;

  @IsEnum(Gender, { message: 'childGender must be MALE, FEMALE or OTHER' })
  @IsNotEmpty()
  childGender!: Gender;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth!: string;

  @IsEnum(IndianState, { message: 'state must be a valid Indian state code' })
  @IsNotEmpty()
  state!: IndianState;

  @IsString()
  @IsNotEmpty()
  motherName!: string;

  @IsOptional()
  @IsString()
  fatherName?: string;

  /** If the mother already has a Unique Registration ID from the maternal service */
  @IsOptional()
  @IsString()
  @Matches(/^MTR-[A-Z]{2}-\d{8}-\d{6}$/, {
    message: 'motherRegistrationId must follow format MTR-{STATE}-{YYYYMMDD}-{NNNNNN}',
  })
  motherRegistrationId?: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+91\d{10}$/, { message: 'phone must be a valid Indian mobile number (+91XXXXXXXXXX)' })
  phone!: string;

  /** Secondary mobile number (optional, max 2 registrations per number) */
  @IsOptional()
  @IsString()
  @Matches(/^\+91\d{10}$/, { message: 'phone2 must be a valid Indian mobile number (+91XXXXXXXXXX)' })
  phone2?: string;

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

  // ─── Health Information ────────────────────────────────────────────

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

  // ─── Registration Source ────────────────────────────────────────────

  @IsOptional()
  @IsEnum(RegistrationType)
  registrationType?: RegistrationType;

  /** Channel Partner ID — set when registering via hospital/clinic/doctor QR code */
  @IsOptional()
  @IsString()
  channelPartnerId?: string;

  /** Coupon/discount code */
  @IsOptional()
  @IsString()
  couponCode?: string;

  // ─── Subscription Plan ────────────────────────────────────────────

  /** Subscription plan: ANNUAL (₹249) or FIVE_YEAR (₹999) */
  @IsOptional()
  @IsEnum(['ANNUAL', 'FIVE_YEAR'], { message: 'subscriptionPlan must be ANNUAL or FIVE_YEAR' })
  subscriptionPlan?: 'ANNUAL' | 'FIVE_YEAR';
}
