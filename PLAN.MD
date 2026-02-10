# PLAN.md

## Branch
feat/seo-ui-polish

## Goal
Polish the existing page-level SEO UI with better guidance while keeping current SEO behavior unchanged.

## In Scope
- Frontend SEO panel polish only:
  - Live character counter for SEO title with recommended range (30–60).
  - Live character counter for meta description with recommended range (70–160).
  - Add a simple static Google-like preview snippet using current title + description values.
  - Keep save flow and persistence to `seoJson` exactly as existing behavior.
  - Show validation hints only; do not introduce new save-blocking rules.
- Backend: no changes unless absolutely required.

## Out of Scope
- New SEO capabilities (OG fields UI, Twitter cards, JSON-LD)
- robots.txt or sitemap.xml
- New endpoints or response-contract changes
- Refactors or unrelated UI changes

## Definition of Done
- Counters update live while typing in SEO fields.
- SEO title/description continue to persist and rehydrate from `seoJson`.
- Preview and publish head-tag injection behavior remains unchanged and correct.
- Manual tests pass:
  - Counter updates live.
  - Persist/reload works.
  - Preview + publish output still contains expected tags.
