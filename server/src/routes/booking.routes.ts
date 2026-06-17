import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody, validateParams } from '../middleware/validate';
import { createBookingSchema, bookingIdParamSchema } from '../schemas/booking.schema';

const router = Router();

// All booking routes require authentication (backend.md §4.2).
// No rate limiters on §3 routes per api_contract.md.

router.post('/', authenticate, validateBody(createBookingSchema), bookingController.create);
router.get('/', authenticate, bookingController.list);
router.get('/:id', authenticate, validateParams(bookingIdParamSchema), bookingController.getDetail);
router.post('/:id/cancel', authenticate, validateParams(bookingIdParamSchema), bookingController.cancel);

export default router;
