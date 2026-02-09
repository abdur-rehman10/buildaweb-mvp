# PLAN.md

## Branch
feat/seo-ui

## Goal
Implement basic SEO settings per page and ensure preview/publish outputs include the tags.

## In Scope
- Frontend page settings panel for `seoJson`.
- Backend already stores `seoJson`; ensure `PUT` page updates it.
- Preview renderer injects `title`/`meta`/`og` tags.
- Publish generator injects the same tags.

## Out of Scope
- `sitemap.xml`.
- `robots.txt`.
- `Schema.org` JSON-LD.
- Multi-language SEO.

## Definition of Done
- Editing SEO fields persists in `seoJson`.
- Preview page HTML contains correct tags.
- Published HTML contains correct tags.
