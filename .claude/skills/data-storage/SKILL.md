---
name: data-and-storage
description: >
  Guides all data persistence and file handling for gstnoticesupport.in — Prisma
  schema models, migrations, NeonDB connection, AWS S3 private bucket access via
  pre-signed URLs, the end-to-end browser → S3 upload flow, and draft PDF
  delivery. Use this when adding or modifying any database table, writing a
  Prisma query, generating a migration, configuring S3, generating pre-signed
  URLs (PUT for upload, GET for download), implementing the document upload
  flow, or handling draft PDF access. Triggers on "Prisma", "schema", "model",
  "migration", "S3", "bucket", "upload", "pre-signed URL", "signed URL",
  "draft PDF", "document", "file storage".
---

# Data & Storage — Prisma Models, S3, and File Upload Flow

## Purpose

Database models, S3 storage, and the file-upload flow are inseparable in this project. Every uploaded document is one S3 object plus one Prisma row; every draft PDF is one S3 object referenced by a column on the booking row. This skill covers the full persistence layer end-to-end.

**Source of truth:**
- HLD §7 (Data Model)
- HLD §9 (File Handling Architecture)
- HLD §22.5 (Locked Data Decisions)
- LLD (Document Service)

---

## Locked Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL on NeonDB (Mumbai region) |
| ORM | Prisma |
| File storage | AWS S3 (private bucket, Mumbai `ap-south-1`) |
| File upload path | Browser → S3 direct (never through Express) |

Do not introduce Multer, busboy, or any server-side file handling — files never pass through the Express process.

---

## Core Entities

Per HLD §7, the data model has these core entities (column-level details belong in the Prisma schema):

| Entity | Purpose |
|---|---|
| `User` | Identity, auth, profile, soft-delete |
| `Booking` | One service booking, links to user, holds status + admin notes |
| `BookingDocument` | One uploaded user document attached to a booking |
| `Draft` (or `bookings.draft_s3_key` column) | Admin-uploaded draft PDF for a booking |
| `PaymentRecord` | Razorpay order + payment + idempotency tracking |
| `OtpCode` | OTP storage for signup + password reset |

A `BookingDocument` is always uploaded by the user. The draft is uploaded by the admin. They are separate concepts and may share storage but never share table or status semantics.

---

## Prisma Conventions

### Schema file

Single `prisma/schema.prisma`. Models in PascalCase singular (`Booking`, not `bookings`). Field names in camelCase (`userId`, `createdAt`). Database tables and columns mapped to snake_case via `@@map` and `@map` only if a convention requires it.

### Required fields on every entity

- `id` — UUID, default `uuid()`.
- `createdAt` — DateTime, default `now()`.
- `updatedAt` — DateTime, `@updatedAt`.

### Soft delete

Use `deletedAt: DateTime?` on entities that need soft-delete (User per HLD; documents may be hard-deleted with the booking). The exact policy is recorded as an open question (KB1 O2) — confirm before assuming.

### Enums

Define enums in the Prisma schema for fixed-value columns: `BookingStatus`, `PaymentStatus`, `UserRole`, `OtpPurpose`, `DocumentType`. Mirror these as TypeScript types where the frontend needs them.

### Indexes

Add explicit indexes for every column used in a `WHERE` clause on a hot path:
- `User.email` (unique)
- `Booking.userId`
- `Booking.status`
- `BookingDocument.bookingId`
- `PaymentRecord.razorpayPaymentId` (unique — idempotency key)
- `PaymentRecord.razorpayOrderId`
- `OtpCode.email`

### Repository pattern

Prisma calls live in `repositories/<domain>.repository.ts`. Services call repositories, never `prisma.` directly. This keeps query logic testable and ownership filters consistent.

**Ownership filter rule:** Every user-scoped read accepts `(resourceId, requesterId, isAdmin)`. If not admin, the `WHERE` clause includes `userId: requesterId`. Admins bypass the filter.

### Migrations

```
npx prisma migrate dev --name <descriptive_name>
```

Run migrations on NeonDB dev branch first, then staging, then production. NeonDB branching is used (HLD §4.1) so staging can be branched off the production schema without infra duplication.

Never edit a committed migration file. If a migration is wrong, add a new migration to fix it.

### Generated client

`npx prisma generate` runs in `postinstall`. The generated client lives in `node_modules/.prisma/client`. Import as `import { PrismaClient } from '@prisma/client'`. A single shared `PrismaClient` instance is exported from `lib/prisma.ts` — never instantiate ad-hoc.

---

## S3 Configuration

### Bucket setup

| Setting | Value |
|---|---|
| Region | `ap-south-1` (Mumbai) |
| Public access | All blocked |
| Encryption | AES-256 (SSE-S3) |
| CORS | `PUT, GET` from frontend origin only, with `Content-Type`, `Content-Length` headers |
| Lifecycle | None at launch (deferred) |
| Versioning | Off at launch |

### IAM

