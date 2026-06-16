import { Router } from 'express';
import healthRouter from './health.routes';
// Phase 2 routes will be registered here — one line per domain:
// import authRouter from './auth.routes';
// import bookingRouter from './booking.routes';
// import documentRouter from './document.routes';
// import paymentRouter from './payment.routes';
// import adminRouter from './admin.routes';

const apiRouter = Router();

// Health check is mounted at root (not under /api/v1)
// Domain routes are registered here as phases are implemented:
// apiRouter.use('/auth', authRouter);
// apiRouter.use('/bookings', bookingRouter);
// apiRouter.use('/payments', paymentRouter);
// apiRouter.use('/admin', adminRouter);
// Webhook is mounted directly in index.ts (before express.json) — not here

export { apiRouter, healthRouter };
