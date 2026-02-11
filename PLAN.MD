# PLAN.md

## Branch
fix/media-public-url

## Goal
Fix broken production images by generating browser-accessible MinIO asset URLs for IP + HTTP deployments.

## In Scope
- Backend: harden MinIO public URL generation so assets never resolve to internal hosts or wrong protocol.
- Backend: support explicit public URL env vars for media URL generation.
- Infra/env: wire production compose and env examples for stable public media URL configuration.
- Docs: document required env vars and verification steps for media URL correctness.

## Out of Scope
- New media endpoints or storage architecture changes.
- Frontend refactors.
- Domain/TLS rollout changes.

## Definition of Done
- Uploaded asset `publicUrl` values are externally reachable in production.
- Asset URLs never use `localhost`, `minio`, or forced `https` in HTTP-only IP mode.
- Deployment docs explain `PUBLIC_APP_URL` and `MINIO_PUBLIC_URL` clearly.
