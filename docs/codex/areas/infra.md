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
