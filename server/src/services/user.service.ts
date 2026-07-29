import { userRepository } from '../repositories/user.repository';
import { paymentRepository } from '../repositories/payment.repository';
import { bookingRepository } from '../repositories/booking.repository';
import { tokenService } from './token.service';
import { notificationService } from './notification.service';
import { ApiError } from '../utils/ApiError';
import { toUserDTO, type UserDTO } from '../dto/user.dto';
import { toPaymentHistoryItemDTO, type PaymentHistoryItemDTO } from '../dto/payment.dto';
import type {
  UpdateProfileInput,
  DeleteAccountInput,
  PaymentHistoryQuery,
} from '../schemas/user.schema';

type PaymentHistoryResult = {
  data: PaymentHistoryItemDTO[];
  meta: { page: number; limit: number; total: number };
};

export const userService = {
  // GET /user/payment-history — captured payments only, offset-paginated (D64).
  async getPaymentHistory(
    userId: string,
    query: PaymentHistoryQuery,
  ): Promise<PaymentHistoryResult> {
    const { data, total } = await paymentRepository.findCapturedByUserId(
      userId,
      query.page,
      query.limit,
    );
    return {
      data: data.map(toPaymentHistoryItemDTO),
      meta: { page: query.page, limit: query.limit, total },
    };
  },

  // PATCH /user/profile — name / phone / allowPromotions only. Email and
  // interestedServices are never editable (D67).
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserDTO> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Account not found');
    }
    if (input.phone !== undefined) {
      const phoneOwner = await userRepository.findByPhone(input.phone);
      if (phoneOwner && phoneOwner.id !== userId) {
        throw new ApiError(409, 'PHONE_TAKEN', 'Mobile number is already registered.');
      }
    }
    const updated = await userRepository.updateProfile(userId, {
      name: input.name,
      phone: input.phone,
      allowPromotions: input.allowPromotions,
    });
    return toUserDTO(updated);
  },

  // DELETE /user — self-serve account deletion (KB1 §13).
  //   1. Confirm the typed email matches the account (400 EMAIL_MISMATCH).
  //   2. Block while any booking is active (409 ACTIVE_BOOKINGS).
  //   3. Soft-delete only (database.md §3.1); bookings + payment records are retained
  //      6–8 yrs for Indian tax law. S3 docs are hard-deleted 7 days later by a job.
  //   4. Kill every session (this one + all refresh tokens). The controller clears cookies.
  async deleteAccount(
    userId: string,
    accessJti: string,
    input: DeleteAccountInput,
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Account not found');
    }
    if (user.email !== input.confirmEmail) {
      throw new ApiError(400, 'EMAIL_MISMATCH', 'The email you entered does not match your account');
    }

    const activeBookingsCount = await bookingRepository.countActiveByUserId(userId);
    if (activeBookingsCount > 0) {
      throw new ApiError(
        409,
        'ACTIVE_BOOKINGS',
        'Your account cannot be closed while you have active services. All bookings must be complete or cancelled first.',
      );
    }

    await userRepository.softDelete(userId);
    await tokenService.revokeAllRefreshTokens(userId);
    await tokenService.blacklistAccessJti(accessJti);

    notificationService
      .sendAccountDeleted({ name: user.name, email: user.email, phone: user.phone, userId })
      .catch(() => {});
  },
};
