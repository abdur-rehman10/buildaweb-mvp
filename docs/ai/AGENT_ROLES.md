# Agent Roles

## Planner
- Produces PR-sized TASKLIST + acceptance criteria
- Never writes code

## Implementer
- Codex (IDE) or human
- Writes code + tests, follows TASKLIST

## QA Agent
- Generates targeted test plan + interprets failures
- Suggests minimal fixes

## Reviewer Agent
- Reviews diff for correctness/security/perf risks
- Suggests safe refactors only if requested

## Release Agent
- Produces deploy checklist + env var diff + rollback plan
