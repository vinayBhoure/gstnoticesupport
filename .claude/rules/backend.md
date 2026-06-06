# Backend Rules — Express.js + TypeScript

> **Applies to:** `server/` directory
> **Universal rules also apply:** See `RULES.md`

---

## 1. Controller-Service-Repository Layering

### 1.1 — The three layers have hard boundaries. Never cross them.

| Layer | File location | Responsibility | May import from |
|---|---|---|---|
| Controller | `src/api/controllers/` | HTTP only: parse request, call service, send response | Services only |
| Service | `src/services/` | Business logic: validation, state transitions, orchestration | Repositories, other services, lib utilities |
| Repository | `src/repositories/` | Data access only: all Prisma queries live here | Prisma client only |

**Why:** A controller that contains business logic cannot be unit-tested without an HTTP layer. A service that calls Prisma directly cannot be tested without a database. The separation makes each layer independently replaceable and testable.

---

### 1.2 — Controllers contain no business logic. Period.

```ts
// ❌ DON'T — business logic in a controller
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.userId !== req.user.id) throw new ApiError(403, 'Forbidden');
  if (booking.status !== 'draft_ready') throw new ApiError(400, 'Cannot cancel at this stage');
  await prisma.booking.update({ where: { id: booking.id }, data: { status: 'cancelled' } });
  res.json(envelope(null));
});

// ✅ DO — controller delegates everything to the service
export const cancelBooking = asyncHandler(async (req, res) => {
  const result = await bookingService.cancelBooking(req.params.id, req.user.id);
  res.json(envelope(result));
});
```

---

### 1.3 — Services contain no Prisma calls. Delegate all data access to repositories.

```ts
// ❌ DON'T — Prisma call inside a service
async function cancelBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  ...
}

// ✅ DO — service calls the repository
async function cancelBooking(bookingId: string, userId: string) {
  const booking = await bookingRepository.findByIdAndUserId(bookingId, userId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'draft_ready') throw new ApiError(400, 'Cannot cancel at this stage');
  await bookingRepository.updateStatus(bookingId, 'cancelled');
  await notificationService.sendCancellationEmail(booking);
}
```

---

### 1.4 — Repositories contain no business logic. They only query and return data.

```ts
// ❌ DON'T — business logic inside a repository
async function findByIdAndUserId(id: string, userId: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.userId !== userId) throw new ApiError(403, 'Forbidden');
  return booking;
}

// ✅ DO — repository returns null, service handles the outcome
async function findByIdAndUserId(id: string, userId: string): Promise<Booking | null> {
  return prisma.booking.findFirst({ where: { id, userId } });
}
```

---

## 2. asyncHandler

### 2.1 — Every route handler is wrapped with `asyncHandler`. Never use try/catch inside a controller.

**Why:** Unhandled promise rejections bypass the global error handler. `asyncHandler` forwards any thrown error to `next(error)` automatically.

```ts
// ❌ DON'T
router.post('/bookings', async (req, res, next) => {
  try {
    const booking = await bookingService.create(req.user.id, req.body);
    res.json(envelope(booking));
  } catch (error) {
    next(error);
  }
});

// ✅ DO
router.post('/bookings', asyncHandler(async (req, res) => {
  const booking = await bookingService.create(req.user.id, req.body);
  res.json(envelope(booking));
}));
```

---

### 2.2 — `asyncHandler` implementation

```ts
// src/utils/asyncHandler.ts
import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(fn: AsyncFn): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
```

---

## 3. ApiError

### 3.1 — All operational errors are thrown as `ApiError`. Never throw plain `Error` objects from services or controllers.

**Why:** The global error handler distinguishes `ApiError` (operational, safe to surface to the client) from unknown `Error` (programmer error, returns a generic 500).

```ts
// ❌ DON'T
throw new Error('Booking not found');
throw new Error('Forbidden');

// ✅ DO
throw new ApiError(404, 'Booking not found');
throw new ApiError(403, 'You do not have permission to access this booking');
throw new ApiError(400, 'Booking cannot be cancelled at this stage');
```

---

