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
