# AWS ECS Deployment Automation Plan

## Goal
Prepare Buildaweb for automated deployment to AWS ECS/Fargate with ECR images and GitHub OIDC-based AWS authentication.

## Definition Of Done
- A push to `main` can trigger one automated deployment pipeline (workflow to be added later).
- API and web Docker images are built and pushed to ECR.
- ECS services are updated to new task definition revisions for API and web.
- Services are reachable behind an ALB with stable routing.
- Application and container logs are available in CloudWatch Logs.
- Runtime secrets are loaded from AWS secret stores, not stored in GitHub or frontend bundles.
- Rollback path is documented and tested: redeploy previous ECS task definition revision.

## Required AWS Resources
- ECR repositories:
  - API image repository
  - Web image repository
- ECS:
  - ECS cluster
  - API ECS service (Fargate)
  - Web ECS service (Fargate)
  - Task definitions for API and web
- Networking and traffic:
  - VPC + subnets + security groups
  - ALB with listeners/rules
  - Target group for API service
  - Target group for web service
  - Routing rules (example): `/api/*` -> API target group, default `/*` -> web target group
- Observability:
  - CloudWatch log groups for API and web containers

## Required GitHub Configuration
Set these in repository settings before adding the deploy workflow.

### GitHub Variables / Secrets
- `AWS_ROLE_ARN`
- `AWS_REGION`
- `ECS_CLUSTER`
- `ECS_SERVICE_API`
- `ECS_SERVICE_WEB`
- `ECR_REPO_API`
- `ECR_REPO_WEB`

## Secrets Strategy
- Use GitHub OIDC with `AWS_ROLE_ARN` to assume AWS role at runtime.
- Store runtime application secrets in AWS SSM Parameter Store and/or AWS Secrets Manager.
- Inject secrets into ECS task definitions via `secrets` references.
- Never commit secrets to git.
- Never ship backend secrets to the frontend bundle.

## Rollback Plan
If deployment is unhealthy:
1. Open ECS service deployment history.
2. Identify the previously healthy task definition revision.
3. Update the ECS service to use that previous revision.
4. Force a new deployment with that revision.
5. Confirm ALB target health and key endpoints.
6. Record rollback reason and follow up with a fix-forward change.

## Out Of Scope In This Plan
- No deploy workflow files yet.
- No Terraform/CDK provisioning in this step.
