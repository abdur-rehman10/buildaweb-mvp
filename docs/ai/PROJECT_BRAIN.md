# Buildaweb Project Brain (stable)

## Product
- What Buildaweb is (1 paragraph)
- What it is NOT (non-goals)

## Repo structure
- apps/api (NestJS)
- apps/web (frontend)
- branch flow: develop -> staging, main -> prod

## Hard constraints (must not break)
- No breaking API changes without migration
- No refactors unless explicitly requested
- Deterministic outputs where required (renderer/publish paths)

## How we work
- One PR per task
- PRs target develop
- Must pass lint/typecheck/test/build before merge

## Current phase
- Phase: <Phase 1/2/...>
- Highest priority: <one sentence>
