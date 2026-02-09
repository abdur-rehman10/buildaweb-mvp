# PLAN.md

## Branch
fix/publish-nav-directory-links

## Goal
Fix published static navigation and internal content links so MinIO-hosted output always points to real HTML files and never directory URLs.

## In Scope
- Publish output only:
  - Nav links must be depth-safe relative links to files:
    - Home file -> `index.html`
    - Other pages -> `<slug>/index.html`
    - From nested pages use `../` prefixes as needed.
- Normalize internal content links (buttons/anchors) during publish:
  - `/` -> depth-safe home file link
  - `/about`, `about`, `about/` -> depth-safe `about/index.html`
  - Keep external links unchanged: `http`, `https`, `mailto`, `tel`
  - Keep hash links unchanged.
- Use one canonical publish-link builder shared by nav rendering and internal href normalization.
- Keep preview behavior unchanged.

## Out of Scope
- Preview endpoint behavior changes
- New UI
- New endpoints
- MinIO folder structure/path changes
- Refactors unrelated to publish link generation

## Definition of Done
- Published nav links always target `index.html` files (never directory URLs like `/about/`).
- Published internal links are normalized to depth-safe `index.html` targets.
- Home never maps to `/home/index.html`.
- External/hash links are preserved.
- Manual tests pass.

## Manual Tests
1. Publish Home + About (+ Services optional) and open published `index.html`.
2. From Home, click About and verify URL ends in `/about/index.html`.
3. From About, click Home and verify URL ends in `/index.html`.
4. From About, click Services (if present) and verify `/services/index.html`.
5. View source:
   - Home nav includes `about/index.html` (not `about/`).
   - About nav includes `../index.html` for Home and `../services/index.html` for Services.
6. Confirm external links and hash links are unchanged.
