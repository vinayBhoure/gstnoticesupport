import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { OtpPurpose } from '@prisma/client';
import { otpRepository } from '../repositories/otp.repository';
import { ApiError } from '../utils/ApiError';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // one code per minute per account, per purpose
const MAX_ATTEMPTS = 5;
const BCRYPT_COST = 12;

export const otpService = {
  // Generates a fresh 6-digit code, invalidating any prior OTP for the same user AND purpose
  // (single active OTP per flow). Returns the plaintext code for the caller to email — never log it.
  async issue(userId: string, purpose: OtpPurpose): Promise<string> {
    // Per-account cooldown: caps rapid OTP sends to one address, independent of IP. Enforced
    // against the DB so it survives Railway deploys/replicas (audit Pass 4). Checked before
    // the delete below so the prior code's timestamp is still visible. Scoped per purpose so a
    // password reset does not consume the verification flow's cooldown.
    const existing = await otpRepository.findByUserIdAndPurpose(userId, purpose);
    if (existing && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
      throw new ApiError(
        429,
        'OTP_COOLDOWN',
        'You have reached the OTP resend limit. Please try again later.',
      );
    }

    await otpRepository.deleteByUserIdAndPurpose(userId, purpose);
    const code = String(randomInt(100000, 1000000)); // 100000–999999
    const hashedOtp = await bcrypt.hash(code, BCRYPT_COST);
    await otpRepository.create({
      userId,
      purpose,
      hashedOtp,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
    return code;
  },

  // Verifies and consumes the OTP. Throws the documented OTP_* error on failure.
  // A code issued for a different purpose never matches — it is not looked up at all.
  async verify(userId: string, code: string, purpose: OtpPurpose): Promise<void> {
    const otp = await otpRepository.findByUserIdAndPurpose(userId, purpose);
    if (!otp) {
      throw new ApiError(400, 'OTP_INVALID', 'Invalid OTP. Please try again.');
    }
    if (otp.expiresAt.getTime() < Date.now()) {
      await otpRepository.deleteByUserIdAndPurpose(userId, purpose);
      throw new ApiError(400, 'OTP_EXPIRED', 'OTP has expired. Please request a new one.');
    }
    if (otp.attemptCount >= MAX_ATTEMPTS) {
      throw new ApiError(
        400,
        'OTP_MAX_ATTEMPTS',
        'Too many incorrect OTP attempts. Request a new OTP.',
      );
    }
    const matches = await bcrypt.compare(code, otp.hashedOtp);
    if (!matches) {
      const updated = await otpRepository.incrementAttempt(otp.id);
      throw new ApiError(400, 'OTP_INVALID', 'Invalid OTP. Please try again.', undefined, {
        attemptsLeft: Math.max(0, MAX_ATTEMPTS - updated.attemptCount),
      });
    }
    await otpRepository.deleteByUserIdAndPurpose(userId, purpose); // single-use
  },
};

export { OtpPurpose };
