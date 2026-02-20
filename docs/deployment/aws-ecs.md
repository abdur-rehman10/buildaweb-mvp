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

Terraform option:

```bash
cd infra/iac/ecr
terraform init
terraform apply \
  -var="aws_region=us-east-1" \
  -var="api_repository_name=buildaweb-api" \
  -var="web_repository_name=buildaweb-web" \
  -var="lifecycle_keep_last_n=30"
```

Use Terraform outputs for GitHub repository variables:
- `ECR_REPO_API=<output api_repository_name>`
- `ECR_REPO_WEB=<output web_repository_name>`

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

Task definition templates in this repository default to:
- API log group: `/ecs/buildaweb-api`
- WEB log group: `/ecs/buildaweb-web`

Provision these log groups with Terraform:

```bash
cd infra/iac/logs
terraform init
terraform apply \
  -var="aws_region=us-east-1" \
  -var="api_log_group_name=/ecs/buildaweb-api" \
  -var="web_log_group_name=/ecs/buildaweb-web" \
  -var="retention_in_days=30"
```

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

### 6. Provision GitHub OIDC deploy role with Terraform
Use `infra/iac/oidc` to provision AWS OIDC trust and deploy role permissions.

Required inputs:
- `AWS_ACCOUNT_ID` (12-digit account ID)
- IAM role name (default: `buildaweb-github-oidc-deploy`)
- GitHub repository (`owner/repo`)
- ECR repository names for API and WEB
- ECS cluster name and ECS service names
- ECS task execution role ARN

Apply:

```bash
cd infra/iac/oidc
terraform init
terraform apply \
  -var="aws_region=us-east-1" \
  -var="aws_account_id=123456789012" \
  -var="role_name=buildaweb-github-oidc-deploy" \
  -var="github_repository=abdur-rehman10/buildaweb-mvp" \
  -var='ecr_repository_names=["buildaweb-prod-api","buildaweb-prod-web"]' \
  -var="ecs_cluster_name=buildaweb-prod-cluster" \
  -var='ecs_service_names=["buildaweb-prod-api","buildaweb-prod-web"]' \
  -var="ecs_task_execution_role_arn=arn:aws:iam::123456789012:role/buildaweb-ecs-task-execution-role"
```

If the OIDC provider does not yet exist in the account, include:

```bash
-var="create_oidc_provider=true"
```

### 7. Configure GitHub repository settings
Set these in **Settings -> Secrets and variables -> Actions**.

Repository Variables:
- `AWS_REGION`
- `ECS_CLUSTER`
- `ECS_SERVICE_API`
- `ECS_SERVICE_WEB`
- `ECR_REPO_API` (example: `buildaweb-api`)
- `ECR_REPO_WEB` (example: `buildaweb-web`)

Repository Secret:
- `AWS_ROLE_ARN` = Terraform output `github_actions_role_arn`

## Required GitHub Deployment Configuration
Set these in **Settings -> Secrets and variables -> Actions** before running `.github/workflows/deploy-aws-ecs.yml`.

Required repository variables:
- `AWS_REGION`
- `ECS_CLUSTER`
- `ECS_SERVICE_API`
- `ECS_SERVICE_WEB`
- `ECR_REPO_API`
- `ECR_REPO_WEB`
- `PROD_BASE_URL` (example: `https://app.example.com`)

Required repository secret:
- `AWS_ROLE_ARN`

### 8. Secrets handling policy
- Store runtime values in AWS SSM/Secrets Manager.
- Reference them from ECS task definitions.
- Do not commit `.env` production secrets.
- Do not expose backend secrets to frontend code.

### 9. Docker build contexts and ports
Build from repository root so both Dockerfiles can copy app files correctly:

- API image: `docker build -f apps/api/Dockerfile -t buildaweb-api:latest .`
- WEB image: `docker build -f apps/web/Dockerfile -t buildaweb-web:latest .`

Container ports:
- API container: `4000`
- WEB container: `80`

### 10. Manual rollback procedure
- In ECS service, select previous healthy task definition revision.
- Redeploy that revision.
- Validate ALB target health and `/api/v1/health`.
- Confirm web root route is healthy.

## Authentication Model
- Deploy workflow uses GitHub OIDC via `aws-actions/configure-aws-credentials`.
- `id-token: write` permission is required.
- Do not configure long-lived AWS access keys in GitHub.

## Deploy Workflow Inputs and Artifacts
- Trigger: push to `main`
- Builds and pushes API and WEB images tagged with `${github.sha}`
- Uses task definition templates:
  - `infra/ecs/taskdef-api.json` (container name `api`)
  - `infra/ecs/taskdef-web.json` (container name `web`)
- Updates ECS services:
  - `${{ vars.ECS_SERVICE_API }}`
  - `${{ vars.ECS_SERVICE_WEB }}`
- Runs post-deploy health check:
  - `${{ vars.PROD_BASE_URL }}/api/health`
  - Retries with backoff for about 2-3 minutes before failing

## Related Plan
- Deployment plan: `infra/deploy/PLAN.md`
- Terraform OIDC config: `infra/iac/oidc/`
- Terraform ECR config: `infra/iac/ecr/`
- Terraform logs config: `infra/iac/logs/`
