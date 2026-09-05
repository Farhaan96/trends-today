#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."
node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major < 20 || (major === 20 && minor < 9)) { console.error("Trends Today requires Node >=20.9; provision a current LTS runtime in the Cursor environment."); process.exit(1); }'

# This repository currently ignores lockfiles. Prefer a committed lockfile once
# the cloud migration supplies one; do not pretend npm install is reproducible.
if git ls-files --error-unmatch package-lock.json >/dev/null 2>&1; then
  npm ci
else
  npm install
fi

# Setup only; browser verification runs in the authorized cloud environment.
npx --no-install playwright install --with-deps chromium
