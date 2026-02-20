# ECR Repositories (Terraform)

Creates the API and WEB ECR repositories and applies lifecycle policies.

## Defaults
- API repo: `buildaweb-api`
- WEB repo: `buildaweb-web`
- Lifecycle policy: keep last `30` images

## Usage
```bash
cd infra/iac/ecr
terraform init
terraform apply \
  -var="aws_region=us-east-1" \
  -var="api_repository_name=buildaweb-api" \
  -var="web_repository_name=buildaweb-web" \
  -var="lifecycle_keep_last_n=30"
```
