# PLAN.md

## Branch
fix/auth-signup-hardening

## Goal
Harden signup reliability for production by tightening validation behavior, duplicate handling, safe logging, and targeted tests.

## In Scope
- API hardening:
  - normalize signup email/name safely
  - preserve strict DTO validation
  - return stable duplicate-email conflict behavior (including race on unique index)
  - keep password hashing mandatory
  - add safe structured signup logs (no password)
- Web verification:
  - confirm signup uses `/api/v1/auth/signup`
  - token persistence + auth redirect flow remains correct
- Add minimal signup-focused API tests:
  - signup success returns token
  - duplicate email returns 409
  - invalid email/short password returns 400
  - `/auth/me` works with signup token

## Out of Scope
- Auth feature expansion (roles, social login, refresh tokens)
- UI redesign
- Deployment/infrastructure changes

## Definition of Done
- Signup API consistently returns token on success and 409 on duplicate.
- Passwords are always hashed and never logged.
- `/api/v1/auth/me` accepts token from signup.
- Signup frontend continues to persist session and survive refresh.
- New tests cover core signup hardening scenarios.
