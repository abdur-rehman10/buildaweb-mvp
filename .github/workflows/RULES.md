# Workflow Local Rules

When editing files in `.github/workflows`:

1. Keep triggers explicit (`on:`) and avoid accidental broad execution.
2. Use least-privilege permissions per workflow/job.
3. Preserve concurrency controls where present.
4. Validate path references, working directories, and command availability.
5. Keep secret usage in `${{ secrets.* }}` and never inline credentials.
6. For deployment workflows, preserve rollout safety (wait for stable service + smoke checks).
7. Document any behavior changes in `docs/codex/areas/infra.md`.
