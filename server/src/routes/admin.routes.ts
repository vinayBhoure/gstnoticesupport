import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validateBody, validateQuery, validateParams } from '../middleware/validate';
import { adminDraftUploadRateLimiter } from '../lib/rateLimiter';
import {
  adminBookingListQuerySchema,
  adminBookingIdParamsSchema,
  adminUserListQuerySchema,
  adminUserIdParamsSchema,
  adminDocumentParamsSchema,
  updateStatusSchema,
  draftUploadUrlSchema,
  draftConfirmSchema,
  updateNoteSchema,
  markPaidSchema,
} from '../schemas/admin.schema';

const router = Router();

// Every admin route is gated: authenticate → requireRole('admin'). Applied at the
// router level (scoped to /admin only — not global, per backend.md §4.2).
router.use(authenticate, requireRole('admin'));

router.get('/bookings', validateQuery(adminBookingListQuerySchema), adminController.listBookings);

router.get('/stats', adminController.getStats);

router.get(
  '/bookings/:id',
  validateParams(adminBookingIdParamsSchema),
  adminController.getBooking,
);

router.patch(
  '/bookings/:id/status',
  validateParams(adminBookingIdParamsSchema),
  validateBody(updateStatusSchema),
  adminController.updateStatus,
);

router.post(
  '/bookings/:id/draft-upload-url',
  adminDraftUploadRateLimiter,
  validateParams(adminBookingIdParamsSchema),
  validateBody(draftUploadUrlSchema),
  adminController.createDraftUploadUrl,
);

router.post(
  '/bookings/:id/draft-confirm',
  validateParams(adminBookingIdParamsSchema),
  validateBody(draftConfirmSchema),
  adminController.confirmDraftUpload,
);

router.post(
  '/bookings/:id/final-draft-upload-url',
  adminDraftUploadRateLimiter,
  validateParams(adminBookingIdParamsSchema),
  validateBody(draftUploadUrlSchema),
  adminController.createFinalDraftUploadUrl,
);

router.post(
  '/bookings/:id/final-draft-confirm',
  validateParams(adminBookingIdParamsSchema),
  validateBody(draftConfirmSchema),
  adminController.confirmFinalDraftUpload,
);

router.patch(
  '/bookings/:id/note',
  validateParams(adminBookingIdParamsSchema),
  validateBody(updateNoteSchema),
  adminController.updateNote,
);

router.post(
  '/bookings/:id/mark-paid',
  validateParams(adminBookingIdParamsSchema),
  validateBody(markPaidSchema),
  adminController.markPaid,
);

router.get(
  '/bookings/:id/documents/:documentId/download-url',
  validateParams(adminDocumentParamsSchema),
  adminController.getDocumentDownloadUrl,
);

router.get('/users', validateQuery(adminUserListQuerySchema), adminController.listUsers);

router.get('/users/:id', validateParams(adminUserIdParamsSchema), adminController.getUser);

router.delete('/users/:id', validateParams(adminUserIdParamsSchema), adminController.deleteUser);

export default router;
