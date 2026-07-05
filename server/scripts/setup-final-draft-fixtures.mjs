// Fixture for the Final-Draft Newman suite (test/postman/FinalDraft.postman_collection.json).
// Lives under server/ so `@prisma/client`, `bcrypt`, and `dotenv` resolve from server/node_modules.
//
// The final-draft feature gates on booking status (filing / complete) — states only
// reachable via a real captured Razorpay payment (D77). This fixture pins that state
// directly in the DB so the API contract, status gates, variant resolution, and the
// hasFinalDraft DTO flag can be exercised without a live payment. draft-confirm and
// draft-url only check the S3 KEY (prefix + which key), never the object's existence,
// so placeholder keys are sufficient for asserting the contract.
//
// Provisions (all owned by the seeded admin, tagged organizationName='__TEST__ final-draft'):
//   • draftReadyId  — status draft_ready (final draft is LOCKED here; draft-url 403)
//   • filingId      — status filing, has an original draftS3Key, no final draft yet
//   • completeId    — status complete, has an original draftS3Key, no final draft yet
//   • one verified role=user account for the RBAC 403 checks
//
// Prints one machine-readable JSON line the runner injects as a single Newman env-var.
// Run from the server directory:  npx tsx scripts/setup-final-draft-fixtures.mjs

import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_USER_EMAIL = 'finaldraft-suite-user@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'FinalDraftUser#12345';
const TAG = '__TEST__ final-draft';

async function ensureTestUser() {
  const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: TEST_USER_EMAIL },
    update: { hashedPassword, emailVerified: true, deletedAt: null, role: 'user' },
    create: {
      name: 'Final Draft Suite User',
      email: TEST_USER_EMAIL,
      hashedPassword,
      role: 'user',
      emailVerified: true,
      termsAccepted: true,
    },
  });
  return user.id;
}

// Create a booking pinned to a status, optionally seeding the pre-payment draft pointer.
async function createBooking(adminId, adminEmail, status, paymentStatus, withOriginalDraft) {
  const booking = await prisma.booking.create({
    data: {
      userId: adminId,
      serviceType: 'asmt_10',
      status,
      paymentStatus,
      contactName: 'Final Draft Test',
      contactEmail: adminEmail,
      contactPhone: '+919876500000',
      organizationName: TAG,
      filingFor: 'self',
      gstn: '29AABCU9603R1ZX',
      consentInformationAccurate: true,
      consentContactAuthorized: true,
    },
  });
  if (withOriginalDraft) {
    // Placeholder original (pre-payment) draft key — the object need not exist; draft-url
    // only signs a GET for whatever key is stored, and the suite asserts the key in the URL.
    await prisma.booking.update({
      where: { id: booking.id },
      data: { draftS3Key: `drafts/${booking.id}-20260101-original-0000.pdf` },
    });
  }
  return booking.id;
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    process.stderr.write('FIXTURE_ERROR: ADMIN_EMAIL missing in server/.env\n');
    process.exit(1);
  }

  const admin = await prisma.user.findFirst({ where: { email: adminEmail, role: 'admin' } });
  if (!admin) {
    process.stderr.write(`FIXTURE_ERROR: admin user not found for ${adminEmail}. Run: npx prisma db seed\n`);
    process.exit(1);
  }

  const testUserId = await ensureTestUser();

  const fixtures = {
    testUserEmail: TEST_USER_EMAIL,
    testUserId,
    draftReadyId: await createBooking(admin.id, adminEmail, 'draft_ready', 'pending', true),
    filingId: await createBooking(admin.id, adminEmail, 'filing', 'paid', true),
    completeId: await createBooking(admin.id, adminEmail, 'complete', 'paid', true),
  };

  process.stdout.write(`FINAL_DRAFT_FIXTURES_JSON=${JSON.stringify(fixtures)}\n`);
}

main()
  .catch((err) => {
    process.stderr.write(`FIXTURE_ERROR: ${err?.message ?? String(err)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
