# Architecture Context (Monorepo)

## Repository structure
- `apps/api`: NestJS backend service.
- `apps/web`: frontend application (currently Vite-based SPA scaffold in this repo).
- `.github/workflows`: CI/CD automation.
- `infra/`: deployment and infrastructure support files.

## CI per app
Primary pull-request validation runs app-specific jobs:
- API checks run in `apps/api` (install, build, test, and/or lint depending on workflow).
- Web checks run in `apps/web` (install, build, and optional lint/test/typecheck depending on workflow).

## Staging deployment pipeline
- `deploy-staging.yml` is triggered on pushes to `develop` (and manual dispatch).
- Pipeline uses AWS OIDC credentials, builds/pushes API and web Docker images to ECR, updates ECS services, waits for service stability, then runs smoke checks.
- Default smoke checks call `/` and `/api/v1/health` on the staging base URL.
