Branch: feat/projects-pages-module

Goal: Wire frontend to existing JWT-protected Projects + Pages API (no editor refactors, no new backend endpoints)

API base: /api/v1 (backend on :4000)

Response shape: { ok: true, data } / { ok: false, error } (must be used as-is)

In scope (this branch):

Auth: login, store JWT, attach Authorization: Bearer <token> to API

Projects UI: list, create, select active project

Pages: open a page, load editorJson, save page via PUT with version

Handle 409 VERSION_CONFLICT with a simple UI message + reload option

Out of scope (explicit):

AI generation

Publishing/preview renderer

Assets upload

Billing

New backend endpoints / schema changes

Definition of Done:

A user can login -> see projects -> create/select project -> open a page -> save it successfully (with version increment) and see a conflict message on 409
