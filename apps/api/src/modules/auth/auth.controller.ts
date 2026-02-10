import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post, Req, UseGuards } from '@nestjs/common';
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
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly auth: AuthService, private readonly users: UsersService) {}

  private requestId(req: any) {
    const headerId = req?.headers?.['x-request-id'] ?? req?.headers?.['x-requestid'];
    if (typeof req?.id === 'string' && req.id.trim()) return req.id.trim();
    if (typeof headerId === 'string' && headerId.trim()) return headerId.trim();
    if (Array.isArray(headerId) && typeof headerId[0] === 'string' && headerId[0].trim()) return headerId[0].trim();
    return undefined;
  }

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Req() req: any) {
    const email = dto.email.trim().toLowerCase();
    const requestId = this.requestId(req);
    this.logger.log(
      JSON.stringify({
        event: 'auth.signup.attempt',
        email,
        requestId,
      }),
    );

    const res = await this.auth.signup(dto);
    if (!res.ok) {
      this.logger.warn(
        JSON.stringify({
          event: 'auth.signup.failed',
          email,
          code: res.code,
          requestId,
        }),
      );
      const status = res.code === 'EMAIL_ALREADY_EXISTS' ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
      throw new HttpException(fail(res.code, res.message), status);
    }

    this.logger.log(
      JSON.stringify({
        event: 'auth.signup.success',
        email,
        userId: res.user.id,
        requestId,
      }),
    );
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
