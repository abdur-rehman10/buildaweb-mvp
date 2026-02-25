import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtPayload = { sub: string; tenantId: string };

type JwtExtractor = (req: Request) => string | null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'Missing JWT_SECRET. Set it in apps/api/.env or environment variables.',
      );
    }

    const extractorFactory = ExtractJwt as unknown as {
      fromAuthHeaderAsBearerToken: () => JwtExtractor;
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest: extractorFactory.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    // attaches to req.user
    return payload;
  }
}
