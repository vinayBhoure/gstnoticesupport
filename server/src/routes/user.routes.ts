import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  updateProfileSchema,
  deleteAccountSchema,
  paymentHistoryQuerySchema,
} from '../schemas/user.schema';

const router = Router();

// User self-service account endpoints (api_contract.md §2). All require authentication.

router.get(
  '/payment-history',
  authenticate,
  validateQuery(paymentHistoryQuerySchema),
  userController.getPaymentHistory,
);

router.patch(
  '/profile',
  authenticate,
  validateBody(updateProfileSchema),
  userController.updateProfile,
);

router.delete('/', authenticate, validateBody(deleteAccountSchema), userController.deleteAccount);

export default router;
