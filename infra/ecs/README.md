# ECS Task Definition Templates

This folder contains ECS task definition JSON templates used by deployment automation.

## Files
- `taskdef-api.json` for the API service container (`name: api`)
- `taskdef-web.json` for the web service container (`name: web`)

## Export Existing Task Definitions From AWS
Use this if you already have running services and want to sync templates:

```bash
aws ecs describe-task-definition \
  --task-definition <API_TASK_DEFINITION_FAMILY_OR_ARN> \
  --query taskDefinition > infra/ecs/taskdef-api.json

aws ecs describe-task-definition \
  --task-definition <WEB_TASK_DEFINITION_FAMILY_OR_ARN> \
  --query taskDefinition > infra/ecs/taskdef-web.json
```

## Cleanup Required After Export
Remove ECS-managed fields before using in CI/CD registration:

- `taskDefinitionArn`
- `revision`
- `status`
- `requiresAttributes`
- `compatibilities`
- `registeredAt`
- `registeredBy`

## Fields You Must Adjust
- `family`
- `executionRoleArn`
- `taskRoleArn`
- `cpu` and `memory`
- `containerDefinitions[].image`
- `containerDefinitions[].logConfiguration.options.awslogs-group`
- `containerDefinitions[].logConfiguration.options.awslogs-region`
- `containerDefinitions[].environment`
- `containerDefinitions[].secrets`

## Important
- Keep container names aligned with deploy automation:
  - API container name must be `api`
  - WEB container name must be `web`
- Use placeholders only in git.
- Do not commit real ARNs, credentials, or secret values.
