# PLAN.md

## Branch
feat/domain-ssl

## Goal
Move production access from raw EC2 IP to domain-based HTTPS using Caddy + Let's Encrypt.

## In Scope
- Update Caddy production routing to:
  - serve web on `https://<DOMAIN>`
  - redirect `http://<DOMAIN>` to HTTPS
  - proxy `https://<DOMAIN>/api/*` to `api:4000` without stripping `/api`
- Keep MinIO access behavior unchanged on ports `9000` and `9001`.
- Add/update production env template for domain-based deploy (`DOMAIN`, Caddy ACME email, CORS origin).
- Add deployment documentation for domain + DNS + HTTPS validation checks.

## Out of Scope
- Custom domain automation platform work
- CDN, WAF, backup or IAM hardening
- App feature or API contract changes
- MinIO reverse-proxy/domain migration

## Definition of Done
- `curl -I http://<DOMAIN>/` returns `301/308` to HTTPS.
- `curl -I https://<DOMAIN>/` returns `200`.
- `curl -I https://<DOMAIN>/api/v1/auth/me` returns `401` (not `404`).
- Production compose still builds and starts with updated Caddy/domain config.
