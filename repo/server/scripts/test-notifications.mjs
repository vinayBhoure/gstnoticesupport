// Exercises the real email transport (Resend) through the app's own emailService and
// asserts it now SURFACES the delivery outcome (D89) — {ok:true, id} on accept — instead
// of silently swallowing errors. Sends to the resolved admin notification recipient (D92).
//
// This proves Resend ACCEPTED the send and returned an id; actual inbox receipt is
// confirmed separately via the Gmail MCP (Layer 3). Safe to run repeatedly — subjects are
// clearly marked [TEST].
//
// Run from the server directory:  npx tsx scripts/test-notifications.mjs

import 'dotenv/config';
import { emailService } from '../src/lib/email.ts';
import { ADMIN_NOTIFICATION_EMAIL } from '../src/lib/env.ts';

const sends = [
  { event: 'test_booking_created_admin', subject: '[TEST] Admin notification — booking created' },
  { event: 'test_payment_failed_admin', subject: '[TEST] Admin notification — payment failed' },
  { event: 'test_final_draft_ready', subject: '[TEST] Notification — final draft available' },
];

const html = '<p>Automated admin-notification delivery test (test-notifications.mjs). Safe to ignore.</p>';

async function main() {
  console.log('Admin notification recipient:', ADMIN_NOTIFICATION_EMAIL);
  console.log('');
  let failed = 0;
  for (const s of sends) {
    const res = await emailService.sendEmail({
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: s.subject,
      html,
      event: s.event,
    });
    if (res.ok) {
      console.log(`  √  ${s.event}  → Resend accepted (id: ${res.id ?? 'n/a'})`);
    } else {
      console.log(`  ✗  ${s.event}  → FAILED (${res.reason})`);
      failed += 1;
    }
  }
  console.log('');
  if (failed > 0) {
    console.error(`${failed} send(s) failed — check RESEND_API_KEY and the recipient.`);
    process.exitCode = 1;
  } else {
    console.log(`All ${sends.length} admin notification sends were accepted by Resend.`);
    console.log('Confirm receipt in the recipient inbox (Layer 3 / Gmail MCP).');
  }
}

main().catch((err) => {
  console.error('test-notifications error:', err?.message ?? String(err));
  process.exitCode = 1;
});
