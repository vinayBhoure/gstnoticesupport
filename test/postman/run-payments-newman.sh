#!/usr/bin/env bash
# Runs the "GST Notice Support — Payments" collection via Newman.
#
# Admin credentials AND Razorpay secrets are read from server/.env at runtime and injected
# as Newman env-vars — they are NEVER written into the committed environment file.
# A fresh pair of draft_ready bookings is minted by setup-draft-ready-booking.mjs each run.
#
# Prerequisites:
#   - Backend running on http://localhost:4000 (cd server && npm run dev) — FRESH boot
#     recommended so the in-memory rate limiter is reset (initiate is 5/hr/IP; the suite
#     issues exactly 5 authenticated initiate calls).
#   - Seeded admin user (cd server && npx prisma db seed) with ADMIN_EMAIL / ADMIN_PASSWORD.
#   - Valid Razorpay TEST keys in server/.env (initiate hits the live test Orders API).
#   - Newman installed (npm install in this directory).
#
# Usage:  bash run-payments-newman.sh

set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE="../../server/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found. Cannot read credentials/secrets." >&2
  exit 1
fi

read_env() {
  # Extract VALUE from a `KEY=VALUE` line, stripping CR, surrounding quotes, and inline comments.
  grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r' | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

ADMIN_EMAIL="$(read_env ADMIN_EMAIL)"
ADMIN_PASSWORD="$(read_env ADMIN_PASSWORD)"
RAZORPAY_WEBHOOK_SECRET="$(read_env RAZORPAY_WEBHOOK_SECRET)"
RAZORPAY_KEY_SECRET="$(read_env RAZORPAY_KEY_SECRET)"

for pair in "ADMIN_EMAIL:$ADMIN_EMAIL" "ADMIN_PASSWORD:$ADMIN_PASSWORD" \
            "RAZORPAY_WEBHOOK_SECRET:$RAZORPAY_WEBHOOK_SECRET" "RAZORPAY_KEY_SECRET:$RAZORPAY_KEY_SECRET"; do
  if [[ -z "${pair#*:}" ]]; then
    echo "ERROR: ${pair%%:*} missing or empty in $ENV_FILE." >&2
    exit 1
  fi
done

echo "→ Minting two draft_ready bookings (fixture)…"
FIXTURE_OUT="$(cd ../../server && npx --no-install tsx scripts/setup-draft-ready-booking.mjs)"
echo "$FIXTURE_OUT"

DRAFT_READY_BOOKING_ID="$(echo "$FIXTURE_OUT" | grep '^DRAFT_READY_BOOKING_ID=' | head -1 | cut -d= -f2 | tr -d '\r')"
DRAFT_READY_BOOKING_ID_2="$(echo "$FIXTURE_OUT" | grep '^DRAFT_READY_BOOKING_ID_2=' | head -1 | cut -d= -f2 | tr -d '\r')"

if [[ -z "$DRAFT_READY_BOOKING_ID" || -z "$DRAFT_READY_BOOKING_ID_2" ]]; then
  echo "ERROR: fixture did not return both booking ids." >&2
  exit 1
fi

echo "→ Running Newman…"
npx --no-install newman run "Payments.postman_collection.json" \
  -e "payments-local.postman_environment.json" \
  --env-var "adminEmail=${ADMIN_EMAIL}" \
  --env-var "adminPassword=${ADMIN_PASSWORD}" \
  --env-var "razorpayWebhookSecret=${RAZORPAY_WEBHOOK_SECRET}" \
  --env-var "razorpayKeySecret=${RAZORPAY_KEY_SECRET}" \
  --env-var "draftReadyBookingId=${DRAFT_READY_BOOKING_ID}" \
  --env-var "draftReadyBookingId2=${DRAFT_READY_BOOKING_ID_2}" \
  --reporters cli
