// Seeds one unverified account so the browser can exercise the abandoned-signup recovery.
// Usage: node scripts/seed-unverified-user.mjs
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const EMAIL = 'abandoned.signup@example.com';
const PASSWORD = 'ValidPass@123';

await prisma.user.deleteMany({ where: { email: EMAIL } });
const user = await prisma.user.create({
  data: {
    name: 'Abandoned Signup',
    email: EMAIL,
    hashedPassword: await bcrypt.hash(PASSWORD, 12),
    emailVerified: false,
    termsAccepted: true,
  },
});

console.log(JSON.stringify({ id: user.id, email: EMAIL, password: PASSWORD }, null, 2));
await prisma.$disconnect();
