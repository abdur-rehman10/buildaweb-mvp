import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, randomBytes } from 'node:crypto';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { PasswordResetToken, PasswordResetTokenDocument } from './password-reset-token.schema';

const DEFAULT_TENANT = 'default';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectModel(PasswordResetToken.name)
    private readonly passwordResetTokenModel: Model<PasswordResetTokenDocument>,
  ) {}

  private tenantId() {
    // MVP: single-tenant
    return DEFAULT_TENANT;
  }

  async signup(params: { email: string; password: string; name?: string }) {
    const tenantId = this.tenantId();
    const exists = await this.users.findByEmail(tenantId, params.email);
    if (exists) {
      return { ok: false as const, code: 'EMAIL_ALREADY_EXISTS', message: 'Email already in use' };
    }

    const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS') ?? 12);
    const passwordHash = await bcrypt.hash(params.password, rounds);

    const user = await this.users.create({
      tenantId,
      email: params.email,
      passwordHash,
      name: params.name ?? null,
    });

    const accessToken = await this.signToken({ sub: String(user._id), tenantId });
    return {
      ok: true as const,
      user: { id: String(user._id), email: user.email, name: user.name, tenantId: user.tenantId },
      accessToken,
    };
  }

  async login(params: { email: string; password: string }) {
    const tenantId = this.tenantId();
    const user = await this.users.findByEmail(tenantId, params.email);
    if (!user) {
      return { ok: false as const, code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' };
    }

    const valid = await bcrypt.compare(params.password, user.passwordHash);
    if (!valid) {
      return { ok: false as const, code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' };
    }

    const accessToken = await this.signToken({ sub: String(user._id), tenantId });
    return {
      ok: true as const,
      user: { id: String(user._id), email: user.email, name: user.name, tenantId: user.tenantId },
      accessToken,
    };
  }

  private resetTokenPepper() {
    return this.config.get<string>('PASSWORD_RESET_TOKEN_PEPPER') ?? this.config.get<string>('JWT_SECRET') ?? 'dev-reset-pepper';
  }

  private resetTokenTtlMs() {
    return Number(this.config.get<string>('PASSWORD_RESET_TTL_MINUTES') ?? 30) * 60 * 1000;
  }

  private hashResetToken(token: string) {
    return createHash('sha256').update(`${token}:${this.resetTokenPepper()}`).digest('hex');
  }

  private isDevMode() {
    return (this.config.get<string>('NODE_ENV') ?? '').toLowerCase() !== 'production';
  }

  async forgotPassword(params: { email: string }) {
    const tenantId = this.tenantId();
    const user = await this.users.findByEmail(tenantId, params.email);

    if (!user) {
      return { ok: true as const };
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + this.resetTokenTtlMs());

    await this.passwordResetTokenModel.create({
      userId: new Types.ObjectId(String(user._id)),
      tokenHash,
      expiresAt,
      usedAt: null,
    });

    if (this.isDevMode()) {
      return { ok: true as const, debugResetToken: rawToken };
    }

    return { ok: true as const };
  }

  async resetPassword(params: { token: string; newPassword: string }) {
    const tokenHash = this.hashResetToken(params.token);
    const resetRecord = await this.passwordResetTokenModel
      .findOne({
        tokenHash,
        usedAt: null,
        expiresAt: { $gt: new Date() },
      })
      .exec();

    if (!resetRecord) {
      return {
        ok: false as const,
        code: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'Invalid or expired reset token',
      };
    }

    const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS') ?? 12);
    const passwordHash = await bcrypt.hash(params.newPassword, rounds);
    const updateResult = await this.users.updatePasswordHashById(String(resetRecord.userId), passwordHash);

    if (!updateResult.acknowledged || updateResult.matchedCount === 0) {
      return {
        ok: false as const,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      };
    }

    resetRecord.usedAt = new Date();
    await resetRecord.save();

    return { ok: true as const };
  }

  private async signToken(payload: { sub: string; tenantId: string }) {
    const expiresIn = this.config.get('JWT_EXPIRES_IN') ?? '1d';
    return this.jwt.signAsync(payload, { expiresIn });
  }
}
