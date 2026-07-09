#!/usr/bin/env bash
# Drives Layer 2 (GET /payments/verify) with the REAL values Razorpay Checkout returned.
# On a captured payment this transitions the booking draft_ready -> filing and returns
# outcome=success. Logs in as the seeded admin (the fixture bookings' owner) for the cookie.
#
# Usage:  bash verify.sh <razorpay_payment_id> <razorpay_order_id> <razorpay_signature> <bookingId>

set -euo pipefail
cd "$(dirname "$0")"

PID="${1:?usage: bash verify.sh <payment_id> <order_id> <signature> <bookingId>}"
OID="${2:?missing razorpay_order_id}"
SIG="${3:?missing razorpay_signature}"
BID="${4:?missing bookingId}"

ENV_FILE="../../server/.env"
BASE="http://localhost:4000/api/v1"

read_env() { grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r' | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"; }
EMAIL="$(read_env ADMIN_EMAIL)"; PASS="$(read_env ADMIN_PASSWORD)"

JAR="$(mktemp)"
trap 'rm -f "$JAR"' EXIT

curl -s -c "$JAR" -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" > /dev/null

echo "→ verify…"
curl -s -b "$JAR" "$BASE/payments/verify?razorpay_payment_id=$PID&razorpay_order_id=$OID&razorpay_signature=$SIG&booking_id=$BID"
echo ""
echo "→ booking status after verify:"
curl -s -b "$JAR" "$BASE/bookings/$BID" | node -e '
let s=""; process.stdin.on("data",d=>s+=d).on("end",()=>{
  const b=JSON.parse(s).data.booking;
  console.log("  status        =", b.status);
  console.log("  paymentStatus =", b.paymentStatus);
});'
