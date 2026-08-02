import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'qa-layout-test@gstnoticesupport.in';
  const hashedPassword = await bcrypt.hash('Test@gst123', 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { deletedAt: null },
    create: {
      name: 'Venkatanarasimharajuvaripeta Subramaniam',
      email,
      hashedPassword,
      phone: '9876543210',
      role: 'user',
      emailVerified: true,
      termsAccepted: true,
    },
  });

  const existing = await prisma.booking.findFirst({ where: { userId: user.id } });
  if (existing) {
    process.stdout.write(`booking exists: ${existing.id} (user ${user.email})\n`);
    return;
  }

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      serviceType: 'gstat_appeal',
      status: 'draft_ready',
      paymentStatus: 'pending',
      contactName: 'Venkatanarasimharajuvaripeta Subramaniam',
      contactEmail: 'venkatanarasimharajuvaripeta.subramaniam@extremelylongdomainexample.co.in',
      contactPhone: '9876543210',
      organizationName: 'Sri Venkateshwara Industrial Manufacturing And Trading Private Limited',
      filingFor: 'others',
      gstn: '29ABCDE1234F1Z5',
      consentInformationAccurate: true,
      consentContactAuthorized: true,
      adminNote:
        'Reviewed all fourteen supporting documents. The departmental valuation report referenced in annexure C requires a certified translation before we can rely on it at the tribunal stage. Draft is ready for your review.',
      documents: {
        create: [
          {
            uploadedBy: 'user',
            fileName: 'GSTAT-Appeal-Supporting-Documents-Consolidated-Final-Version-2026.pdf',
            s3Key: `${user.id}/qa-doc-1/20260802-doc1-aaaa.pdf`,
          },
          {
            uploadedBy: 'user',
            fileName: 'Order-In-Original-No-127-2025-26-Commissioner-Appeals-Bengaluru.pdf',
            s3Key: `${user.id}/qa-doc-2/20260802-doc2-bbbb.pdf`,
          },
          {
            uploadedBy: 'user',
            fileName: 'notice.pdf',
            s3Key: `${user.id}/qa-doc-3/20260802-doc3-cccc.pdf`,
          },
        ],
      },
    },
  });

  process.stdout.write(`seeded booking ${booking.id} for ${user.email}\n`);
}

main()
  .catch((err) => {
    process.stderr.write(`seed failed: ${String(err)}\n`);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
