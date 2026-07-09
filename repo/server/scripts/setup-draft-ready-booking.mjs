// Fixture for the Payments Newman suite (test/postman/Payments.postman_collection.json).
// Lives under server/ so `@prisma/client` and `dotenv` resolve from server/node_modules.
//
// Creates two fresh bookings owned by the seeded admin, each at status=draft_ready /
// paymentStatus=pending, and prints their ids for the runner to inject as Newman env-vars.
//
// Why a DB fixture: `initiate` and the capture→filing flow gate on `draft_ready`, a state
// produced by the admin draft-upload endpoint (EP13, not built yet). Until then this is the
// only way to reach that state. Bookings are tagged organizationName='__TEST__ payments'.
//
// Run from the server directory:  npx tsx scripts/setup-draft-ready-booking.mjs

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDraftReadyBooking(adminId, adminEmail) {
  const booking = await prisma.booking.create({
    data: {
      userId: adminId,
      serviceType: 'asmt_10', // ₹2,999 = 299900 paise
      status: 'draft_ready',
      paymentStatus: 'pending',
      contactName: 'Payment Test',
      contactEmail: adminEmail,
      contactPhone: '+919876500000',
      organizationName: '__TEST__ payments',
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

  const id1 = await createDraftReadyBooking(admin.id, adminEmail);
  const id2 = await createDraftReadyBooking(admin.id, adminEmail);

  // Machine-readable lines the runner greps. Keep on stdout only.
  process.stdout.write(`DRAFT_READY_BOOKING_ID=${id1}\n`);
  process.stdout.write(`DRAFT_READY_BOOKING_ID_2=${id2}\n`);
}

main()
  .catch((err) => {
    process.stderr.write(`FIXTURE_ERROR: ${err?.message ?? String(err)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
