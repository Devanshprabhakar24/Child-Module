
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto, FirstTimeLoginDto, LoginWithRegistrationIdDto, RegisterUserDto, UpdateProfileDto } from '@wombto18/shared';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticatedRequest } from './guards/auth.guard';
import cloudinary from './cloudinary';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('update-profile')
  @UseGuards(AuthGuard)
  async updateProfile(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    // Only allow updating own profile
    const user = await this.authService.findUserByEmail(req.user.email);
    if (!user) return { success: false, message: 'User not found' };
    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.profilePictureUrl) user.profilePictureUrl = dto.profilePictureUrl;
    await user.save();
    return { success: true, data: { fullName: user.fullName, profilePictureUrl: user.profilePictureUrl } };
  }

  @Get('cloudinary-signature')
  @UseGuards(AuthGuard)
  getCloudinarySignature() {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      process.env.CLOUDINARY_API_SECRET as string,
    );
    return {
      success: true,
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    };
  }

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.authService.registerUser(dto);
    return {
      success: true,
      data: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto) {
    const result = await this.authService.sendOtp(dto);
    return { success: true, ...result };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(dto);
    return {
      success: true,
      token: result.token,
      user: {
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        isFirstLoginComplete: result.user.isFirstLoginComplete,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginWithRegistrationId(@Body() dto: LoginWithRegistrationIdDto) {
    const result = await this.authService.loginWithRegistrationId(dto);
    return {
      success: true,
      token: result.token,
      user: {
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        registrationIds: result.user.registrationIds,
      },
    };
  }

  /**
   * First-time login: Registration ID + Email + Mobile Number + OTP.
   * Links the registration to the user account and marks first login complete.
   */
  @Post('first-login')
  @HttpCode(HttpStatus.OK)
  async firstTimeLogin(@Body() dto: FirstTimeLoginDto) {
    const result = await this.authService.firstTimeLogin(dto);
    return {
      success: true,
      token: result.token,
      user: {
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        registrationIds: result.user.registrationIds,
        isFirstLoginComplete: result.user.isFirstLoginComplete,
      },
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: AuthenticatedRequest) {
    const user = await this.authService.findUserByEmail(req.user.email);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    return {
      success: true,
      data: {
        email: user.email,
        fullName: user.fullName,
        profilePictureUrl: user.profilePictureUrl ?? '',
        role: user.role,
        registrationIds: user.registrationIds,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    };
  }
}
