# Web Local Rules

Before editing files in `apps/web`, run and verify relevant commands:
- `pnpm --dir apps/web run build`
- `pnpm --dir apps/web run lint` (if present)
- `pnpm --dir apps/web run test` (if present)

Conventions:
- Keep component changes minimal and design-consistent.
- Keep routing and page behavior predictable and testable.
- Do not expose backend secrets in frontend code.
- Coordinate API contract changes with backend updates and docs.
