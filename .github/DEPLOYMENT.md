# CI/CD Deployment Workflows

This repository deploys **staging** and **production** from GitHub Actions using AWS OIDC (no long-lived AWS keys).

## Required Repository Configuration

### Secrets

- `AWS_ROLE_ARN`: IAM role assumed by GitHub Actions via OIDC.

### Variables

- `AWS_REGION`
- `ECS_CLUSTER`
- `STAGING_DOMAIN` (example: `staging.buildaweb.ai`)
- `PROD_DOMAIN` (example: `buildaweb.ai`)
- `STG_API_SERVICE` (example: `buildaweb-api-stg-svc`)
- `STG_WEB_SERVICE` (example: `buildaweb-web-stg-svc`)
- `PROD_API_SERVICE` (example: `buildaweb-api-svc`)
- `PROD_WEB_SERVICE` (example: `buildaweb-web-svc`)
- `API_ECR_REPO` (example: `buildaweb-api`)
- `WEB_ECR_REPO` (example: `buildaweb-web`)

## Workflows

- `pr-gate.yml` (pull_request to `develop` and `main`)
  - API: install + build + test
  - Web: install + build

- `deploy-staging.yml` (push to `develop`)
  - Builds/pushes API and Web images tagged as `${GITHUB_SHA}-${GITHUB_RUN_ATTEMPT}`
  - Registers new ECS task definition revisions from currently-running service task definitions
  - Updates staging ECS services and waits for stability
  - Runs smoke tests against `https://${STAGING_DOMAIN}`

- `deploy-prod.yml` (push to `main`)
  - Same deployment sequence as staging
  - Runs smoke tests against `https://${PROD_DOMAIN}`

## Smoke Tests

Both deploy workflows run only non-mutating checks (`GET`) after ECS becomes stable:

- `GET /api/v1/health` expects `200`
- `GET /api/v1/auth/me` expects `401` without token
- `GET /` expects `200`
- `GET /login` expects `200`
- `GET /signup` expects `200`
- `GET /dashboard` expects `200` or `302`

Each failure captures endpoint, expected/actual status, and body snippet in logs.

## Failure Reporting

When smoke tests fail in staging or production:

1. Workflow logs include failing endpoint details and body snippet.
2. The workflow is marked failed.
3. A GitHub Issue is created automatically with:
   - failing endpoint(s)
   - HTTP code/body snippet
   - workflow run link
   - Codex trigger line (for example: `@codex fix staging failure: ...`)
