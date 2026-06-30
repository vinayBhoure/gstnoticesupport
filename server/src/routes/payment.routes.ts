import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/authenticate';
import { validateParams, validateQuery } from '../middleware/validate';
import { initiateParamsSchema, verifyQuerySchema } from '../schemas/payment.schema';
import { paymentInitiateRateLimiter, paymentVerifyRateLimiter } from '../lib/rateLimiter';

const router = Router();

// All payment routes require authentication. The Razorpay webhook is NOT here —
// it is mounted in index.ts with express.raw() before express.json().

router.post(
  '/:bookingId/initiate',
  authenticate,
  paymentInitiateRateLimiter,
  validateParams(initiateParamsSchema),
  paymentController.initiate,
);

router.get(
  '/verify',
  authenticate,
  paymentVerifyRateLimiter,
  validateQuery(verifyQuerySchema),
  paymentController.verify,
);

export default router;