### 3.2 — `ApiError` implementation

```ts
// src/utils/ApiError.ts
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

---

### 3.3 — Global error handler (the only place errors become HTTP responses)

```ts
// src/middleware/errorHandler.ts
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  // Programmer error — never expose stack trace to client
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    data: null,
    error: 'An unexpected error occurred',
    statusCode: 500,
  });
}
```

---

## 4. Middleware Order

### 4.1 — The Express middleware chain must follow this exact order.

**Why:** Each middleware depends on the previous. Changing the order causes subtle failures (e.g., CORS headers missing, cookies not parsed, body already consumed).

```ts
// ✅ DO — src/index.ts
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(cookieParser());

// Webhook route must be registered BEFORE express.json() and with express.raw()
app.post('/webhooks/razorpay', express.raw({ type: 'application/json' }), webhookController.handle);

// JSON body parsing for all other routes
app.use(express.json());

// API routes (auth middleware and role middleware applied per-route, not globally)
app.use('/api/v1', apiRouter);

// Error handler must be registered LAST
app.use(errorHandler);
```

---

### 4.2 — Auth middleware and role middleware are applied per-route, not globally.

```ts
// ✅ DO
router.get('/bookings', authenticate, asyncHandler(bookingController.list));
router.get('/admin/bookings', authenticate, requireRole('admin'), asyncHandler(adminController.listAll));

// ❌ DON'T
app.use('/api/v1', authenticate); // this would block public endpoints like /auth/login
```

---

### 4.3 — Rate limiters are applied per-route, not globally.

```ts
// ✅ DO — only on sensitive endpoints
router.post('/auth/send-otp', otpRateLimiter, asyncHandler(authController.sendOtp));
router.post('/auth/login', loginRateLimiter, asyncHandler(authController.login));
router.post('/contact', contactRateLimiter, asyncHandler(contactController.submit));

// Rate limiting matrix (from HLD §6.6)
// POST /auth/send-otp       → 5 requests / 15 min / IP
// POST /auth/forgot-password → 5 requests / 15 min / IP
// POST /auth/login           → 10 requests / 15 min / IP
// POST /contact              → 3 requests / 60 min / IP
// POST /bookings/:id/upload-url → 20 requests / 60 min / user
```

---

## 5. Request Validation

### 5.1 — All request bodies are validated with Zod at the controller boundary. Nothing reaches the service unvalidated.

**Why:** Services are business logic — they should not be defensive about input shapes. That is the controller's job.

```ts
// ✅ DO — use a validate() middleware
router.post('/bookings', authenticate, validate(createBookingSchema), asyncHandler(bookingController.create));
```

---

### 5.2 — The `validate` middleware implementation

```ts
// src/middleware/validate.ts
import type { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ApiError(400, result.error.errors.map(e => e.message).join(', '));
    }
    req.body = result.data; // replace with the parsed + coerced values
    next();
  };
}
```

---

### 5.3 — Never trust `req.params` or `req.query` without validation.

```ts
// ✅ DO — parse and validate route params
const idSchema = z.string().cuid();
const id = idSchema.safeParse(req.params.id);
if (!id.success) throw new ApiError(400, 'Invalid booking ID');
```

---

## 6. Razorpay Webhook Handling

### 6.1 — The webhook route uses `express.raw()`. Never `express.json()` on this route.

**Why:** HMAC-SHA256 signature verification is computed over the raw request buffer. JSON parsing mutates the body and causes signature verification to fail permanently.

```ts
// ✅ DO — registered BEFORE express.json() in the middleware chain
app.post(
  '/webhooks/razorpay',
  express.raw({ type: 'application/json' }),
  asyncHandler(webhookController.handle),
);
```

---

### 6.2 — Verify the HMAC-SHA256 signature as the first operation. Return 400 immediately on failure.

**Why:** Without signature verification, any actor can POST a fake `payment.captured` event and unlock a draft without paying.

```ts
// ✅ DO
export const handle = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  if (!signature || typeof signature !== 'string') {
    return res.status(400).end();
  }

  const isValid = verifyRazorpaySignature(req.body, signature);
  if (!isValid) {
    return res.status(400).end(); // no logging of the payload
  }

  const event = JSON.parse(req.body.toString()) as RazorpayWebhookEvent;
  await paymentService.handleWebhookEvent(event);
  res.status(200).end();
});
```

---

### 6.3 — Idempotency check before any state transition or email.

**Why:** Razorpay may deliver the same webhook more than once. Processing it twice causes double-emails and potential double-status-transitions.

```ts
// ✅ DO — inside paymentService.handleWebhookEvent
const existing = await paymentRepository.findByRazorpayPaymentId(paymentId);
if (existing) return; // already processed — no further action

