import { prisma } from '../lib/prisma';
import type { User, UserRole } from '@prisma/client';

type AdminUserFilter = {
  page: number;
  limit: number;
  search?: string;
};

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    // Prisma middleware auto-excludes deleted users (lib/prisma.ts)
    return prisma.user.findFirst({ where: { id } });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { email } });
  },

  // `mobile` is the canonical bare-10-digit form. Legacy rows may still hold
  // +91/91/0-prefixed variants from before strict validation was added, so all
  // four are matched. orderBy keeps the result deterministic if any duplicates exist.
  async findByPhone(mobile: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { phone: { in: [mobile, `+91${mobile}`, `91${mobile}`, `0${mobile}`] } },
      orderBy: { createdAt: 'asc' },
    });
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

  async updateProfile(
    id: string,
    data: { name?: string; phone?: string; allowPromotions?: boolean },
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  },

  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { hashedPassword, updatedAt: new Date() },
    });
  },

  // Cut-off instant for access tokens; see authenticate.ts. Callers must pass a stamp
  // floored to the second — JWT `iat` has second resolution, so a millisecond value
  // would invalidate the token issued in the same request.
  async updateSessionsValidFrom(id: string, validFrom: Date): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { sessionsValidFrom: validFrom, updatedAt: new Date() },
    });
  },

  async softDelete(id: string): Promise<User> {
    // database.md §3.1 — never call prisma.user.delete()
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), updatedAt: new Date() },
    });
  },

  // Admin users list (role=user only; the soft-delete guard extension already
  // excludes deleted rows — the explicit filter documents intent, database.md §3.2).
  async findAllForAdmin(filter: AdminUserFilter): Promise<{ data: User[]; total: number }> {
    const where = {
      role: 'user' as UserRole,
      deletedAt: null,
      ...(filter.search
        ? {
            OR: [
              { name: { contains: filter.search, mode: 'insensitive' as const } },
              { email: { contains: filter.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
      }),
      prisma.user.count({ where }),
    ]);
    return { data, total };
  },
};
