# Buildaweb Web App

## Local development

1. Install dependencies:
   - `pnpm install`
2. Create env file:
   - `cp .env.example .env`
3. Start dev server:
   - `pnpm dev`

## Environment variables

- `VITE_API_BASE_URL` (default: `/api`)
  - Local ALB-style routing: keep `/api`
  - Production: set to your API base path if different (example: `https://your-domain.com/api`)

The frontend calls auth endpoints at:
- `${VITE_API_BASE_URL}/v1/auth/signup`
- `${VITE_API_BASE_URL}/v1/auth/login`
- `${VITE_API_BASE_URL}/v1/auth/me`
