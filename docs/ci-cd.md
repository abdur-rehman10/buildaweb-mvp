# CI/CD Setup

This repository uses two primary GitHub Actions pipelines:

- **QA** on pull requests to `develop` and `main`.
- **Deploy / Staging ECS** on pushes to `develop` (merge path), plus optional manual dispatch.

## Branch protection for `develop`

In **GitHub → Settings → Branches → Add rule** for `develop`:

1. Enable **Require a pull request before merging**.
2. Enable **Require status checks to pass before merging** and add:
   - `QA / API`
   - `QA / WEB`
3. (Optional, recommended) Enable **Restrict who can push to matching branches** to reduce direct pushes.

This ensures every PR is validated before merge, and staging deploy happens only after merge to `develop`.

## How staging deploy works

- When a PR is merged into `develop`, GitHub emits a push to `develop`.
- `Deploy / Staging ECS` runs automatically.
- Workflow flow:
  1. Validate required GitHub secrets/variables.
  2. Assume AWS role via OIDC.
  3. Build API + WEB Docker images.
  4. Push both SHA tags and `staging-latest` tags to ECR.
  5. Pull each current ECS service task definition.
  6. Replace only container image (`api` and `web`).
  7. Register new task definition revisions.
  8. Update ECS services and wait for stability.
  9. Print deployment summary (plus ALB URL when configured).

## Required GitHub configuration

### Secrets

- `AWS_ROLE_ARN`

### Repository variables

- `AWS_REGION`
- `ECS_CLUSTER`
- `ECS_SERVICE_API`
- `ECS_SERVICE_WEB`
- `ECR_REPO_API`
- `ECR_REPO_WEB`

### Optional variable

- `ALB_DNS` (used only for summary output URL)

## Manual workflow runs

You can run workflows manually from **Actions** tab:

- **QA** via `workflow_dispatch` for ad-hoc validation.
- **Deploy / Staging ECS** via `workflow_dispatch` for manual redeploys.
- **Deploy / AWS ECS** is kept as a manual production fallback path only.
