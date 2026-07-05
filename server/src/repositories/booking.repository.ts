import { prisma } from '../lib/prisma';
import { BookingStatus } from '@prisma/client';
import type {
  Booking,
  BookingDocument,
  PaymentRecord,
  PaymentStatus,
  ServiceType,
} from '@prisma/client';
import type { CreateBookingInput } from '../schemas/booking.schema';

export type BookingWithRelations = Booking & {
  documents: BookingDocument[];
  paymentRecords: PaymentRecord[];
};

// Admin views join the owning user and (for detail) the full payment history.
export type AdminBookingListRow = Booking & {
  user: { id: string; name: string; email: string };
};

export type AdminBookingDetailRow = Booking & {
  user: { id: string; name: string; email: string };
  documents: BookingDocument[];
  paymentRecords: PaymentRecord[];
};

type AdminBookingFilter = {
  page: number;
  limit: number;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  serviceType?: ServiceType;
  search?: string;
  sortBy: 'createdAt' | 'updatedAt';
  sortDir: 'asc' | 'desc';
};

// Statuses that count as "active" for the delete-user gate (Admin User Detail
// prototype: users are deletable only once every booking is complete/cancelled).
const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.document_upload,
  BookingStatus.in_review,
  BookingStatus.draft_ready,
  BookingStatus.filing,
];

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

  // ── Admin surface (Phase 6) ──────────────────────────────────────────────
  // No userId filter — admin sees every booking (database.md §7.1: admin lookups
  // use a separate method that does not bake in ownership).

  async findAllForAdmin(
    filter: AdminBookingFilter,
  ): Promise<{ data: AdminBookingListRow[]; total: number }> {
    const where = {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.paymentStatus ? { paymentStatus: filter.paymentStatus } : {}),
      ...(filter.serviceType ? { serviceType: filter.serviceType } : {}),
      ...(filter.search
        ? {
            user: {
              is: {
                OR: [
                  { name: { contains: filter.search, mode: 'insensitive' as const } },
                  { email: { contains: filter.search, mode: 'insensitive' as const } },
                ],
              },
            },
          }
        : {}),
    };
    const [data, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        orderBy: { [filter.sortBy]: filter.sortDir },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.booking.count({ where }),
    ]);
    return { data, total };
  },

  async countActiveByUserId(userId: string): Promise<number> {
    return prisma.booking.count({
      where: { userId, status: { in: ACTIVE_BOOKING_STATUSES } },
    });
  },

  async findByIdForAdmin(id: string): Promise<AdminBookingDetailRow | null> {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        documents: { orderBy: { uploadedAt: 'asc' } },
        paymentRecords: { orderBy: { createdAt: 'desc' } },
      },
    });
  },

  async setAdminNote(id: string, note: string): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data: { adminNote: note, updatedAt: new Date() },
    });
  },

  // Draft confirm: set the draft pointer and (for the first draft) transition to
  // draft_ready. On re-upload the caller passes status = draft_ready (unchanged).
  async setDraftAndStatus(
    id: string,
    draftS3Key: string,
    status: BookingStatus,
  ): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data: { draftS3Key, status, updatedAt: new Date() },
    });
  },

  // Final (post-payment) draft: set the pointer only — status is unchanged, since the
  // final draft is uploaded while the booking is already in filing/complete.
  async setFinalDraft(id: string, finalDraftS3Key: string): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data: { finalDraftS3Key, updatedAt: new Date() },
    });
  },

  async countGroupedByStatus(): Promise<{ status: BookingStatus; count: number }[]> {
    const rows = await prisma.booking.groupBy({ by: ['status'], _count: { _all: true } });
    return rows.map((r) => ({ status: r.status, count: r._count._all }));
  },

  async countGroupedByServiceType(): Promise<{ serviceType: ServiceType; count: number }[]> {
    const rows = await prisma.booking.groupBy({ by: ['serviceType'], _count: { _all: true } });
    return rows.map((r) => ({ serviceType: r.serviceType, count: r._count._all }));
  },
};
