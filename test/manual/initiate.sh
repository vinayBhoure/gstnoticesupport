#!/usr/bin/env bash
# Logs in as the seeded admin and creates a Razorpay order for a draft_ready booking.
# Prints orderId / keyId / amount so you can drive checkout.html.
#
# Usage:  bash initiate.sh <draft_ready bookingId>
#   Get a draft_ready bookingId from:  (cd ../../server && npx tsx scripts/setup-draft-ready-booking.mjs)

set -euo pipefail
cd "$(dirname "$0")"

BOOKING_ID="${1:?usage: bash initiate.sh <draft_ready bookingId>}"
ENV_FILE="../../server/.env"
BASE="http://localhost:4000/api/v1"

read_env() { grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r' | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"; }
EMAIL="$(read_env ADMIN_EMAIL)"; PASS="$(read_env ADMIN_PASSWORD)"

JAR="$(mktemp)"
trap 'rm -f "$JAR"' EXIT

curl -s -c "$JAR" -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" > /dev/null

curl -s -b "$JAR" -X POST "$BASE/payments/$BOOKING_ID/initiate" | node -e '
let s=""; process.stdin.on("data",d=>s+=d).on("end",()=>{
  const j=JSON.parse(s);
  if(!j.success){ console.error("ERROR:", JSON.stringify(j.error)); process.exit(1); }
  const d=j.data;
  console.log("orderId    =", d.orderId);
  console.log("keyId      =", d.keyId);
  console.log("amountPaise=", d.amountPaise);
  console.log("\nOpen in a browser:");
  console.log("  test/manual/checkout.html?keyId="+d.keyId+"&orderId="+d.orderId);
});'
