import 'express';
import type { AppUserPrincipal } from '../auth/types/app-user-principal';

declare global {
  namespace Express {
    interface User extends AppUserPrincipal {
      sub: AppUserPrincipal['sub'];
    }
    interface Request {
      user?: User;
    }
  }
}

export {};
