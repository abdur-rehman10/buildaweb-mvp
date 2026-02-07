Branch: feat/pages-navigation-api

Goal: Add minimal Pages management + Navigation API for MVP (duplicate/delete/meta + nav JSON). Wire frontend to use these endpoints.

In scope:

Backend:

PATCH /projects/:projectId/pages/:pageId/meta (title/slug/seoJson)

POST /projects/:projectId/pages/:pageId/duplicate

DELETE /projects/:projectId/pages/:pageId

Navigation storage endpoints (project-scoped):

GET /projects/:projectId/navigation

PUT /projects/:projectId/navigation

Auto-generate default nav if none exists (based on pages, home first)

Frontend:

Page rename + slug edit (via meta PATCH)

Duplicate/Delete page buttons

Nav editor: rename menu labels + reorder (simple up/down)

Out of scope:

Publish/preview

Assets pipeline

Global tokens UI

AI

DoD:

User can rename/slug-edit a page, duplicate/delete a page, and edit navigation labels/order; all persists via API.
