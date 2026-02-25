---
name: Staging failure
about: Report a staging deployment or smoke-test failure
labels: ["staging", "bug"]
---

## Summary

Describe what failed in staging.

## Failed workflow run

- Workflow name:
- Run URL:
- Commit SHA:
- Branch/PR:

## Failing step(s)

- [ ] Smoke test WEB (`/`)
- [ ] Smoke test API health (`/api/v1/health`)
- [ ] Smoke test auth signup HEAD (`/api/v1/auth/signup`)
- [ ] Smoke test auth login HEAD (`/api/v1/auth/login`)
- [ ] Other (describe)

## Error logs

Paste the relevant step output (or link to raw logs).

## Reproduction

Paste local reproduction commands/output (curl preferred).

## Expected vs actual

- Expected:
- Actual:

## Scope guardrails

- [ ] I understand the fix should avoid infrastructure changes.
- [ ] I understand the fix should be minimal and regression-safe.
