# PLAN.md

## Branch
infra/deploy-one-command

## Goal
Add a reliable one-command production deploy workflow for EC2 so `main` can be shipped consistently.

## In Scope
- Add `scripts/deploy-prod.sh` fail-fast deployment script that:
  - fetches `origin/main`
  - checks out `main`
  - hard resets to `origin/main`
  - runs production compose pull + up/build
  - runs post-deploy health checks
  - prints `DEPLOY OK` only on success
- Add `Makefile` target `deploy-prod` to run the script.
- Add `DEPLOYMENT.md` with prerequisites, `.env.prod` location, one-command run instructions, and rollback note.

## Out of Scope
- App feature changes
- API contract changes
- Infrastructure redesign beyond deploy automation

## Definition of Done
- `make deploy-prod` updates server code to `origin/main` and recreates production containers.
- Deployment exits non-zero on build/start/health-check failures.
- Success path prints `DEPLOY OK`.
- Docs clearly explain EC2 prerequisites, command usage, and rollback.