A single IAM user with a policy scoped to: `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on `arn:aws:s3:::<bucket>/*`. Nothing else. Credentials in backend env vars only.

### Key naming convention

```
uploads/<userId>/<bookingId>/<documentId>.pdf
drafts/<bookingId>/<draftId>.pdf
```

Predictable keys simplify access checks. Random UUIDs in the path prevent enumeration. Never put filenames from user input directly in keys — always sanitize or replace with a generated UUID.

---

## File Upload Flow (Browser → S3 Direct)

Per HLD §9.2, files never pass through Express. The flow:

1. **User selects file** in the browser (React Hook Form input).
2. **Frontend sends metadata** to `POST /api/v1/user/bookings/:bookingId/upload-url`:
   ```
   { filename, size, contentType }
   ```
3. **Backend validates** (in service):
   - User is authenticated and owns the booking.
   - Booking status is `Document Upload` (uploads are not allowed after this state).
   - File count for this booking is under 8.
   - File size is under 5 MB.
   - Total size across all booking documents stays under 40 MB.
   - Content type is `application/pdf`.
4. **Backend generates** a pre-signed PUT URL valid for 5 minutes, with a fixed S3 key:
   ```
   uploads/<userId>/<bookingId>/<newDocumentId>.pdf
   ```
   The pre-signed URL includes a `Content-Length` range constraint matching the declared file size, and a `Content-Type: application/pdf` constraint.
5. **Backend returns** `{ uploadUrl, s3Key, documentId }`.
6. **Frontend uploads** directly to S3 via `PUT` with the file as body and the matching headers.
7. **Frontend confirms** via `POST /api/v1/user/bookings/:bookingId/confirm-upload` with `{ documentId, s3Key }`.
8. **Backend inserts** a `BookingDocument` row referencing the S3 key.

### File constraints (locked, HLD §9.3)

| Constraint | Value |
|---|---|
| Allowed type | PDF only |
| Max file size | 5 MB |
| Max files per booking | 8 |
| Max total per booking | 40 MB |
| Upload URL expiry | 5 minutes |

Enforce all four constraints both at the URL-generation step (backend) and via the pre-signed URL itself (Content-Length range, Content-Type).

---

## Draft PDF Delivery (Pre-signed GET URL)

Per HLD §9.4, draft access uses short-lived GET URLs:

1. User navigates to `/dashboard/services/[id]/draft` (a Server Component).
2. Server Component calls `GET /api/v1/user/bookings/:bookingId/draft-url`.
3. Backend verifies:
   - User owns the booking.
   - Booking status is `Filing` or `Complete` (no early access).
4. Backend generates a pre-signed GET URL valid for 15 minutes.
5. Frontend renders an in-browser PDF viewer pointing at the URL.
6. After 15 minutes the URL is dead; navigating to the page again generates a fresh one.

This endpoint is rate-limited: **20 requests per hour per user** (HLD §6.6). Do not cache the URL on the client beyond its 15-minute lifetime — never persist it in localStorage or a database.

---

## Admin Draft Upload

The admin upload is structurally identical to user upload but with different authorization and a different status side-effect:

1. Admin requests upload URL at `POST /api/v1/admin/bookings/:bookingId/draft-upload-url`.
2. Backend checks: requester is admin, booking exists, status is `In Review` or `Draft Ready` (re-upload is allowed in `Draft Ready`, locked once at `Filing`).
3. Generates pre-signed PUT URL with key `drafts/<bookingId>/<draftId>.pdf`.
4. Returns URL. Admin uploads directly to S3.
5. Admin confirms via `POST /api/v1/admin/bookings/:bookingId/confirm-draft`.
6. Backend sets `bookings.draft_s3_key`, transitions status:
   - If was `In Review` → `Draft Ready` (auto-transition, sends user email).
   - If was `Draft Ready` (re-upload) → stays `Draft Ready`, sends "Draft updated" email per notification matrix.
7. Draft re-upload is **blocked** when status is `Filing` or beyond.

---

## Transactional Consistency

PostgreSQL transactions are required for any operation that:

- Creates a payment record AND updates booking status.
- Creates a booking AND multiple booking documents in one logical action (rare — usually two API calls).
- Inserts an OTP AND updates user state.

Use `prisma.$transaction([...])` for batch operations or `prisma.$transaction(async (tx) => { ... })` for interactive transactions. Webhook handlers and the payment verification page rely on this for the three-layer reliability pattern (see `integrations` skill).

---

## Anti-patterns

Do not:

- Proxy file uploads through Express (no Multer, no buffering). Browser uploads direct to S3.
- Generate pre-signed URLs without size, type, and time constraints.
- Use predictable filenames from user input as S3 keys. Generate UUIDs.
- Make the S3 bucket public. All access is via signed URLs.
- Reuse a pre-signed URL after the response is sent. Generate fresh ones on each request.
- Store pre-signed URLs in the database. They expire.
- Skip the `Content-Length` range constraint on pre-signed PUTs — without it, a user can bypass the file size check.
- Use `prisma` directly in controllers. Go through a repository.
- Forget the ownership filter in repositories. Every user-scoped query needs `WHERE userId = ...` unless admin.
- Edit committed Prisma migrations. Add a new migration to fix.
- Cross-tenant queries without an admin check. The repository decides; the controller does not.

---

## Quick Reference

**Adding a new entity:**
1. Add model to `prisma/schema.prisma` with id, createdAt, updatedAt, indexes.
2. `npx prisma migrate dev --name add_<entity>`.
3. Create `repositories/<entity>.repository.ts`.
4. Create `services/<entity>.service.ts`.
5. Wire into routes/controllers per `backend-core` skill.

**Adding a new file upload path:**
1. Decide who uploads (user or admin) and what status gates apply.
2. Add the `upload-url` endpoint (returns pre-signed PUT URL).
3. Add the `confirm-upload` endpoint (records the row, possibly triggers status transition).
4. Add the matching `download-url` or `view-url` endpoint (returns pre-signed GET URL).
5. All constraints (size, type, count, total) enforced in service layer.
