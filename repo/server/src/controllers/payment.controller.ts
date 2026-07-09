import { asyncHandler } from '../utils/asyncHandler';
import { envelope } from '../utils/envelope';
import { paymentService } from '../services/payment.service';
import type { InitiateParams, VerifyQuery } from '../schemas/payment.schema';

export const paymentController = {
  // POST /payments/:bookingId/initiate
  initiate: asyncHandler(async (req, res) => {
    const { bookingId } = req.validated.params as InitiateParams;
    const order = await paymentService.initiate(req.user!.id, bookingId);
    res.status(201).json(envelope(order));
  }),

  // GET /payments/verify
  verify: asyncHandler(async (req, res) => {
    const query = req.validated.query as VerifyQuery;
    const result = await paymentService.verify(req.user!.id, query);
    res.status(200).json(envelope(result));
  }),
};
