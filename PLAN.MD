# PLAN.md

## Branch
feat/publish-engine

## Goal
Implement path-based publish engine so publicly published sites are served at `/p/<slug>/` from MinIO-backed artifacts.

## In Scope
- Add project publish-state fields for path-based publish metadata:
  - `isPublished`, `publishedAt`, `publishedSlug`, `publishedBucketKey`, `publishedVersion`
- Extend publish flow (`POST /api/v1/projects/:id/publish`) to:
  - generate/validate unique published slug
  - render static output
  - upload to MinIO prefix for current published version
  - update project publish-state fields
- Add `POST /api/v1/projects/:id/unpublish` to disable public serving without deleting artifacts.
- Add public metadata endpoint `GET /api/v1/published/:slug`.
- Add public site handler for `/p/<slug>/...` with SPA fallback:
  - file-like paths serve exact object
  - route-like paths serve `index.html`
- Update Caddy so `/p/*` proxies to API published-site handler while preserving existing web and `/api` routes.
- Add/update docs for publish engine behavior and verification.

## Out of Scope
- Wildcard DNS/subdomain publishing
- CDN/edge caching redesign
- Domain management automation
- Publish rollback UX redesign

## Definition of Done
- `POST /api/v1/projects/:id/publish` returns publish slug and public URL.
- `GET /api/v1/published/:slug` returns publish metadata.
- `GET /p/<slug>/` serves published `index.html`.
- `GET /p/<slug>/some/route` serves published `index.html` (SPA fallback).
- `POST /api/v1/projects/:id/unpublish` disables `/p/<slug>/` serving with 404.
