# PLAN.md

## Branch
fix/prod-hardening

## Goal
Harden production API startup and auth safety by enforcing strict CORS origins, validating required env vars, and preventing debug reset token exposure in production.

## In Scope
- API startup hardening:
  - Configure CORS origins from environment variables.
  - Disallow wildcard CORS in production mode.
  - Keep local development behavior practical.
- Environment validation at startup:
  - Fail fast with clear errors when required env vars are missing/invalid in production.
  - Include key settings such as `JWT_SECRET`, `MONGO_URI`, and core auth/minio settings used at runtime.
- Forgot-password safety:
  - Ensure reset debug token is never included when `NODE_ENV=production`.

## Out of Scope
- New auth features or endpoint changes
- API response contract changes
- Frontend/UI changes
- Infrastructure refactors beyond env usage

## Definition of Done
- Starting API with `NODE_ENV=production` and missing required env fails immediately with a clear startup error.
- Production CORS only allows configured origins (no wildcard).
- Forgot-password endpoint never returns debug reset token in production.
- Existing API behavior remains unchanged outside these hardening rules.
