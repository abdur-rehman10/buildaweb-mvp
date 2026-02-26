import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { AppUserPrincipal } from '../auth/types/app-user-principal';

export function requireAuthUser(req: Request): AppUserPrincipal {
  const user = req.user;

  if (typeof user !== 'object' || user === null) {
    throw new UnauthorizedException('Missing authenticated user');
  }

  const userId =
    'userId' in user && typeof user.userId === 'string'
      ? user.userId
      : 'sub' in user && typeof user.sub === 'string'
        ? user.sub
        : '';

  if (!userId.trim()) {
    throw new UnauthorizedException('Missing authenticated user id');
  }

  const tenantId =
    'tenantId' in user && typeof user.tenantId === 'string'
      ? user.tenantId
      : undefined;

  return {
    userId,
    tenantId,
    email:
      'email' in user && typeof user.email === 'string'
        ? user.email
        : undefined,
    roles:
      'roles' in user && Array.isArray(user.roles)
        ? user.roles.filter((role): role is string => typeof role === 'string')
        : undefined,
  };
}

export function getAuthContext(req: Request): {
  ownerUserId: string;
  tenantId: string;
} {
  const user = requireAuthUser(req);

  return {
    ownerUserId: user.userId,
    tenantId: user.tenantId ?? 'default',
  };
}
