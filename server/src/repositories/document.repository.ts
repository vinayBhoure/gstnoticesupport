import { prisma } from '../lib/prisma';
import type { BookingDocument, UploadedBy } from '@prisma/client';

type CreateDocumentData = {
  bookingId: string;
  uploadedBy: UploadedBy;
  fileName: string;
  s3Key: string;
};

export const documentRepository = {
  async existsByS3Key(s3Key: string): Promise<boolean> {
    const existing = await prisma.bookingDocument.findUnique({
      where: { s3Key },
      select: { id: true },
    });
    return existing !== null;
  },

  async create(data: CreateDocumentData): Promise<BookingDocument> {
    return prisma.bookingDocument.create({ data });
  },

  // Ownership-baked via bookingId (database.md §7.1) — a document ID from a
  // different booking returns null rather than leaking its existence.
  async findByIdAndBookingId(id: string, bookingId: string): Promise<BookingDocument | null> {
    return prisma.bookingDocument.findFirst({ where: { id, bookingId } });
  },

  async deleteById(id: string): Promise<void> {
    await prisma.bookingDocument.delete({ where: { id } });
  },
};
