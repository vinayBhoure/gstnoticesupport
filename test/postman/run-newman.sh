#!/usr/bin/env bash
# Runs the "GST Notice Support" Postman collection via Newman.
# Admin credentials are read from server/.env at runtime and injected as
# Newman env-vars — they are NEVER written into the committed environment file.
#
# Prerequisites:
#   - Backend running on http://localhost:4000 (cd server && npm run dev)
#   - Seeded admin user (npx prisma db seed) with ADMIN_EMAIL / ADMIN_PASSWORD in server/.env
#   - Newman installed (npm install in this directory)
#
# Usage:  bash run-newman.sh

set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE="../../server/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found. Cannot read admin credentials." >&2
  exit 1
fi

read_env() {
  # Extract VALUE from a `KEY=VALUE` line, stripping CR, surrounding quotes, and inline comments.
  grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r' | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

ADMIN_EMAIL="$(read_env ADMIN_EMAIL)"
ADMIN_PASSWORD="$(read_env ADMIN_PASSWORD)"

if [[ -z "${ADMIN_EMAIL}" || -z "${ADMIN_PASSWORD}" ]]; then
  echo "ERROR: ADMIN_EMAIL / ADMIN_PASSWORD missing or empty in $ENV_FILE." >&2
  exit 1
fi

npx --no-install newman run "GST Notice Support.postman_collection.json" \
  -e "gst-local.postman_environment.json" \
  --env-var "adminEmail=${ADMIN_EMAIL}" \
  --env-var "adminPassword=${ADMIN_PASSWORD}" \
  --reporters cli
