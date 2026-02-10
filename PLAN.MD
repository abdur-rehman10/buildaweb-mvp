# PLAN.md

## Branch
feat/auth-signup-wiring

## Goal
Wire signup end-to-end so new users can register from web UI, receive JWT, and enter authenticated state immediately.

## In Scope
- Ensure `POST /api/v1/auth/signup` returns JWT and user for valid signup.
- Ensure duplicate email returns proper API error shape with conflict status.
- Wire web signup form to call signup API.
- Persist JWT on signup success using existing token storage.
- Update app authenticated state and redirect to post-auth project area after signup.
- Show API validation/auth errors in signup UI.

## Out of Scope
- Refresh tokens
- Social login
- Role/permission changes
- Auth architecture refactor

## Definition of Done
- Signup from web creates user and lands in authenticated area.
- `POST /api/v1/auth/signup` returns token for new user.
- `GET /api/v1/auth/me` with signup token returns user.
- Duplicate signup email returns conflict error with `{ ok:false, error }`.
- Manual curl + UI checks pass.

## How To Test
- Web:
  - Open signup screen, create a new account, confirm redirect to authenticated project area.
  - Refresh and confirm authenticated session still works via stored token.
- API:
  - `POST /api/v1/auth/signup` with new email -> `ok:true` with `accessToken`.
  - `GET /api/v1/auth/me` with bearer token -> `ok:true` with user.
  - Repeat signup with same email -> `409` and `{ ok:false, error:{ code:\"EMAIL_ALREADY_EXISTS\"... } }`.
