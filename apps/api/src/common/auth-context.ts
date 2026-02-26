import { HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';
import { fail } from './api-response';

export type AuthContext = {
  ownerUserId: string;
  tenantId: string;
};

export function getAuthContext(req: Request): AuthContext {
  const ownerUserId = req.user?.sub;
  if (typeof ownerUserId !== 'string' || ownerUserId.trim().length === 0) {
    throw new HttpException(
      fail('UNAUTHORIZED', 'Unauthorized'),
      HttpStatus.UNAUTHORIZED,
    );
  }

  const tenantId =
    typeof req.user?.tenantId === 'string' &&
    req.user.tenantId.trim().length > 0
      ? req.user.tenantId
      : 'default';

  return { ownerUserId, tenantId };
}
