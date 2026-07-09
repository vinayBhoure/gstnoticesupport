import { prisma } from '../lib/prisma';
import type { OtpStore } from '@prisma/client';

export const otpRepository = {
  async create(data: { userId: string; hashedOtp: string; expiresAt: Date }): Promise<OtpStore> {
    return prisma.otpStore.create({ data });
  },

  async findByUserId(userId: string): Promise<OtpStore | null> {
    return prisma.otpStore.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async incrementAttempt(id: string): Promise<OtpStore> {
    return prisma.otpStore.update({
      where: { id },
      data: { attemptCount: { increment: 1 } },
    });
  },

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.otpStore.deleteMany({ where: { userId } });
  },

  async deleteExpired(): Promise<void> {
    await prisma.otpStore.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  },
};
