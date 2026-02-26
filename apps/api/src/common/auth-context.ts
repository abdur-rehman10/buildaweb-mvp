import { UnauthorizedException } from '@nestjs/common';
import type { AuthRequest } from '../types/auth-request';
import type { AppUserPrincipal } from '../auth/types/app-user-principal';

export function requireAuthUser(req: AuthRequest): AppUserPrincipal {
  const user = (req as AuthRequest & { user?: AppUserPrincipal }).user;
  if (!user || typeof user !== 'object') {
    throw new UnauthorizedException('Unauthorized');
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
    throw new UnauthorizedException('Unauthorized');
  }

  return {
    ownerUserId,
    tenantId: user.tenantId ?? 'default',
  };
}
