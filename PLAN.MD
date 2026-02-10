# PLAN.md

## Branch
chore/deploy-wrapper

## Goal
Add a root-level deploy wrapper so production deploy can be run with a simple obvious command from repo root.

## In Scope
- Add root script `./deploy-prod.sh`.
- Wrapper forwards execution to `./scripts/deploy-prod.sh`.
- Preserve exit codes and arguments.
- Make wrapper executable.
- Brief docs update mentioning both `./deploy-prod.sh` and `make deploy-prod`.

## Out of Scope
- Deploy logic refactor
- Infrastructure/API changes

## Definition of Done
- `./deploy-prod.sh` works from repo root.
- Wrapper does not duplicate deploy logic.
- Existing `scripts/deploy-prod.sh` remains the source of deploy behavior.
