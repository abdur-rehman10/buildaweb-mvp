# PLAN.md

## Branch
feat/publish-history

## Goal
Show publish history per project (last N publishes) with status and URL.

## In Scope
- Backend: list publishes by project, sorted newest first, with default limit 10.
- Frontend: show a small publish history list/table with `Open` and `Copy` actions.
- Keep existing publish flow unchanged.

## Out of Scope
- Delete publish.
- Rollback (changing `latestPublishId`).
- Pagination UI beyond "show last 10".

## Definition of Done
- User can see the latest publishes for a project after refresh.
- User can open publish URLs from history.
- User can copy publish URLs from history.
