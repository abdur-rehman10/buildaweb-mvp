# Staging Failure Fix Playbook

Use this playbook when staging smoke tests fail in GitHub Actions.

## 1) Reproduce smoke tests locally

Set your staging base URL first:

```bash
export STAGING_BASE_URL="https://<staging-host>"
```

Run the same smoke checks used by CI:

```bash
curl -fsS "${STAGING_BASE_URL}/" >/dev/null
curl -fsS "${STAGING_BASE_URL}/api/v1/health" >/dev/null
curl -sS -o /dev/null -w "%{http_code}\n" -I "${STAGING_BASE_URL}/api/v1/auth/signup"
curl -sS -o /dev/null -w "%{http_code}\n" -I "${STAGING_BASE_URL}/api/v1/auth/login"
```

Optional media-proxy verification (when media routing is involved):

```bash
curl -I "${STAGING_BASE_URL}/media/minio/health/live"
```

## 2) Where to find failing logs in GitHub Actions

1. Open **GitHub → Actions**.
2. Open the failed run for the staging/deploy workflow.
3. Open the failing job (typically `deploy`).
4. Expand the exact failed step (for example, `Smoke test WEB` or `Smoke test API health`).
5. Use **View raw logs** when output is truncated.
6. Check the run **Summary** for annotations and linked errors.

## 3) How Codex should respond when tagged to fix staging failure

When tagged in a PR or issue for a staging fix, Codex should:

1. **Diagnose from logs first** and reproduce with the smoke-test curl commands above.
2. **Do not change infrastructure** (no cluster/network/DNS/security-group/host-level mutations).
3. **Fix the smallest code/config change** required in the repository.
4. **Add or adjust automated tests/checks** to prevent regression where practical.
5. **Push the fix to the same PR branch** when requested, or create a small dedicated fix branch and PR.
6. Keep scope tight: avoid unrelated refactors or feature work.
