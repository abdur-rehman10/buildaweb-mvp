# Buildaweb — Agent Context

## Product
Buildaweb is a Brizy-like AI website builder.
Goal: a non-designer can create, edit, and publish a professional website in under 10 minutes.

## Source of Truth
- The MVP scope + rules are defined in: "Build A Web - MVP Documentation" (PDF).
- The Figma design + generated frontend are the UI truth.
- Backend behavior must support MVP rules even if UI shows disabled features.

## Core MVP Rules (non-negotiable)
- Section → Block → Node hierarchy (no free-drag chaos)
- Global tokens: colors, fonts, spacing presets, button styles
- AI generates: structure + copy + section order
- Pages: add / duplicate / delete, slug editing, auto navigation
- Media: upload / replace / basic crop, central library
- Publishing: one-click publish to free subdomain (username.product.ai)
- Billing: Free vs Pro (Stripe subscription)
- **1 user = 1 site for MVP (enforced in backend logic)**

## Auth & User Rules (MVP)
- Email + password authentication only
- JWT-based auth (access token only for MVP)
- Passwords must be hashed (bcrypt)
- No social login in MVP
- No roles beyond basic user (admin roles later)
- All API routes must be user-scoped
- Tenant logic must exist but default to single-tenant SaaS mode

## API Conventions
- REST only
- Global prefix: `/api/v1`
- Response shape:
  ```json
  { "ok": true, "data": {} }
  { "ok": false, "error": { "code": "", "message": "" } }
