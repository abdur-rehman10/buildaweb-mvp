# PLAN.md

## Branch
feat/prod-dockerfiles

## Goal
Add production-grade Docker build/run setup for API and Web with minimal runtime images and no application behavior changes.

## In Scope
- Add `apps/api/Dockerfile`:
  - multi-stage build
  - compile NestJS to `dist`
  - runtime stage uses `NODE_ENV=production`
  - run API using built output
- Add `apps/web/Dockerfile`:
  - build Vite app in build stage
  - serve static `dist` from Nginx in runtime stage
- Add minimal Nginx config for Web app shell routing:
  - serve static assets
  - SPA fallback to `index.html`
  - no impact on published-site hosting behavior
- Add minimal Docker Compose wiring to build and run API + Web containers locally for validation.

## Out of Scope
- Changes to app routes, business logic, API contracts, or auth
- Any backend/frontend feature changes
- Changes to published static-site MinIO behavior
- Infrastructure redesign beyond required Docker build/run files

## Definition of Done
- `docker build` succeeds for `apps/api` and `apps/web` images.
- Containers can be started locally with Docker Compose.
- Web container loads and can call API container successfully.
- Existing API contracts and behavior remain unchanged.
