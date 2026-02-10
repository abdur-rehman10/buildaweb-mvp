# PLAN.md

## Branch
feat/prod-compose

## Goal
Add a production compose stack with Caddy reverse proxy for TLS and routing across web and API services.

## In Scope
- Add/adjust `docker-compose.prod.yml` to run:
  - `mongo` with private persistent volume
  - `minio` with persistent volume(s)
  - `api`
  - `web`
  - `caddy` reverse proxy
- Add Caddy routing config for host + API path routing with TLS suitable for local validation.
- Add `.env.prod.example` with non-secret placeholders and required variable names.

## Out of Scope
- App feature changes (frontend/backend business logic)
- API contract changes
- Production secret values
- Infrastructure beyond compose + Caddy routing setup

## Definition of Done
- `docker compose -f docker-compose.prod.yml up -d` starts the production stack.
- Caddy routes app traffic to web and `/api/*` requests to API.
- Mongo and MinIO persist data to Docker volumes.
- `.env.prod.example` documents required environment variables without real secrets.
