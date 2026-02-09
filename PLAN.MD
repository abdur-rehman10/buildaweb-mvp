# PLAN.md

## Branch
feat/auth-ux-polish

## Goal
Polish auth UX and error handling without changing auth architecture.

## In Scope
- Frontend:
  - Signup screen:
    - Add confirm password field
    - Password rule hint (minimum length 8)
    - Client-side validation messages
  - Login/Forgot/Reset screens:
    - Improve generic error presentation
    - Loading states on submit actions
  - Ensure displayed errors map cleanly from API contract (`{ ok, data }` / `{ ok, error }`) through existing API error handling.
- Backend (only if needed):
  - Ensure reset-password enforces minimum password length 8 consistently.

## Out of Scope
- Roles/permissions changes
- Refresh tokens
- Email sending/integration
- Redesign or styling overhaul

## Definition of Done
- Signup blocks password mismatch and short password client-side.
- Login wrong credentials still show generic failure.
- Forgot password remains generic success (no user enumeration).
- Reset password success returns user to login.
- Auth submit buttons show loading states and prevent duplicate submits.
