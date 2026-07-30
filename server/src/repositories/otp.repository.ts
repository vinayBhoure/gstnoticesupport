import { prisma } from '../lib/prisma';
import type { OtpStore, OtpPurpose } from '@prisma/client';

export const otpRepository = {
  async create(data: {
    userId: string;
    purpose: OtpPurpose;
    hashedOtp: string;
    expiresAt: Date;
  }): Promise<OtpStore> {
    return prisma.otpStore.create({ data });
  },

  async findByUserIdAndPurpose(userId: string, purpose: OtpPurpose): Promise<OtpStore | null> {
    return prisma.otpStore.findFirst({
      where: { userId, purpose },
      orderBy: { createdAt: 'desc' },
    });
  },

  async incrementAttempt(id: string): Promise<OtpStore> {
    return prisma.otpStore.update({
      where: { id },
      data: { attemptCount: { increment: 1 } },
    });
  },

  async deleteByUserIdAndPurpose(userId: string, purpose: OtpPurpose): Promise<void> {
    await prisma.otpStore.deleteMany({ where: { userId, purpose } });
  },

  async deleteExpired(): Promise<void> {
    await prisma.otpStore.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  },
};
