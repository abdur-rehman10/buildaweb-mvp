# Codex Mini-Task Library

## Purpose
Reusable mini-tasks can be referenced by ID from a TASKLIST (for example: `MINI:T01`).

## Execution rule
When a TASKLIST references `MINI:Txx`, execute that mini-task exactly as written. Unless explicitly stated otherwise, use one PR per mini-task.

---

## MINI:T01 — Codex Session Start checklist + bootstrap verification

### Scope
- Ensure `docs/codex/README.md` contains `## Codex Session Start (Required)` with exactly these four checklist bullets:
  - Run: `bash docs/codex/bootstrap.sh`
  - Confirm: `git remote -v`
  - Confirm: `gh api user --jq .login`
  - Confirm: `git status -sb` is clean
- Verify `docs/codex/bootstrap.sh` guarantees:
  - inside git repo check
  - ensure origin exists via `GIT_REMOTE_URL`
  - `git fetch origin --prune`
  - checkout/pull base branch (default `develop`)

### Commands
- `bash docs/codex/bootstrap.sh`
- `gh api user --jq .login`
- `git remote -v`
- `git status -sb`
- `rg -n "git rev-parse --is-inside-work-tree|GIT_REMOTE_URL|git fetch origin --prune|GIT_DEFAULT_BASE|git pull --ff-only" docs/codex/bootstrap.sh`

### Definition of Done
- README has the required section and the four bullets.
- Bootstrap guarantees are verified (or minimally patched if missing).
- Branch/commit/PR flow is completed per standard workflow.

---

## MINI:T02 — Workspace Cleanliness Gate (pre-commit/pr)

### Scope
- Run `git status -sb` before commit and before PR operations.
- Stop if unexpected `??` files are present.
- Use `git clean -nd` for preview, then `git clean -fd` only when safe.
- Never run `git add -A` while unexpected untracked files exist.

### Commands
- `git status -sb`
- `git clean -nd`
- `git clean -fd` (only if safe)

### Definition of Done
- Working tree includes only intended changes.
- No unexpected untracked files remain before commit/PR.
- Staging is limited to task-scoped files.


---

## MINI:T03 — Docs Consistency Check

### Purpose
Ensure docs stay aligned with code/process changes and enforce the Docs Update Policy.

### Checklist
- Run `git diff --name-only origin/develop...HEAD` (or equivalent) and identify whether changes touch:
  - `.github/workflows` or deployment scripts
  - `apps/api` or `apps/web` commands/tooling
  - `docs/codex/*` files
- If changes touch workflow/CI/deploy/commands and docs were not updated, STOP and report:
  - exact docs file suggestions that should be updated
  - short guidance on which section should be added/edited
- If docs are updated appropriately, report: `Docs consistent ✅`

### Definition of Done
- The consistency check is documented clearly.
- `MINI:T03` can be referenced directly from TASKLIST items.

---

## MINI:T04 — Env Separation Check (Staging vs Prod)

### Purpose
Prevent accidental routing/deploy overlap.

### Steps
- Fetch `/api/v1/health` from staging and prod.
- Compare `git_sha` and `build_time_utc`.
- If they are identical when we expect staging-only deploy, STOP and report `staging/prod not separated`.

### Commands (examples)
- `curl -s https://staging.buildaweb.ai/api/v1/health`
- `curl -s https://buildaweb.ai/api/v1/health`

### Pass criteria
- `staging git_sha != prod git_sha` (unless a prod deploy just happened intentionally).

### Fail criteria
- Identical `git_sha` + identical `build_time_utc` unexpectedly.
- Missing `git_sha`/`build_time_utc` fields.
