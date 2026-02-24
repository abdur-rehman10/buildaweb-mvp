import { authApi, type AuthUser } from './api';
import { clearAuthToken, getAuthToken, setAuthToken } from './auth';

let currentUser: AuthUser | null = null;

function normalizeUser(payload: unknown): AuthUser | null {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  if (record.user && typeof record.user === 'object') {
    return record.user as AuthUser;
  }

  if (typeof record.email === 'string') {
    return payload as AuthUser;
  }

  return null;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const result = await authApi.login({ email, password });
  const user = normalizeUser(result);

  if (!result.accessToken || !user) {
    throw new Error('Invalid login response');
  }

  setAuthToken(result.accessToken);
  currentUser = user;
  return user;
}

export async function signup(email: string, password: string): Promise<AuthUser> {
  const result = await authApi.signup({ email, password });
  const user = normalizeUser(result);

  if (!result.accessToken || !user) {
    throw new Error('Invalid signup response');
  }

  setAuthToken(result.accessToken);
  currentUser = user;
  return user;
}

export async function hydrateCurrentUser(): Promise<AuthUser | null> {
  const token = getAuthToken();
  if (!token) {
    currentUser = null;
    return null;
  }

  try {
    const result = await authApi.me();
    const user = normalizeUser(result);
    if (!user) {
      logout();
      return null;
    }

    currentUser = user;
    return user;
  } catch {
    logout();
    return null;
  }
}

export function logout(): void {
  currentUser = null;
  clearAuthToken();
}

export function getCurrentUser(): AuthUser | null {
  return currentUser;
}
