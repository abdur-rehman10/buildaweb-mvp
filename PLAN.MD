# PLAN.md

## Branch
feat/publish-static-site

## Goal
Implement MVP one-click publish that renders all project pages to static HTML/CSS and uploads to MinIO for a public URL.

## In Scope
Backend:
- POST /projects/:projectId/publish (JWT protected, scoped)
- GET /projects/:projectId/publish/:publishId (JWT protected, scoped)
- Render pages using existing preview renderer logic (deterministic)
- Upload rendered HTML files (and one CSS file) to MinIO under a publish folder
- Persist publish record/status in Mongo (minimal)

Frontend:
- Publish button in Project screen
- Poll publish status until live
- Show published URL link

## Out of Scope
- Custom domains
- CDN invalidation
- SEO settings UI
- Assets copying/rewriting (we will reference stable public URLs)
- Multi-user collaboration
- Billing

## Constraints
- Must not change existing editor JSON schema
- Use ok/data + ok/error response contract
- Publish must never crash if page has unknown nodes; render placeholders safely

## Definition of Done
- User clicks Publish → gets a public URL for the site
- Home page available at /index.html
- Other pages available at /<slug>/index.html
- Publishing status can be checked and does not block server
