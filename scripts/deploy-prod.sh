#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.prod"
COMPOSE_FILE="$ROOT_DIR/docker-compose.prod.yml"

cd "$ROOT_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: This script must run inside the git repository." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is required." >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: Missing $ENV_FILE. Copy from .env.prod.example first." >&2
  exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "ERROR: Missing $COMPOSE_FILE." >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: Working tree is not clean. Commit or stash changes before deploy." >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "ERROR: docker compose or docker-compose is required." >&2
  exit 1
fi

echo "Fetching origin/main..."
git fetch origin main

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Switching to main branch..."
  if git show-ref --verify --quiet refs/heads/main; then
    git checkout main
  else
    git checkout -B main origin/main
  fi
fi

echo "Resetting to origin/main..."
git reset --hard origin/main

echo "Pulling latest images (best effort)..."
"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull || true

echo "Starting production stack..."
"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

DOMAIN="$(
  grep -E '^DOMAIN=' "$ENV_FILE" | tail -n 1 | cut -d '=' -f 2- | tr -d '\r' | xargs || true
)"

if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "localhost" ]; then
  WEB_URL="https://${DOMAIN}/"
  API_HEALTH_URL="https://${DOMAIN}/api/v1/health"
  CURL_FLAGS=(-kfsS --resolve "${DOMAIN}:443:127.0.0.1")
else
  WEB_URL="http://localhost/"
  API_HEALTH_URL="http://localhost/api/v1/health"
  CURL_FLAGS=(-fsS)
fi

echo "Running health checks..."
curl "${CURL_FLAGS[@]}" "$WEB_URL" >/dev/null

if ! curl "${CURL_FLAGS[@]}" "$API_HEALTH_URL" >/dev/null; then
  AUTH_ME_URL="${API_HEALTH_URL%/health}/auth/me"
  HTTP_CODE="$(curl "${CURL_FLAGS[@]}" -o /dev/null -w '%{http_code}' "$AUTH_ME_URL")"
  if [ "$HTTP_CODE" != "401" ]; then
    echo "ERROR: API health check failed (health and auth fallback failed)." >&2
    exit 1
  fi
fi

echo "DEPLOY OK"
