# gstnoticesupport.in — API Contract
> **Stack:** Node.js · Express.js · TypeScript  
> **Base URL:** `https://api.gstnoticesupport.in`  
> **Version:** Phase 2 · derived from HLD + LLD

---

## Conventions

### Response envelope

Every response uses one of three shapes:

```jsonc
// Success (single object)
{ "success": true, "message": "Optional human-readable note.", "data": { … } }

// Success (paginated list)
{ "success": true, "data": [ … ], "meta": { "page": 1, "limit": 20, "total": 45 } }

// Error
{
  "success": false,
  "error": {
    "code": "SNAKE_CASE_CODE",
    "message": "Human-readable message safe to show in UI.",
    "details": [ { "field": "email", "message": "Invalid email format" } ]   // Zod errors only
  }
}
```

### Auth — HTTP-only cookies

| Cookie | TTL | Scope |
|--------|-----|-------|
| `access_token` | 15 min | `Path=/` |
| `refresh_token` | 7 days | `Path=/auth/refresh` |

Both cookies: `HttpOnly; Secure; SameSite=Lax; Domain=.gstnoticesupport.in`  
Logout clears both cookies with `Max-Age=0`.  
All browser requests include cookies automatically. No `Authorization` header is used.

### Shared enum values

```
ServiceType   : asmt_10 | scn | commissioner_appeal | gstat_appeal
BookingStatus : document_upload | in_review | draft_ready | filing | complete | cancelled
PaymentStatus : pending | paid | failed
FilingFor     : self | others
UploadedBy    : user | admin
PayRecStatus  : created | authorized | captured | failed
```

### Shared object shapes

