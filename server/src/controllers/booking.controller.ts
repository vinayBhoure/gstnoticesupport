import { asyncHandler } from '../utils/asyncHandler';
import { envelope } from '../utils/envelope';
import { bookingService } from '../services/booking.service';
import type { CreateBookingInput, BookingIdParam } from '../schemas/booking.schema';

export const bookingController = {
  // POST /bookings → 201
  create: asyncHandler(async (req, res) => {
    const input = req.validated.body as CreateBookingInput;
    const booking = await bookingService.create(req.user!.id, input);
    res
      .status(201)
      .json(envelope({ booking }, 'Booking created. Please upload your documents to proceed.'));
  }),

  // GET /bookings → 200
  list: asyncHandler(async (req, res) => {
    const bookings = await bookingService.listForUser(req.user!.id);
    res.status(200).json(envelope(bookings));
  }),

  // GET /bookings/:id → 200
  getDetail: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as BookingIdParam;
    const booking = await bookingService.getDetail(id, req.user!.id);
    res.status(200).json(envelope({ booking }));
  }),

  // POST /bookings/:id/cancel → 200
  cancel: asyncHandler(async (req, res) => {
    const { id } = req.validated.params as BookingIdParam;
    const booking = await bookingService.cancel(id, req.user!.id);
    res.status(200).json(envelope({ booking }, 'Booking cancelled.'));
  }),
};
