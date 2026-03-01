import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';

export type JwtPayload = { sub: string; tenantId: string };

type JwtExtractor = (req: Request) => string | null;
type ExtractJwtFactory = {
  fromAuthHeaderAsBearerToken: () => JwtExtractor;
};

const createBearerTokenExtractor = (): JwtExtractor => {
  const extractJwtFactory = ExtractJwt as unknown as ExtractJwtFactory;
  return extractJwtFactory.fromAuthHeaderAsBearerToken();
};

const JwtPassportStrategy = PassportStrategy(
  Strategy,
) as unknown as new (options: {
  jwtFromRequest: JwtExtractor;
  secretOrKey: string;
}) => {
  validate(payload: JwtPayload): JwtPayload;
};

@Injectable()
export class JwtStrategy extends JwtPassportStrategy {
  constructor(private readonly config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }

    super({
      jwtFromRequest: createBearerTokenExtractor(),
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
