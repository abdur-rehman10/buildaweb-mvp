#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.prod"
COMPOSE_FILE="$ROOT_DIR/docker-compose.prod.yml"
HEALTH_TIMEOUT_SECONDS=30

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

http_code() {
  local url="$1"
  local code
  code="$(curl -ksS --connect-timeout 2 --max-time 5 -o /dev/null -w '%{http_code}' "$url" || true)"
  if [ -z "$code" ]; then
    echo "000"
    return
  fi
  echo "$code"
}

is_web_ready() {
  local code
  for url in "http://127.0.0.1/" "https://127.0.0.1/"; do
    code="$(http_code "$url")"
    if [[ "$code" == 2* || "$code" == 3* ]]; then
      return 0
    fi
  done
  return 1
}

is_api_ready() {
  local code
  local health_ok=1
  for url in "http://127.0.0.1/api/v1/health" "https://127.0.0.1/api/v1/health"; do
    code="$(http_code "$url")"
    if [ "$code" = "200" ]; then
      health_ok=0
      break
    fi
  done

  if [ $health_ok -eq 0 ]; then
    return 0
  fi

  for url in "http://127.0.0.1/api/v1/auth/me" "https://127.0.0.1/api/v1/auth/me"; do
    code="$(http_code "$url")"
    if [ "$code" = "401" ]; then
      return 0
    fi
  done

  return 1
}

print_service_logs() {
  local container_name="$1"
  if docker ps -a --format '{{.Names}}' | grep -Fxq "$container_name"; then
    echo "----- ${container_name} (last 80 lines) -----"
    docker logs --tail 80 "$container_name" || true
  fi
}

echo "Running health checks with retry window (${HEALTH_TIMEOUT_SECONDS}s)..."
start_ts="$(date +%s)"
web_ready=1
api_ready=1

while true; do
  now_ts="$(date +%s)"
  elapsed=$((now_ts - start_ts))

  if is_web_ready; then
    web_ready=0
  else
    web_ready=1
  fi

  if is_api_ready; then
    api_ready=0
  else
    api_ready=1
  fi

  if [ $web_ready -eq 0 ] && [ $api_ready -eq 0 ]; then
    break
  fi

  if [ "$elapsed" -ge "$HEALTH_TIMEOUT_SECONDS" ]; then
    echo "ERROR: Health checks failed after ${HEALTH_TIMEOUT_SECONDS}s (web_ready=$((1 - web_ready)), api_ready=$((1 - api_ready)))." >&2
    print_service_logs "buildaweb-caddy"
    print_service_logs "buildaweb-api"
    print_service_logs "buildaweb-web"
    exit 1
  fi

  sleep 1
done

echo "DEPLOY OK"
