# PLAN.md

## Branch
fix/publish-preflight

## Goal
Add preflight validation before publish so broken inputs are caught early.

## In Scope
- Backend: validate pages + navigation before generating/uploading.
- Frontend: surface friendly validation errors and block publish until resolved.

## Out of Scope
- Auto-fixing slugs.
- AI suggestions.
- SEO features.

## Definition of Done
- Publish fails fast with clear errors when:
  - no home page exists
  - duplicate slugs exist
  - slug is empty/invalid
  - navigation references missing pages
- UI shows these errors and does not start publish until resolved.
