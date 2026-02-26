# API Area Guide

## Conventions (NestJS)
- Framework: NestJS with modular structure under `apps/api/src`.
- Keep REST conventions and global prefix `/api/v1`.
- Keep response envelope shape:
  - `{ "ok": true, "data": {} }`
  - `{ "ok": false, "error": { "code": "", "message": "" } }`
- Keep user-scoped behavior for MVP routes.

## Auth typing expectations
- Use typed request/user objects in guards/controllers (avoid untyped `any`).
- Preserve JWT access-token MVP scope (no refresh token flow in this phase).
- Keep bcrypt-based password hashing behavior.

## Commands
Run from repository root:
- `pnpm --dir apps/api run lint`
- `pnpm --dir apps/api run test`
- `pnpm --dir apps/api run build`
