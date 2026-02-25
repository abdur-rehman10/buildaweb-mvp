import { UnauthorizedException } from '@nestjs/common';
import type { AuthRequest, AuthUser } from '../types/auth-request';

export function requireAuthUser(req: AuthRequest): AuthUser {
  const user = req.user;
  if (!user) {
    throw new UnauthorizedException();
  }

  return user;
}

export function getAuthContext(req: AuthRequest): {
  ownerUserId: string;
  tenantId: string;
} {
  const user = requireAuthUser(req);
  const ownerUserId = user.sub ?? user.id;

  if (!ownerUserId) {
    throw new UnauthorizedException();
  }

  return {
    ownerUserId,
    tenantId: user.tenantId ?? 'default',
  };
}
