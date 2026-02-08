#!/usr/bin/env bash

set -euo pipefail

# Usage:
#   scripts/test-pretty-urls.sh /buildaweb/buildaweb-sites/.../home/
# Notes:
# - Run this after a site has been published.
# - The path must point to a directory URL that exists via the local proxy.

PROXY_BASE_URL="${PROXY_BASE_URL:-http://localhost:8080}"
PAGE_PATH="${1:-/home/}"

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

echo "Fetching index URL with redirect follow: ${INDEX_URL}"
index_status="$(curl -sS -L -o "$body_index_file" -w '%{http_code}' "$INDEX_URL")"
if [[ "$index_status" != "200" ]]; then
  echo "ERROR: expected 200 for ${INDEX_URL} (after redirect), got ${index_status}." >&2
  exit 1
fi

if ! diff -q "$body_dir_file" "$body_index_file" >/dev/null; then
  echo "ERROR: content mismatch between ${DIR_URL} and ${INDEX_URL}." >&2
  exit 1
fi

echo "OK: pretty URL proxy test passed for ${PAGE_PATH}"
echo " - ${DIR_URL} returned 200"
echo " - ${INDEX_URL} redirected and returned matching 200 content"
