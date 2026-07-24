import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository';
import { otpService } from './otp.service';
import { tokenService } from './token.service';
import { notificationService } from './notification.service';
import { verifyRefreshToken, hashToken } from '../lib/jwt';
import { refreshTokenRepository } from '../repositories/refresh-token.repository';
import { tokenBlacklistRepository } from '../repositories/token-blacklist.repository';
import { ApiError } from '../utils/ApiError';
import { toUserDTO, type UserDTO } from '../dto/user.dto';
import type {
  SignupInput,
  VerifyOtpInput,
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

export const authService = {
  async signup(input: SignupInput): Promise<{ userId: string }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ApiError(409, 'CONFLICT', 'An account with this email already exists');
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

    const otp = await otpService.issue(user.id);
    await notificationService.sendSignupOtp(user.email, { name: user.name, otp });
    await notificationService.sendAccountCreatedAdmin({ userEmail: user.email, userId: user.id });

    return { userId: user.id };
  },

  async verifyOtp(input: VerifyOtpInput): Promise<AuthResult> {
    const user = await userRepository.findById(input.userId);
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Account not found');
    }
    if (user.emailVerified) {
      throw new ApiError(409, 'CONFLICT', 'Email is already verified');
    }

    await otpService.verify(user.id, input.otp);
    const verified = await userRepository.updateEmailVerified(user.id, true);

    notificationService
      .sendWelcome({ name: verified.name, email: verified.email })
      .catch(() => {});

    const { accessToken, refreshToken } = await tokenService.issueAuthTokens(verified);
    return { user: toUserDTO(verified), tokens: { accessToken, refreshToken } };
  },

  async resendOtp(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Account not found');
    }
    if (user.emailVerified) {
      throw new ApiError(409, 'CONFLICT', 'Email is already verified');
    }
    const otp = await otpService.issue(user.id);
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
      throw new ApiError(409, 'PHONE_TAKEN', 'Mobile number is already registered.');
    }
    const updated = await userRepository.updateProfile(userId, {
      name: input.name,
      phone: input.phone,
    });
    return toUserDTO(updated);
  },

  async checkPhoneAvailability(userId: string, phone: string): Promise<PhoneAvailability> {
    const owner = await userRepository.findByPhone(phone);
    return { available: !owner || owner.id === userId };
  },

  async login(input: LoginInput, ctx: LoginContext): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password');
    }
    const passwordMatches = await bcrypt.compare(input.password, user.hashedPassword);
    if (!passwordMatches) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password');
    }
    if (!user.emailVerified) {
      throw new ApiError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email before signing in');
    }

    const { accessToken, refreshToken, accessJti } = await tokenService.issueAuthTokens(user);
    await notificationService.sendLoginAlerts(
      { name: user.name, email: user.email },
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

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    // Always succeed silently — never reveal whether the email is registered.
    if (!user) return;
    let otp: string;
    try {
      otp = await otpService.issue(user.id);
    } catch (err) {
      // A reset code was already sent within the cooldown window. Stay silent so the
      // response is identical whether or not the email exists (no enumeration oracle).
      if (err instanceof ApiError && err.code === 'OTP_COOLDOWN') return;
      throw err;
    }
    await notificationService.sendPasswordResetOtp(user.email, {
      name: user.name,
      otp,
      userId: user.id,
    });
  },

  async resetPassword(input: ResetPasswordInput): Promise<AuthResult> {
    const user = await userRepository.findById(input.userId);
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'Account not found');
    }
    await otpService.verify(user.id, input.otp);

    const hashedPassword = await bcrypt.hash(input.newPassword, BCRYPT_COST);
    const updated = await userRepository.updatePassword(user.id, hashedPassword);
    await tokenService.revokeAllRefreshTokens(user.id); // invalidate existing sessions

    const { accessToken, refreshToken } = await tokenService.issueAuthTokens(updated);
    return { user: toUserDTO(updated), tokens: { accessToken, refreshToken } };
  },

  // Authenticated password change (Admin Settings, and any signed-in user).
  // The current session stays valid; other refresh tokens are revoked so a
  // stolen session elsewhere cannot outlive the password change.
  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
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
