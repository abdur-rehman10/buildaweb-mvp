# PLAN.md

## Branch
feat/reverse-proxy-pretty-urls

## Goal
Configure an Nginx reverse proxy in front of MinIO to support pretty subpage URLs while keeping a reliable root publish URL.

## In Scope
- Add an Nginx configuration file with rewrite rules for pretty URLs.
- Integrate Nginx into the existing Docker Compose setup.
- Expose the reverse proxy on a suitable local port (for example, `8080`).
- Test that a directory URL such as `/home/` resolves correctly.
- Keep root publish URL behavior explicit for MinIO (`.../index.html`).

## MinIO Limitation
- MinIO does not resolve directory keys to `index.html` automatically.
- Requesting a directory key directly on MinIO can return `NoSuchKey` unless `index.html` is explicitly requested.

## Publish URL Behavior
- The publish UI must display the root site URL with `/index.html` appended.
- Subpage links may omit `index.html` only when accessed through the Nginx proxy.
- Users should access pretty URLs via the proxy port (for example, `http://localhost:8080`), not directly via MinIO `:9000`.

## Out of Scope
- Production deployment (this setup is for local development only).
- TLS/HTTPS configuration.

## Definition of Done
- Root published URL is shown and accessed as `.../index.html`.
- With the proxy enabled, visiting `/.../home/` returns the same content as `/.../home/index.html`.
- With the proxy enabled, accessing `/index.html` automatically redirects to the directory URL.
