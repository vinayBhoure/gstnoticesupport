# Database Rules — Prisma + PostgreSQL (NeonDB)

> **Applies to:** `server/src/repositories/`, `server/prisma/`
> **Universal rules also apply:** See `RULES.md`

---

## 1. Repository Layer

### 1.1 — All Prisma client calls live in `src/repositories/`. Nowhere else.

**Why:** A single data-access layer means schema changes require edits in only one place, and services can be tested by swapping the repository.

```
src/repositories/
  user.repository.ts
  booking.repository.ts
  booking-document.repository.ts
  draft.repository.ts
  payment.repository.ts
  otp.repository.ts
```

```ts
// ❌ DON'T — Prisma call inside a service
// src/services/booking.service.ts
import { prisma } from '@/lib/prisma';
const booking = await prisma.booking.findUnique({ where: { id } });

// ✅ DO — service imports the repository
import { bookingRepository } from '@/repositories/booking.repository';
const booking = await bookingRepository.findById(id);
```

---

### 1.2 — Repository methods are named after operations, not SQL verbs.

Prefer domain language that reflects intent over generic SQL terminology.

```ts
// ❌ DON'T
select(id: string)
insert(data: CreateBookingInput)
selectByUserId(userId: string)

// ✅ DO
findById(id: string)
findByIdAndUserId(id: string, userId: string)   // ownership-enforced lookup
findAllByUserId(userId: string)
create(data: CreateBookingInput)
updateStatus(id: string, status: BookingStatus)
softDelete(id: string)
```

---

### 1.3 — Each repository is a plain object of async functions. No classes.

```ts
// ✅ DO — src/repositories/booking.repository.ts
import { prisma } from '@/lib/prisma';

export const bookingRepository = {
  async findById(id: string) {
    return prisma.booking.findFirst({ where: { id, deleted_at: null } });
  },

  async findByIdAndUserId(id: string, userId: string) {
    return prisma.booking.findFirst({ where: { id, user_id: userId, deleted_at: null } });
  },

  async create(data: CreateBookingData) {
    return prisma.booking.create({ data });
  },

  async updateStatus(id: string, status: BookingStatus) {
    return prisma.booking.update({ where: { id }, data: { status, updated_at: new Date() } });
  },
};
```

---

## 2. No Raw SQL

### 2.1 — Never use `prisma.$queryRaw` or `prisma.$executeRaw`.

**Why:** Raw SQL queries bypass Prisma's type safety and parameterisation, opening the door to SQL injection. Every query needed for this platform can be expressed through Prisma's query builder.

```ts
// ❌ DON'T
const bookings = await prisma.$queryRaw`SELECT * FROM bookings WHERE user_id = ${userId}`;

// ✅ DO
const bookings = await prisma.booking.findMany({ where: { user_id: userId } });
```

---

### 2.2 — Never construct query conditions with string concatenation.

**Why:** Even inside Prisma's query builder, string concatenation in `where` clauses can introduce injection vectors.

```ts
// ❌ DON'T
const whereClause = `status = '${status}'`;

// ✅ DO — use the typed where object
const bookings = await prisma.booking.findMany({
  where: { status }, // status is a BookingStatus enum value, not a raw string
});
```

---

## 3. Soft Delete

### 3.1 — Users are soft-deleted. Never call `prisma.user.delete()`.

**Why:** Bookings and payment records referencing the user must be retained for legal and audit purposes. Hard-deleting the user row would violate referential integrity or require cascading deletes that destroy financial records.

```ts
// ❌ DON'T
await prisma.user.delete({ where: { id } });

// ✅ DO
await prisma.user.update({
  where: { id },
  data: { deleted_at: new Date() },
});
```

---

### 3.2 — All user queries must exclude soft-deleted records.

**Why:** A soft-deleted user should be invisible to all application logic.

```ts
// ❌ DON'T — may return a deleted user
const user = await prisma.user.findUnique({ where: { id } });

// ✅ DO — always filter out soft-deleted records
const user = await prisma.user.findFirst({ where: { id, deleted_at: null } });
```

Add a Prisma middleware in `src/lib/prisma.ts` to enforce `deleted_at: null` globally on all `findUnique`, `findFirst`, and `findMany` calls on the `User` model. This is the safety net — explicit filters in repository methods are still required as documentation.

---

### 3.3 — Bookings and payment records are never deleted. Not soft-deleted, not hard-deleted.

**Why:** Indian tax law requires retention of financial records for 6–8 years. These records must outlive the user account.

---

### 3.4 — S3 documents are hard-deleted 7 days after account soft-deletion via a scheduled job.

The 7-day window allows for accidental-deletion recovery. The scheduled job reads users where `deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days'` and deletes their S3 objects.

---

## 4. Migration Conventions

### 4.1 — Migration names must be descriptive and operation-specific.

**Why:** `npx prisma migrate dev --name add_something` generates a timestamped file. The name must make the purpose obvious when scanning the `prisma/migrations/` directory.

```bash
# ❌ DON'T
npx prisma migrate dev --name update
npx prisma migrate dev --name changes
npx prisma migrate dev --name migration1

# ✅ DO
npx prisma migrate dev --name add_booking_documents_table
npx prisma migrate dev --name add_admin_note_to_bookings
npx prisma migrate dev --name add_soft_delete_to_users
npx prisma migrate dev --name add_unique_constraint_razorpay_payment_id
```

---

### 4.2 — Never modify an existing migration file. Create a new one.

**Why:** Modifying a migration that has already been applied to any environment causes the migration state to diverge, which breaks `prisma migrate deploy`.

---

