# PLAN.md

## Branch
feat/media-library-ui

## Goal
Implement a media library UI so users can browse and reuse previously uploaded images.

## In Scope
- Add a backend endpoint to list assets per project.
- Create a React modal to display the media library.
- Integrate the modal into the image picker in the editor.
- Ensure newly uploaded images appear in the library immediately.

## Out of Scope
- Image cropping or editing.
- Asset deletion.
- File type filtering (unless already supported).

## Constraints
- Follow existing API response shapes:
  - `{ "ok": true, "data": {} }`
  - `{ "ok": false, "error": { "code": "", "message": "" } }`
- Keep JWT authentication and user/tenant scoping on relevant endpoints.
- Do not add new libraries unless explicitly allowed.

## Definition of Done
- Users can open the media library from the editor.
- Users can see thumbnails of previously uploaded images for their current project.
- Users can select an image from the library to replace an image in the editor.
