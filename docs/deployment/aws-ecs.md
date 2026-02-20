# AWS ECS Deployment (GitHub Actions + OIDC)

This document describes required GitHub configuration and deployment behavior for AWS ECS deploys on pushes to `main`.

## Required GitHub Repository Variables
Set these in **Settings -> Secrets and variables -> Actions -> Variables**.

- `AWS_REGION`
- `ECS_CLUSTER`
- `ECS_SERVICE_API`
- `ECS_SERVICE_WEB`
- `ECR_REPO_API`
- `ECR_REPO_WEB`

### Example Variable Values
Use values that match your AWS account resources.

- `AWS_REGION=us-east-1`
- `ECS_CLUSTER=buildaweb-prod-cluster`
- `ECS_SERVICE_API=buildaweb-prod-api`
- `ECS_SERVICE_WEB=buildaweb-prod-web`
- `ECR_REPO_API=buildaweb-prod-api`
- `ECR_REPO_WEB=buildaweb-prod-web`

## Required GitHub Repository Secrets
Set these in **Settings -> Secrets and variables -> Actions -> Secrets**.

- `AWS_ROLE_ARN`

### Example Secret Value
- `AWS_ROLE_ARN=arn:aws:iam::123456789012:role/buildaweb-github-oidc-deploy`

## Authentication Model
- Deploy workflow uses GitHub OIDC via `aws-actions/configure-aws-credentials`.
- `id-token: write` permission is required.
- Do not configure long-lived AWS access keys in GitHub.

## Deploy Workflow Inputs and Artifacts
- Trigger: push to `main`
- Builds and pushes:
  - API image from `apps/api/Dockerfile`
  - WEB image from `apps/web/Dockerfile`
- Image tags: `${github.sha}`
- Task definitions rendered from:
  - `infra/ecs/taskdef-api.json` (container name `api`)
  - `infra/ecs/taskdef-web.json` (container name `web`)
- ECS services updated:
  - `${{ vars.ECS_SERVICE_API }}`
  - `${{ vars.ECS_SERVICE_WEB }}`

## Notes
- Keep real ARNs and secret values out of git.
- Ensure `infra/ecs/taskdef-api.json` and `infra/ecs/taskdef-web.json` exist and include valid ECS configuration for your environment.
