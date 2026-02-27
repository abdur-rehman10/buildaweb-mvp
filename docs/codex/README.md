# Codex Instruction System

## Codex Session Start (Required)
- Run: `bash docs/codex/bootstrap.sh`
- Confirm: `git remote -v`
- Confirm: `gh api user --jq .login`
- Confirm: `git status -sb` is clean

To work safely in this repository, ALWAYS read instructions in this order:

1. `CODEX_PROMPT.md`
2. `AGENTS.md`
3. `PLAN.md`
4. `docs/codex/AUTOPILOT.md`

Then, before modifying any directory, check for and read a local `RULES.md` file inside that directory.

## Navigation map
- Autopilot workflow: `docs/codex/AUTOPILOT.md`
- Task list template: `docs/codex/TASKLIST.template.md`
- Documentation update rules: `docs/codex/UPDATE_POLICY.md`
- Repository architecture context: `docs/codex/CONTEXT/architecture.md`
- Area-specific references:
  - API: `docs/codex/areas/api.md`
  - Web: `docs/codex/areas/web.md`
  - Infra/CI: `docs/codex/areas/infra.md`
