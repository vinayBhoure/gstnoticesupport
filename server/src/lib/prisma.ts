import { PrismaClient } from '@prisma/client';

// Soft-delete guard — auto-exclude deleted users from all find operations.
// Prisma 6 removed `$use` middleware, so this is implemented as a client extension.
// Repositories must still include explicit `deletedAt: null` filters as documentation,
// but this is the safety net (database.md §3.2).
function createPrismaClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  return base.$extends({
    query: {
      user: {
        async findUnique({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findUniqueOrThrow({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirstOrThrow({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findMany({ args, query }) {
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
