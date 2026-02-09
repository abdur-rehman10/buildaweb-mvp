# PLAN.md

## Branch
feat/publish-rollback

## Goal
Allow selecting a previous publish from Publish History and mark it as "Live".

## In Scope
- Backend endpoint to set `project.latestPublishId` to an existing publish belonging to the project.
- Update `publishedAt` accordingly.
- Frontend button `Make Live` per publish row.
- UI updates so the Live indicator moves to the selected publish.

## Out of Scope
- Deleting publishes.
- Re-generating files.
- Multi-tenant admin features.

## Definition of Done
- User clicks `Make Live` on any prior publish.
- After refresh, the project shows that publish as Live.
- The live URL uses that selected publishId.
