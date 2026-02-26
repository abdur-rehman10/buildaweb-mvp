# Documentation Update Policy

## Triggers (when docs must be updated)
Update docs in the same pull request when any of the following changes occur:

1. Repository structure changes (new app, moved folders, renamed paths).
2. Build/test/lint commands change.
3. CI/CD workflow behavior changes.
4. Deployment environments, smoke checks, or health endpoints change.
5. Coding conventions or local rules change.
6. API response contracts or authentication behavior change.

## Which document to update by change type
- **Global instructions/process changes** → `docs/codex/README.md`, `docs/codex/AUTOPILOT.md`
- **Task planning format changes** → `docs/codex/TASKLIST.template.md`
- **Architecture/layout changes** → `docs/codex/CONTEXT/architecture.md`
- **API area changes** → `docs/codex/areas/api.md`, `apps/api/RULES.md`
- **Web area changes** → `docs/codex/areas/web.md`, `apps/web/RULES.md`
- **Workflow/infra changes** → `docs/codex/areas/infra.md`, `.github/workflows/RULES.md`

## Docs update checklist (include in PR)
- [ ] Updated all affected docs for changed behavior.
- [ ] Verified commands in docs still run.
- [ ] Confirmed workflow names/paths referenced are current.
- [ ] Updated local `RULES.md` in touched directories when conventions changed.
- [ ] Added migration notes if old docs are now stale.
