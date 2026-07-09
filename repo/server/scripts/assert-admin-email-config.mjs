// Asserts the admin-notification delivery config is sane (D89/D92).
//
// Checks:
//   1. A notification recipient resolves (ADMIN_NOTIFICATION_EMAIL, else ADMIN_EMAIL).
//   2. The recipient is NOT on the same domain as RESEND_FROM_EMAIL — same-domain mail
//      can silently fail until that domain's SPF/DKIM/DMARC are verified in Resend, which
//      was the original "admin gets no emails" root cause.
//   3. The server recipient and the client CONTACT_TO_EMAIL point at the same inbox, so
//      every admin alert lands in one place.
//
// Run from the server directory:  npx tsx scripts/assert-admin-email-config.mjs

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

function domainOf(email) {
  return (email || '').split('@')[1]?.toLowerCase() ?? '';
}

function readEnvVar(path, key) {
  try {
    const text = readFileSync(path, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && m[1] === key) return m[2].replace(/^["']|["']$/g, '').trim();
    }
  } catch {
    /* file missing */
  }
  return undefined;
}

const results = [];
const check = (name, ok, detail) => results.push({ name, ok, detail });

const adminEmail = process.env.ADMIN_EMAIL;
const notifyEmail = process.env.ADMIN_NOTIFICATION_EMAIL || adminEmail;
const fromEmail = process.env.RESEND_FROM_EMAIL;
const clientEnvPath = resolve(here, '../../client/.env');
const contactTo = readEnvVar(clientEnvPath, 'CONTACT_TO_EMAIL');

console.log('Resolved config:');
console.log('  ADMIN_EMAIL (login identity)   :', adminEmail);
console.log('  ADMIN_NOTIFICATION_EMAIL (recip):', process.env.ADMIN_NOTIFICATION_EMAIL || '(unset → falls back to ADMIN_EMAIL)');
console.log('  → effective admin recipient    :', notifyEmail);
console.log('  RESEND_FROM_EMAIL (sender)     :', fromEmail);
console.log('  client CONTACT_TO_EMAIL        :', contactTo ?? '(not found)');
console.log('');

check('admin recipient is set', Boolean(notifyEmail), notifyEmail);
check('admin recipient is a valid email', /.+@.+\..+/.test(notifyEmail || ''), notifyEmail);
check(
  'admin recipient is NOT on the sender domain (deliverability)',
  domainOf(notifyEmail) !== '' && domainOf(notifyEmail) !== domainOf(fromEmail),
  `recipient=@${domainOf(notifyEmail)} sender=@${domainOf(fromEmail)}`,
);
check(
  'server recipient matches client CONTACT_TO_EMAIL',
  Boolean(contactTo) && contactTo === notifyEmail,
  `server=${notifyEmail} client=${contactTo ?? '(none)'}`,
);

let failed = 0;
for (const r of results) {
  console.log(`  ${r.ok ? '√' : '✗'}  ${r.name}${r.detail ? `  [${r.detail}]` : ''}`);
  if (!r.ok) failed += 1;
}
console.log('');
if (failed > 0) {
  console.error(`${failed} check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('All admin-email config checks passed.');
}
