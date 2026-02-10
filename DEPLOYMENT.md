# Production Deployment (EC2)

This repository includes a one-command production deploy workflow for EC2.

## Prerequisites
- Ubuntu EC2 instance with Docker Engine + Docker Compose plugin installed.
- Repository cloned on the server.
- `.env.prod` file at the repository root (never commit secrets).

## Environment File
Create `.env.prod` from the template:

```bash
cp .env.prod.example .env.prod
```

Set real production values in `.env.prod` (JWT secret, Mongo URI, domain, MinIO keys, etc.).

## One-Command Deploy
From repository root on EC2:

```bash
make deploy-prod
```

What it does:
- Fails fast on errors.
- Fetches latest `origin/main`.
- Checks out `main` and hard resets to `origin/main`.
- Runs production compose pull + up/build.
- Runs health checks for web and API.
- Prints `DEPLOY OK` only when checks pass.

## Rollback
If a deployment is bad:

```bash
git log --oneline -n 5
git reset --hard <previous-good-commit>
make deploy-prod
```

This restores a known commit and redeploys containers.
