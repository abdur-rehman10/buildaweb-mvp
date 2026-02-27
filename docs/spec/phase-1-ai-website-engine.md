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
- [ ] R-011: Image accessibility policy enforces non-empty alt text deterministically.
- [ ] R-012: One-H1-per-page rule enforces deterministic demotion strategy.
- [ ] R-013: Canonical section template library validates to schema.v1 deterministically.
- [ ] R-014: Token placeholders resolve to token or deterministic literal fallback.
- [ ] R-015: Deterministic fixture harness validates stable html/css/hash snapshots for baseline R-cases.
- [ ] R-016: Fixture matrix expansion remains deterministic and non-flaky in incremental batches.


## Batch progress
- [x] B2-T01: Strict schema validator utility implemented with unit tests.
- [x] B2-T02: AI generation pipeline aligned to strict validation rules with deterministic failure tests.

- [x] B3-T01: Repair pipeline stages implemented with focused unit tests.
- [x] B3-T02: Strictness strategy (strict vs repair) added with safe strict default.

- [x] B4-T01: Canonical hash function implemented with deterministic fixtures.
- [x] B4-T02: Central renderer version constant wired for preview/hash flow.

- [x] B5-T01: Preview renderer contract `{ html, css, hash }` enforced with pre-render normalize/validate strategy.
- [x] B5-T02: CSS rules enforced with `--baw-*` tokens, ID-scoped selectors, and stability tests.

- [x] B6-T01: Publish manifest schema implemented/validated with stable stored values.
- [x] B6-T02: Publish state transitions logged for auditable state machine traceability.

- [x] B7-T01: Image alt-text determinism enforced via strict validation and repair defaults.
- [x] B7-T02: One-h1-per-page rule enforced with deterministic extra-h1 demotion.

- [x] B8-T01: Canonical section templates centralized and validated against schema.v1.
- [x] B8-T02: Token placeholder resolution enforces deterministic token/literal behavior.

- [x] B9-T01: Added deterministic fixture harness for initial six R-cases with stable expectations.
- [x] B9-T02: Expanded fixture matrix by five additional deterministic R-cases.
