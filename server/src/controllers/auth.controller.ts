import { asyncHandler } from '../utils/asyncHandler';
import { envelope } from '../utils/envelope';
import { setAuthCookies, setAccessCookie, clearAuthCookies } from '../utils/cookies';
import { authService } from '../services/auth.service';
import type {
  SignupInput,
  VerifyOtpInput,
  ResendOtpInput,
  CompleteProfileInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  InvalidateQuery,
} from '../schemas/auth.schema';

export const authController = {
  signup: asyncHandler(async (req, res) => {
    const input = req.validated.body as SignupInput;
    const result = await authService.signup(input);
    res
      .status(201)
      .json(
        envelope(
          result,
          'Account created. Please check your email for a 6-digit verification code.',
        ),
      );
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const input = req.validated.body as VerifyOtpInput;
    const { user, tokens } = await authService.verifyOtp(input);
    setAuthCookies(res, tokens);
    res.status(200).json(envelope({ user }, 'Email verified successfully.'));
  }),

  resendOtp: asyncHandler(async (req, res) => {
    const input = req.validated.body as ResendOtpInput;
    await authService.resendOtp(input.userId);
    res
      .status(200)
      .json(envelope(null, 'A new verification code has been sent to your email.'));
  }),

  completeProfile: asyncHandler(async (req, res) => {
    const input = req.validated.body as CompleteProfileInput;
    const user = await authService.completeProfile(req.user!.id, input);
    res.status(200).json(envelope({ user }));
  }),

  login: asyncHandler(async (req, res) => {
    const input = req.validated.body as LoginInput;
    const userAgent = String(req.headers['user-agent'] ?? 'unknown').slice(0, 200);
    const { user, tokens } = await authService.login(input, {
      ip: req.ip ?? 'unknown',
      userAgent,
    });
    setAuthCookies(res, tokens);
    res.status(200).json(envelope({ user }));
  }),

  refresh: asyncHandler(async (req, res) => {
    const rawRefresh = req.cookies?.refresh_token as string | undefined;
    const accessToken = await authService.refresh(rawRefresh);
    setAccessCookie(res, accessToken);
    res.status(200).json(envelope(null, 'Token refreshed.'));
  }),

  logout: asyncHandler(async (req, res) => {
    const rawRefresh = req.cookies?.refresh_token as string | undefined;
    await authService.logout(req.user!.jti, rawRefresh);
    clearAuthCookies(res);
    res.status(200).json(envelope(null, 'Logged out successfully.'));
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const input = req.validated.body as ForgotPasswordInput;
    await authService.forgotPassword(input.email);
    res
      .status(200)
      .json(envelope(null, 'If an account with that email exists, a reset code has been sent.'));
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const input = req.validated.body as ResetPasswordInput;
    const { user, tokens } = await authService.resetPassword(input);
    setAuthCookies(res, tokens);
    res.status(200).json(envelope({ user }, 'Password updated successfully.'));
  }),

  invalidate: asyncHandler(async (req, res) => {
    const { ref } = req.validated.query as InvalidateQuery;
    await authService.invalidate(ref);
    res
      .status(200)
      .json(
        envelope(null, 'Session has been invalidated. If this was you, no action is needed.'),
      );
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user!.id);
    res.status(200).json(envelope({ user }));
  }),
};
