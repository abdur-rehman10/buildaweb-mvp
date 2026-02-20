# AWS ECS/Fargate Deployment Runbook (Manual Setup)

This runbook prepares AWS and GitHub for Buildaweb deployments using ECS/Fargate, ECR, and GitHub OIDC.

## Naming Conventions
Use consistent names per environment.

- Cluster: `buildaweb-<env>-cluster`
- API service: `buildaweb-<env>-api`
- Web service: `buildaweb-<env>-web`
- API ECR repo: `buildaweb-<env>-api`
- Web ECR repo: `buildaweb-<env>-web`
- ALB: `buildaweb-<env>-alb`
- API target group: `buildaweb-<env>-api-tg`
- Web target group: `buildaweb-<env>-web-tg`
- CloudWatch log groups:
  - `/ecs/buildaweb-<env>-api`
  - `/ecs/buildaweb-<env>-web`

## Checklist

### 1. Create ECR repositories
- Create API and web repositories in ECR.
- Enable image scanning.
- (Optional) Set lifecycle policy for old tags.

### 2. Create ECS cluster and task execution roles
- Create ECS cluster for Fargate.
- Ensure ECS task execution role can:
  - pull images from ECR
  - write logs to CloudWatch
  - read SSM/Secrets Manager values used by tasks

### 3. Create task definitions
- Create separate task definitions for API and web.
- Configure container ports and health checks.
- Configure CloudWatch log driver for both containers.
- Use SSM/Secrets Manager references for runtime secrets.

### 4. Create ALB and target groups
- Create ALB in public subnets.
- Create target groups for API and web services.
- Configure listener rules:
  - `/api/*` -> API target group
  - default `/*` -> web target group

### 5. Create ECS services
- Create Fargate API service using API task definition and API target group.
- Create Fargate web service using web task definition and web target group.
- Set desired count and deployment strategy.

### 6. Configure IAM role for GitHub OIDC
- Add GitHub OIDC identity provider in AWS IAM.
- Create deploy role trusted by GitHub OIDC for this repository.
- Restrict trust policy to the expected repo and branch.
- Attach least-privilege policy for ECR push + ECS service update.

### 7. Configure GitHub repository settings
Add the following in repository variables/secrets:

- `AWS_ROLE_ARN`
- `AWS_REGION`
- `ECS_CLUSTER`
- `ECS_SERVICE_API`
- `ECS_SERVICE_WEB`
- `ECR_REPO_API`
- `ECR_REPO_WEB`

### 8. Secrets handling policy
- Store runtime values in AWS SSM/Secrets Manager.
- Reference them from ECS task definitions.
- Do not commit `.env` production secrets.
- Do not expose backend secrets to frontend code.

### 9. Manual rollback procedure
- In ECS service, select previous healthy task definition revision.
- Redeploy that revision.
- Validate ALB target health and `/api/v1/health`.
- Confirm web root route is healthy.

## Related Plan
- Deployment plan: `infra/deploy/PLAN.md`
