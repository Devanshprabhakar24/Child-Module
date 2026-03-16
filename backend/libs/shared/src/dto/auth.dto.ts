import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class SendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+91\d{10}$/, { message: 'phone must be a valid Indian mobile number (+91XXXXXXXXXX)' })
  phone?: string;
}

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  otp!: string;
}

/**
 * First-time login: Registration ID + Email + Mobile + OTP.
 * The system verifies all three match the registration record.
 */
export class FirstTimeLoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^CHD-[A-Z]{2}-\d{8}-\d{6}$/, {
    message: 'registrationId must follow format CHD-{STATE}-{YYYYMMDD}-{NNNNNN}',
  })
  registrationId!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+91\d{10}$/, { message: 'phone must be a valid Indian mobile number (+91XXXXXXXXXX)' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  otp!: string;
}

/**
 * Subsequent login: Registration ID + Email + OTP.
 */
export class LoginWithRegistrationIdDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^CHD-[A-Z]{2}-\d{8}-\d{6}$/, {
    message: 'registrationId must follow format CHD-{STATE}-{YYYYMMDD}-{NNNNNN}',
  })
  registrationId!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  otp!: string;
}

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+91\d{10}$/, { message: 'phone must be a valid Indian mobile number (+91XXXXXXXXXX)' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class SendPhoneOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?91?\d{10}$/, { message: 'phone must be a valid Indian mobile number' })
  phone!: string;
}

export class VerifyPhoneOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?91?\d{10}$/, { message: 'phone must be a valid Indian mobile number' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  otp!: string;
}
