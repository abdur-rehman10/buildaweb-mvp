# PLAN.md

## Branch
feat/auth-forgot-password

## Goal
Implement a minimal, secure forgot-password and reset-password flow with dev-only token output and matching frontend screens.

## In Scope
- Backend endpoints:
  - `POST /api/v1/auth/forgot-password`
  - `POST /api/v1/auth/reset-password`
- Forgot-password behavior:
  - Always return `ok: true` (no user enumeration).
  - If user exists, generate cryptographically secure token.
  - Store only token hash with `userId`, `expiresAt`, `usedAt`, `createdAt`.
  - Return `debugResetToken` only when `NODE_ENV !== 'production'`.
- Reset-password behavior:
  - Validate token hash, expiration, and unused state.
  - Update password with existing hashing approach.
  - Mark token `usedAt`.
- Add password-reset token Mongo model with indexes:
  - `tokenHash` unique
  - `userId`
  - TTL on `expiresAt` (recommended)
- Frontend screens:
  - Forgot Password form (email + generic success message)
  - Reset Password form (token + new password + submit)
  - Routing integrated with existing frontend style

## Out of Scope
- SMTP integration
- Email templates
- Refresh tokens
- Magic-link login
- Auth architecture refactors
- New roles/permissions

## Definition of Done
- Forgot/reset endpoints exist and follow `{ ok, data } / { ok, error }` contract.
- UI screens exist and complete the flow.
- Forgot response never reveals account existence.
- Reset token is never exposed in production responses.
- Manual tests pass:
  - Existing user forgot -> dev token returned in dev only
  - Reset with valid token updates password and login succeeds
  - Non-existing user forgot still returns ok
  - Invalid/expired/reused token reset fails safely
