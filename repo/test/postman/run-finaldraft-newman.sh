#!/usr/bin/env bash
# Runs the "GST Notice Support — Final Draft" collection via Newman.
#
# Admin credentials are read from server/.env at runtime and injected as Newman env-vars.
# Fixtures (draft_ready/filing/complete bookings owned by the admin, each with a placeholder
# original draftS3Key, + one verified role=user account) are minted by
# setup-final-draft-fixtures.mjs each run and passed to Newman as a single JSON env-var.
#
# Prerequisites:
#   - Backend running on http://localhost:4000 (cd server && npm run dev) — fresh boot keeps
#     the draft-url (15/hr) and admin-draft-upload (15/hr) limiters clean.
#   - Seeded admin (cd server && npx prisma db seed) with ADMIN_EMAIL / ADMIN_PASSWORD in server/.env.
#   - Newman installed (npm install in this directory).
#
# Note: the confirm steps send REAL "final draft available/updated" emails via Resend to the
# booking contactEmail (= ADMIN_EMAIL). This is expected and feeds the Layer-3 Gmail check.
#
# Usage:  bash run-finaldraft-newman.sh

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

TEST_USER_PASSWORD="FinalDraftUser#12345"

echo "→ Minting final-draft fixtures (draft_ready/filing/complete bookings + test user)…"
FIXTURE_OUT="$(cd ../../server && TEST_USER_PASSWORD="$TEST_USER_PASSWORD" npx --no-install tsx scripts/setup-final-draft-fixtures.mjs)"
echo "$FIXTURE_OUT"

FINAL_DRAFT_FIXTURES_JSON="$(echo "$FIXTURE_OUT" | grep '^FINAL_DRAFT_FIXTURES_JSON=' | head -1 | cut -d= -f2- | tr -d '\r')"

if [[ -z "$FINAL_DRAFT_FIXTURES_JSON" ]]; then
  echo "ERROR: fixture did not return FINAL_DRAFT_FIXTURES_JSON." >&2
  exit 1
fi

echo "→ Running Newman…"
npx --no-install newman run "FinalDraft.postman_collection.json" \
  -e "finaldraft-local.postman_environment.json" \
  --env-var "adminEmail=${ADMIN_EMAIL}" \
  --env-var "adminPassword=${ADMIN_PASSWORD}" \
  --env-var "testUserPassword=${TEST_USER_PASSWORD}" \
  --env-var "finalDraftFixturesJson=${FINAL_DRAFT_FIXTURES_JSON}" \
  --reporters cli
