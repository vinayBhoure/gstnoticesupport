import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { documentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import { createBookingSchema, bookingIdParamSchema } from '../schemas/booking.schema';
import {
  uploadUrlSchema,
  confirmUploadSchema,
  draftUrlQuerySchema,
  documentIdParamSchema,
} from '../schemas/document.schema';
import { documentUploadRateLimiter, draftUrlRateLimiter } from '../lib/rateLimiter';

const router = Router();

// All booking routes require authentication (backend.md §4.2).

router.post('/', authenticate, validateBody(createBookingSchema), bookingController.create);
router.get('/', authenticate, bookingController.list);
router.get('/:id', authenticate, validateParams(bookingIdParamSchema), bookingController.getDetail);
router.post('/:id/cancel', authenticate, validateParams(bookingIdParamSchema), bookingController.cancel);

// Document handling (api_contract.md §4) — sub-resources of a booking.
router.post(
  '/:id/upload-url',
  authenticate,
  documentUploadRateLimiter,
  validateParams(bookingIdParamSchema),
  validateBody(uploadUrlSchema),
  documentController.getUploadUrl,
);
router.post(
  '/:id/confirm-upload',
  authenticate,
  validateParams(bookingIdParamSchema),
  validateBody(confirmUploadSchema),
  documentController.confirmUpload,
);
router.get(
  '/:id/documents',
  authenticate,
  validateParams(bookingIdParamSchema),
  documentController.list,
);
router.delete(
  '/:id/documents/:docId',
  authenticate,
  validateParams(documentIdParamSchema),
  documentController.remove,
);
router.get(
  '/:id/draft-url',
  authenticate,
  draftUrlRateLimiter,
  validateParams(bookingIdParamSchema),
  validateQuery(draftUrlQuerySchema),
  documentController.getDraftUrl,
);

export default router;
