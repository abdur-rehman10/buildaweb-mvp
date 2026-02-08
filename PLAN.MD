# PLAN.md

## Branch
feat/page-management

## Goal
Implement page management functionality: duplicate page, delete page, and set home page.

## In Scope
- Duplicate page functionality (API + UI flow)
- Delete page functionality (API + UI flow)
- Set home page functionality (API + UI flow)
- Update navigation automatically when page management actions affect pages

## Out of Scope
- Any feature not explicitly listed in In Scope

## Constraints
- Must follow existing API response shape:
  - `{ "ok": true, "data": {} }`
  - `{ "ok": false, "error": { "code": "", "message": "" } }`
- All relevant endpoints must remain JWT protected
- Pages save/update flows must preserve optimistic concurrency behavior

## Definition of Done
- Users can duplicate a page from the UI
- Users can delete pages from the UI, except when it is the only page
- Users can set any page as the home page from the UI
- Navigation updates automatically to reflect page changes
