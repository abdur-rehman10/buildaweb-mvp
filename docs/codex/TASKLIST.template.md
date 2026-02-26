# Task List Template

Use sequential IDs and keep each task independently reviewable.

## Task selection rules
- Always pick the lowest-numbered task that is:
  - not completed
  - not blocked
  - has all dependencies completed
- If the next task is blocked by missing info, STOP and ask one question; do not skip silently.
- If a task is high risk, run extra verification commands before opening/updating a PR.

## Task
- **ID:** T01
- **Status:** TODO / IN-PROGRESS / BLOCKED / DONE
- **Title:**
- **Scope:**
- **Dependencies:** None
- **Risk level:** Low / Medium / High
- **PR strategy:** One PR (default) / Grouped PR (only if explicitly allowed)
- **Files:**
  - `path/to/file-a`
  - `path/to/file-b`
- **Commands:**
  - `pnpm --dir apps/api run lint`
  - `pnpm --dir apps/api run test`
- **Extra verification (required if Risk level = High):**
  -
- **Definition of Done (DoD):**
  - [ ]
  - [ ]
- **Docs Impact:**
  - [ ] No docs changes needed
  - [ ] Update `docs/codex/CONTEXT/architecture.md`
  - [ ] Update `docs/codex/areas/api.md`
  - [ ] Update `docs/codex/areas/web.md`
  - [ ] Update `docs/codex/areas/infra.md`
  - [ ] Update `apps/api/RULES.md`
  - [ ] Update `apps/web/RULES.md`
  - [ ] Update `.github/workflows/RULES.md`
  - [ ] Update `PLAN.md` (mark step DONE / update notes)
  - [ ] Other: __________
- **If BLOCKED:**
  - **Blocker:**
  - **What input is needed:**
- **Risks / Notes:**
  -

---

## Task
- **ID:** T02
- **Status:** TODO / IN-PROGRESS / BLOCKED / DONE
- **Title:**
- **Scope:**
- **Dependencies:** T01
- **Risk level:** Low / Medium / High
- **PR strategy:** One PR (default) / Grouped PR (only if explicitly allowed)
- **Files:**
- **Commands:**
- **Extra verification (required if Risk level = High):**
  -
- **Definition of Done (DoD):**
  - [ ]
- **Docs Impact:**
  - [ ] No docs changes needed
  - [ ] Update `docs/codex/CONTEXT/architecture.md`
  - [ ] Update `docs/codex/areas/api.md`
  - [ ] Update `docs/codex/areas/web.md`
  - [ ] Update `docs/codex/areas/infra.md`
  - [ ] Update `apps/api/RULES.md`
  - [ ] Update `apps/web/RULES.md`
  - [ ] Update `.github/workflows/RULES.md`
  - [ ] Update `PLAN.md` (mark step DONE / update notes)
  - [ ] Other: __________
- **If BLOCKED:**
  - **Blocker:**
  - **What input is needed:**
- **Risks / Notes:**
  -

## Docs Update Triggers
- new module/subsystem
- new env vars
- CI/CD changes
- API contract changes
- new conventions/patterns

> Continue with `T03`, `T04`, etc. in execution order.
