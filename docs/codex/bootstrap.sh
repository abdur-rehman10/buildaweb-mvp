#!/usr/bin/env bash
set -euo pipefail

echo "[bootstrap] repo: $(pwd)"



# 1) Must be a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[bootstrap] ERROR: not inside a git repo."
  exit 1
fi

# Ensure origin uses HTTPS (Codex Cloud blocks SSH:22)
if [ -n "${GIT_REMOTE_URL:-}" ]; then
  git remote set-url origin "$GIT_REMOTE_URL" 2>/dev/null || true
fi

# Configure HTTPS credentials for git push
if [ -n "${GIT_PAT:-}" ]; then
  git config --global credential.helper store
  printf "https://abdur-rehman10:%s@github.com\n" "$GIT_PAT" > ~/.git-credentials
  chmod 600 ~/.git-credentials
else
  echo "[bootstrap] WARNING: GIT_PAT is not set. git push will likely fail."
fi

# 2) Ensure origin exists
if ! git remote get-url origin >/dev/null 2>&1; then
  if [ -z "${GIT_REMOTE_URL:-}" ]; then
    echo "[bootstrap] ERROR: origin remote missing and GIT_REMOTE_URL is not set."
    echo "[bootstrap] Set GIT_REMOTE_URL in Codex environment variables."
    exit 1
  fi
  git remote add origin "$GIT_REMOTE_URL"
  echo "[bootstrap] Added origin remote: $GIT_REMOTE_URL"
else
  echo "[bootstrap] origin remote exists: $(git remote get-url origin)"
fi

# 3) Fetch and ensure develop exists locally
git fetch origin --prune

BASE_BRANCH="${GIT_DEFAULT_BASE:-develop}"

# Create local base branch if missing
if ! git show-ref --verify --quiet "refs/heads/${BASE_BRANCH}"; then
  git checkout -b "$BASE_BRANCH" "origin/$BASE_BRANCH"
else
  git checkout "$BASE_BRANCH"
  git pull --ff-only origin "$BASE_BRANCH"
fi

# 4) Safety: never work directly on develop
CURRENT="$(git branch --show-current || true)"
if [ "$CURRENT" = "$BASE_BRANCH" ]; then
  echo "[bootstrap] On base branch ($BASE_BRANCH). OK. Next step is to create a feature branch before changes."
fi

# 5) Verify GitHub CLI auth (non-interactive)
if command -v gh >/dev/null 2>&1; then
  if [ -z "${GH_TOKEN:-}" ]; then
    echo "[bootstrap] WARNING: GH_TOKEN not set. gh PR automation will not work."
  else
    gh auth status || true
    gh api user >/dev/null 2>&1 && echo "[bootstrap] gh auth OK"
  fi
else
  echo "[bootstrap] WARNING: gh not installed. PR automation may require UI."
fi

echo "[bootstrap] Done."