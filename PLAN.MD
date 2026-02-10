# PLAN.md

## Branch
fix/deploy-healthcheck-ip

## Goal
Harden deploy health checks for IP-based EC2 deployments so transient Caddy restarts do not cause false failures.

## In Scope
- Update `scripts/deploy-prod.sh` health checks to:
  - retry for ~30 seconds after compose up
  - support both `http://127.0.0.1` and `https://127.0.0.1` (`-k`)
  - prefer `/api/v1/health`
  - fallback to `/api/v1/auth/me` expecting `401`
  - avoid any domain/host-header assumptions
- On health-check failure, print recent logs from:
  - `buildaweb-caddy`
  - `buildaweb-api`
  - `buildaweb-web`

## Out of Scope
- App/API feature changes
- Domain/TLS infrastructure changes
- Compose topology changes

## Definition of Done
- Deploy script succeeds on IP-only EC2 when services become healthy within retry window.
- Transient Caddy restart/reset during startup no longer causes immediate failure.
- Script exits non-zero with service logs when health checks never recover.
- Script prints `DEPLOY OK` only when web + API health checks pass.
