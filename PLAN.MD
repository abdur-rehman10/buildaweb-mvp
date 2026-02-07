
---

## ✅ UPDATED `PLAN.md` (explicit branch goal)

```md
# Buildaweb — Development Plan

## Current Branch
feat/projects-pages-module

## Branch Goal (DO NOT EXPAND)
Implement the **Projects + Pages domain** only.

This branch includes:
- Projects schema + service + module
- Pages schema + service + module
- Minimal REST endpoints for:
- `POST /projects`
- `GET /projects`
- `GET /projects/:project_id`
- `POST /projects/:project_id/pages`
- `GET /projects/:project_id/pages/:page_id`
- `PUT /projects/:project_id/pages/:page_id` (save `editor_json` + `version`)
- All routes protected with JWT
- Enforce `1 user = 1 site` at project creation (or at minimum `1 project per user` for MVP)

This branch explicitly excludes:
- Tokens / navigation APIs
- Assets upload
- Preview/publish
- AI generation
- Billing

## Completed
- Frontend scaffold (React + Vite)
- Backend scaffold (NestJS)
- Docker setup (MongoDB + MinIO)
- MongoDB connection verified
- Health + DB ping endpoints

## Next (After This Branch)
1) Editor JSON save/load
2) Tokens + navigation APIs
3) Asset upload
4) Preview rendering
5) Publish flow

## Definitions
### MVP Functional (must work)
Auth, Dashboard, Project, Editor save/load, Tokens, Navigation, Assets upload, Preview, Publish, AI generate, Billing.

### UI Present but Limited
Team/Collab, Analytics, Marketplace, Integrations, Version History — UI only, disabled.

### Out of MVP
CMS/blog, forms builder, ecommerce, animations, free-drag, advanced grid, AI images, multilingual.

## Git Workflow
- `main`: always deployable
- feature branches: `feat/<area>-<short-name>`
- bugfix branches: `fix/<area>-<short-name>`
- PR required before merge to main
- Squash merge preferred

## Coding Standards
- TypeScript strict
- Validate input DTOs
- Never trust frontend input
- Enforce user scoping in every query
- Mongo IDs must never be guessable across users
```
