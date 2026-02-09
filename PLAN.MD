# PLAN.md

## Branch
feat/publish-status

## Goal
Persist the latest publish status per project so that after publishing, the project page can always show the current live state and published URL after a browser refresh.

## In Scope
- Add a `latestPublishId` (or equivalent) field to the Project schema.
- Update publish completion flow to set `latestPublishId` on the project.
- Add an endpoint to fetch the latest publish record for a project.
- Update the frontend project page load flow to call that endpoint and display current publish status/url.

## Out of Scope
- Multiple concurrent publishes.
- Historical publish list UI.

## Constraints
- Keep API response shape unchanged: `{ "ok": true, "data": {} }` and `{ "ok": false, "error": { "code": "", "message": "" } }`.
- Respect existing optimistic concurrency behavior.
- Follow all MVP rules and current auth/user scoping constraints.

## Definition of Done
- After a successful publish, refreshing the project page still shows the project as live.
- The published URL is still shown after refresh without requiring another publish action.
