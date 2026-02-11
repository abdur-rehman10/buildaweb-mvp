# PLAN.md

## Branch
fix/publish-link-output

## Goal
Ensure publish responses and frontend mapping always show a user-visible published website link immediately after publish.

## In Scope
- Backend: return `publishedSlug` + absolute `publishedUrl` from publish response.
- Backend: keep compatible fields for existing callers.
- Frontend: consume `publishedUrl` and render publish link even when URL is path-based (`/p/<slug>/`).
- Docs: clarify `PUBLIC_APP_URL` is required for absolute publish links in IP mode.

## Out of Scope
- Publish pipeline/storage refactors.
- New endpoints.
- UI redesign.

## Definition of Done
- Publish API returns `publishedSlug` and `publishedUrl`.
- Publish success UI always shows “Open published site” link immediately.
- Link opens the published site, and link is hidden when there is no live publish URL.
