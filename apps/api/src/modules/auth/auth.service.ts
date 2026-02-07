import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

const DEFAULT_TENANT = 'default';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
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

  private async signToken(payload: { sub: string; tenantId: string }) {
    const expiresIn = this.config.get('JWT_EXPIRES_IN') ?? '1d';
    return this.jwt.signAsync(payload, { expiresIn });
  }
}
