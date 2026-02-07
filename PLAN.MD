Branch: feat/projects-pages-module

Goal: Wire frontend to existing JWT-protected Projects + Pages API (no editor refactors, no new backend endpoints)

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
