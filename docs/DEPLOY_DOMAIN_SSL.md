# Domain + HTTPS Deployment (Caddy + Let's Encrypt)

This guide upgrades Buildaweb production access from raw IP to domain-based HTTPS.

## 1) Prerequisites
- Running EC2 deployment with Docker + `docker compose`
- Domain you control
- Public EC2 IPv4 address

## 2) DNS Setup
Create an `A` record:
- Host: your root domain (example: `app.example.com`)
- Value: `<EC2_PUBLIC_IP>`
- TTL: default/low

Wait for DNS propagation before requesting certificates.

## 3) Security Group Inbound Rules
- `22` from `MY_IP/32`
- `80` from `0.0.0.0/0` (required for HTTP->HTTPS and ACME HTTP challenge)
- `443` from `0.0.0.0/0` (required for HTTPS)
- `9000` optional public (MinIO API)
- `9001` `MY_IP/32` only (MinIO Console)

## 4) Prepare Environment

```bash
cp .env.prod.example .env.prod
```

Set these values in `.env.prod`:
- `DOMAIN=<YOUR_DOMAIN>`
- `ACME_EMAIL=<YOUR_EMAIL>`
- `CORS_ORIGINS=https://<YOUR_DOMAIN>`
- `JWT_SECRET=<STRONG_SECRET>`
- MinIO creds and public base URL

MinIO remains direct on `:9000` and `:9001` in this baseline.

## 5) Start Stack

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## 6) Verification

```bash
curl -I http://<DOMAIN>/
curl -I https://<DOMAIN>/
curl -I https://<DOMAIN>/api/v1/auth/me
```

Expected:
- `http://<DOMAIN>/` -> `301` or `308` to HTTPS
- `https://<DOMAIN>/` -> `200`
- `https://<DOMAIN>/api/v1/auth/me` -> `401` (routing works, auth required)

## 7) Troubleshooting
- **`http://<DOMAIN>/` times out or reset**
  - Confirm SG allows inbound `80`.
- **HTTPS cert not issued**
  - Confirm DNS `A` record points to EC2 and has propagated.
  - Confirm inbound `80` and `443` are open.
- **`/api/v1/...` returns `404`**
  - Ensure Caddy uses `handle /api/*` and not `handle_path /api/*`.
