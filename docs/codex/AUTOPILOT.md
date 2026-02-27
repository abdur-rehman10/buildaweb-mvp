# Codex Autopilot

## Standard autopilot loop
1. Pick the next highest-priority task from the active task list.
2. Create or switch to the task branch.
3. Implement the minimal viable change for that task only.
4. Run per-app verification commands for touched areas.
5. Commit with a focused message.
6. Open/update PR with summary, risks, and docs checklist.
7. Resolve CI failures before merge.
8. Rebase or merge `develop` to resolve conflicts.
9. Merge safely only after required checks pass.

## Long Task List Mode
Use this mode when the task list is large or pre-sequenced.

### Quickstart
1. Paste the TASKLIST into the prompt so Codex can track dependencies and status fields.
2. Execute the next `TODO` task whose dependencies are already `DONE` (lowest task number first).
3. Create one focused PR per completed task before moving to the next task.

- Execute tasks sequentially (`T01`, `T02`, ...).
- Use dependency-aware selection from `docs/codex/TASKLIST.template.md`: choose the lowest-numbered task that is not completed, not blocked, and has all dependencies done.
- Complete one task fully (code + checks + commit) before starting the next.
- If the next task is blocked by missing info, stop and ask one focused question; do not silently skip ahead.
- Keep each task scoped to its declared files and Definition of Done.
- At the end, provide a task-by-task completion summary.

## Per-app verification expectation
- If API was touched: run API lint/test/build commands.
- If Web was touched: run Web lint/test/build commands.
- If workflows/infra were touched: validate YAML syntax and workflow references.
