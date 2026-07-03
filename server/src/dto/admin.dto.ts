import type {
  Booking,
  BookingDocument,
  PaymentRecord,
  ServiceType,
  BookingStatus,
  PaymentStatus,
  User,
} from '@prisma/client';
import {
  toBookingDetailDTO,
  toBookingDocumentDTO,
  toPaymentRecordDTO,
  type BookingDetailDTO,
  type BookingDocumentDTO,
  type PaymentRecordDTO,
} from './booking.dto';

// Admin views expose the owning user and the FULL payment history (D66 `source`
// visible). draftS3Key is never returned — only a derived `hasDraft` flag. s3Key on
// documents is never returned (inherited from toBookingDocumentDTO).

export type AdminUserSummaryDTO = {
  id: string;
  name: string;
  email: string;
};

type BookingWithUser = Booking & {
  user: { id: string; name: string; email: string };
};

type BookingWithAdminRelations = Booking & {
  user: { id: string; name: string; email: string };
  documents: BookingDocument[];
  paymentRecords: PaymentRecord[];
};

export type AdminBookingListItemDTO = {
  id: string;
  serviceType: ServiceType;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  user: AdminUserSummaryDTO;
  createdAt: string;
  updatedAt: string;
};

export type AdminBookingDetailDTO = BookingDetailDTO & {
  user: AdminUserSummaryDTO;
  documents: BookingDocumentDTO[];
  paymentRecords: PaymentRecordDTO[];
  hasDraft: boolean;
};

export type AdminStatsDTO = {
  totalBookings: number;
  byStatus: Record<BookingStatus, number>;
  byServiceType: Record<ServiceType, number>;
  totalRevenuePaise: number;
};

export function toAdminBookingListItemDTO(booking: BookingWithUser): AdminBookingListItemDTO {
  return {
    id: booking.id,
    serviceType: booking.serviceType,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    user: {
      id: booking.user.id,
      name: booking.user.name,
      email: booking.user.email,
    },
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

export function toAdminBookingDetailDTO(
  booking: BookingWithAdminRelations,
): AdminBookingDetailDTO {
  return {
    ...toBookingDetailDTO(booking),
    user: {
      id: booking.user.id,
      name: booking.user.name,
      email: booking.user.email,
    },
    documents: booking.documents.map(toBookingDocumentDTO),
    paymentRecords: booking.paymentRecords.map(toPaymentRecordDTO),
    hasDraft: booking.draftS3Key !== null,
  };
}

// Admin Users screens (Admin Users / Admin User Detail prototypes). Explicitly
// listed fields only — hashedPassword/deletedAt never leave the server (database.md §5.3).
export type AdminUserListItemDTO = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interestedServices: ServiceType[];
  createdAt: string;
};

export type AdminUserDetailDTO = AdminUserListItemDTO & {
  activeBookingsCount: number;
};

export function toAdminUserListItemDTO(user: User): AdminUserListItemDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    interestedServices: user.interestedServices,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toAdminUserDetailDTO(user: User, activeBookingsCount: number): AdminUserDetailDTO {
  return { ...toAdminUserListItemDTO(user), activeBookingsCount };
}
