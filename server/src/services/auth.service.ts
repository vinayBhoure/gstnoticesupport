import bcrypt from 'bcrypt';
import { OtpPurpose } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { otpService } from './otp.service';
import { tokenService } from './token.service';
import { notificationService } from './notification.service';
import { verifyRefreshToken, hashToken } from '../lib/jwt';
import { refreshTokenRepository } from '../repositories/refresh-token.repository';
import { tokenBlacklistRepository } from '../repositories/token-blacklist.repository';
import { ApiError } from '../utils/ApiError';
import { setCachedCutoff } from '../lib/sessionCutoffCache';
import { maskEmail } from '../utils/mask';
import { toUserDTO, type UserDTO } from '../dto/user.dto';
import type {
  SignupInput,
  VerifyOtpInput,
  ResendOtpInput,
  CompleteProfileInput,
  LoginInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from '../schemas/auth.schema';

type PhoneAvailability = { available: boolean };

const BCRYPT_COST = 12;

type AuthTokens = { accessToken: string; refreshToken: string };
type AuthResult = { user: UserDTO; tokens: AuthTokens };
type LoginContext = { ip: string; userAgent: string };
type SignupResult = { userId: string; maskedEmail: string };
// An unverified user may reset their password, but must not be signed in by doing so —
// they are sent to login, which re-issues a verification code.
type ResetResult = { emailVerified: boolean; user: UserDTO | null; tokens: AuthTokens | null };

// Stamps the instant before which every access token for this user is refused.
// JWT `iat` is expressed in whole seconds, so the cut-off is floored to the same resolution —
// a millisecond value would reject the token minted moments later in this same request.
// The cache is written through so the revocation is effective immediately, not after its TTL.
async function applySessionCutoff(userId: string) {
  const cutoff = new Date(Math.floor(Date.now() / 1000) * 1000);
  const updated = await userRepository.updateSessionsValidFrom(userId, cutoff);
  setCachedCutoff(userId, updated.sessionsValidFrom);
  return updated;
}

export const authService = {
  async signup(input: SignupInput): Promise<SignupResult> {
    const existing = await userRepository.findByEmail(input.email);
    // Signup is the one place account existence is disclosed — the user cannot resolve a
    // duplicate without being told. Login stays uniformly opaque (HLD §14.2).
    if (existing?.emailVerified) {
      throw new ApiError(
        409,
        'EMAIL_TAKEN',
        'An account already exists with this email. Please log in.',
      );
    }
    // Abandoned signup: never create a second row. Login re-issues the code (see login()).
    if (existing) {
      throw new ApiError(
        409,
        'ACCOUNT_UNVERIFIED',
        'An account already exists. Please log in to verify your email.',
      );
    }

    const hashedPassword = await bcrypt.hash(input.password, BCRYPT_COST);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      hashedPassword,
      emailVerified: false,
      termsAccepted: input.termsAccepted,
      allowPromotions: input.allowPromotions,
    });

    const otp = await otpService.issue(user.id, OtpPurpose.email_verification);
    await notificationService.sendSignupOtp(user.email, { name: user.name, otp });
    await notificationService.sendAccountCreatedAdmin({ userEmail: user.email, userId: user.id });

    return { userId: user.id, maskedEmail: maskEmail(user.email) };
  },

  async verifyOtp(input: VerifyOtpInput): Promise<AuthResult> {
    const user = await userRepository.findById(input.userId);
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Account not found');
    }
    if (user.emailVerified) {
      throw new ApiError(409, 'ALREADY_VERIFIED', 'Your email is already verified.');
    }

    await otpService.verify(user.id, input.otp, OtpPurpose.email_verification);
    const verified = await userRepository.updateEmailVerified(user.id, true);

    notificationService
      .sendWelcome({ name: verified.name, email: verified.email })
      .catch(() => {});

    const { accessToken, refreshToken } = await tokenService.issueAuthTokens(verified);
    return { user: toUserDTO(verified), tokens: { accessToken, refreshToken } };
  },

  async resendOtp(input: ResendOtpInput): Promise<void> {
    const user = await userRepository.findById(input.userId);
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Account not found');
    }

    if (input.purpose === 'password_reset') {
      const otp = await otpService.issue(user.id, OtpPurpose.password_reset);
      await notificationService.sendPasswordResetOtp(user.email, {
        name: user.name,
        otp,
        userId: user.id,
      });
      return;
    }

    // Verification codes are pointless once the address is confirmed; a reset code is not.
    if (user.emailVerified) {
      throw new ApiError(409, 'ALREADY_VERIFIED', 'Your email is already verified.');
    }
    const otp = await otpService.issue(user.id, OtpPurpose.email_verification);
    await notificationService.sendSignupOtp(user.email, { name: user.name, otp });
  },

  async completeProfile(userId: string, input: CompleteProfileInput): Promise<UserDTO> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Account not found');
    }
    // A non-null phone marks the one-time profile step as already done (D67).
    if (user.phone) {
      throw new ApiError(409, 'CONFLICT', 'Profile has already been completed');
    }
    const phoneOwner = await userRepository.findByPhone(input.phone);
    if (phoneOwner) {
      // Signup-time wording. PATCH /user/profile keeps a neutral message — the caller is
      // already signed in there, so "please log in" would make no sense.
      throw new ApiError(
        409,
        'PHONE_TAKEN',
        'An account already exists with this mobile number. Please log in.',
      );
    }
    const updated = await userRepository.updateProfile(userId, {
      name: input.name,
      phone: input.phone,
    });

    // The account holder's phone number first exists now, so this is where the
    // WhatsApp welcome fires (the welcome EMAIL already went out at OTP verification,
    // before any phone was on file). Best-effort — never blocks profile completion.
    notificationService
      .sendWelcomeWhatsApp({ name: updated.name, phone: updated.phone })
      .catch(() => {});

    return toUserDTO(updated);
  },

  async checkPhoneAvailability(userId: string, phone: string): Promise<PhoneAvailability> {
    const owner = await userRepository.findByPhone(phone);
    return { available: !owner || owner.id === userId };
  },

  async login(input: LoginInput, ctx: LoginContext): Promise<AuthResult> {
    const user = input.email
      ? await userRepository.findByEmail(input.email)
      : await userRepository.findByPhone(input.phone!);
    // Identical failure for an unknown identifier and a wrong password — the response must
    // never disclose whether the account exists (HLD §14.2).
    if (!user) {
      throw new ApiError(
        401,
        'INVALID_CREDENTIALS',
        'Incorrect email/mobile number or password.',
      );
    }
    const passwordMatches = await bcrypt.compare(input.password, user.hashedPassword);
    if (!passwordMatches) {
      throw new ApiError(
        401,
        'INVALID_CREDENTIALS',
        'Incorrect email/mobile number or password.',
      );
    }

    // Password is proven, so this account is genuinely the caller's: recover an abandoned
    // signup by re-issuing the code and handing the client what /verify-otp needs.
    if (!user.emailVerified) {
      try {
        const otp = await otpService.issue(user.id, OtpPurpose.email_verification);
        await notificationService.sendSignupOtp(user.email, { name: user.name, otp });
      } catch (err) {
        // A code sent moments ago is still valid — the cooldown must not block the redirect.
        if (!(err instanceof ApiError && err.code === 'OTP_COOLDOWN')) throw err;
      }
      throw new ApiError(
        403,
        'EMAIL_NOT_VERIFIED',
        'Email not verified. A new verification OTP has been sent to your email.',
        undefined,
        { userId: user.id, maskedEmail: maskEmail(user.email) },
      );
    }

    const { accessToken, refreshToken, accessJti } = await tokenService.issueAuthTokens(user);
    await notificationService.sendLoginAlerts(
      { name: user.name, email: user.email, phone: user.phone },
      { ip: ctx.ip, userAgent: ctx.userAgent, jti: accessJti },
    );

    return { user: toUserDTO(user), tokens: { accessToken, refreshToken } };
  },

  async refresh(rawRefreshToken: string | undefined): Promise<string> {
    if (!rawRefreshToken) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
    }
    const payload = verifyRefreshToken(rawRefreshToken);
    if (!payload) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired session');
    }
    const stored = await refreshTokenRepository.findByTokenHash(hashToken(rawRefreshToken));
    if (!stored || stored.expiresAt.getTime() < Date.now()) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired session');
    }
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired session');
    }
    return tokenService.issueAccessToken(user);
  },

  async logout(jti: string, rawRefreshToken: string | undefined): Promise<void> {
    await tokenService.blacklistAccessJti(jti);
    if (rawRefreshToken) {
      await tokenService.revokeRefreshToken(rawRefreshToken);
    }
  },

  // Reports an unknown address explicitly, so a user who mistypes their email is not left
  // waiting for a code that will never arrive. This is a deliberate, product-owner-approved
  // enumeration trade-off that supersedes the silent behaviour of D96(a); login stays opaque.
  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'No account found with the provided email.');
    }
    const otp = await otpService.issue(user.id, OtpPurpose.password_reset);
    await notificationService.sendPasswordResetOtp(user.email, {
      name: user.name,
      otp,
      userId: user.id,
    });
  },

  async resetPassword(input: ResetPasswordInput): Promise<ResetResult> {
    const user = await userRepository.findById(input.userId);
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Account not found');
    }
    await otpService.verify(user.id, input.otp, OtpPurpose.password_reset);

    const hashedPassword = await bcrypt.hash(input.newPassword, BCRYPT_COST);
    await userRepository.updatePassword(user.id, hashedPassword);
    // Both halves are needed: revoking refresh tokens stops renewal, and the cut-off kills
    // access tokens already in flight that would otherwise live for their full 12h.
    await tokenService.revokeAllRefreshTokens(user.id);
    const updated = await applySessionCutoff(user.id);

    // An unverified account must not gain a session from a reset — it goes back to login,
    // which re-issues a verification code.
    if (!updated.emailVerified) {
      return { emailVerified: false, user: null, tokens: null };
    }

    const { accessToken, refreshToken } = await tokenService.issueAuthTokens(updated);
    return {
      emailVerified: true,
      user: toUserDTO(updated),
      tokens: { accessToken, refreshToken },
    };
  },

  // Authenticated password change (Admin Settings, and any signed-in user). Every session is
  // dropped, then this device is immediately re-issued one — so the caller stays signed in
  // while a stolen session elsewhere cannot outlive the change.
  async changePassword(userId: string, input: ChangePasswordInput): Promise<AuthTokens> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Account not found');
    }

    const matches = await bcrypt.compare(input.currentPassword, user.hashedPassword);
    if (!matches) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Incorrect current password');
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, BCRYPT_COST);
    await userRepository.updatePassword(userId, hashedPassword);
    await tokenService.revokeAllRefreshTokens(userId);
    const updated = await applySessionCutoff(userId);

    const { accessToken, refreshToken } = await tokenService.issueAuthTokens(updated);
    return { accessToken, refreshToken };
  },

  // Blacklists the access-token jti from the login "This wasn't me" link.
  // We keep no access-token registry, so an unknown/expired jti is blacklisted harmlessly
  // and still returns success (cannot reliably distinguish a 404 here).
  async invalidate(jti: string): Promise<void> {
    const alreadyBlacklisted = await tokenBlacklistRepository.existsByJti(jti);
    if (alreadyBlacklisted) {
      throw new ApiError(404, 'NOT_FOUND', 'Session reference not found or already invalidated');
    }
    await tokenService.blacklistAccessJti(jti);
  },

  async getMe(userId: string): Promise<UserDTO> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
    }
    return toUserDTO(user);
  },
};
