import { Router } from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';
import bookingRouter from './booking.routes';
import paymentRouter from './payment.routes';
import adminRouter from './admin.routes';
// Further Phase 2+ routes register here — one line per domain:
// import documentRouter from './document.routes';

const apiRouter = Router();

// Domain routes (all under /api/v1)
apiRouter.use('/auth', authRouter);
apiRouter.use('/bookings', bookingRouter);
apiRouter.use('/payments', paymentRouter);
apiRouter.use('/admin', adminRouter);
// Webhook is mounted directly in index.ts (before express.json) — not here

export { apiRouter, healthRouter };
