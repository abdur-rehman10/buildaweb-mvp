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

Media URL variables for production:
- `PUBLIC_APP_URL` (required): public app origin, for IP mode use `http://<EC2_IP>`; also used to build absolute published site URLs (`/p/<slug>/`)
- `MEDIA_PUBLIC_BASE_URL` (recommended): proxied media base, use `http://<EC2_IP>/media`
- `MINIO_PUBLIC_URL` (legacy fallback): optional compatibility variable
- `MINIO_PUBLIC_BASE_URL` (legacy fallback): optional compatibility variable
- `AUTH_RATE_LIMIT_MAX` / `AUTH_RATE_LIMIT_WINDOW_MS` (optional): auth endpoint throttling controls

The API generates asset URLs using this priority:
1. `MEDIA_PUBLIC_BASE_URL`
2. (production fallback) `${PUBLIC_APP_URL}/media`
3. `MINIO_PUBLIC_URL`
4. `MINIO_PUBLIC_BASE_URL`

This serves assets through Caddy on port `80` and prevents broken image URLs like `http://localhost:9000/...`, `http://minio:9000/...`, or forced `https://` in HTTP-only IP deployments.

## Mode A: IP MODE (Default)
- HTTP only
- Caddy exposed on port `80` only
- No domain required
- No TLS/certificate provisioning

Use this mode when accessing the app via `http://<EC2_IP>/`.

Important:
- Do **not** expose port `443` in IP mode.
- Do **not** expect HTTPS on raw EC2 IP.
- Keep MinIO API port `9000` closed from the internet (assets are proxied via `/media`).
- Keep MinIO console `9001` restricted to your IP only (or close it when not needed).

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
- Runs HTTP health checks for web (`/`), API (`/api/v1/health` with `/api/v1/auth/me` fallback), and media proxy (`/media/minio/health/live`).
- Prints `DEPLOY OK` only when checks pass.

## API Lint Scope (Temporary)
- Run scoped AI lint during AI feature work:
  - `pnpm --dir apps/api run lint:ai`
- This targets only AI generator files and avoids unrelated legacy lint failures in untouched modules.
- Full repo-wide lint cleanup is tracked as a separate milestone.

## Rollback
If a deployment is bad:

```bash
git log --oneline -n 5
git reset --hard <previous-good-commit>
make deploy-prod
```

This restores a known commit and redeploys containers.

## Media Troubleshooting (Broken Images)
- Confirm `.env.prod` values:
  - `PUBLIC_APP_URL=http://<EC2_IP>`
  - `MEDIA_PUBLIC_BASE_URL=http://<EC2_IP>/media`
- Re-deploy containers after changing env:
  - `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build`
- Verify object URL from browser:
  - Open a returned `publicUrl` directly; it should return `200` and image content.
- Verify media proxy health:
  - `curl -I http://127.0.0.1/media/minio/health/live`
