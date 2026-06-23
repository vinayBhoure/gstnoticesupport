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
};
