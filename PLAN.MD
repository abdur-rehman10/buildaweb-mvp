# PLAN.md

## Branch
feat/ui-polish

## Goal
Improve the MVP user interface by adding consistent toast notifications, disabling invalid actions, and providing clearer error feedback.

## In Scope
- Implement consistent success and failure toast notifications across the app.
- Disable buttons when actions are not valid (for example, deleting the only page).
- Improve UI-facing API error messages, including clearer version-conflict feedback.

## Out of Scope
- Visual redesigns.
- Adding new functionality.
- Changing existing logic beyond UI feedback improvements.

## Constraints
- Follow existing API response shapes:
  - `{ "ok": true, "data": {} }`
  - `{ "ok": false, "error": { "code": "", "message": "" } }`
- Do not introduce new libraries unless explicitly permitted.
- Keep changes minimal and focused on UI polish.

## Definition of Done
- The app displays consistent toast notifications for success and failure states.
- Invalid actions are prevented through disabled UI controls.
- Network and version-conflict issues are shown with clear, user-friendly error messages.
