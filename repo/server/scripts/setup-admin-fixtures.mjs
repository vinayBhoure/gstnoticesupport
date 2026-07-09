// Fixture for the Admin Surface Newman suite (test/postman/Admin.postman_collection.json).
// Lives under server/ so `@prisma/client`, `bcrypt`, and `dotenv` resolve from server/node_modules.
//
// Provisions a deterministic, order-independent set of rows so every admin edge can be
// exercised without cross-test state coupling:
//   • one verified role=user account (for RBAC 403 checks) — login-capable (bcrypt, emailVerified)
//   • eight bookings owned by the seeded admin, each pinned to the state a specific test needs
//
// Bookings are tagged organizationName='__TEST__ admin' and created fresh each run (bookings are
// never deleted per database.md §3.3). Prints one machine-readable JSON line the runner injects
// as a single Newman env-var; the collection parses it in the first item.
//
// Run from the server directory:  npx tsx scripts/setup-admin-fixtures.mjs

import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_USER_EMAIL = 'admin-suite-user@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'AdminSuiteUser#12345';
const TAG = '__TEST__ admin';

async function ensureTestUser() {
  const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: TEST_USER_EMAIL },
    update: { hashedPassword, emailVerified: true, deletedAt: null, role: 'user' },
    create: {
      name: 'Admin Suite User',
      email: TEST_USER_EMAIL,
      hashedPassword,
      role: 'user',
      emailVerified: true,
      termsAccepted: true,
    },
  });
  return user.id;
}

async function createBooking(adminId, adminEmail, status, paymentStatus) {
  const booking = await prisma.booking.create({
    data: {
      userId: adminId,
      serviceType: 'asmt_10', // ₹2,999 = 299900 paise
      status,
      paymentStatus,
      contactName: 'Admin Test',
      contactEmail: adminEmail,
      contactPhone: '+919876500000',
      organizationName: TAG,
      filingFor: 'self',
      gstn: '29AABCU9603R1ZX',
      consentInformationAccurate: true,
      consentContactAuthorized: true,
    },
  });
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
    docUploadId: await createBooking(admin.id, adminEmail, 'document_upload', 'pending'),
    docUploadTransitionId: await createBooking(admin.id, adminEmail, 'document_upload', 'pending'),
    inReviewId: await createBooking(admin.id, adminEmail, 'in_review', 'pending'),
    inReviewConfirmId: await createBooking(admin.id, adminEmail, 'in_review', 'pending'),
    draftReadyId: await createBooking(admin.id, adminEmail, 'draft_ready', 'pending'),
    draftReadyReuploadId: await createBooking(admin.id, adminEmail, 'draft_ready', 'pending'),
    filingCompleteId: await createBooking(admin.id, adminEmail, 'filing', 'paid'),
    filingPaidId: await createBooking(admin.id, adminEmail, 'filing', 'paid'),
  };

  // Single machine-readable line the runner greps. Keep on stdout only.
  process.stdout.write(`ADMIN_FIXTURES_JSON=${JSON.stringify(fixtures)}\n`);
}

main()
  .catch((err) => {
    process.stderr.write(`FIXTURE_ERROR: ${err?.message ?? String(err)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
