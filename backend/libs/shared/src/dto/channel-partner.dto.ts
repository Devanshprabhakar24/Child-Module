import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class RegisterChannelPartnerDto {
  @IsString()
  @IsNotEmpty()
  partnerName!: string;

  @IsString()
  @IsNotEmpty()
  organizationName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+91\d{10}$/, { message: 'phone must be a valid Indian mobile number (+91XXXXXXXXXX)' })
  phone!: string;

  @IsOptional()
  @IsString()
  region?: string;
}
