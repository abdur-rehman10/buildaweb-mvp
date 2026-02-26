# Web Area Guide

## Conventions (Next.js-style guidance)
- Prefer component-driven UI organization and route-based structure.
- Keep UI changes minimal and aligned with design source-of-truth.
- Preserve API integration boundaries and avoid embedding backend secrets.

## Commands
Run from repository root:
- `pnpm --dir apps/web run build`
- `pnpm --dir apps/web run dev`
- `pnpm --dir apps/web run test` (if present)
- `pnpm --dir apps/web run lint` (if present)

## Note
This repository's current `apps/web` scripts are Vite-based; apply Next.js conventions only where relevant to future migration tasks.
