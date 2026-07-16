#!/usr/bin/env bash
# Runs the "GST Notice Support — Admin Surface" collection via Newman.
#
# Admin credentials are read from server/.env at runtime and injected as Newman env-vars —
# never written into the committed environment file. A fresh set of fixtures (one verified
# role=user account + eight state-pinned bookings) is minted by setup-admin-fixtures.mjs each
# run and passed to Newman as a single JSON env-var.
#
# Prerequisites:
#   - Backend running on http://localhost:4000 (cd server && npm run dev) — FRESH boot recommended
#     (the draft-upload-url limiter is 15/hr/IP; this suite issues 1 successful signed-URL call,
#     well under the limit, but a fresh boot keeps counters clean).
#   - Seeded admin (cd server && npx prisma db seed) with ADMIN_EMAIL / ADMIN_PASSWORD in server/.env.
#   - Valid server/.env (DATABASE_URL + Razorpay keys — the mark-paid 502 test calls the Razorpay
#     Fetch Payment API with an unknown id, which errors and yields 502 regardless of key validity).
#   - Newman installed (npm install in this directory).
#
# Usage:  bash run-admin-newman.sh

set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE="../../server/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found. Cannot read admin credentials." >&2
  exit 1
fi

# Resolve admin creds via dotenv (the app's + seed's source of truth) rather than grep/sed:
# .env may contain duplicate or quoted ADMIN_* lines, and a naive `grep | head -1` can pick a
# stale duplicate that dotenv (last-wins) does not use — causing a spurious login failure.
CREDS="$(cd ../../server && node -e "require('dotenv').config(); process.stdout.write((process.env.ADMIN_EMAIL||'')+'\n'+(process.env.ADMIN_PASSWORD||''))")"
ADMIN_EMAIL="$(printf '%s' "$CREDS" | sed -n '1p')"
ADMIN_PASSWORD="$(printf '%s' "$CREDS" | sed -n '2p')"

for pair in "ADMIN_EMAIL:$ADMIN_EMAIL" "ADMIN_PASSWORD:$ADMIN_PASSWORD"; do
  if [[ -z "${pair#*:}" ]]; then
    echo "ERROR: ${pair%%:*} missing or empty in $ENV_FILE." >&2
    exit 1
  fi
done

# The regular-user password used both to hash the fixture user and to log in during the RBAC folder.
TEST_USER_PASSWORD="${TEST_USER_PASSWORD:-AdminSuiteUser#12345}"

echo "→ Minting admin fixtures (test user + 8 state-pinned bookings)…"
FIXTURE_OUT="$(cd ../../server && TEST_USER_PASSWORD="$TEST_USER_PASSWORD" npx --no-install tsx scripts/setup-admin-fixtures.mjs)"
echo "$FIXTURE_OUT"

ADMIN_FIXTURES_JSON="$(echo "$FIXTURE_OUT" | grep '^ADMIN_FIXTURES_JSON=' | head -1 | cut -d= -f2- | tr -d '\r')"

if [[ -z "$ADMIN_FIXTURES_JSON" ]]; then
  echo "ERROR: fixture did not return ADMIN_FIXTURES_JSON." >&2
  exit 1
fi

echo "→ Running Newman…"
npx --no-install newman run "Admin.postman_collection.json" \
  -e "admin-local.postman_environment.json" \
  --env-var "adminEmail=${ADMIN_EMAIL}" \
  --env-var "adminPassword=${ADMIN_PASSWORD}" \
  --env-var "testUserPassword=${TEST_USER_PASSWORD}" \
  --env-var "adminFixturesJson=${ADMIN_FIXTURES_JSON}" \
  --reporters cli
