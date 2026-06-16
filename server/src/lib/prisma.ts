import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Soft-delete guard — auto-exclude deleted users from all find operations.
// Repositories must still include explicit `deletedAt: null` filters as documentation,
// but this middleware is the safety net (database.md §3.2).
prisma.$use(async (params, next) => {
  if (params.model === 'User') {
    const findOps = ['findUnique', 'findFirst', 'findMany'];
    if (findOps.includes(params.action)) {
      params.args.where = { deletedAt: null, ...params.args.where };
    }
  }
  return next(params);
});
