# Buildaweb — Development Plan

## Now (Next 3 Steps)
1) Repo standards: Codex context + agent memory files + branching workflow (current step)
2) Add backend scaffold (NestJS) + local Docker (Mongo + MinIO)
3) Connect frontend to backend (auth + projects + pages)

## Definitions
### MVP Functional (must work)
Auth, Dashboard, Project, Editor save/load, Tokens, Navigation, Assets upload, Preview, Publish, AI generate, Billing.

### UI Present but Limited
Team/Collab, Analytics, Marketplace, Integrations, Version History — show UI but disable/coming soon.

### Out of MVP
CMS/blog, forms builder, ecommerce, animations, free-drag, advanced grid, AI images, multilingual.

## Git Workflow
- main: always deployable
- feature branches: feat/<area>-<short-name>
- bugfix branches: fix/<area>-<short-name>
- PR required before merge to main
- squash merge preferred

## Coding Standards
- TypeScript strict
- No breaking API contracts
- Validate editor JSON on backend
- Enforce tenant + user scoping everywhere
