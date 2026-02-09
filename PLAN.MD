# PLAN.md

## Branch
feat/seo-ui

## Goal
Add page-level SEO UI (title + meta description) and inject those head tags in preview and publish HTML.

## In Scope
- Frontend Page Settings SEO panel with:
  - SEO Title
  - Meta Description
- Load and save these values through page `seoJson` via the existing page save/update flow.
- Rehydrate saved values on page reload.
- Preview renderer injects:
  - `<title>` from `seoJson.title`, fallback to `page.title`
  - `<meta name="description">` when `seoJson.description` is present
- Publish generator injects the same head tags for:
  - home: `index.html`
  - non-home pages: `<slug>/index.html`

## Out of Scope
- `sitemap.xml`
- `robots.txt`
- Open Graph tags
- Twitter cards
- JSON-LD / Schema.org
- Project-level or global SEO defaults
- New endpoints or routing changes

## Definition of Done
- SEO panel is visible in Page Settings.
- `seoJson.title` and `seoJson.description` persist and rehydrate.
- Preview HTML head includes correct fallback title + optional description meta tag.
- Published HTML head includes correct fallback title + optional description meta tag.
- Manual checks pass for save, refresh, preview, and published `index.html` files.
