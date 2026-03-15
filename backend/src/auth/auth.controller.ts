
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from './multer';
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
    const user = await this.authService.findUserByEmail(req.user.email);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.profilePictureUrl !== undefined) user.profilePictureUrl = dto.profilePictureUrl;
    await user.save();

    return {
      success: true,
      data: {
        email: user.email,
        fullName: user.fullName,
        profilePictureUrl: user.profilePictureUrl ?? '',
        role: user.role,
      },
    };
  }

  @Post('upload-profile-picture')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadProfilePicture(@Req() req: AuthenticatedRequest, @UploadedFile() file: any) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'profile_pictures',
      public_id: req.user.email,
    });
    // Update user profile picture URL
    const user = await this.authService.findUserByEmail(req.user.email);
    if (user) {
      user.profilePictureUrl = result.secure_url;
      await user.save();
    }
    // Optionally delete the temp file after upload
    // fs.unlinkSync(file.path);
    return { success: true, url: result.secure_url };
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
    try {
      const user = await this.authService.registerUser(dto);
      return {
        success: true,
        data: {
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      };
    } catch (err: any) {
      console.error('register error:', {
        body: dto,
        error: err?.message || err,
        stack: err?.stack,
      });
      return {
        success: false,
        message: err?.message || 'Registration failed',
      };
    }
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
    try {
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
    } catch (err: any) {
      console.error('verifyOtp error:', {
        body: dto,
        error: err?.message || err,
        stack: err?.stack,
      });
      throw err;
    }
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

  @Post('admin-login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() body: { username: string; password: string }) {
    const result = await this.authService.adminLogin(body.username, body.password);
    return {
      success: true,
      token: result.token,
      user: {
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
      },
    };
  }
}
