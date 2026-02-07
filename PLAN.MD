# PLAN.md

## Branch
feat/preview-renderer-api

## Goal
Add server-side page preview rendering (HTML + CSS) and wire it to frontend via iframe preview.

## In Scope
Backend:
- GET /projects/:projectId/preview/:pageId
- Minimal deterministic renderer (sections → blocks → nodes)
- Stable hash generation
- Safe handling of unknown nodes

Frontend:
- Preview button on Page screen
- Call preview API
- Render preview in iframe using srcdoc

## Out of Scope
- Publish flow
- Hosting
- Domains
- Assets upload
- Global styles editor
- AI generation
- Billing

## Constraints
- Use existing editorJson only
- No refactors of existing APIs
- No new DB tables
- Response format must follow ok/data contract

## Definition of Done
- Preview reflects saved editor JSON
- Preview never crashes on malformed data
- Preview updates after save
- No impact on save/version/409 logic
