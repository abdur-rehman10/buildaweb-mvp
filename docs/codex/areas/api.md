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

## Phase-1 invariants
- Enforce strict validation: reject unknown fields, enforce ID regex/text limits, and use strict enums.
- Keep validator/repair pipeline staged and deterministic (validate -> repair -> revalidate).
- Preserve canonical hash rules and `renderer_version` tracking for reproducible outputs.
- Keep renderer output contract stable as `{ html, css, hash }`.
- Maintain publish manifest/state-machine invariants and guarded transitions.
- See tracker: `docs/spec/phase-1-ai-website-engine.md`.
