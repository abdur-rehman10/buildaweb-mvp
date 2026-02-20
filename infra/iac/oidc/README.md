# GitHub OIDC Deploy Role (Terraform)

This Terraform config provisions IAM resources needed for GitHub Actions to deploy to ECS without long-lived AWS keys.

## What it creates
- GitHub OIDC provider (`token.actions.githubusercontent.com`) when `create_oidc_provider=true`
- IAM role restricted to a single repository + branch (`repo:<owner>/<repo>:ref:refs/heads/main` by default)
- IAM inline policy for:
  - ECR push/pull actions
  - ECS deploy actions (register/describe task definition, update/describe service)
  - `iam:PassRole` for ECS task execution role ARN

## Quick start
```bash
cd infra/iac/oidc
terraform init
terraform apply \
  -var="aws_account_id=123456789012" \
  -var="role_name=buildaweb-github-oidc-deploy" \
  -var="github_repository=OWNER/REPO" \
  -var='ecr_repository_names=["buildaweb-prod-api","buildaweb-prod-web"]' \
  -var="ecs_cluster_name=buildaweb-prod-cluster" \
  -var='ecs_service_names=["buildaweb-prod-api","buildaweb-prod-web"]' \
  -var="ecs_task_execution_role_arn=arn:aws:iam::123456789012:role/buildaweb-ecs-task-execution-role"
```

If your account does not yet have the GitHub OIDC provider, add:
```bash
-var="create_oidc_provider=true"
```

## GitHub Secret
After apply, set repository secret:
- `AWS_ROLE_ARN=<output github_actions_role_arn>`
