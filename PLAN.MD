# PLAN.md

## Branch

chore/lint-scope-ai

## Goal

Add a scoped lint workflow for AI generator files so current PRs can pass quality checks while legacy repo-wide lint debt is tracked for a dedicated cleanup phase.

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

### Step 2: Fix publish output contract

- Status: DONE
- Changes:
  - Publish endpoint now returns `slug` + `url` in a stable contract (`/p/:slug` off `PUBLIC_APP_URL`).
  - If `PUBLIC_APP_URL` is missing, API returns an empty `url` but still returns `slug`.
  - Frontend publish success handling now falls back to `${window.location.origin}/p/${slug}` when API `url` is empty.
  - Added request-level API e2e test for publish response contract and updated publish service/controller tests.

### Step 3: Production sanity layer (IP-only)

- Status: DONE
- Changes:
  - Kept Caddy in IP-safe HTTP mode (`:80`, no forced HTTPS) with `/api`, `/p`, and `/media` proxy paths.
  - Hardened publish asset/public URL base construction to prefer `MEDIA_PUBLIC_BASE_URL`, then production `${PUBLIC_APP_URL}/media`, then legacy MinIO public vars.
  - Added auth endpoint rate limiting middleware for `/api/v1/auth/*` with configurable limits (`AUTH_RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_WINDOW_MS`).
  - Updated deploy health checks to HTTP-only and added `/media/minio/health/live` verification.
  - Added tests covering publish URL sanity and auth rate limiting behavior.

## Phase 2

### Step 4: AI Site Generation Endpoint

- Status: DONE
- Changes:
  - Added `POST /api/v1/projects/:projectId/generate` (JWT + scoped) to generate and persist site structure from prompt.
  - Added AI module/service with OpenAI integration and fallback generator when `OPENAI_API_KEY` is missing.
  - Enforced strict AI JSON normalization/validation (`pages`, `navigation`, `theme`) with `502` on invalid AI output.
  - Replaced project pages + navigation on generation and updated `homePageId`.
  - Reused existing rate-limit middleware on generate endpoint.
  - Added request-level tests for generation endpoint wiring and preview URL contract.

### Step 5: AI Generation UI Wiring

- Status: DONE
- Changes:
  - Added a “Generate with AI” prompt panel in the projects screen with loading/disabled/error states.
  - Wired frontend API client to `POST /api/v1/projects/:projectId/generate`.
  - Ensured generation flow opens the generated page in the editor after refresh of pages/navigation.
  - Added frontend tests for API call payload, loading-state button disabling, and success/error behavior.

### Step 7: Full AI Website Generator

- Status: DONE
- Changes:
  - Added structured OpenAI generator output validation with `zod` and one automatic retry on invalid JSON.
  - Added Pexels integration for real section imagery (`PEXELS_API_KEY`) and injected `imageUrl` values.
  - Added service-level generation flow `ProjectsService.createFromPrompt()` to build project pages/navigation from generated schema.
  - Enforced non-empty generated sections/pages and home-page section quality checks.
  - Added tests for generation success, invalid JSON rejection, empty-section rejection, and image injection cleanup.

### Step 8: Scoped lint baseline for AI generator

- Status: DONE
- Changes:
  - Added `pnpm --dir apps/api run lint:ai` to lint only AI generator files (`src/modules/ai/**` + `test/ai-generator.spec.ts`).
  - Kept global lint rules unchanged to avoid masking existing strict-rule debt across legacy modules.
  - Confirmed AI generator files are lint-clean under scoped lint and covered by tests.
- Lint debt note:
  - Repo-wide `pnpm --dir apps/api lint` still reports legacy violations outside this scope.
  - A dedicated future milestone is required for full repository lint cleanup.
