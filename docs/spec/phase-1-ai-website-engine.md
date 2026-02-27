# Phase 1 — AI Website Engine Implementation Tracker

Use this tracker to manage delivery of Phase-1 engine invariants and keep implementation work auditable.

## Schema rules checklist
- [ ] Reject unknown fields by default in all Phase-1 payload validators.
- [ ] Enforce ID regex constraints consistently across project/page/section/block/node identifiers.
- [ ] Enforce text length limits for AI-generated/user-edited fields.
- [ ] Enforce strict enums for all state/action/type fields.

## Validator / Repair pipeline checklist
- [ ] Stage 1: structural validation (shape/types/required fields).
- [ ] Stage 2: semantic validation (cross-field and hierarchy rules).
- [ ] Stage 3: deterministic repair pass for safe auto-fixes.
- [ ] Stage 4: post-repair revalidation and explicit error reporting.

## Canonical hash + renderer_version checklist
- [ ] Define canonical serialization rules for hash computation.
- [ ] Compute stable content hash from canonical representation only.
- [ ] Store and validate `renderer_version` with generated artifacts.
- [ ] Ensure hash/version updates are deterministic and reproducible.

## Renderer output contract checklist
- [ ] Renderer returns exactly: `{ html, css, hash }`.
- [ ] `html` is sanitized/validated against allowed structure.
- [ ] `css` output is deterministic for identical inputs.
- [ ] `hash` matches canonical hash rules.

## Publish manifest/state machine checklist
- [ ] Define publish manifest schema and required metadata fields.
- [ ] Model explicit publish states and valid transitions.
- [ ] Enforce transition guards and rollback-safe behavior.
- [ ] Record publish events for traceability/audit.

## Deterministic test matrix (R-001...)
- [ ] R-001: Unknown field rejection is deterministic.
- [ ] R-002: ID regex constraints enforced.
- [ ] R-003: Text limits enforced.
- [ ] R-004: Strict enums enforced.
- [ ] R-005: Repair pipeline stage ordering is deterministic.
- [ ] R-006: Canonical hash stability across equivalent payloads.
- [ ] R-007: `renderer_version` compatibility checks.
- [ ] R-008: Renderer contract returns `{html, css, hash}` only.
- [ ] R-009: Publish manifest validation and state transitions.
- [ ] R-010: Repeat run determinism (same input => same outputs).


## Batch progress
- [x] B2-T01: Strict schema validator utility implemented with unit tests.
- [x] B2-T02: AI generation pipeline aligned to strict validation rules with deterministic failure tests.

- [x] B3-T01: Repair pipeline stages implemented with focused unit tests.
- [x] B3-T02: Strictness strategy (strict vs repair) added with safe strict default.

- [x] B4-T01: Canonical hash function implemented with deterministic fixtures.
- [x] B4-T02: Central renderer version constant wired for preview/hash flow.

- [x] B5-T01: Preview renderer contract `{ html, css, hash }` enforced with pre-render normalize/validate strategy.
- [x] B5-T02: CSS rules enforced with `--baw-*` tokens, ID-scoped selectors, and stability tests.
