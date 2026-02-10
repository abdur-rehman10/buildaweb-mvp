# Production Deployment (EC2)

This repository supports two deployment modes. Default mode is IP-based and HTTP-only.

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

## Mode A: IP MODE (Default)
- HTTP only
- Caddy exposed on port `80` only
- No domain required
- No TLS/certificate provisioning

Use this mode when accessing the app via `http://<EC2_IP>/`.

Important:
- Do **not** expose port `443` in IP mode.
- Do **not** expect HTTPS on raw EC2 IP.

## Mode B: DOMAIN MODE (Future)
- HTTPS enabled
- Port `443` exposed
- Requires:
  - real domain DNS pointing to EC2
  - ACME email configured
  - Caddy HTTPS config for domain host

## One-Command Deploy (IP Mode)
From repository root on EC2, run either:

```bash
./deploy-prod.sh
```

or:

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
