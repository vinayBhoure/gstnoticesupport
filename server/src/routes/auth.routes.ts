import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  loginRateLimiter,
  otpVerifyRateLimiter,
  otpResendRateLimiter,
  forgotPasswordRateLimiter,
  resetPasswordRateLimiter,
} from '../lib/rateLimiter';
import {
  signupSchema,
  verifyOtpSchema,
  resendOtpSchema,
  completeProfileSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  invalidateQuerySchema,
} from '../schemas/auth.schema';

const router = Router();

router.post('/signup', validateBody(signupSchema), authController.signup);
router.post('/verify-otp', otpVerifyRateLimiter, validateBody(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', otpResendRateLimiter, validateBody(resendOtpSchema), authController.resendOtp);
router.post('/complete-profile', authenticate, validateBody(completeProfileSchema), authController.completeProfile);
router.post('/login', loginRateLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', forgotPasswordRateLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', resetPasswordRateLimiter, validateBody(resetPasswordSchema), authController.resetPassword);
router.get('/invalidate', validateQuery(invalidateQuerySchema), authController.invalidate);
router.get('/me', authenticate, authController.me);

export default router;
