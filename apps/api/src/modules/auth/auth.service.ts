import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, randomBytes } from 'node:crypto';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import {
  PasswordResetToken,
  PasswordResetTokenDocument,
} from './password-reset-token.schema';

const DEFAULT_TENANT = 'default';

type AuthUserRecord = {
  _id: unknown;
  email: string;
  name: string | null;
  tenantId: string;
  passwordHash: string;
};

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

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private normalizeName(name?: string) {
    if (typeof name !== 'string') return null;
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private bcryptRounds() {
    const configured = this.config.get<string>('BCRYPT_SALT_ROUNDS');
    const parsed = Number.parseInt(String(configured ?? ''), 10);
    if (Number.isInteger(parsed) && parsed >= 4 && parsed <= 31) {
      return parsed;
    }
    return 12;
  }

  private isDuplicateKeyError(error: unknown) {
    if (!error || typeof error !== 'object') return false;
    const code = (error as { code?: unknown }).code;
    return code === 11000;
  }

  private readUser(value: unknown): AuthUserRecord {
    if (!value || typeof value !== 'object') {
      throw new Error('Invalid user record');
    }

    const record = value as {
      _id?: unknown;
      email?: unknown;
      name?: unknown;
      tenantId?: unknown;
      passwordHash?: unknown;
    };

    if (
      record._id === undefined ||
      typeof record.email !== 'string' ||
      typeof record.tenantId !== 'string' ||
      typeof record.passwordHash !== 'string'
    ) {
      throw new Error('Invalid user record');
    }

    return {
      _id: record._id,
      email: record.email,
      name: typeof record.name === 'string' ? record.name : null,
      tenantId: record.tenantId,
      passwordHash: record.passwordHash,
    };
  }

  async signup(params: { email: string; password: string; name?: string }) {
    const tenantId = this.tenantId();
    const normalizedEmail = this.normalizeEmail(params.email);
    const normalizedName = this.normalizeName(params.name);
    const existingUser: unknown = await this.users.findByEmail(
      tenantId,
      normalizedEmail,
    );
    if (existingUser) {
      return {
        ok: false as const,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email already in use',
      };
    }

    const passwordHash = await bcrypt.hash(
      params.password,
      this.bcryptRounds(),
    );
    let userRecord: AuthUserRecord;
    try {
      const createdUser: unknown = await this.users.create({
        tenantId,
        email: normalizedEmail,
        passwordHash,
        name: normalizedName,
      });
      userRecord = this.readUser(createdUser);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        return {
          ok: false as const,
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'Email already in use',
        };
      }
      throw error;
    }

    const accessToken = await this.signToken({
      sub: String(userRecord._id),
      tenantId,
    });
    return {
      ok: true as const,
      user: {
        id: String(userRecord._id),
        email: userRecord.email,
        name: userRecord.name,
        tenantId: userRecord.tenantId,
      },
      accessToken,
    };
  }

  async login(params: { email: string; password: string }) {
    const tenantId = this.tenantId();
    const normalizedEmail = this.normalizeEmail(params.email);
    const foundUser: unknown = await this.users.findByEmail(
      tenantId,
      normalizedEmail,
    );
    if (!foundUser) {
      return {
        ok: false as const,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      };
    }

    const userRecord = this.readUser(foundUser);

    const valid = await bcrypt.compare(
      params.password,
      userRecord.passwordHash,
    );
    if (!valid) {
      return {
        ok: false as const,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      };
    }

    const accessToken = await this.signToken({
      sub: String(userRecord._id),
      tenantId,
    });
    return {
      ok: true as const,
      user: {
        id: String(userRecord._id),
        email: userRecord.email,
        name: userRecord.name,
        tenantId: userRecord.tenantId,
      },
      accessToken,
    };
  }

  private resetTokenPepper() {
    return (
      this.config.get<string>('PASSWORD_RESET_TOKEN_PEPPER') ??
      this.config.get<string>('JWT_SECRET') ??
      'dev-reset-pepper'
    );
  }

  private resetTokenTtlMs() {
    return (
      Number(this.config.get<string>('PASSWORD_RESET_TTL_MINUTES') ?? 30) *
      60 *
      1000
    );
  }

  private hashResetToken(token: string) {
    return createHash('sha256')
      .update(`${token}:${this.resetTokenPepper()}`)
      .digest('hex');
  }

  private isProductionMode() {
    const env =
      this.config.get<string>('NODE_ENV') ?? process.env.NODE_ENV ?? '';
    return env.toLowerCase() === 'production';
  }

  async forgotPassword(params: { email: string }) {
    const tenantId = this.tenantId();
    const foundUser: unknown = await this.users.findByEmail(
      tenantId,
      params.email,
    );

    if (!foundUser) {
      return { ok: true as const };
    }

    const userRecord = this.readUser(foundUser);

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + this.resetTokenTtlMs());

    await this.passwordResetTokenModel.create({
      userId: new Types.ObjectId(String(userRecord._id)),
      tokenHash,
      expiresAt,
      usedAt: null,
    });

    if (!this.isProductionMode()) {
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

    const passwordHash = await bcrypt.hash(
      params.newPassword,
      this.bcryptRounds(),
    );
    const updateResult = await this.users.updatePasswordHashById(
      String(resetRecord.userId),
      passwordHash,
    );

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
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') ?? '1d';
    return this.jwt.signAsync(payload, {
      expiresIn: expiresIn as JwtSignOptions['expiresIn'],
    });
  }
}
