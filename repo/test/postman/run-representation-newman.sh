#!/usr/bin/env bash
# Runs the "GST Notice Support — Representation Service" collection via Newman.
#
# Self-contained: no DB fixture script. The seeded admin logs in and creates its own
# representation + asmt_10 bookings through the API, then drives them forward. Admin
# credentials are read from server/.env at runtime and injected as Newman env-vars.
#
# Prerequisites:
#   - Backend running on http://localhost:4000 (cd server && npm run dev) — a fresh boot
#     keeps the payment-initiate limiter (5/hr/user) clean; this suite issues 1 initiate.
#   - Seeded admin (cd server && npx prisma db seed) with ADMIN_EMAIL / ADMIN_PASSWORD in server/.env.
#   - Newman installed (npm install in this directory).
#
# Note: the initiate step creates a REAL Razorpay test order (rzp_test_ key). The two
# booking creations also send real "booking created" emails via Resend. Both are expected.
#
# Usage:  bash run-representation-newman.sh

set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE="../../server/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found. Cannot read admin credentials." >&2
  exit 1
fi

CREDS="$(cd ../../server && node -e "require('dotenv').config(); process.stdout.write((process.env.ADMIN_EMAIL||'')+'\n'+(process.env.ADMIN_PASSWORD||''))")"
ADMIN_EMAIL="$(printf '%s' "$CREDS" | sed -n '1p')"
ADMIN_PASSWORD="$(printf '%s' "$CREDS" | sed -n '2p')"

for pair in "ADMIN_EMAIL:$ADMIN_EMAIL" "ADMIN_PASSWORD:$ADMIN_PASSWORD"; do
  if [[ -z "${pair#*:}" ]]; then
    echo "ERROR: ${pair%%:*} missing or empty in $ENV_FILE." >&2
    exit 1
  fi
done

echo "→ Running Newman…"
npx --no-install newman run "Representation.postman_collection.json" \
  -e "representation-local.postman_environment.json" \
  --env-var "adminEmail=${ADMIN_EMAIL}" \
  --env-var "adminPassword=${ADMIN_PASSWORD}" \
  --reporters cli
