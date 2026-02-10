# PLAN.md

## Branch
fix/infra-ip-http-only

## Goal
Lock IP-based EC2 deployments to stable HTTP-only behavior and remove accidental HTTPS exposure.

## Status
Completed: IP-only deployment hardening is done. HTTPS remains deferred until domain setup.

## In Scope
- Remove `443` port exposure from production Caddy service in compose.
- Keep Caddy in HTTP-only mode:
  - `auto_https off`
  - single `:80` site block
  - no TLS directives
- Update deployment docs with explicit two-mode guidance:
  - IP mode (default, HTTP-only)
  - domain mode (future, HTTPS-enabled)
- Mark IP-only deployment hardening complete and note HTTPS is deferred until domain setup.

## Out of Scope
- Domain setup
- HTTPS enablement in IP mode
- App/API feature changes

## Definition of Done
- `docker-compose.prod.yml` exposes Caddy on port `80` only.
- `infra/caddy/Caddyfile` is HTTP-only and does not trigger certificate attempts.
- Deployment docs clearly warn against exposing `443` in IP mode.
- HTTPS is documented as domain-mode only (future).
