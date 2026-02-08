# PLAN.md

## Branch
feat/pretty-urls

## Goal
Remove `index.html` from user-facing URLs in previews and published sites while still serving static pages correctly.

## In Scope
- Adjust the preview route to handle paths with or without `index.html`.
- Generate navigation links using directory paths (trailing slashes) instead of `index.html`.
- Update the publish UI to display links without `index.html`.
- Ensure that published sites still load correctly from static storage.

## Out of Scope
- Server-level rewrite rules (for example, NGINX).
- Custom domains.

## Constraints
- Must not break existing preview/publish behavior.
- Must continue using relative links to ensure nested pages resolve correctly.

## Definition of Done
- All links in previews and published sites omit `index.html`.
- Users can navigate to pages via `/about/` instead of `/about/index.html`.