// proceed with status transition and email
```

---

### 6.4 — The Razorpay webhook route is excluded from all rate limiters.

**Why:** Rate limiting the webhook blocks Razorpay's retry mechanism, which is the Layer 1 payment reliability pillar.

---

## 7. Response Envelope

### 7.1 — All responses use the standard envelope. Never return raw data.

```ts
// ❌ DON'T
res.json(booking);
res.status(201).json({ id: booking.id });

// ✅ DO
res.status(200).json({
  success: true,
  data: toBookingDTO(booking),
  error: null,
  statusCode: 200,
});

res.status(201).json({
  success: true,
  data: toBookingDTO(booking),
  error: null,
  statusCode: 201,
});
```

---

### 7.2 — Create a reusable `envelope` utility.

```ts
// src/utils/envelope.ts
export function envelope<T>(data: T, statusCode = 200) {
  return { success: true, data, error: null, statusCode };
}
```

---

### 7.3 — Never return raw Prisma results. Always map to a DTO.

**Why:** Raw Prisma results expose `password_hash`, `deletedAt`, `refreshToken`, and other internal fields.

```ts
// ❌ DON'T
res.json(envelope(user));

// ✅ DO
res.json(envelope(toUserDTO(user)));

// src/dto/user.dto.ts
export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    emailVerified: user.email_verified,
    createdAt: user.created_at,
  };
}
```

---

## 8. Authentication Middleware

### 8.1 — The `authenticate` middleware reads the JWT from the HTTP-only cookie and attaches `req.user`.

```ts
// ✅ DO — src/middleware/authenticate.ts
export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.token;
  if (!token) throw new ApiError(401, 'Authentication required');

  const payload = verifyAccessToken(token);
  if (!payload) throw new ApiError(401, 'Invalid or expired session');

  req.user = { id: payload.sub, role: payload.role, email: payload.email };
  next();
});
```

---

### 8.2 — The `requireRole` middleware checks `req.user.role`. Always apply after `authenticate`.

```ts
// ✅ DO
export function requireRole(role: Role) {
  return asyncHandler(async (req, _res, next) => {
    if (req.user.role !== role) throw new ApiError(403, 'Insufficient permissions');
    next();
  });
}
```

---

## 9. File Upload Endpoints

### 9.1 — Files are never proxied through Express. Use pre-signed S3 PUT URLs.

**Why:** Proxying files through Express consumes server memory proportional to file size and limits throughput. Pre-signed URLs offload uploads directly to S3.

---

### 9.2 — Pre-signed URL generation validates all constraints before issuing the URL.

The endpoint must verify before generating a URL:
1. User is authenticated and owns the booking
2. Booking is in a state that accepts document uploads
3. File is PDF (MIME type check)
4. File size ≤ 5 MB
5. Existing file count for this booking is < 8
6. Adding this file won't exceed the 40 MB total limit

If any check fails, return a 400 `ApiError`. Never issue a URL and let S3 reject the upload.

---

### 9.3 — S3 object key format is strict.

```ts
// ✅ DO
// Format: {userId}/{bookingId}/{date}-{sanitizedOriginalName}-{4randomChars}.pdf
const key = `${userId}/${bookingId}/${format(new Date(), 'yyyyMMdd')}-${sanitize(filename)}-${nanoid(4)}.pdf`;
```

The sanitize step must strip special characters, spaces, and non-ASCII characters that would break S3 key parsing.
