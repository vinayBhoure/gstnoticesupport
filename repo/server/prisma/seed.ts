import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const name = process.env.ADMIN_NAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !name || !password) {
    throw new Error(
      'ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD must be set in .env before running the seed.',
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name,
      email,
      hashedPassword,
      role: 'admin',
      emailVerified: true,
      termsAccepted: true,
    },
  });

  process.stdout.write(`✅ Admin seeded: ${admin.email} (id: ${admin.id})\n`);
}

main()
  .catch((err) => {
    process.stderr.write(`❌ Seed failed: ${String(err)}\n`);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
