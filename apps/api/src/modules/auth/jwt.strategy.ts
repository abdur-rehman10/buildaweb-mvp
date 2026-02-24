import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export type JwtPayload = { sub: string; tenantId: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    const isProduction =
      (
        config.get<string>('NODE_ENV') ??
        process.env.NODE_ENV ??
        ''
      ).toLowerCase() === 'production';
    if (isProduction && !secret) {
      throw new Error(
        'Missing JWT_SECRET. Set it in apps/api/.env or environment variables.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret ?? 'dev-jwt-secret',
    });
  }

  validate(payload: JwtPayload) {
    // attaches to req.user
    return payload;
  }
}
