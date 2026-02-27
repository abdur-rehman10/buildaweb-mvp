# Infra & CI Area Guide

## CI workflow locations
- All workflows are located in `.github/workflows/`.
- Key workflows include:
  - `pr-gate.yml` (PR checks for API and Web)
  - `qa.yml` (expanded QA checks)
  - `deploy-staging.yml` (staging ECS deploy)
  - `deploy-prod.yml` / `deploy-aws-ecs.yml` / `deploy-ecs.yml` (deployment-related workflows)

## Staging deploy workflow summary
- Trigger: push to `develop` or manual dispatch.
- Uses AWS OIDC role assumption.
- Builds and pushes Docker images for API and Web to ECR.
- Updates ECS task definitions/services and waits for stability.
- Runs smoke checks against staging URL (`/` and `/api/v1/health`).

## Smoke and health checks
- Health endpoint expectation: `GET /api/v1/health`.
- Basic smoke check expectation: frontend root path `GET /`.
- Keep checks fast, deterministic, and environment-safe.


## ALB environment separation reminder
- Keep staging/prod routing separated by listener rule priority on `alb-baw-prod`.
- Apply host+path rules in this precedence order:
  1) `staging.buildaweb.ai` + `/api/*` -> `buildaweb-api-stg-tg`
  2) `staging.buildaweb.ai` + `/*` -> `buildaweb-web-stg-tg`
  3) `buildaweb.ai` + `/api/*` -> `tg-buildaweb-api`
  4) `buildaweb.ai` + `/*` -> `tg-baw-web`
- Reference: `docs/deployment/aws-ecs.md` section **Staging vs Production Routing (ALB Rule Priority)**.
