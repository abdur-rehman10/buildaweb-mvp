# PLAN.md

## Branch
fix/published-nav-links

## Goal
Harden published static-site navigation and internal content links so they always resolve on MinIO static hosting.

## In Scope
- Publish output nav links must be canonical:
  - Home -> `/index.html`
  - Other pages -> `/<slug>/index.html`
- Publish output internal content links (for example button href values) must be normalized:
  - `/` -> `/index.html`
  - `/about` or `about` -> `/about/index.html`
  - External links (`http`, `https`, `mailto`, `tel`) remain unchanged.
- Keep preview behavior unchanged.
- Keep existing publish storage paths and API contracts unchanged.

## Out of Scope
- New UI
- New endpoints
- Refactors unrelated to publish-link generation
- MinIO infrastructure/path changes

## Definition of Done
- Published nav links always resolve correctly and never use directory-only URLs.
- Published internal button/content links resolve to canonical `index.html` targets.
- Home never maps to `/home/index.html`.
- Preview behavior is unchanged.
- Manual tests pass.

## Manual Tests
1. Publish a project with Home + About.
2. Open published Home `index.html`, click About in nav, and confirm About loads.
3. From About page, click Home in nav, and confirm it returns to Home.
4. Click About multiple times and confirm no path nesting/crash.
5. Verify generated HTML contains `href="/index.html"` for Home and `href="/about/index.html"` for About.
6. Verify external links are not modified.
