# PLAN.md

## Branch
feat/publish-rollback-ux

## Goal
Polish publish rollback UX so making an older publish live is clear, safe, and correctly updates live badges and status.

## In Scope
- Frontend:
  - Publish History shows `Make Live` for non-live rows.
  - Add confirmation dialog: `This will set this publish as Live.`
  - On success:
    - Live badge moves to selected publish row.
    - Project live banner updates from latest publish state.
    - Draft-vs-live status updates correctly after rollback.
- Backend:
  - Reuse existing rollback endpoint/behavior if present.
  - If missing, add minimal `POST /api/v1/projects/:projectId/publishes/:publishId/make-live` that updates `latestPublishId` and `publishedAt` following API response contract.

## Out of Scope
- Diff view
- Publish deletion
- Background jobs

## Definition of Done
- User can safely confirm rollback from Publish History.
- Selected publish becomes live in both history badge and live banner.
- Live URL points to selected publish id.
- Draft-vs-live badge remains correct after rollback.
