# CloudWatch Logs for ECS Tasks (Terraform)

Creates CloudWatch log groups for API and WEB ECS task logs.

## Defaults
- API log group: `/ecs/buildaweb-api`
- WEB log group: `/ecs/buildaweb-web`
- Retention: `30` days

## Usage
```bash
cd infra/iac/logs
terraform init
terraform apply \
  -var="aws_region=us-east-1" \
  -var="api_log_group_name=/ecs/buildaweb-api" \
  -var="web_log_group_name=/ecs/buildaweb-web" \
  -var="retention_in_days=30"
```
