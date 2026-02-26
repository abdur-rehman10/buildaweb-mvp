export interface AppUserPrincipal {
  userId: string;
  email?: string;
  roles?: string[];
  tenantId?: string;
}
