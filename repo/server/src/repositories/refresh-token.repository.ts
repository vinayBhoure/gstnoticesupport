import { prisma } from '../lib/prisma';
import type { RefreshToken } from '@prisma/client';

export const refreshTokenRepository = {
  async create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  },

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  },

  async deleteAllByUserId(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  },

  async deleteExpired(): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  },
};
