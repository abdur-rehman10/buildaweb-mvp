import type { AppUserPrincipal } from '../auth/types/app-user-principal';

declare global {
  namespace Express {
    interface User extends AppUserPrincipal {
      readonly __appUserPrincipalBrand?: never;
    }
  }
}

export {};
