# PLAN.md

## Branch
feat/draft-live-diff

## Goal
Implement accurate draft-vs-live change detection so each project exposes a deterministic `hasUnpublishedChanges` flag and the frontend status/actions reflect it.

## In Scope
- Backend:
  - Compute `hasUnpublishedChanges` per project.
  - Rule:
    - `latestPublishId == null` -> `hasUnpublishedChanges = true`
    - Else compare current draft vs latest publish snapshot deterministically for:
      - pages (count, slug, title, editorJson, seoJson)
      - navigation (deep compare)
      - output-affecting project settings (`siteName`, `favicon`, `locale`, `defaultOgImage`)
  - Ignore timestamps and non-output metadata.
  - Include `hasUnpublishedChanges` in:
    - `GET /projects`
    - `GET /projects/:projectId`
- Frontend:
  - Use backend `hasUnpublishedChanges` to drive publish status labels:
    - no publish -> `Not published`
    - published + false -> `Live (up to date)`
    - published + true -> `Live (outdated)`
  - Disable publish button when published and up to date.
  - Show republish CTA only when outdated.

## Out of Scope
- HTML diffing
- New endpoints
- Publish pipeline behavior changes
- Polling hacks
- Per-page visual diff or history browsing

## Definition of Done
- `hasUnpublishedChanges` is deterministic and correct for list/detail project responses.
- UI states and publish button behavior match the flag.
- Manual tests pass:
  1. New project (no publish) -> `Not published`
  2. Publish with no changes -> `Live (up to date)` and publish disabled
  3. Edit content -> `Live (outdated)` and publish enabled
  4. Revert to published state -> back to `Live (up to date)`
  5. Navigation/settings changes mark project outdated
  6. Publish returns project to `Live (up to date)`
