# PLAN.md

## Branch
feat/project-settings

## Goal
Implement Project Settings UI and persistence for site-level settings, then apply those settings in preview and publish HTML head output.

## In Scope
- Backend project settings fields:
  - `siteName` (string)
  - `logoAssetId` (string|null)
  - `faviconAssetId` (string|null)
  - `defaultOgImageAssetId` (string|null)
  - `locale` (string, default `en`)
- Backend endpoints (JWT + tenant/user scoped):
  - `GET /projects/:projectId/settings`
  - `PUT /projects/:projectId/settings`
- Frontend Project Settings panel:
  - Site Name
  - Locale
  - Logo asset selection/upload
  - Favicon asset selection/upload
  - Default OG image asset selection/upload
- Persist settings through PUT and rehydrate through GET on reload.
- Preview + publish head usage:
  - `<title>`: page SEO title if present, else project `siteName`, else page title
  - `<link rel="icon" ...>` when favicon is set
  - `<meta property="og:image" ...>` from project default OG image when set
  - `<html lang="...">` from project locale, fallback `en`

## Out of Scope
- Custom domains
- Billing
- AI generation
- Global styles/tokens
- Page-level OG overrides
- Additional SEO features beyond the tags above

## Definition of Done
- Project Settings UI is visible and editable.
- Settings persist and rehydrate after refresh.
- Preview HTML contains correct title fallback, favicon, og:image, and `lang`.
- Published home and non-home HTML contain the same settings-based head behavior.
- Existing SEO behavior is not broken.
- Manual tests pass.

## Manual Tests
1. Open Project Settings, set Site Name + Locale, save, refresh, and confirm values persist.
2. Select/upload logo, favicon, and default OG image, save, refresh, and confirm links persist.
3. Open Preview and confirm page source includes favicon + og:image and correct `html lang`.
4. Publish and open `index.html` and a non-home page HTML to confirm the same head tags and title fallback behavior.
