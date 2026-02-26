import type { Request } from 'express';

export interface AuthUser {
  sub?: string;
  id?: string;
  tenantId?: string;
  email?: string;
  name?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  id?: string;
}
