# Buildaweb — Agent Context

## Product
Buildaweb is a Brizy-like AI website builder. Goal: a non-designer can create, edit, and publish a professional website in under 10 minutes.

## Source of Truth
- The MVP scope + rules are defined in: "Build A Web - MVP Documentation" (PDF).
- The Figma design + generated frontend are the UI truth. We implement all Figma screens, but gate advanced features via flags (MVP-safe).

## Core MVP Rules (non-negotiable)
- Section → Block → Node hierarchy (no free-drag chaos)
- Global tokens: colors, fonts, spacing presets, button styles
- AI generates: structure + copy + section order (no AI images, no multilingual in MVP)
- Pages: add/duplicate/delete, slug editing, auto navigation
- Media: upload/replace/crop basic, central library
- Publishing: one-click publish to free subdomain username.product.ai
- Billing: Free vs Pro (Stripe subscription), branding badge removal
- 1 user = 1 site for MVP (enforced by backend)

## Figma Parity Policy
If a screen exists in Figma:
- Implement the UI.
- If feature is not MVP, keep UI but mark as Coming Soon or disabled.
No scope creep beyond MVP rules.

## Tech Stack
Frontend: React 18 + TypeScript + Vite + Tailwind (existing)
Backend: Node.js + TypeScript + NestJS (REST)
Database: MongoDB
Storage: S3-compatible (MinIO local, R2/S3 prod)

## Working Style
- Always follow PLAN.md.
- Keep changes small and shippable.
- Update PLAN.md when decisions change.
- For each feature: create a branch before coding, PR into main when done.