### 4.3 — Use `prisma migrate dev` in development. Use `prisma migrate deploy` in staging and production.

```bash
# Development (creates migration files + applies)
npx prisma migrate dev

# Staging / Production (applies existing migrations only — never creates new ones)
npx prisma migrate deploy
```

---

### 4.4 — Never use `prisma db push` in staging or production.

**Why:** `db push` updates the schema without creating a migration file, leaving no record of the change and making it impossible to reproduce the database state.

---

### 4.5 — Commit migration files to git. Never `.gitignore` the `prisma/migrations/` directory.

---

## 5. Type Exposure

### 5.1 — Never return a raw Prisma-generated type from a repository to a service, or from a service to a controller.

**Why:** Prisma-generated types include all columns including `password_hash`, `deleted_at`, `refresh_token`, and `otp_hash`. Passing these to the API response leaks sensitive internal fields.

```ts
// ❌ DON'T — service returns the raw Prisma type
async function getUserById(id: string): Promise<User> {
  return userRepository.findById(id);
}

// ✅ DO — service maps to a DTO before returning
async function getUserById(id: string): Promise<UserDTO> {
  const user = await userRepository.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return toUserDTO(user);
}
```

---

### 5.2 — DTOs live in `src/dto/`. Each entity has its own DTO file and mapper function.

```
src/dto/
  user.dto.ts          # UserDTO type + toUserDTO()
  booking.dto.ts       # BookingDTO type + toBookingDTO()
  payment.dto.ts       # PaymentDTO type + toPaymentDTO()
```

---

### 5.3 — DTO types are strict. Every field is explicitly listed — no spread of the Prisma type.

```ts
// ❌ DON'T — spreading can accidentally include sensitive fields
export function toUserDTO(user: User): UserDTO {
  const { password_hash, otp_hash, refresh_token, ...safeFields } = user;
  return safeFields; // forgetting to destructure a new sensitive field is a silent bug
}

// ✅ DO — explicitly list every field that is safe to expose
export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    emailVerified: user.email_verified,
    createdAt: user.created_at.toISOString(),
  };
}
```

---

## 6. Pagination

### 6.1 — All list endpoints have a default limit. Unbounded queries are not allowed.

**Why:** Returning an unbounded result set is a latency and memory risk as the dataset grows.

```ts
// ❌ DON'T
const bookings = await prisma.booking.findMany({ where: { user_id: userId } });

// ✅ DO
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const bookings = await prisma.booking.findMany({
  where: { user_id: userId },
  orderBy: { created_at: 'desc' },
  skip: (page - 1) * limit,
  take: Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT),
});
```

---

### 6.2 — Paginated responses include both the data and the total count.

**Why:** The frontend needs the total count to calculate page numbers.

```ts
// ✅ DO — use a Prisma transaction to get data + count in one round trip
const [bookings, total] = await prisma.$transaction([
  prisma.booking.findMany({ where, orderBy, skip, take }),
  prisma.booking.count({ where }),
]);

return { data: bookings.map(toBookingDTO), total, page, limit };
```

---

### 6.3 — Use offset-based pagination. Cursor-based pagination is out of scope for this project.

---

## 7. Query Safety

### 7.1 — Resource ownership is enforced at the repository layer for all user-facing queries.

**Why:** Relying on the service or controller to enforce ownership creates a risk of the check being missed or bypassed. The repository is the last line of defence.

```ts
// ❌ DON'T — ownership check is optional and easy to forget
async function findById(id: string) {
  return prisma.booking.findFirst({ where: { id } }); // returns any user's booking
}

// ✅ DO — ownership is baked in when userId is available
async function findByIdAndUserId(id: string, userId: string) {
  return prisma.booking.findFirst({ where: { id, user_id: userId } });
}

// Admin lookups use a separate method that does NOT filter by userId
async function findById(id: string) {
  return prisma.booking.findFirst({ where: { id } });
}
```

---

### 7.2 — Status enum values are always typed as the Prisma-generated enum, not raw strings.

```ts
// ❌ DON'T
await prisma.booking.updateMany({ where: { status: 'draft_ready' } });

// ✅ DO
import { BookingStatus } from '@prisma/client';
await prisma.booking.updateMany({ where: { status: BookingStatus.draft_ready } });
```

---

### 7.3 — Booking status transitions are validated before the update is issued.

**Why:** The state machine defines which transitions are legal. The repository must not accept an illegal status update — that would corrupt the state machine.

```ts
// ✅ DO — in the booking service, before calling the repository
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  document_upload: ['in_review'],
  in_review: ['draft_ready'],
  draft_ready: ['filing', 'cancelled'],
  filing: ['complete'],
  complete: [],
  cancelled: [],
};

if (!ALLOWED_TRANSITIONS[booking.status].includes(newStatus)) {
  throw new ApiError(400, `Cannot transition from ${booking.status} to ${newStatus}`);
}
```

---

## 8. Index Awareness

### 8.1 — Any query used in a hot path must have a corresponding index in the Prisma schema.

The following indexes are required and must be present in `prisma/schema.prisma`:

| Column(s) | Reason |
|---|---|
| `User.email` (unique) | Login lookup |
| `Booking.user_id` | All user-scoped booking queries |
| `Booking.status` | Admin filter by status |
| `Booking.created_at` | Default sort order |
| `BookingDocument.booking_id` | Document list per booking |
| `PaymentRecord.booking_id` | Payment list per booking |
| `PaymentRecord.razorpay_payment_id` (unique) | Idempotency check |
| `PaymentRecord.razorpay_order_id` (unique) | Order-to-payment linkage |

Adding a new repository query that filters or sorts by a column not in this list requires a migration to add the index.
