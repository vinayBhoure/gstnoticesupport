import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { otpRepository } from '../repositories/otp.repository';
import { ApiError } from '../utils/ApiError';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // one code per minute per account
const MAX_ATTEMPTS = 5;
const BCRYPT_COST = 12;

export const otpService = {
  // Generates a fresh 6-digit code, invalidating any prior OTP for the user
  // (single active OTP). Returns the plaintext code for the caller to email — never log it.
  async issue(userId: string): Promise<string> {
    // Per-account cooldown: caps rapid OTP sends to one address, independent of IP. Enforced
    // against the DB so it survives Railway deploys/replicas (audit Pass 4). Checked before
    // the delete below so the prior code's timestamp is still visible.
    const existing = await otpRepository.findByUserId(userId);
    if (existing && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
      throw new ApiError(429, 'OTP_COOLDOWN', 'Please wait a moment before requesting another code.');
    }

    await otpRepository.deleteByUserId(userId);
    const code = String(randomInt(100000, 1000000)); // 100000–999999
    const hashedOtp = await bcrypt.hash(code, BCRYPT_COST);
    await otpRepository.create({
      userId,
      hashedOtp,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
    return code;
  },

  // Verifies and consumes the OTP. Throws the documented OTP_* error on failure.
  async verify(userId: string, code: string): Promise<void> {
    const otp = await otpRepository.findByUserId(userId);
    if (!otp) {
      throw new ApiError(400, 'OTP_INVALID', 'Invalid verification code');
    }
    if (otp.expiresAt.getTime() < Date.now()) {
      await otpRepository.deleteByUserId(userId);
      throw new ApiError(400, 'OTP_EXPIRED', 'Verification code has expired');
    }
    if (otp.attemptCount >= MAX_ATTEMPTS) {
      throw new ApiError(400, 'OTP_MAX_ATTEMPTS', 'Too many incorrect attempts. Request a new code.');
    }
    const matches = await bcrypt.compare(code, otp.hashedOtp);
    if (!matches) {
      await otpRepository.incrementAttempt(otp.id);
      throw new ApiError(400, 'OTP_INVALID', 'Invalid verification code');
    }
    await otpRepository.deleteByUserId(userId); // single-use
  },
};