**`UserObject`** — returned by auth + user endpoints. `hashedPassword` is **never** returned.
```jsonc
{
  "id": "uuid",
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "role": "user",
  "emailVerified": true,
  "termsAccepted": true,
  "allowPromotions": false,
  "interestedServices": ["asmt_10", "scn"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**`BookingSummaryObject`** — used in list responses.
```jsonc
{
  "id": "uuid",
  "serviceType": "asmt_10",
  "status": "document_upload",
  "paymentStatus": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**`BookingDetailObject`** — used in single-booking responses. `draftS3Key` is **never** returned to clients; use `GET /bookings/:id/draft-url` to access the draft.
```jsonc
{
  "id": "uuid",
  "serviceType": "asmt_10",
  "status": "draft_ready",
  "paymentStatus": "pending",
  "contactName": "Ravi Kumar",
  "contactEmail": "ravi@example.com",
  "contactPhone": "+919876543210",
  "organizationName": "Ravi Enterprises Pvt Ltd",
  "filingFor": "self",
  "gstn": "29AABCU9603R1ZX",                 // string | null (optional at booking time — issue #10)
  "consentInformationAccurate": true,
  "consentContactAuthorized": true,
  "adminNote": "Pre-deposit of ₹12,000 applicable. Please arrange before we proceed.",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T08:00:00.000Z"
}
```

**`BookingDocumentObject`** — `s3Key` is **never** returned to clients.
```jsonc
{
  "id": "uuid",
  "bookingId": "uuid",
  "uploadedBy": "user",
  "fileName": "gst_notice_jan2024.pdf",
  "uploadedAt": "2024-01-15T11:00:00.000Z"
}
```

**`PaymentRecordObject`**
```jsonc
{
  "id": "uuid",
  "bookingId": "uuid",
  "razorpayOrderId": "order_PJjkNMkDSf1234",
  "razorpayPaymentId": "pay_PJjkXXXXXX5678",
  "amountPaise": 299900,
  "currency": "INR",
  "status": "captured",
  "createdAt": "2024-01-16T09:00:00.000Z",
  "updatedAt": "2024-01-16T09:02:00.000Z"
}
```

### Common error codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Zod schema failed; `details` array present |
| `UNAUTHORIZED` | 401 | Missing, expired, or blacklisted token |
| `FORBIDDEN` | 403 | Authenticated but not permitted (wrong role / wrong owner) |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate unique constraint or invalid state transition |
| `RATE_LIMITED` | 429 | Too many requests within the window |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

---

## 1. Auth

---

### 1.1 `POST /auth/signup`
> **Auth:** Public · **Rate limit:** —

Creates a new user account with `emailVerified = false`. Sends a 6-digit OTP to the provided email via Resend. OTP expires in 10 minutes.

#### Request body
```jsonc
{
  "name": "Ravi Kumar",           // string, 2–100 chars, required
  "email": "ravi@example.com",    // valid email, lowercased, required
  "password": "MyPass@123",       // string, min 8 chars, 1 uppercase, 1 digit, 1 special char, required
  "termsAccepted": true,          // boolean, must be true, required
  "allowPromotions": false        // boolean, optional, defaults to false
}
```

#### `201 Created`
```jsonc
{
  "success": true,
  "message": "Account created. Please check your email for a 6-digit verification code.",
  "data": { "userId": "uuid" }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Invalid/missing fields; `termsAccepted` is false |
| 409 | `CONFLICT` | Email already registered |

---

### 1.2 `POST /auth/verify-otp`
> **Auth:** Public · **Rate limit:** 5 attempts / 10 min per IP

Verifies the signup OTP. Sets `emailVerified = true`. Issues `access_token` + `refresh_token` cookies.

#### Request body
```jsonc
{
  "userId": "uuid",     // required
  "otp": "847291"       // string, exactly 6 digits, required
}
```

#### `200 OK`
Sets `Set-Cookie: access_token` (15 min) and `Set-Cookie: refresh_token` (7 days).
```jsonc
{
  "success": true,
  "message": "Email verified successfully.",
  "data": { "user": { /* UserObject */ } }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Invalid format |
| 400 | `OTP_EXPIRED` | OTP TTL (10 min) has passed |
| 400 | `OTP_INVALID` | Wrong code |
| 400 | `OTP_MAX_ATTEMPTS` | 5 failed attempts reached |
| 404 | `NOT_FOUND` | `userId` does not exist |
| 409 | `CONFLICT` | Email already verified |

---

### 1.3 `POST /auth/resend-otp`
> **Auth:** Public · **Rate limit:** 3 requests / 1 hr per IP

Generates a new OTP and re-sends the verification email. Invalidates the previous OTP.

#### Request body
```jsonc
{
  "userId": "uuid"    // required
}
```

#### `200 OK`
```jsonc
{
  "success": true,
  "message": "A new verification code has been sent to your email."
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 404 | `NOT_FOUND` | `userId` does not exist |
| 409 | `CONFLICT` | Email already verified |
| 429 | `RATE_LIMITED` | 3 OTP requests within 1 hour |

---

### 1.4 `POST /auth/complete-profile`
> **Auth:** 🔒 User · **Rate limit:** —

Called once after OTP verification to capture `interestedServices`. Per LLD Decision 5, `interestedServices` is non-editable after this step.

#### Request body
```jsonc
{
  "interestedServices": ["asmt_10", "commissioner_appeal"]
  // ServiceType[], min 1 item, required
}
```

#### `200 OK`
```jsonc
{
  "success": true,
  "data": { "user": { /* UserObject */ } }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Empty array or invalid enum values |
| 409 | `CONFLICT` | Profile already completed (interestedServices already set) |

---

### 1.5 `POST /auth/login`
> **Auth:** Public · **Rate limit:** 5 attempts / 15 min per IP

Verifies credentials. Issues `access_token` + `refresh_token` cookies. Sends login security alert email with "This wasn't me" invalidation link.

#### Request body
```jsonc
{
  "email": "ravi@example.com",    // valid email, required
  "password": "MyPass@123"        // string, required
}
```

#### `200 OK`
Sets `Set-Cookie: access_token` (15 min) and `Set-Cookie: refresh_token` (7 days).
```jsonc
{
  "success": true,
  "data": { "user": { /* UserObject */ } }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Invalid format |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 403 | `EMAIL_NOT_VERIFIED` | Account exists but OTP not completed |
| 429 | `RATE_LIMITED` | 5 failed attempts within 15 min |

---

### 1.6 `POST /auth/refresh`
> **Auth:** Public (reads `refresh_token` cookie) · **Rate limit:** —

Exchanges a valid refresh token for a new `access_token`. The refresh token must exist in `refresh_tokens` table and not be expired.

#### Request
No body. Reads `refresh_token` from HTTP-only cookie.

#### `200 OK`
Sets `Set-Cookie: access_token` (new 15 min TTL). Refresh token cookie unchanged.
```jsonc
{
  "success": true,
  "message": "Token refreshed."
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 401 | `UNAUTHORIZED` | Cookie missing, token not in DB, or token expired |

---

### 1.7 `POST /auth/logout`
> **Auth:** 🔒 User · **Rate limit:** —

Adds the current `access_token` JTI to `token_blacklist`. Deletes the `refresh_token` record from DB. Clears both cookies.

#### Request
No body.

#### `200 OK`
Sets `Set-Cookie: access_token; Max-Age=0` and `Set-Cookie: refresh_token; Max-Age=0`.
```jsonc
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

### 1.8 `POST /auth/forgot-password`
> **Auth:** Public · **Rate limit:** 5 requests / 1 hr per IP

Generates an OTP and sends password-reset email. Silently succeeds even if email is not registered (to prevent user enumeration).

#### Request body
```jsonc
{
  "email": "ravi@example.com"    // valid email, required
}
```

#### `200 OK`
```jsonc
{
  "success": true,
  "message": "If an account with that email exists, a reset code has been sent."
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Invalid email format |
| 429 | `RATE_LIMITED` | 5 requests within 1 hour |

---

### 1.9 `POST /auth/reset-password`
> **Auth:** Public · **Rate limit:** 5 attempts / 10 min per IP

Verifies the password-reset OTP and sets a new password. Issues fresh `access_token` + `refresh_token` cookies.

#### Request body
```jsonc
{
  "userId": "uuid",
  "otp": "384710",              // string, exactly 6 digits, required
  "newPassword": "NewPass@456"  // same complexity rules as signup, required
}
```

#### `200 OK`
Sets new cookie pair.
```jsonc
{
  "success": true,
  "message": "Password updated successfully.",
  "data": { "user": { /* UserObject */ } }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `OTP_EXPIRED` | OTP TTL passed |
| 400 | `OTP_INVALID` | Wrong code |
| 400 | `OTP_MAX_ATTEMPTS` | 5 attempts reached |
| 404 | `NOT_FOUND` | `userId` not found |

---

### 1.10 `GET /auth/invalidate`
> **Auth:** Public · **Rate limit:** —

Blacklists a specific access token JTI. Called when the user clicks "This wasn't me" in the login security alert email. The link in the email contains the JTI as a query param. Endpoint is public because the user may be on a different device than the one that triggered the alert.

#### Query params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `ref` | string | ✅ | JTI of the access token to invalidate |

#### `200 OK`
```jsonc
{
  "success": true,
  "message": "Session has been invalidated. If this was you, no action is needed."
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | `ref` param missing |
| 404 | `NOT_FOUND` | JTI does not match any known token (already expired or does not exist) |

---

### 1.11 `GET /auth/me`
> **Auth:** 🔒 User · **Rate limit:** —

Returns the currently authenticated user's profile.

#### Request
No body or params.

#### `200 OK`
```jsonc
{
  "success": true,
  "data": { "user": { /* UserObject */ } }
}
```

---

## 2. User

---

### 2.1 `PATCH /user/profile`
> **Auth:** 🔒 User · **Rate limit:** —

Updates editable profile fields. `interestedServices` and `email` are not editable here.

#### Request body (all fields optional; send only what you want to change)
```jsonc
{
  "name": "Ravi K. Sharma",       // string, 2–100 chars
  "allowPromotions": true         // boolean
}
```

#### `200 OK`
```jsonc
{
  "success": true,
  "data": { "user": { /* UserObject with updated fields */ } }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Invalid field types or lengths |

---

### 2.2 `GET /user/payment-history`
> **Auth:** 🔒 User · **Rate limit:** —

Returns all `captured` payment records for the authenticated user, joined with booking service type. Only paid transactions appear (per KB1 §8.1).

#### `200 OK`
```jsonc
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "bookingId": "uuid",
      "serviceType": "asmt_10",
      "razorpayOrderId": "order_PJjkNMkDSf1234",
      "razorpayPaymentId": "pay_PJjkXXXXXX5678",
      "amountPaise": 299900,
      "currency": "INR",
      "status": "captured",
      "createdAt": "2024-01-16T09:00:00.000Z"
    }
  ]
}
```

---

### 2.3 `DELETE /user`
> **Auth:** 🔒 User · **Rate limit:** —

Deletes the authenticated user's account. Blocked if any booking is in an active state (`document_upload`, `in_review`, `draft_ready`, `filing`). Requires the user to type their email for confirmation.

#### Request body
```jsonc
{
  "confirmEmail": "ravi@example.com"   // must match account email exactly, required
}
```

#### `200 OK`
Clears both cookies.
```jsonc
{
  "success": true,
  "message": "Your account has been deleted."
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | `confirmEmail` missing |
| 400 | `EMAIL_MISMATCH` | `confirmEmail` does not match account email |
| 409 | `ACTIVE_BOOKINGS` | One or more bookings are in an active state |

---

## 3. Bookings (user)

---

### 3.1 `POST /bookings`
> **Auth:** 🔒 User · **Rate limit:** —

Creates a new booking with intake form data. Sets `status = document_upload`, `payment_status = pending`. Sends confirmation emails to user and admin.

#### Request body
```jsonc
{
  "serviceType": "asmt_10",                  // ServiceType enum, required
  "contactName": "Ravi Kumar",               // string, 2–100 chars, required
  "contactEmail": "ravi@example.com",        // valid email, required
  "contactPhone": "+919876543210",           // string, 7–20 chars, required
  "organizationName": "Ravi Enterprises",    // string, max 255 chars, optional (nullable)
  "filingFor": "self",                       // "self" | "others", required
  "gstn": "29AABCU9603R1ZX",                 // string, exactly 15 chars, GSTN format regex, optional (issue #10 — empty/omitted stored as null)
  "consentInformationAccurate": true,        // boolean, must be true, required
  "consentContactAuthorized": true           // boolean, must be true, required
}
```

#### `201 Created`
```jsonc
{
  "success": true,
  "message": "Booking created. Please upload your documents to proceed.",
  "data": { "booking": { /* BookingDetailObject (no documents yet) */ } }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Invalid fields; consents not true; GSTN format invalid |

---

### 3.2 `GET /bookings`
> **Auth:** 🔒 User · **Rate limit:** —

Returns all bookings for the authenticated user, newest first.

#### `200 OK`
```jsonc
{
  "success": true,
  "data": [ /* BookingSummaryObject[] */ ]
}
```

---

### 3.3 `GET /bookings/:id`
> **Auth:** 🔒 User · **Rate limit:** —  
> Ownership enforced: `booking.userId` must equal `req.user.id`.

Returns full booking detail including documents and most recent payment record.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |

#### `200 OK`
```jsonc
{
  "success": true,
  "data": {
    "booking": {
      /* BookingDetailObject */
      "documents": [ /* BookingDocumentObject[] */ ],
      "latestPayment": { /* PaymentRecordObject or null */ }
    }
  }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 403 | `FORBIDDEN` | Booking belongs to another user |
| 404 | `NOT_FOUND` | Booking ID does not exist |

---

### 3.4 `POST /bookings/:id/cancel`
> **Auth:** 🔒 User · **Rate limit:** —  
> Ownership enforced.

Cancels a booking. Only allowed when `status = draft_ready` AND `payment_status = pending`. Sends cancellation emails to user and admin.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |

#### Request
No body.

#### `200 OK`
```jsonc
{
  "success": true,
  "message": "Booking cancelled.",
  "data": { "booking": { /* BookingDetailObject with status: cancelled */ } }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 403 | `FORBIDDEN` | Booking belongs to another user |
| 404 | `NOT_FOUND` | Booking ID does not exist |
| 409 | `INVALID_TRANSITION` | Status is not `draft_ready`, or payment already captured |

---

## 4. Documents (user)

---

### 4.1 `POST /bookings/:id/upload-url`
> **Auth:** 🔒 User · **Rate limit:** 7 uploads / 1 hr per user · Ownership enforced.

Step 1 of 2 for document upload. Validates the file metadata server-side and returns a pre-signed S3 `PUT` URL. The S3 key is constructed as `{userId}-{yyyyMMdd}-{sanitizedName}-{4randomChars}.pdf`. URL expires in 5 minutes.

Blocked if: `booking.status ≠ document_upload`, file count already at 8, file size > 5 MB, or `contentType ≠ application/pdf`.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |

#### Request body
```jsonc
{
  "fileName": "gst_notice_jan2024.pdf",   // string, original filename for display, required
  "fileSize": 2097152,                    // integer (bytes), max 5,242,880 (5 MB), required
  "contentType": "application/pdf"        // must be exactly "application/pdf", required
}
```

#### `200 OK`
```jsonc
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.ap-south-1.amazonaws.com/bucket/key?X-Amz-...",
    "s3Key": "uuid-20240115-gst_notice_jan2024-a3f7.pdf",
    "expiresAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Missing/invalid fields |
| 400 | `FILE_TOO_LARGE` | `fileSize` > 5 MB |
| 400 | `INVALID_FILE_TYPE` | `contentType` is not `application/pdf` |
| 403 | `FORBIDDEN` | Booking belongs to another user |
| 404 | `NOT_FOUND` | Booking ID does not exist |
| 409 | `INVALID_STATUS` | Booking status is not `document_upload` |
| 409 | `FILE_LIMIT_REACHED` | Booking already has 8 documents |
| 429 | `RATE_LIMITED` | 7 uploads within 1 hour |

---

### 4.2 `POST /bookings/:id/confirm-upload`
> **Auth:** 🔒 User · **Rate limit:** — · Ownership enforced.

Step 2 of 2. Called after the browser has successfully PUT the file to S3. Creates the `booking_documents` row in the database.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |

#### Request body
```jsonc
{
  "s3Key": "uuid-20240115-gst_notice_jan2024-a3f7.pdf",   // exact key returned by upload-url, required
  "fileName": "gst_notice_jan2024.pdf"                      // original filename for display, required
}
```

#### `201 Created`
```jsonc
{
  "success": true,
  "data": { "document": { /* BookingDocumentObject */ } }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Missing/invalid fields |
| 403 | `FORBIDDEN` | Booking belongs to another user |
| 404 | `NOT_FOUND` | Booking ID does not exist |
| 409 | `DUPLICATE_KEY` | `s3Key` already exists in `booking_documents` |

---

### 4.3 `GET /bookings/:id/documents`
> **Auth:** 🔒 User · **Rate limit:** — · Ownership enforced.

Lists all documents attached to a booking. Returns metadata only; no URLs. Use `draft-url` for draft access.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |

#### `200 OK`
```jsonc
{
  "success": true,
  "data": { "documents": [ /* BookingDocumentObject[] */ ] }
}
```

---

### 4.4 `GET /bookings/:id/draft-url`
> **Auth:** 🔒 User · **Rate limit:** 15 requests / 1 hr per user · Ownership enforced.

Returns a pre-signed S3 `GET` URL to view the draft PDF. Gate: `booking.status` must be `filing` or `complete`. URL expires in 15 minutes.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |

#### `200 OK`
```jsonc
{
  "success": true,
  "data": {
    "draftUrl": "https://s3.ap-south-1.amazonaws.com/bucket/draft-key?X-Amz-...",
    "expiresAt": "2024-01-16T09:15:00.000Z"
  }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 403 | `FORBIDDEN` | Booking belongs to another user |
| 403 | `DRAFT_NOT_ACCESSIBLE` | Status is not `filing` or `complete` |
| 404 | `NOT_FOUND` | Booking ID does not exist or no draft uploaded |
| 429 | `RATE_LIMITED` | 15 requests within 1 hour |

---

### 4.5 `DELETE /bookings/:id/documents/:docId`
> **Auth:** 🔒 User · **Rate limit:** — · Ownership enforced.

Deletes a user-uploaded document (issue #3 — D102). Gate: `booking.status = document_upload` (HLD §19 — no mid-service re-upload once review has started). The DB row is removed first; the S3 object delete is best-effort (a stray object is swept by the existing lifecycle policy — database.md §3.4).

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |
| `docId` | uuid | Document ID |

#### `200 OK`
```jsonc
{
  "success": true,
  "data": null
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 404 | `NOT_FOUND` | Booking not found, wrong owner, document not found, or document was not user-uploaded |
| 409 | `INVALID_STATUS` | `booking.status` is not `document_upload` |

---

## 5. Payments

---

### 5.1 `POST /payments/:bookingId/initiate`
> **Auth:** 🔒 User · **Rate limit:** 5 attempts / 1 hr per user · Ownership enforced.

Creates a Razorpay Order for the booking and inserts a `payment_records` row (`status = created`). The frontend uses the returned `orderId` and `keyId` to open the Razorpay checkout modal.

Gate: `booking.status = draft_ready` AND `booking.paymentStatus = pending`.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `bookingId` | uuid | Booking ID |

#### Request
No body.

#### `201 Created`
```jsonc
{
  "success": true,
  "data": {
    "orderId": "order_PJjkNMkDSf1234",
    "amountPaise": 299900,
    "currency": "INR",
    "keyId": "rzp_live_xxxxxxxxxx",
    "prefill": {
      "name": "Ravi Kumar",
      "email": "ravi@example.com",
      "contact": "+919876543210"
    },
    "callbackUrl": "https://gstnoticesupport.in/payment/verify?booking_id=uuid"
  }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 403 | `FORBIDDEN` | Booking belongs to another user |
| 404 | `NOT_FOUND` | Booking ID does not exist |
| 409 | `INVALID_STATUS` | Booking is not in `draft_ready` state |
| 409 | `PAYMENT_ALREADY_CAPTURED` | `paymentStatus` is already `paid` |
| 429 | `RATE_LIMITED` | 5 attempts within 1 hour |
| 502 | `RAZORPAY_ERROR` | Razorpay order creation API call failed |

---

### 5.2 `GET /payments/verify`
> **Auth:** 🔒 User · **Rate limit:** 7 requests / 1 hr per user

Layer 2 payment verification fallback. Called by the Next.js Server Component at `/payment/verify` page after the Razorpay redirect. Verifies the redirect signature, calls Razorpay Fetch Payment API, applies idempotency check, and returns a structured outcome. The Next.js page redirects or renders based on this outcome.

#### Query params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `razorpay_payment_id` | string | ✅ | From Razorpay redirect |
| `razorpay_order_id` | string | ✅ | From Razorpay redirect |
| `razorpay_signature` | string | ✅ | From Razorpay redirect |
| `booking_id` | uuid | ✅ | Appended by backend when creating order callback URL |

#### `200 OK`
```jsonc
// Outcome: "success" — payment captured, booking → filing
{
  "success": true,
  "data": { "outcome": "success", "bookingId": "uuid" }
}

// Outcome: "failed" — payment failed or abandoned
{
  "success": true,
  "data": { "outcome": "failed", "bookingId": "uuid" }
}

// Outcome: "inconclusive" — Razorpay API unreachable or returned unexpected status
{
  "success": true,
  "data": { "outcome": "inconclusive", "bookingId": "uuid" }
}

// Outcome: "tampered" — signature verification failed
{
  "success": true,
  "data": { "outcome": "tampered" }
}
```

> Frontend routing after each outcome:  
> `success` → redirect to `/dashboard/services/{bookingId}?payment=success`  
> `failed` → redirect to `/dashboard/services/{bookingId}?payment=failed`  
> `inconclusive` → stay on `/payment/verify`, show inconclusive UI with WhatsApp link  
> `tampered` → stay on `/payment/verify`, show invalid-link message

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Missing query params |
| 429 | `RATE_LIMITED` | 7 requests within 1 hour |

---

### 5.3 `POST /payments/webhook`
> **Auth:** HMAC-SHA256 signature verification (no JWT cookie) · **Rate limit:** Exempt  
> **Body parser:** `express.raw({ type: 'application/json' })` — do NOT use `express.json()`.

Layer 1 primary payment path. Razorpay fires this on `payment.captured`. Backend verifies the HMAC signature using the raw body bytes + `X-Razorpay-Signature` header. Applies idempotency check on `razorpay_payment_id`. Transitions booking to `filing` and sends emails.

#### Request headers
| Header | Description |
|--------|-------------|
| `X-Razorpay-Signature` | HMAC-SHA256 of raw body using webhook secret |
| `Content-Type` | `application/json` |

#### Request body (Razorpay standard webhook payload)
```jsonc
{
  "entity": "event",
  "event": "payment.captured",
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_PJjkXXXXXX5678",
        "order_id": "order_PJjkNMkDSf1234",
        "amount": 299900,
        "currency": "INR",
        "status": "captured",
        "email": "ravi@example.com",
        "contact": "+919876543210"
      }
    }
  },
  "created_at": 1705392000
}
```

#### `200 OK`
```jsonc
{ "success": true }
```
> Always return `200` to Razorpay after processing (or on idempotent re-delivery). Never return a 4xx for duplicate delivery — Razorpay will retry aggressively.

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `SIGNATURE_INVALID` | HMAC verification failed — reject silently, no processing |

---

## 6. Admin — Bookings

---

### 6.1 `GET /admin/bookings`
> **Auth:** 🛡️ Admin · **Rate limit:** —

Returns all bookings across all users with optional filters. Sorted by `createdAt DESC` by default.

#### Query params
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | integer | — | 1 | Page number |
| `limit` | integer | — | 20 | Items per page (max 100) |
| `status` | BookingStatus | — | — | Filter by booking status |
| `paymentStatus` | PaymentStatus | — | — | Filter by payment status |
| `serviceType` | ServiceType | — | — | Filter by service type |

#### `200 OK`
```jsonc
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "serviceType": "asmt_10",
      "status": "draft_ready",
      "paymentStatus": "pending",
      "user": {
        "id": "uuid",
        "name": "Ravi Kumar",
        "email": "ravi@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-16T08:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 45 }
}
```

---

### 6.2 `GET /admin/bookings/:id`
> **Auth:** 🛡️ Admin · **Rate limit:** —

Full booking detail including all documents, all payment records, and the associated user info.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |

#### `200 OK`
```jsonc
{
  "success": true,
  "data": {
    "booking": {
      /* BookingDetailObject */
      "user": { "id": "uuid", "name": "Ravi Kumar", "email": "ravi@example.com" },
      "documents": [ /* BookingDocumentObject[] */ ],
      "paymentRecords": [ /* PaymentRecordObject[] — all attempts */ ]
    }
  }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 404 | `NOT_FOUND` | Booking ID does not exist |

---

### 6.3 `PATCH /admin/bookings/:id/status`
> **Auth:** 🛡️ Admin · **Rate limit:** —

Manual status transition by admin. Only two transitions are allowed here: `→ in_review` and `→ complete`. `draft_ready` is automatic (via draft upload), `filing` is automatic (via payment), `cancelled` is user-initiated only in Phase 2.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |

#### Request body
```jsonc
{
  "status": "in_review"   // "in_review" | "complete" only, required
}
```

#### `200 OK`
```jsonc
{
  "success": true,
  "data": { "booking": { /* BookingDetailObject with updated status */ } }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | `status` is not `in_review` or `complete` |
| 404 | `NOT_FOUND` | Booking ID does not exist |
| 409 | `INVALID_TRANSITION` | Transition not allowed from current status (e.g. trying to set `in_review` on a `filing` booking) |

---

### 6.4 `POST /admin/bookings/:id/draft-upload-url`
> **Auth:** 🛡️ Admin · **Rate limit:** 15 uploads / 1 hr (admin)

Step 1 of 2 for admin draft upload. Returns a pre-signed S3 `PUT` URL. Allowed when `status = in_review` or `status = draft_ready` (re-upload). Blocked when `status = filing`, `complete`, or `cancelled`.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |

#### Request body
```jsonc
{
  "fileName": "draft_asmt10_ravi_jan2024.pdf",  // string, display name, required
  "fileSize": 1048576,                            // integer (bytes), max 20 MB for drafts, required
  "contentType": "application/pdf"               // must be "application/pdf", required
}
```

#### `200 OK`
```jsonc
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.ap-south-1.amazonaws.com/bucket/draft-key?X-Amz-...",
    "s3Key": "drafts/uuid-20240116-draft_asmt10_ravi_jan2024-b2e9.pdf",
    "expiresAt": "2024-01-16T08:05:00.000Z"
  }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `FILE_TOO_LARGE` | `fileSize` exceeds 20 MB |
| 400 | `INVALID_FILE_TYPE` | Not `application/pdf` |
| 404 | `NOT_FOUND` | Booking ID does not exist |
| 409 | `DRAFT_LOCKED` | Status is `filing`, `complete`, or `cancelled` |
| 429 | `RATE_LIMITED` | 15 uploads within 1 hour |

---

### 6.5 `POST /admin/bookings/:id/draft-confirm`
> **Auth:** 🛡️ Admin · **Rate limit:** —

Step 2 of 2. Confirms the draft upload. Updates `bookings.draft_s3_key`. Auto-transitions status to `draft_ready`. Sends appropriate email (first-upload: "Draft ready"; re-upload: "Draft updated").

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |

#### Request body
```jsonc
{
  "s3Key": "drafts/uuid-20240116-draft_asmt10_ravi_jan2024-b2e9.pdf",  // required
  "fileName": "draft_asmt10_ravi_jan2024.pdf"                            // required, for document record
}
```

#### `200 OK`
```jsonc
{
  "success": true,
  "message": "Draft uploaded. Booking status set to draft_ready. User notified by email.",
  "data": { "booking": { /* BookingDetailObject with status: draft_ready */ } }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 404 | `NOT_FOUND` | Booking ID does not exist |
| 409 | `DRAFT_LOCKED` | Status is `filing`, `complete`, or `cancelled` |

---

### 6.6 `PATCH /admin/bookings/:id/note`
> **Auth:** 🛡️ Admin · **Rate limit:** —

Sets or updates `admin_note` on the booking. The note is visible to the user on the service detail page. Can be updated at any booking status.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |

#### Request body
```jsonc
{
  "note": "Pre-deposit of ₹12,000 required before we proceed with the appeal filing."
  // string, max 5000 chars, required. Send empty string "" to clear the note.
}
```

#### `200 OK`
```jsonc
{
  "success": true,
  "data": { "booking": { /* BookingDetailObject with updated adminNote */ } }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | `note` exceeds 5000 chars |
| 404 | `NOT_FOUND` | Booking ID does not exist |

---

### 6.7 `POST /admin/bookings/:id/mark-paid`
> **Auth:** 🛡️ Admin · **Rate limit:** —

Layer 3 manual payment override. Visible only when `status = draft_ready` AND `payment_record.status = pending or failed`. Admin supplies the `razorpayPaymentId` from the Razorpay dashboard. Backend calls Razorpay Fetch Payment API to confirm the payment is genuinely `captured` before processing. Admin cannot fabricate a payment.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |

#### Request body
```jsonc
{
  "razorpayPaymentId": "pay_PJjkXXXXXX5678"  // string, required
}
```

#### `200 OK`
```jsonc
{
  "success": true,
  "message": "Payment verified with Razorpay. Booking transitioned to filing.",
  "data": { "booking": { /* BookingDetailObject with status: filing */ } }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | `razorpayPaymentId` missing |
| 404 | `NOT_FOUND` | Booking ID does not exist |
| 409 | `INVALID_STATUS` | Booking not in `draft_ready` or payment already captured |
| 422 | `PAYMENT_NOT_CAPTURED` | Razorpay API confirmed payment is not `captured` |
| 502 | `RAZORPAY_ERROR` | Razorpay Fetch API call failed |

---

### 6.8 `GET /admin/stats`
> **Auth:** 🛡️ Admin · **Rate limit:** —

Returns overview metrics for the admin dashboard.

#### `200 OK`
```jsonc
{
  "success": true,
  "data": {
    "totalBookings": 45,
    "byStatus": {
      "document_upload": 10,
      "in_review": 5,
      "draft_ready": 8,
      "filing": 12,
      "complete": 8,
      "cancelled": 2
    },
    "byServiceType": {
      "asmt_10": 15,
      "scn": 12,
      "commissioner_appeal": 10,
      "gstat_appeal": 8
    },
    "totalRevenuePaise": 18750000
  }
}
```

---

## 7. Admin — Documents

---

### 7.1 `GET /admin/bookings/:id/documents`
> **Auth:** 🛡️ Admin · **Rate limit:** —

Lists all documents (user-uploaded + admin draft) for a booking. Returns metadata only.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |

#### `200 OK`
```jsonc
{
  "success": true,
  "data": { "documents": [ /* BookingDocumentObject[] */ ] }
}
```

---

### 7.2 `GET /admin/bookings/:id/documents/:docId/download-url`
> **Auth:** 🛡️ Admin · **Rate limit:** 15 requests / 1 hr (admin)

Returns a pre-signed S3 `GET` URL to download a user-uploaded document. URL expires in 15 minutes.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Booking ID |
| `docId` | uuid | Document ID |

#### `200 OK`
```jsonc
{
  "success": true,
  "data": {
    "downloadUrl": "https://s3.ap-south-1.amazonaws.com/bucket/doc-key?X-Amz-...",
    "fileName": "gst_notice_jan2024.pdf",
    "expiresAt": "2024-01-15T11:15:00.000Z"
  }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 404 | `NOT_FOUND` | Booking or document ID does not exist |
| 409 | `DOC_BOOKING_MISMATCH` | `docId` does not belong to `:id` booking |
| 429 | `RATE_LIMITED` | 15 requests within 1 hour |

---

### 7.3 `GET /admin/users`
> **Auth:** 🛡️ Admin · **Rate limit:** None

Returns a paginated list of registered users for the Admin Users screen. Soft-deleted users
(`deletedAt IS NOT NULL`) are excluded. Supports search by name or email.

#### Query params
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | integer | No | Page number. Default `1`. |
| `limit` | integer | No | Page size. Default `25`, max `100`. |
| `search` | string | No | Case-insensitive partial match against `name` or `email`. |

#### `200 OK`
```jsonc
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "e2c1a7b0-1234-4abc-9def-0a1b2c3d4e5f",
        "name": "Rohit Sharma",
        "email": "rohit.sharma@example.com",
        "phone": "+919876543210",
        "interestedServices": ["ASMT10_REPLY", "SCN_REPLY"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 142,
      "totalPages": 6
    }
  }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | `page` or `limit` is not a positive integer, or `limit` exceeds `100` |

---

### 7.4 `GET /admin/users/:id`
> **Auth:** 🛡️ Admin · **Rate limit:** None

Returns full detail for a single user for the Admin User Detail screen, including whether the
delete action should be enabled.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | User ID |

#### `200 OK`
```jsonc
{
  "success": true,
  "data": {
    "id": "e2c1a7b0-1234-4abc-9def-0a1b2c3d4e5f",
    "name": "Rohit Sharma",
    "email": "rohit.sharma@example.com",
    "phone": "+919876543210",
    "interestedServices": ["ASMT10_REPLY", "SCN_REPLY"],
    "activeBookingCount": 0
  }
}
```

> `activeBookingCount` = count of this user's bookings with `status` in
> (`document_upload`, `in_review`, `draft_ready`, `filing`). Frontend uses this to enable/disable
> the "Delete user" control and populate the disabled-reason copy.

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 404 | `NOT_FOUND` | User ID does not exist, or user is soft-deleted (`deletedAt` set) |

---

### 7.5 `DELETE /admin/users/:id`
> **Auth:** 🛡️ Admin · **Rate limit:** 10 requests / 1 hr (admin)

Soft-deletes a user (HLD §7.4): sets `deletedAt` on the `users` row. Bookings and
`payment_records` for this user are retained. Associated S3 documents are hard-deleted 7 days
later via scheduled job. Blocked if the user has any booking in an active state.

#### Path params
| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | User ID |

#### `200 OK`
```jsonc
{
  "success": true,
  "data": {
    "id": "e2c1a7b0-1234-4abc-9def-0a1b2c3d4e5f",
    "deletedAt": "2026-06-14T10:30:00.000Z"
  }
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 404 | `NOT_FOUND` | User ID does not exist or is already soft-deleted |
| 409 | `USER_HAS_ACTIVE_BOOKING` | User has ≥1 booking in `document_upload`, `in_review`, `draft_ready`, or `filing` — deletion blocked |
| 429 | `RATE_LIMITED` | 10 requests within 1 hour |

---

## 8. Public

---

### 8.1 `POST /contact`
> **Auth:** Public · **Rate limit:** 3 submissions / 1 hr per IP

Submits the public contact form. Sends a notification email to the admin.

#### Request body
```jsonc
{
  "name": "Ravi Kumar",                        // string, 2–100 chars, required
  "email": "ravi@example.com",                  // valid email, required
  "phone": "+919876543210",                     // string, 7–20 chars, required
  "organizationName": "Ravi Enterprises",       // string, max 255 chars, optional
  "message": "I received an ASMT-10 notice..."  // string, 10–2000 chars, required
}
```

#### `200 OK`
```jsonc
{
  "success": true,
  "message": "Your message has been received. We will get back to you within 24 hours."
}
```

#### Errors
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Invalid/missing required fields |
| 429 | `RATE_LIMITED` | 3 submissions within 1 hour |

---

## Appendix — Pricing reference (for `amountPaise` values)

| Service | Price (₹) | `amountPaise` |
|---------|-----------|---------------|
| ASMT-10 Reply | ₹2,999 | `299900` |
| SCN Reply | ₹5,999 | `599900` |
| Commissioner Appeal | ₹9,999 | `999900` |
| GSTAT Appeal | ₹14,999 | `1499900` |

> Prices are set server-side based on `booking.serviceType` when creating the Razorpay Order. The frontend never supplies the amount.

---

## Appendix — Full error code reference

| Code | HTTP | Used in |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | All endpoints with body/query |
| `OTP_EXPIRED` | 400 | verify-otp, reset-password |
| `OTP_INVALID` | 400 | verify-otp, reset-password |
| `OTP_MAX_ATTEMPTS` | 400 | verify-otp, reset-password |
| `FILE_TOO_LARGE` | 400 | upload-url, draft-upload-url |
| `INVALID_FILE_TYPE` | 400 | upload-url, draft-upload-url |
| `EMAIL_MISMATCH` | 400 | DELETE /user |
| `SIGNATURE_INVALID` | 400 | webhook |
| `UNAUTHORIZED` | 401 | All 🔒/🛡️ endpoints |
| `INVALID_CREDENTIALS` | 401 | login |
| `EMAIL_NOT_VERIFIED` | 403 | login |
| `FORBIDDEN` | 403 | Ownership checks, role checks |
| `DRAFT_NOT_ACCESSIBLE` | 403 | draft-url (wrong status) |
| `NOT_FOUND` | 404 | Any resource by ID |
| `CONFLICT` | 409 | Email exists, already verified, profile already completed |
| `ACTIVE_BOOKINGS` | 409 | DELETE /user |
| `INVALID_TRANSITION` | 409 | cancel, PATCH status |
| `INVALID_STATUS` | 409 | upload-url, initiate, mark-paid |
| `FILE_LIMIT_REACHED` | 409 | upload-url (8-file cap) |
| `DUPLICATE_KEY` | 409 | confirm-upload |
| `DRAFT_LOCKED` | 409 | draft-upload-url, draft-confirm |
| `PAYMENT_ALREADY_CAPTURED` | 409 | initiate |
| `PAYMENT_NOT_CAPTURED` | 422 | mark-paid |
| `RATE_LIMITED` | 429 | Rate-limited endpoints |
| `RAZORPAY_ERROR` | 502 | initiate, mark-paid |
| `INTERNAL_ERROR` | 500 | Unhandled errors |
