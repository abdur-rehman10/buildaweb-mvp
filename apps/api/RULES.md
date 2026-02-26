# API Local Rules

Before editing files in `apps/api`, run and verify:
- `pnpm --dir apps/api run lint`
- `pnpm --dir apps/api run test`
- `pnpm --dir apps/api run build`

Conventions:
- Follow NestJS module/controller/service structure.
- Keep REST API prefix `/api/v1`.
- Preserve response envelope shape:
  - `{ "ok": true, "data": {} }`
  - `{ "ok": false, "error": { "code": "", "message": "" } }`
- Keep auth/user logic typed and user-scoped.
- Do not add refresh tokens, social login, or role systems in MVP-only tasks.
