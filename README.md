# buildaweb-mvp
Build a web is an AI Website Builder. 

## Local Pretty URL Proxy

For local published-site browsing with pretty URLs, use the Nginx reverse proxy:

- Start services with Docker Compose.
- Open published pages via `http://localhost:8080/.../home/` instead of MinIO `:9000`.
- Requests ending in `/index.html` are redirected to their directory form.
- Run `scripts/test-pretty-urls.sh /buildaweb/buildaweb-sites/.../home/` after publishing to validate rewrites.

## Production Compose (Caddy)

Use the production stack with Caddy host routing + local TLS:

1. Copy env template:
   - `cp .env.prod.example .env.prod`
2. Start stack:
   - `docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build`
3. Check routes:
   - `curl -k https://app.localhost/`
   - `curl -k https://app.localhost/api/v1/health`
   - `curl -k https://api.localhost/api/v1/health`

Notes:
- `*.localhost` resolves locally by default on modern systems.
- Caddy uses internal local TLS, so `curl` examples use `-k`.
