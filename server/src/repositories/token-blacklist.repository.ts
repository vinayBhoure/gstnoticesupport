import { prisma } from '../lib/prisma';

export const tokenBlacklistRepository = {
  async create(data: { tokenJti: string; expiresAt: Date }): Promise<void> {
    await prisma.tokenBlacklist.create({ data });
  },

  async existsByJti(tokenJti: string): Promise<boolean> {
    const row = await prisma.tokenBlacklist.findUnique({ where: { tokenJti } });
    return row !== null;
  },

  async deleteExpired(): Promise<void> {
    await prisma.tokenBlacklist.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  },
};
