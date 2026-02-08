# PLAN.md

## Branch
feat/reverse-proxy-pretty-urls

## Goal
Configure an Nginx reverse proxy in front of MinIO to serve `index.html` automatically when a directory URL is requested, and to rewrite any request containing `/index.html` to its directory form.

## In Scope
- Add an Nginx configuration file with rewrite rules for pretty URLs.
- Integrate Nginx into the existing Docker Compose setup.
- Expose the reverse proxy on a suitable local port (for example, `8080`).
- Test that a directory URL such as `/home/` resolves correctly.

## Out of Scope
- Production deployment (this setup is for local development only).
- TLS/HTTPS configuration.

## Definition of Done
- Visiting `/.../home/` in a browser returns the same content as `/.../home/index.html`.
- Accessing `/index.html` automatically redirects to the directory URL.
