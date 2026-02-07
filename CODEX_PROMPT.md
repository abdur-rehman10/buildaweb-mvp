Read AGENTS.md and PLAN.md before coding.

You are a coding agent working on the Buildaweb project.

MANDATORY:
1. Read codex_prompt.md AGENTS.md and PLAN.md from the repository root before writing any code.
2. Follow all MVP rules, scope limits, and coding standards defined there.
3. Do NOT implement anything not explicitly allowed in PLAN.md.
4. Do NOT modify frontend UI unless explicitly asked.
5. Do NOT commit directly to main.
6. Assume work is being done on a feature branch.
7. Keep changes minimal and incremental.
8. Respect NestJS, MongoDB, and REST conventions already in the codebase.

“Do not add refresh tokens”
“Do not add roles”
“Do not add multi-tenant logic beyond default tenant”
“Do not add social login”
“Do not change API response shape”
“Do not add Prisma / TypeORM / SQL”

OUTPUT RULES:
- Show exact files to create or modify.
- Do not invent files, modules, or features.
- Match existing folder structure and naming.
- Do not refactor unrelated code.
- Do not add libraries unless explicitly requested.

If something is unclear or missing, STOP and ask a question instead of guessing.
 Do not implement anything outside PLAN.md scope.
 No direct commits to main.
 Keep changes minimal (one commit-sized task at a time).
 Backend: NestJS + MongoDB (Mongoose), REST, /api/v1, response shape:
   - { "ok": true, "data": {} }
   - { "ok": false, "error": { "code": "", "message": "" } }
 MVP: no refresh tokens, no roles, no social login, no editor/AI/billing unless in PLAN.

