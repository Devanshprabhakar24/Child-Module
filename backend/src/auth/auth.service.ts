import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as crypto from 'crypto';

import { User, UserDocument } from './schemas/user.schema';
import { OtpRecord, OtpRecordDocument } from './schemas/otp-record.schema';
import {
  ChildRegistration,
  ChildRegistrationDocument,
} from '../registration/schemas/child-registration.schema';
import {
  SendOtpDto,
  VerifyOtpDto,
  FirstTimeLoginDto,
  LoginWithRegistrationIdDto,
  RegisterUserDto,
  UserRole,
} from '@wombto18/shared';
import { EmailService } from '../notifications/email.service';
import { SmsService } from '../notifications/sms.service';

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpTestMode: boolean;
  private readonly otpTestCode: string;
  private readonly jwtSecret: string;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(OtpRecord.name) private readonly otpModel: Model<OtpRecordDocument>,
    @InjectModel(ChildRegistration.name)
    private readonly childRegModel: Model<ChildRegistrationDocument>,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {
    this.otpTestMode = this.configService.get<string>('OTP_TEST_MODE') === 'true';
    this.otpTestCode = this.configService.get<string>('OTP_TEST_CODE') ?? '123456';
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') ?? 'wombto18-dev-secret';

    if (this.otpTestMode) {
      this.logger.warn('⚠ OTP_TEST_MODE is ON — OTP will use test code');
    }
  }

  // ─── User Registration ────────────────────────────────────────────────

  async registerUser(dto: RegisterUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) {
      return existing;
    }

    const user = await this.userModel.create({
      email: dto.email,
      phone: dto.phone,
      fullName: dto.fullName,
      role: dto.role ?? UserRole.PARENT,
    });

    this.logger.log(`User registered: ${user.email}`);
    return user;
  }

  // ─── OTP Flow ─────────────────────────────────────────────────────────

  async sendOtp(dto: SendOtpDto): Promise<{ message: string; expiresInMinutes: number }> {
    const code = this.otpTestMode
      ? this.otpTestCode
      : this.generateSecureOtp();

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Invalidate previous unused OTPs for this email
    await this.otpModel.updateMany(
      { email: dto.email, isUsed: false },
      { isUsed: true },
    );

    await this.otpModel.create({
      email: dto.email,
      code,
      expiresAt,
    });

    if (!this.otpTestMode) {
      // Send OTP via email and SMS
      const sendPromises = [
        this.emailService.sendOtpEmail(dto.email, code),
      ];

      // If phone is provided in the request, send SMS directly
      if (dto.phone) {
        sendPromises.push(this.smsService.sendOtpSms(dto.phone, code));
      } else {
        // Otherwise, check if user exists and has phone number
        const user = await this.userModel.findOne({ email: dto.email }).exec();
        if (user?.phone) {
          sendPromises.push(this.smsService.sendOtpSms(user.phone, code));
        }
      }

      await Promise.all(sendPromises);
      this.logger.log(`OTP sent to ${dto.email}${dto.phone ? ` and ${dto.phone}` : ''}`);
    } else {
      this.logger.log(`[TEST MODE] OTP for ${dto.email}: ${code}`);
    }

    return { message: 'OTP sent successfully', expiresInMinutes: OTP_EXPIRY_MINUTES };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ verified: boolean; token: string; user: UserDocument }> {
    const otpRecord = await this.otpModel
      .findOne({ email: dto.email, isUsed: false })
      .sort({ createdAt: -1 })
      .exec();

    if (!otpRecord) {
      throw new UnauthorizedException('No OTP found. Please request a new one.');
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      throw new UnauthorizedException('Maximum OTP attempts exceeded. Please request a new one.');
    }

    if (new Date() > otpRecord.expiresAt) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      throw new UnauthorizedException('OTP has expired. Please request a new one.');
    }

    otpRecord.attempts += 1;

    if (otpRecord.code !== dto.otp) {
      await otpRecord.save();
      throw new UnauthorizedException('Invalid OTP.');
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    // Mark email as verified
    let user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new UnauthorizedException('User not found. Please register first.');
    }

    user.isEmailVerified = true;

    // Auto-link any child registrations with matching email
    const childRegs = await this.childRegModel
      .find({ email: dto.email })
      .select('registrationId _id')
      .lean()
      .exec();

    for (const child of childRegs) {
      if (!user.registrationIds.includes(child.registrationId)) {
        user.registrationIds.push(child.registrationId);
      }
      // Also set parentUserId on the child record if not already set
      await this.childRegModel.updateOne(
        { registrationId: child.registrationId, parentUserId: { $in: [null, undefined, ''] } },
        { parentUserId: user.id as string },
      );
    }

    await user.save();

    const token = this.generateToken(user);

    this.logger.log(`OTP verified for ${dto.email}`);
    return { verified: true, token, user };
  }

  // ─── Login with Registration ID (Subsequent Logins) ───────────────────

  async loginWithRegistrationId(
    dto: LoginWithRegistrationIdDto,
  ): Promise<{ token: string; user: UserDocument }> {
    // Verify the OTP
    const otpResult = await this.verifyOtp({ email: dto.email, otp: dto.otp });

    // Verify the registration ID actually exists and belongs to this user's email
    const childReg = await this.childRegModel
      .findOne({ registrationId: dto.registrationId })
      .exec();
    if (!childReg) {
      throw new UnauthorizedException(
        'Registration ID does not exist.',
      );
    }

    const user = otpResult.user;

    // Auto-link the registration ID if the child was registered with the same email
    if (!user.registrationIds.includes(dto.registrationId)) {
      if (childReg.email.toLowerCase() !== user.email.toLowerCase()) {
        throw new UnauthorizedException(
          'Registration ID does not belong to this account.',
        );
      }
      user.registrationIds.push(dto.registrationId);
      user.isFirstLoginComplete = true;
      await user.save();
    }

    this.logger.log(`Login via Registration ID: ${dto.registrationId}`);
    return { token: otpResult.token, user };
  }

  // ─── First-Time Login ─────────────────────────────────────────────────

  /**
   * First-time login flow: Registration ID + Email + Mobile + OTP.
   * Verifies all three match the registration record, then links the
   * registration ID to the user's account and marks first login complete.
   */
  async firstTimeLogin(
    dto: FirstTimeLoginDto,
  ): Promise<{ token: string; user: UserDocument }> {
    // Verify OTP first
    const otpResult = await this.verifyOtp({ email: dto.email, otp: dto.otp });
    const user = otpResult.user;

    // Verify phone matches the user record
    if (user.phone !== dto.phone) {
      throw new UnauthorizedException(
        'Phone number does not match the registered account.',
      );
    }

    // Verify the registration ID actually exists in the database
    const regExists = await this.childRegModel
      .exists({ registrationId: dto.registrationId })
      .exec();
    if (!regExists) {
      throw new UnauthorizedException(
        'Registration ID does not exist. Please register a child first.',
      );
    }

    // Link the registration ID to the user if not already linked
    if (!user.registrationIds.includes(dto.registrationId)) {
      user.registrationIds.push(dto.registrationId);
    }

    user.isFirstLoginComplete = true;
    user.isPhoneVerified = true;
    await user.save();

    this.logger.log(`First-time login completed: ${dto.registrationId} → ${dto.email}`);
    return { token: otpResult.token, user };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

  async linkRegistrationId(email: string, registrationId: string): Promise<void> {
    await this.userModel.updateOne(
      { email },
      { $addToSet: { registrationIds: registrationId } },
    );
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  private generateSecureOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private generateToken(user: UserDocument): string {
    // Simple base64-encoded token for development
    // In production, replace with proper JWT (jsonwebtoken / @nestjs/jwt)
    const payload = {
      sub: user.id as string,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
  }

  parseToken(token: string): { sub: string; email: string; role: string; exp: number } {
    const payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8')) as {
      sub: string;
      email: string;
      role: string;
      exp: number;
    };

    if (payload.exp < Date.now()) {
      throw new UnauthorizedException('Token has expired.');
    }

    return payload;
  }

  // ─── Admin Login ──────────────────────────────────────────────────────

  async adminLogin(username: string, password: string): Promise<{ token: string; user: UserDocument }> {
    // Hardcoded admin credentials
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Find or create admin user
    let adminUser = await this.userModel.findOne({ email: 'admin@wombto18.com' }).exec();
    
    if (!adminUser) {
      adminUser = await this.userModel.create({
        email: 'admin@wombto18.com',
        phone: '+919999999999',
        fullName: 'System Administrator',
        role: UserRole.ADMIN,
        isEmailVerified: true,
        isPhoneVerified: true,
        isFirstLoginComplete: true,
      });
      this.logger.log('Admin user created');
    }

    const token = this.generateToken(adminUser);
    this.logger.log('Admin login successful');

    return { token, user: adminUser };
  }
}
