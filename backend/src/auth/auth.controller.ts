import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SendOtpDto,
  VerifyOtpDto,
  FirstTimeLoginDto,
  LoginWithRegistrationIdDto,
  RegisterUserDto,
} from '@wombto18/shared';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticatedRequest } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
        role: user.role,
        registrationIds: user.registrationIds,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    };
  }
}
