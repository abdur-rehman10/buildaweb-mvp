import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ok, fail } from '../../common/api-response';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly users: UsersService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const res = await this.auth.signup(dto);
    if (!res.ok) return fail(res.code, res.message);
    return ok({ user: res.user, accessToken: res.accessToken });
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const res = await this.auth.login(dto);
    if (!res.ok) return fail(res.code, res.message);
    return ok({ user: res.user, accessToken: res.accessToken });
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const res = await this.auth.forgotPassword(dto);
    if ('debugResetToken' in res && res.debugResetToken) {
      return ok({ debugResetToken: res.debugResetToken });
    }
    return ok({});
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const res = await this.auth.resetPassword(dto);
    if (!res.ok) return fail(res.code, res.message);
    return ok({});
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const userId = req.user?.sub as string;
    const user = await this.users.safeById(userId);
    if (!user) return fail('USER_NOT_FOUND', 'User not found');
    return ok({ user });
  }
}
