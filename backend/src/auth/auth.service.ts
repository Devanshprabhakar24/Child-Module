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
import { TwilioSmsService } from '../notifications/twilio-sms.service';
import { ResendEmailService } from '../notifications/resend-email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpSmsTestMode: boolean;
  private readonly otpTestCode: string;
  private readonly jwtSecret: string;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(OtpRecord.name) private readonly otpModel: Model<OtpRecordDocument>,
    @InjectModel(ChildRegistration.name)
    private readonly childRegModel: Model<ChildRegistrationDocument>,
    private readonly configService: ConfigService,
    private readonly twilioSmsService: TwilioSmsService,
    private readonly resendEmailService: ResendEmailService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    this.otpSmsTestMode = this.configService.get<string>('OTP_SMS_TEST_MODE') === 'true';
    this.otpTestCode = this.configService.get<string>('OTP_TEST_CODE') ?? '123456';
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') ?? 'wombto18-dev-secret';

    if (this.otpSmsTestMode) {
      this.logger.warn('⚠️  OTP SMS Test Mode Enabled');
      this.logger.log(`📱 Test OTP Code: ${this.otpTestCode}`);
    } else {
      this.logger.log('✅ Twilio SMS enabled for SMS OTP');
      if (this.resendEmailService.isEnabled()) {
        this.logger.log('✅ Resend Email enabled for Email OTP');
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
    this.logger.log(`🔔 sendOtp called for email: ${dto.email}`);
    
    // Check if user exists in database OR if there's a child registration with this email
    let user = await this.userModel.findOne({ email: dto.email }).exec();
    const childReg = await this.childRegModel.findOne({ email: dto.email }).exec();
    
    this.logger.debug(`User exists: ${!!user}, Child registration exists: ${!!childReg}`);
    
    // Check if an OTP was sent recently (within last 60 seconds) to prevent spam
    const recentOtp = await this.otpModel
      .findOne({ 
        email: dto.email, 
        type: 'email',
        createdAt: { $gte: new Date(Date.now() - 60 * 1000) } // Last 60 seconds
      })
      .sort({ createdAt: -1 })
      .exec();
    
    if (recentOtp) {
      const secondsAgo = Math.floor((Date.now() - new Date(recentOtp.get('createdAt')).getTime()) / 1000);
      this.logger.warn(`⏱️  OTP request too soon for ${dto.email}. Last OTP sent ${secondsAgo}s ago`);
      return { 
        message: 'OTP was sent recently. Please wait before requesting again.', 
        expiresInMinutes: OTP_EXPIRY_MINUTES 
      };
    }
    
    // If no user exists, create one automatically (for registration flow)
    if (!user) {
      this.logger.log(`👤 Auto-creating user for OTP request: ${dto.email}`);
      const newUser = await this.registerUser({
        email: dto.email,
        phone: dto.phone || (childReg?.phone) || '+910000000000',
        fullName: childReg?.motherName || 'User',
        role: UserRole.PARENT,
      });
      user = await this.userModel.findOne({ email: dto.email }).exec();
      this.logger.log(`✅ User created successfully: ${user?.email}`);
    }

    // Generate OTP code - ALWAYS generate unique OTP for email
    const code = this.generateSecureOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    this.logger.log(`🔢 Generated OTP code: ${code} for ${dto.email}`);

    // Invalidate previous unused OTPs for this email
    await this.otpModel.updateMany(
      { email: dto.email, type: 'email', isUsed: false },
      { isUsed: true },
    );

    await this.otpModel.create({
      email: dto.email,
      code,
      expiresAt,
      type: 'email',
    });

    this.logger.log(`💾 OTP record saved to database for ${dto.email}`);

    let logMessage = `📧 Email OTP for ${dto.email}: ${code}`;

    // Send Email OTP
    if (this.resendEmailService.isEnabled()) {
      this.logger.log(`📤 Attempting to send email via Resend to ${dto.email}`);
      const emailSent = await this.resendEmailService.sendOTP(dto.email, code);
      if (emailSent) {
        logMessage += ` | ✅ Email sent via Resend`;
        this.logger.log(`✅ Email OTP sent successfully to ${dto.email}`);
      } else {
        logMessage += ` | ❌ Email failed via Resend`;
        this.logger.error(`❌ Failed to send email OTP to ${dto.email}`);
      }
    } else {
      logMessage += ` | ⚠️ Resend Email not configured`;
      this.logger.warn(`⚠️  Resend Email service not enabled`);
    }

    this.logger.log(logMessage);

    return { 
      message: 'Email OTP sent successfully', 
      expiresInMinutes: OTP_EXPIRY_MINUTES 
    };
  }

  async sendPhoneOtp(dto: SendPhoneOtpDto): Promise<{ message: string; expiresInMinutes: number }> {
    // Normalize phone number to include +91 prefix
    const normalizedPhone = dto.phone.startsWith('+91') ? dto.phone : `+91${dto.phone.replace(/^\+?91?/, '')}`;
    
    this.logger.log(`🔔 sendPhoneOtp called for phone: ${normalizedPhone}`);
    
    // Check if an OTP was sent recently (within last 60 seconds) to prevent spam
    const recentOtp = await this.otpModel
      .findOne({ 
        phone: normalizedPhone, 
        type: 'phone',
        createdAt: { $gte: new Date(Date.now() - 60 * 1000) } // Last 60 seconds
      })
      .sort({ createdAt: -1 })
      .exec();
    
    if (recentOtp) {
      const secondsAgo = Math.floor((Date.now() - new Date(recentOtp.get('createdAt')).getTime()) / 1000);
      this.logger.warn(`⏱️  Phone OTP request too soon for ${normalizedPhone}. Last OTP sent ${secondsAgo}s ago`);
      return { 
        message: 'OTP was sent recently. Please wait before requesting again.', 
        expiresInMinutes: OTP_EXPIRY_MINUTES 
      };
    }
    
    // Generate OTP code - ALWAYS generate unique OTP for phone (different from email)
    const code = this.generateSecureOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    this.logger.log(`🔢 Generated Phone OTP code: ${code} for ${normalizedPhone}`);

    // Invalidate previous unused OTPs for this phone
    await this.otpModel.updateMany(
      { phone: normalizedPhone, type: 'phone', isUsed: false },
      { isUsed: true },
    );

    await this.otpModel.create({
      phone: normalizedPhone,
      code,
      expiresAt,
      type: 'phone',
    });

    this.logger.log(`💾 Phone OTP record saved to database for ${normalizedPhone}`);

    let logMessage = `📱 Phone OTP for ${normalizedPhone}: ${code}`;

    // Send SMS OTP via Twilio
    this.logger.log(`📤 Attempting to send SMS via Twilio to ${normalizedPhone}`);
    const smsSent = await this.twilioSmsService.sendOTP(normalizedPhone, code);
    if (smsSent) {
      logMessage += ` | ✅ SMS sent via Twilio`;
      this.logger.log(`✅ SMS OTP sent successfully to ${normalizedPhone}`);
    } else {
      logMessage += ` | ❌ SMS failed via Twilio`;
      this.logger.error(`❌ Failed to send SMS OTP to ${normalizedPhone}`);
    }

    this.logger.log(logMessage);

    return { 
      message: 'Phone OTP sent successfully via SMS', 
      expiresInMinutes: OTP_EXPIRY_MINUTES 
    };
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
        
        // Send in-app notification
        this.notificationsGateway.sendWelcomeBackNotification(user.id as string, parentName);
        
        this.logger.log(`Welcome back message sent to ${user.email}`);
      } catch (error) {
        this.logger.warn(`Failed to send welcome back message to ${user.email}: ${error instanceof Error ? error.message : error}`);
      }
    } else if (!isReturningUser) {
      // Send welcome notification for new users
      try {
        let parentName = user.fullName;
        if (!parentName || parentName.trim() === '') {
          const firstChild = await this.childRegModel
            .findOne({ registrationId: childRegs[0]?.registrationId })
            .select('motherName')
            .lean()
            .exec();
          parentName = firstChild?.motherName || 'Parent';
        }
        
        this.notificationsGateway.sendWelcomeNotification(user.id as string, parentName);
        this.logger.log(`Welcome notification sent to ${user.email}`);
      } catch (error) {
        this.logger.warn(`Failed to send welcome notification: ${error instanceof Error ? error.message : error}`);
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
