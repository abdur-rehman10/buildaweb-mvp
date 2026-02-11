# PLAN.md

## Branch
feat/infra-media-proxy

## Goal
Proxy MinIO asset delivery through Caddy (`/media`) so public images load from the app host/port in IP-based HTTP deployments without exposing MinIO API port 9000.

## In Scope
- Caddy: add `/media/*` reverse proxy to MinIO.
- API: generate asset `publicUrl` with `MEDIA_PUBLIC_BASE_URL` (fallback `${PUBLIC_APP_URL}/media` in production).
- Infra: remove requirement to publicly expose MinIO `9000` in production compose.
- Docs: update deployment guidance and security-group recommendations.

## Out of Scope
- New media endpoints.
- Frontend UI changes.
- Domain/TLS rollout changes.

## Definition of Done
- Asset URLs resolve via `http://<PUBLIC_APP_URL>/media/...`.
- Caddy serves media proxy on port 80.
- MinIO API port 9000 is no longer required to be public.
- Deployment docs include `/media` proxy setup and SG hardening notes.

## Status
- Completed: Proxy MinIO assets through Caddy and remove need for public port 9000.

## Phase 1
### Step 1: Enforce 1 user = 1 project
- Status: DONE
- Changes:
  - Added unique project ownership index at DB level (`tenantId + ownerUserId`).
  - Project create now returns `403` with `PROJECT_ALREADY_EXISTS` if user already has a project.
  - Duplicate-key race case (`E11000`) is converted to the same `403` behavior.
  - Projects UI create form is disabled once a project exists, with a clear MVP-limit hint.
  - Added API tests for first create success + second create blocked, plus service duplicate-key coverage.
