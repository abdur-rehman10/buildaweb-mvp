# PLAN.md

## Branch
fix/aws-ip-deploy

## Goal
Make AWS EC2 IP-based deployment reproducible and documented.

## In Scope
- Caddy routing baseline:
  - Ensure `/api/*` is proxied to API without stripping the `/api` prefix.
  - Use `handle /api/*` (not `handle_path`) for API routing.
- Production compose hardening:
  - Ensure `docker-compose.prod.yml` exposes MinIO ports `9000` and `9001` (MinIO only).
  - Ensure Mongo remains internal-only in production compose (no host port publish).
- Environment baseline:
  - Ensure `.env.prod.example` uses MinIO endpoint without protocol (`MINIO_ENDPOINT=minio`, `MINIO_PORT=9000`).
- Deployment docs:
  - Add `DEPLOY_AWS_IP.md` with exact deploy steps.
  - Include AWS security group port rules.
  - Include verification `curl` checks and troubleshooting for "connection reset by peer".

## Out of Scope
- Domains and real TLS certificates
- Custom domains
- CDN setup
- Backups and disaster recovery
- IAM hardening
- ECS/Kubernetes migration

## Definition of Done
- `curl http://localhost/api/v1/auth/me` returns `401` (not `404`) through proxy routing.
- `docker ps` shows MinIO mapped on `9000/9001` and Mongo internal-only (no published port).
- `DEPLOY_AWS_IP.md` contains security group rules and troubleshooting for "connection reset by peer".
