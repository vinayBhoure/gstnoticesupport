import { prisma } from '../lib/prisma';
import { BookingStatus } from '@prisma/client';
import type { Booking, BookingDocument, PaymentRecord } from '@prisma/client';
import type { CreateBookingInput } from '../schemas/booking.schema';

export type BookingWithRelations = Booking & {
  documents: BookingDocument[];
  paymentRecords: PaymentRecord[];
};

export const bookingRepository = {
  async create(data: CreateBookingInput & { userId: string }): Promise<Booking> {
    return prisma.booking.create({ data });
  },

  // Returns all bookings for a user, newest first (database.md §6.1 — no unbounded queries).
  async findAllByUserId(userId: string): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Ownership-baked: returns null for IDs owned by another user (database.md §7.1).
  // Decision: 404 for both "not found" and "wrong owner" — no existence leak (decisions.md).
  async findByIdAndUserId(id: string, userId: string): Promise<BookingWithRelations | null> {
    return prisma.booking.findFirst({
      where: { id, userId },
      include: {
        documents: { orderBy: { uploadedAt: 'asc' } },
        paymentRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  },

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
  },
};
