# buildaweb-mvp
Build a web is an AI Website Builder. 

## Local Pretty URL Proxy

For local published-site browsing with pretty URLs, use the Nginx reverse proxy:

- Start services with Docker Compose.
- Open published pages via `http://localhost:8080/.../home/` instead of MinIO `:9000`.
- Requests ending in `/index.html` are redirected to their directory form.
- Run `scripts/test-pretty-urls.sh /buildaweb/buildaweb-sites/.../home/` after publishing to validate rewrites.
