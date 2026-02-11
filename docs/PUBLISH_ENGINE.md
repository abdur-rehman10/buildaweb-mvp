# Publish Engine (Path-Based)

Buildaweb publish engine serves public sites at:

- `https://<DOMAIN>/p/<slug>/`

## What Publish Does

- Endpoint: `POST /api/v1/projects/:id/publish` (JWT protected)
- Response contract includes:
  - `slug` (published site slug)
  - `url` (public URL built from `PUBLIC_APP_URL` + `/p/<slug>`)
  - If `PUBLIC_APP_URL` is not configured, `url` is an empty string and UI should fall back to current origin + slug.
- Validates publish preflight rules (pages/nav)
- Renders static HTML/CSS from project pages
- Uploads output to MinIO under a versioned prefix
- Marks project as published and stores:
  - `isPublished`
  - `publishedSlug`
  - `publishedBucketKey`
  - `publishedVersion`
  - `publishedAt`

## Public Routes

- Metadata: `GET /api/v1/published/:slug` (public)
- Site serving: `GET /p/:slug/*` (public via Caddy -> API)

Routing behavior for `/p/:slug/...`:

- If request path has a file extension -> exact MinIO object
- Otherwise -> `index.html` (SPA fallback)

## Unpublish

- Endpoint: `POST /api/v1/projects/:id/unpublish` (JWT protected)
- Sets `isPublished=false`
- Public `/p/:slug/...` returns `404` after unpublish

## Caddy Behavior

- `/api/*` -> API unchanged
- `/p/*` is rewritten to `/api/v1/p/*` and proxied to API
- Builder web app remains default route

## Quick Checks

```bash
# Authenticated publish
curl -X POST -H "Authorization: Bearer <token>" https://<DOMAIN>/api/v1/projects/<id>/publish

# Public site
curl -I https://<DOMAIN>/p/<slug>/

# API still works
curl -I https://<DOMAIN>/api/v1/auth/me
```
