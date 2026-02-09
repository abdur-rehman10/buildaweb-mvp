# PLAN.md

## Branch
feat/assets-library

## Goal
Add a central assets library so users can browse and reuse uploaded images across project pages.

## In Scope
- Frontend:
  - Add an `Assets` screen/panel using existing app navigation patterns.
  - List project assets with thumbnail, filename, createdAt, mimeType, and size when available.
  - Add `Copy URL` action for each asset.
  - Add `Use in page` selection flow from image picker/replace UI so existing assets can be reused.
- Backend:
  - Reuse existing assets list endpoint if already present.
  - If missing, add minimal read-only `GET /api/v1/projects/:projectId/assets`.
  - Keep AGENTS response contract (`{ ok: true, data }` / `{ ok: false, error }`).

## Out of Scope
- Asset delete
- Folders, tags, search, or filtering enhancements beyond current behavior
- Storage system changes

## Definition of Done
- Uploaded editor images appear in the central assets library.
- User can copy asset URL from the library.
- User can select an existing library asset in image replace flow.
- Selected image renders correctly and remains correct after refresh.
