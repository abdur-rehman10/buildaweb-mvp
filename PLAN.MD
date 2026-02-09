# PLAN.md

## Branch
fix/publish-url-builder

## Goal
Eliminate inconsistent publish URL generation by introducing a canonical URL builder.

## In Scope
- Add a single utility function to generate:
  - publish root URL
  - per-page publish URL
- Replace all ad-hoc string concatenations in the web app with this function.
- Ensure Home never maps to `/home/index.html`.
- Ensure MinIO-compatible links always include `index.html`.

## Out of Scope
- Proxy pretty URLs.
- Infrastructure changes.

## Definition of Done
- All publish links in UI (publish result, live banner, publish history, page link list) are correct and consistent.
- Home link never 404s.
