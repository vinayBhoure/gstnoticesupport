import { prisma } from '../lib/prisma';
import type { User, UserRole } from '@prisma/client';

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    // Prisma middleware auto-excludes deleted users (lib/prisma.ts)
    return prisma.user.findFirst({ where: { id } });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { email } });
  },

  async create(data: {
    name: string;
    email: string;
    hashedPassword: string;
    role?: UserRole;
    emailVerified?: boolean;
    termsAccepted?: boolean;
    allowPromotions?: boolean;
  }): Promise<User> {
    return prisma.user.create({ data });
  },

  async updateEmailVerified(id: string, verified: boolean): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { emailVerified: verified, updatedAt: new Date() },
    });
  },

  async updateProfile(id: string, data: { name?: string; phone?: string }): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  },

  async softDelete(id: string): Promise<User> {
    // database.md §3.1 — never call prisma.user.delete()
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), updatedAt: new Date() },
    });
  },
};
