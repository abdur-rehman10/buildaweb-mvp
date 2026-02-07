
---

## ✅ UPDATED `PLAN.md` (explicit branch goal)

```md
# Buildaweb — Development Plan

## Current Branch
feat/auth-user-module

## Branch Goal (DO NOT EXPAND)
Implement the **User + Auth domain** only.

This branch includes:
- User schema (MongoDB)
- Email + password signup
- Login (JWT)
- Auth guard
- First protected endpoint

This branch explicitly excludes:
- Editor logic
- Projects / pages
- AI generation
- Publishing
- Billing
- White-label logic

## Completed
- Frontend scaffold (React + Vite)
- Backend scaffold (NestJS)
- Docker setup (MongoDB + MinIO)
- MongoDB connection verified
- Health + DB ping endpoints

## Next (After This Branch)
1) Projects + pages domain
2) Editor JSON save/load
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
