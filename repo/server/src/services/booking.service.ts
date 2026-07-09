import { bookingRepository } from '../repositories/booking.repository';
import { notificationService } from './notification.service';
import { assertUserCancellable } from './booking-state-machine';
import { ApiError } from '../utils/ApiError';
import {
  toBookingSummaryDTO,
  toBookingDetailDTO,
  toBookingDetailWithRelationsDTO,
  type BookingSummaryDTO,
  type BookingDetailDTO,
  type BookingDetailWithRelationsDTO,
} from '../dto/booking.dto';
import type { CreateBookingInput } from '../schemas/booking.schema';

export const bookingService = {
  async create(userId: string, input: CreateBookingInput): Promise<BookingDetailDTO> {
    const booking = await bookingRepository.create({ userId, ...input });

    // Best-effort — email failure must never block the booking creation.
    notificationService
      .sendBookingCreated({
        id: booking.id,
        serviceType: booking.serviceType,
        contactName: booking.contactName,
        contactEmail: booking.contactEmail,
        gstn: booking.gstn,
      })
      .catch(() => {
        // Intentionally suppressed — emailService already logs internally.
      });

    return toBookingDetailDTO(booking);
  },

  async listForUser(userId: string): Promise<BookingSummaryDTO[]> {
    const bookings = await bookingRepository.findAllByUserId(userId);
    return bookings.map(toBookingSummaryDTO);
  },

  async getDetail(id: string, userId: string): Promise<BookingDetailWithRelationsDTO> {
    // Ownership-baked query: returns null for IDs that belong to another user.
    // Both "not found" and "wrong owner" collapse to 404 — no existence leak.
    // Decision recorded in docs/tracking/decisions.md.
    const booking = await bookingRepository.findByIdAndUserId(id, userId);
    if (!booking) {
      throw new ApiError(404, 'NOT_FOUND', 'Booking not found');
    }
    return toBookingDetailWithRelationsDTO(booking);
  },

  async cancel(id: string, userId: string): Promise<BookingDetailDTO> {
    const booking = await bookingRepository.findByIdAndUserId(id, userId);
    if (!booking) {
      throw new ApiError(404, 'NOT_FOUND', 'Booking not found');
    }

    assertUserCancellable(booking);

    const updated = await bookingRepository.updateStatus(id, 'cancelled');

    // Best-effort — email failure must never block the cancellation.
    notificationService
      .sendBookingCancelled({
        id: updated.id,
        serviceType: updated.serviceType,
        contactName: updated.contactName,
        contactEmail: updated.contactEmail,
      })
      .catch(() => {
        // Intentionally suppressed — emailService already logs internally.
      });

    return toBookingDetailDTO(updated);
  },
};
