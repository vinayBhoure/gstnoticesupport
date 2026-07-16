import { prisma } from '../lib/prisma';

export const healthRepository = {
  // Cheapest round-trip that proves the DB connection is live and the schema is
  // reachable, without raw SQL (database.md §2.1). Used by the deploy health gate
  // so a container pointed at a broken/unmigrated database fails its check instead
  // of reporting healthy.
  async ping(): Promise<void> {
    await prisma.user.findFirst({ select: { id: true } });
  },
};
