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
  SendPhoneOtpDto,
  VerifyPhoneOtpDto,
  UserRole,
} from '@wombto18/shared';
import { EmailService } from '../notifications/email.service';
import { SmsService } from '../notifications/sms.service';
import { NotificationsService } from '../notifications/notifications.service';

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpEmailTestMode: boolean;
  private readonly otpSmsTestMode: boolean;
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
    private readonly notificationsService: NotificationsService,
  ) {
    this.otpEmailTestMode = this.configService.get<string>('OTP_EMAIL_TEST_MODE') === 'true';
    this.otpSmsTestMode = this.configService.get<string>('OTP_SMS_TEST_MODE') === 'true';
    this.otpTestCode = this.configService.get<string>('OTP_TEST_CODE') ?? '123456';
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') ?? 'wombto18-dev-secret';

    if (this.otpEmailTestMode || this.otpSmsTestMode) {
      this.logger.warn('⚠ OTP Test Modes Enabled:');
      if (this.otpEmailTestMode) {
        this.logger.log(`📧 Email Test Mode: ON`);
      }
      if (this.otpSmsTestMode) {
        this.logger.log(`📱 SMS Test Mode: ON`);
      }
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
    // Use email test mode as primary - if email is in test mode, use test code for both
    // If email is in real mode, generate real code for both email and SMS
    const code = this.otpEmailTestMode ? this.otpTestCode : this.generateSecureOtp();
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
      type: 'email',
    });

    const sendPromises: Promise<any>[] = [];
    let logMessage = '';

    // Handle Email OTP
    if (this.otpEmailTestMode) {
      logMessage += `📧 [EMAIL TEST] ${dto.email}: ${code}`;
    } else {
      // Send real email
      sendPromises.push(this.emailService.sendOtpEmail(dto.email, code));
      logMessage += `📧 Real email sent to ${dto.email} (Use this OTP: ${code})`;
    }

    // Handle SMS OTP if phone is provided - use SAME code as email
    if (dto.phone) {
      const userPhone = dto.phone;
      if (this.otpSmsTestMode) {
        logMessage += ` | 📱 [SMS TEST] ${userPhone}: ${code} (same as email)`;
      } else {
        // Send real SMS with same code
        sendPromises.push(this.smsService.sendOtpSms(userPhone, code));
        logMessage += ` | 📱 Real SMS sent to ${userPhone} (same OTP)`;
      }
    } else {
      // Check if user exists and has phone number
      const user = await this.userModel.findOne({ email: dto.email }).exec();
      if (user?.phone) {
        const userPhone = user.phone;
        if (this.otpSmsTestMode) {
          logMessage += ` | 📱 [SMS TEST] ${userPhone}: ${code} (same as email)`;
        } else {
          // Send real SMS with same code
          sendPromises.push(this.smsService.sendOtpSms(userPhone, code));
          logMessage += ` | 📱 Real SMS sent to ${userPhone} (same OTP)`;
        }
      }
    }

    // Execute all real sending operations
    if (sendPromises.length > 0) {
      await Promise.all(sendPromises);
    }

    this.logger.log(logMessage);

    return { message: 'OTP sent successfully', expiresInMinutes: OTP_EXPIRY_MINUTES };
  }

  async sendPhoneOtp(dto: SendPhoneOtpDto): Promise<{ message: string; expiresInMinutes: number }> {
    // Normalize phone number to include +91 prefix
    const normalizedPhone = dto.phone.startsWith('+91') ? dto.phone : `+91${dto.phone.replace(/^\+?91?/, '')}`;
    
    const code = this.otpSmsTestMode ? this.otpTestCode : this.generateSecureOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Invalidate previous unused OTPs for this phone
    await this.otpModel.updateMany(
      { phone: normalizedPhone, isUsed: false },
      { isUsed: true },
    );

    await this.otpModel.create({
      phone: normalizedPhone,
      code,
      expiresAt,
      type: 'phone',
    });

    let logMessage = '';

    if (this.otpSmsTestMode) {
      logMessage = `📱 [SMS TEST] ${normalizedPhone}: ${code}`;
    } else {
      // Send real SMS
      await this.smsService.sendOtpSms(normalizedPhone, code);
      logMessage = `📱 Real SMS sent to ${normalizedPhone} (Use this OTP: ${code})`;
    }

    this.logger.log(logMessage);

    return { message: 'Phone OTP sent successfully', expiresInMinutes: OTP_EXPIRY_MINUTES };
  }

  async verifyPhoneOtp(dto: VerifyPhoneOtpDto): Promise<{ verified: boolean; message: string }> {
    // Normalize phone number to include +91 prefix
    const normalizedPhone = dto.phone.startsWith('+91') ? dto.phone : `+91${dto.phone.replace(/^\+?91?/, '')}`;
    
    const otpRecord = await this.otpModel
      .findOne({ phone: normalizedPhone, type: 'phone', isUsed: false })
      .sort({ createdAt: -1 })
      .exec();

    if (!otpRecord) {
      throw new UnauthorizedException('No OTP found for this phone number. Please request a new one.');
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

    this.logger.log(`Phone OTP verified for ${normalizedPhone}`);
    return { verified: true, message: 'Phone OTP verified successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ verified: boolean; token: string; user: UserDocument }> {
    const otpRecord = await this.otpModel
      .findOne({ email: dto.email, type: 'email', isUsed: false })
      .sort({ createdAt: -1 })
      .exec();

    if (!otpRecord) {
      this.logger.warn(`No OTP found for ${dto.email}`);
      throw new UnauthorizedException('No OTP found. Please request a new one.');
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      this.logger.warn(`Max attempts exceeded for ${dto.email}`);
      throw new UnauthorizedException('Maximum OTP attempts exceeded. Please request a new one.');
    }

    if (new Date() > otpRecord.expiresAt) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      this.logger.warn(`OTP expired for ${dto.email}`);
      throw new UnauthorizedException('OTP has expired. Please request a new one.');
    }

    otpRecord.attempts += 1;

    // Debug logging
    this.logger.debug(`OTP Verification - Email: ${dto.email}, Provided: ${dto.otp}, Expected: ${otpRecord.code}, Match: ${otpRecord.code === dto.otp}`);

    if (otpRecord.code !== dto.otp) {
      await otpRecord.save();
      this.logger.warn(`Invalid OTP for ${dto.email} - Provided: ${dto.otp}, Expected: ${otpRecord.code}`);
      throw new UnauthorizedException('Invalid OTP.');
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    // Mark email as verified
    let user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new UnauthorizedException('User not found. Please register first.');
    }

    const isReturningUser = user.isEmailVerified && user.lastLoginAt;
    const lastLoginDate = user.lastLoginAt;

    user.isEmailVerified = true;
    user.lastLoginAt = new Date();

    // Auto-link any child registrations with matching email
    const childRegs = await this.childRegModel
      .find({ email: dto.email })
      .select('registrationId childName _id')
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

    // Send welcome back message for returning users
    if (isReturningUser && childRegs.length > 0) {
      try {
        // Get parent name from user or fallback to mother's name from first child
        let parentName = user.fullName;
        if (!parentName || parentName.trim() === '') {
          const firstChild = await this.childRegModel
            .findOne({ registrationId: childRegs[0].registrationId })
            .select('motherName')
            .lean()
            .exec();
          parentName = firstChild?.motherName || 'Parent';
        }

        await this.notificationsService.sendWelcomeBackMessage({
          phone: user.phone,
          email: user.email,
          parentName: parentName,
          childrenNames: childRegs.map(child => child.childName),
          lastLoginDate: lastLoginDate?.toISOString(),
        });
        this.logger.log(`Welcome back message sent to ${user.email}`);
      } catch (error) {
        this.logger.warn(`Failed to send welcome back message to ${user.email}: ${error instanceof Error ? error.message : error}`);
      }
    }

    const token = this.generateToken(user);

    this.logger.log(`OTP verified for ${dto.email}${isReturningUser ? ' (returning user)' : ' (first time)'}`);
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
