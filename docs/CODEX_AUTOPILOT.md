# Codex Autopilot Operating System

Use this guide as the default operating system for Codex in this repository.

## Guardrails (always on)

- Read and obey `CODEX_PROMPT.md`, `AGENTS.md`, and relevant `PLAN.md` before changes.
- Do not implement anything outside `PLAN.md` scope and constraints.
- Do not commit directly to `main`; always use a feature branch and PR into `develop` (unless explicitly instructed otherwise).
- Keep changes minimal and incremental (one task-sized change at a time).
- Respect Buildaweb MVP constraints:
  - No refresh tokens
  - No roles
  - No social login
  - No new DB stack (no Prisma/TypeORM/SQL)
- Preserve API response shape:
  - `{ "ok": true, "data": {} }`
  - `{ "ok": false, "error": { "code": "", "message": "" } }`
- Monorepo command rule: run commands from app directories (`apps/api`, `apps/web`), not from a root pnpm workspace.

---

## A) How to use this

### 1) Session Start Prompt (short)

Use when starting a fresh run:

> Follow `docs/CODEX_AUTOPILOT.md`. Read `CODEX_PROMPT.md`, `AGENTS.md`, and relevant `PLAN.md`. Execute the next task with minimal scoped changes, open PR to `develop`, fix QA until green, merge safely, then report using the required template.

### 2) Continue Prompt (very short)

Use between tasks:

> Continue in Long Task List Mode from the next unchecked task. Same constraints and reporting template.

### 3) Long Task List Mode

Use when many tasks are pasted. Codex must execute tasks sequentially using the format and rules below.

---

## B) Long Task List Mode spec

### Standard TASK LIST format

```md
## TASKLIST
- [ ] T01: <title>
  - Scope:
  - Files likely:
  - Commands to run:
  - Definition of Done:
- [ ] T02: <title>
  - Scope:
  - Files likely:
  - Commands to run:
  - Definition of Done:
```

### Execution rules

- Always pick the next unchecked task (lowest task number).
- Default: one task = one PR.
- Only group multiple tasks into one PR if the task list explicitly allows “one PR per N tasks”.
- After one task is merged, return to the task list and continue with the next unchecked task.
- If QA fails, fix minimally and retry until green.
- If blocked (missing secrets, missing AWS resource names, unclear scope, missing access), **STOP** and ask exactly one clear unblock question.

---

## C) Operating loop (step-by-step)

1. **Read constraints**
   - Open `CODEX_PROMPT.md`, `AGENTS.md`, and applicable `PLAN.md`.
   - Confirm in-scope behavior only.
2. **Pick next task**
   - Select lowest-number unchecked task from `## TASKLIST`.
3. **Create/switch branch**
   - Branch naming:
     - `feat/Txx-short-slug` for features
     - `fix/Txx-short-slug` for bug fixes
     - `docs/Txx-short-slug` for documentation
4. **Implement minimal change**
   - Touch only files needed for this task.
   - Avoid unrelated refactors.
5. **Run checks from per-app dirs**
   - API checks from `apps/api`.
   - Web checks from `apps/web`.
   - Run only required commands for task DoD plus lint/type/test/build as applicable.
6. **Commit**
   - Use clear scoped commit messages, e.g.:
     - `feat(api): add ...`
     - `fix(web): resolve ...`
     - `docs: ...`
7. **Push + PR**
   - Push branch.
   - Open PR into `develop`.
   - PR body should include scope, validation commands, and constraints confirmation.
8. **Handle CI/QA**
   - If CI fails, apply minimal fix and push.
   - Repeat until green.
9. **Handle conflicts**
   - Rebase from `develop`.
   - Resolve conflicts minimally.
   - Re-run checks and ensure CI green.
10. **Merge safely**
   - Merge only after required checks pass.
   - Verify `develop` is green post-merge.
   - If staging deploy exists, verify successful deployment.
11. **Report**
   - Post task report using the required template (below).

---

## D) Failure-handling playbook

- **Lint failures**
  - Fix only relevant lint issues introduced by scope.
  - Do not mass-reformat unrelated files.
- **TypeScript errors**
  - Fix with strict typing.
  - No global weakening (`any` sprawl, tsconfig loosening, broad ignores).
- **Test failures**
  - Fix behavior within task scope and MVP rules.
  - Do not change unrelated tests unless required by legitimate breakage.
- **Workflow/CI issues**
  - Adjust workflow/scripts only if required for task DoD.
  - Keep CI edits minimal and justified.
- **Merge conflicts**
  - Rebase from `develop`.
  - Resolve smallest possible diff.
  - Re-run checks and confirm green status.

---

## E) Reporting template (use verbatim)

1) Selected task:
2) What changed:
3) Files changed:
4) Commands run + results:
5) PR link + CI status:
6) Merge result:
7) Next task / blockers:
