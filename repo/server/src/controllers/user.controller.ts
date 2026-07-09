import { asyncHandler } from '../utils/asyncHandler';
import { envelope, paginated } from '../utils/envelope';
import { clearAuthCookies } from '../utils/cookies';
import { userService } from '../services/user.service';
import type {
  UpdateProfileInput,
  DeleteAccountInput,
  PaymentHistoryQuery,
} from '../schemas/user.schema';

export const userController = {
  // GET /user/payment-history
  getPaymentHistory: asyncHandler(async (req, res) => {
    const query = req.validated.query as PaymentHistoryQuery;
    const { data, meta } = await userService.getPaymentHistory(req.user!.id, query);
    res.status(200).json(paginated(data, meta));
  }),

  // PATCH /user/profile
  updateProfile: asyncHandler(async (req, res) => {
    const input = req.validated.body as UpdateProfileInput;
    const user = await userService.updateProfile(req.user!.id, input);
    res.status(200).json(envelope({ user }, 'Profile updated.'));
  }),

  // DELETE /user — clears both auth cookies on success (KB1 §13).
  deleteAccount: asyncHandler(async (req, res) => {
    const input = req.validated.body as DeleteAccountInput;
    await userService.deleteAccount(req.user!.id, req.user!.jti, input);
    clearAuthCookies(res);
    res.status(200).json(envelope(null, 'Your account has been closed.'));
  }),
};
