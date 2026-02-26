import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AppUserPrincipal } from '../../auth/types/app-user-principal';
import type { JwtPayload } from '../../auth/types/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'Missing JWT_SECRET. Set it in apps/api/.env or environment variables.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): AppUserPrincipal {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
      tenantId: payload.tenantId,
    };
  }
}
