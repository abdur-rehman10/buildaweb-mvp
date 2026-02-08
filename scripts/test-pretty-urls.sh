#!/usr/bin/env bash

set -euo pipefail

# Usage:
#   scripts/test-pretty-urls.sh /buildaweb/buildaweb-sites/.../home/
#   scripts/test-pretty-urls.sh /buildaweb/pretty-url-smoke/home/
# Notes:
# - The path must include bucket + key prefix (for example, /buildaweb/.../home/).
# - By default the script seeds a fixture object for deterministic local testing.

PROXY_BASE_URL="${PROXY_BASE_URL:-http://localhost:8080}"
PAGE_PATH="${1:-/buildaweb/pretty-url-smoke/home/}"
MINIO_ROOT_USER="${MINIO_ROOT_USER:-minio}"
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-minio12345}"
SEED_FIXTURE="${SEED_FIXTURE:-1}"
WAIT_RETRIES="${WAIT_RETRIES:-30}"
WAIT_DELAY_SECONDS="${WAIT_DELAY_SECONDS:-2}"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is required." >&2
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

normalize_path() {
  local path="$1"
  [[ "$path" == /* ]] || path="/$path"
  [[ "$path" == */ ]] || path="$path/"
  printf '%s' "$path"
}

PAGE_PATH="$(normalize_path "$PAGE_PATH")"
DIR_URL="${PROXY_BASE_URL}${PAGE_PATH}"
INDEX_URL="${DIR_URL}index.html"

echo "Starting docker compose services..."
"${COMPOSE_CMD[@]}" up -d

wait_for_proxy() {
  local health_url="${PROXY_BASE_URL}/index.html"
  local try code
  for ((try = 1; try <= WAIT_RETRIES; try++)); do
    code="$(curl -s -o /dev/null -w '%{http_code}' "$health_url" || true)"
    if [[ "$code" == "301" || "$code" == "302" || "$code" == "200" ]]; then
      return 0
    fi
    sleep "$WAIT_DELAY_SECONDS"
  done
  echo "ERROR: proxy did not become ready on ${health_url}." >&2
  return 1
}

seed_fixture_object() {
  local trimmed bucket rest object_key compose_project network_name
  trimmed="${PAGE_PATH#/}"
  trimmed="${trimmed%/}"
  bucket="${trimmed%%/*}"
  rest="${trimmed#*/}"

  if [[ -z "$bucket" || "$rest" == "$trimmed" || -z "$rest" ]]; then
    echo "ERROR: PAGE_PATH must include bucket and path, got '${PAGE_PATH}'." >&2
    return 1
  fi

  object_key="${rest}/index.html"
  compose_project="${COMPOSE_PROJECT_NAME:-$(basename "$(pwd)")}"
  network_name="${compose_project}_default"

  local fixture_file
  fixture_file="$(mktemp)"
  cat >"$fixture_file" <<EOF
<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Pretty URL Test</title></head>
  <body>
    <h1>Pretty URL fixture</h1>
    <p>Path: ${PAGE_PATH}</p>
  </body>
</html>
EOF

  docker run --rm \
    --network "$network_name" \
    -v "$fixture_file:/tmp/index.html:ro" \
    --entrypoint /bin/sh \
    minio/mc \
    -c "
      set -e
      mc alias set local http://minio:9000 \"$MINIO_ROOT_USER\" \"$MINIO_ROOT_PASSWORD\" >/dev/null
      mc mb --ignore-existing local/$bucket >/dev/null
      mc cp /tmp/index.html local/$bucket/$object_key >/dev/null
    " >/dev/null

  rm -f "$fixture_file"
}

echo "Waiting for proxy readiness..."
wait_for_proxy

if [[ "$SEED_FIXTURE" == "1" ]]; then
  echo "Seeding fixture object in MinIO for path ${PAGE_PATH}..."
  seed_fixture_object
fi

headers_file="$(mktemp)"
body_dir_file="$(mktemp)"
body_index_file="$(mktemp)"
trap 'rm -f "$headers_file" "$body_dir_file" "$body_index_file"' EXIT

echo "Checking redirect: ${INDEX_URL}"
curl -sS -D "$headers_file" -o /dev/null "$INDEX_URL"

redirect_status="$(awk '/^HTTP/{code=$2} END{print code}' "$headers_file")"
location_header="$(awk 'tolower($1)=="location:" {print $2}' "$headers_file" | tr -d '\r' | tail -n1)"

if [[ "$redirect_status" != "301" && "$redirect_status" != "302" ]]; then
  echo "ERROR: expected 301/302 for ${INDEX_URL}, got ${redirect_status:-unknown}." >&2
  exit 1
fi

expected_location_path="${PAGE_PATH}"
if [[ "$location_header" == http://* || "$location_header" == https://* ]]; then
  location_path="/${location_header#*://*/}"
else
  location_path="$location_header"
fi

if [[ "$location_path" != "$expected_location_path" ]]; then
  echo "ERROR: expected redirect location '${expected_location_path}', got '${location_header}'." >&2
  exit 1
fi

echo "Fetching directory URL: ${DIR_URL}"
dir_status="$(curl -sS -o "$body_dir_file" -w '%{http_code}' "$DIR_URL")"
if [[ "$dir_status" != "200" ]]; then
  echo "ERROR: expected 200 for ${DIR_URL}, got ${dir_status}." >&2
  exit 1
fi

index_status="$(curl -sS -o /dev/null -w '%{http_code}' "$INDEX_URL")"
if [[ "$index_status" != "301" && "$index_status" != "302" ]]; then
  echo "ERROR: expected 301/302 for ${INDEX_URL}, got ${index_status}." >&2
  exit 1
fi

redirect_target_url="${PROXY_BASE_URL}${location_path}"
echo "Fetching redirect target for content compare: ${redirect_target_url}"
followed_index_status="$(curl -sS -o "$body_index_file" -w '%{http_code}' "$redirect_target_url")"
if [[ "$followed_index_status" != "200" ]]; then
  echo "ERROR: expected 200 for redirect target ${redirect_target_url}, got ${followed_index_status}." >&2
  exit 1
fi

if ! diff -q "$body_dir_file" "$body_index_file" >/dev/null; then
  echo "ERROR: content mismatch between ${DIR_URL} and ${INDEX_URL}." >&2
  exit 1
fi

echo "OK: pretty URL proxy test passed for ${PAGE_PATH}"
echo " - ${DIR_URL} returned 200"
echo " - ${INDEX_URL} returned ${index_status} and redirects to ${PAGE_PATH}"
echo " - Redirect target content matches ${DIR_URL}"
