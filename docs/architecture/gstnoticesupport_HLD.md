# gstnoticesupport.in — High-Level Design (HLD)

> **Document Type:** High-Level Design specification for engineering and design teams
> **Version:** 1.0
> **Status:** Locked. Ready for Low-Level Design (LLD) and UX/UI design execution.
> **Last Updated:** June 2026
> **Audience:** Frontend developers, backend developers, UX/UI designers, project lead
> **Depends On:** `gstnoticesupport_project_knowledge_base_1.md`, `gstnoticesupport_project_knowledge_base_2.md`, `Design_Blueprint_for_Trust__Credibility__Authenticity.md`

This document defines the system architecture, component boundaries, data flow patterns, and integration contracts for the gstnoticesupport.in platform. It is the bridge between requirement analysis (the knowledge bases) and detailed implementation (LLD). Every developer and designer working on this project should read this document end-to-end before starting any work.

---

## Table of Contents

1. Project Overview & Scope
2. System Architecture
3. Technology Stack
4. Deployment Topology
5. Frontend Architecture
6. Backend Architecture
7. Data Model
8. Authentication & Authorization
9. File Handling Architecture
10. Payment Architecture
11. Service Status State Machine
12. Notification Architecture
13. External Integrations
14. Security Architecture
15. Performance & SEO Architecture
16. Design System & UX Constraints
17. Error Handling & Monitoring
18. Environment Strategy
19. Out of Scope
20. Open Gaps & Future Work
21. Glossary
22. Appendix — Locked Decisions Summary

---

## 1. Project Overview & Scope

### 1.1 What We Are Building

A two-phase GST litigation services platform for Indian businesses, Chartered Accountants, and Advocates. The platform helps users respond to GST notices, file appeals before the Commissioner and the GSTAT, and prepare ASMT-10 and Show Cause Notice replies through a digital workflow backed by an offline CA/legal practice.

### 1.2 Phase Boundaries

**Phase 1 — Marketing Website (Launch: 15–16 June 2026)**

A trust-first marketing site with lead generation. No authentication. No platform functionality. The Phase 1 site exists to convert visitors into leads via Calendly demos, Contact Us form submissions, and WhatsApp redirects.

**Phase 2 — Full Platform (Launch: 5–6 July 2026)**

Adds user authentication, service booking workflow, document upload, draft delivery, payment processing, and admin dashboard. The marketing site from Phase 1 remains as the public entry point.

### 1.3 Core User Mechanic

The defining product mechanic is a draft-gated payment model. The user books a service, uploads documents, the admin manually reviews and prepares a draft PDF, the user sees that the draft is ready but locked, reads the admin's text notes summarizing the work, then either pays via Razorpay to unlock the draft or cancels. After payment, the admin files the response on the relevant government portal. The platform itself does not perform the government filing.

### 1.4 Target Users

Three primary user personas: Chartered Accountants delegating litigation work, Advocates handling adjacent legal matters, and SME business owners anxious after receiving a GST notice. All three are skeptical, professional, and treat WhatsApp as their preferred communication channel. The platform must signal institutional credibility immediately — flashy startup-coded design reduces trust with this audience.

### 1.5 Services & Pricing

Four services are bookable through the platform with fixed prices. A fifth service (Representation before Tax Authority) is consultation-based and not bookable online.

| # | Service | Price (INR) | Notes |
|---|---|---|---|
| 1 | GSTAT Appeal | 14,999 | Pre-deposit applies (paid by user to government, outside platform) |
| 2 | Commissioner Appeal | 9,999 | Pre-deposit applies (paid by user to government, outside platform) |
| 3 | Show Cause Notice Reply | 5,999 | No pre-deposit |
| 4 | ASMT-10 Reply | 2,999 | No pre-deposit |
| 5 | Representation before Tax Authority | Consultation-based | Not bookable through platform |

---

## 2. System Architecture

### 2.1 Architecture Style

The system follows a decoupled frontend-backend architecture with two independent deployments communicating over HTTPS. The frontend is a Next.js application hosted on Hostinger Business plan as a Node.js application. The backend is an Express.js API also hosted on Hostinger Business plan as a separate Node.js application under the `api.gstnoticesupport.in` subdomain. They share a PostgreSQL database hosted on NeonDB and an AWS S3 bucket for file storage.

### 2.2 High-Level System Components

The system consists of nine major components: the public marketing pages, the authenticated user dashboard, the booking workflow, the document handling subsystem, the payment subsystem, the admin dashboard, the notification subsystem, the authentication subsystem, and the external integration layer (Razorpay, Resend, Calendly, WhatsApp redirect).

### 2.3 Component Responsibilities

| Component | Responsibility |
|---|---|
| Marketing pages | Trust-first lead generation, SEO optimization, public information |
| User dashboard | Booking management, payment history, account settings |
| Booking workflow | Multi-step form, document upload, submission |
| Document handling | Pre-signed URL generation, S3 storage management, draft delivery |
| Payment subsystem | Razorpay Orders creation, webhook processing, payment verification |
| Admin dashboard | Booking review, draft upload, status management, analytics overview |
| Notification subsystem | Transactional email delivery via Resend across all lifecycle events |
| Authentication subsystem | JWT-based auth with HTTP-only cookies, OTP email verification |
| External integrations | Razorpay, Resend, Calendly, AWS S3, WhatsApp redirect |

### 2.4 Data Flow Pattern

All data access from the Next.js frontend goes through the Express backend via authenticated HTTP calls. Server Components on Next.js read the JWT cookie, forward it to the Express backend with each request, and receive JSON responses to render. The Next.js frontend does not connect directly to NeonDB. This pattern keeps authentication logic in one place and allows future mobile or partner integrations to use the same API.

---

## 3. Technology Stack

### 3.1 Frontend Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | SSR + SSG, type safety |
| Styling | Tailwind CSS | Utility-first styling aligned with design tokens |
| Forms | React Hook Form + Zod | Performant forms with shared validation schemas |
| Server state | TanStack Query | Caching, refetching, mutation handling |
| UI state | useState / useReducer | Local component state |
| Animations | Framer Motion | Micro-interactions only |
| Icons | Lucide React | Outline icon set, design-system aligned |
| Notifications | React Hot Toast | In-page toast messages |
| SEO | Next.js Metadata API, Schema.org, OG tags | Search visibility |

### 3.2 Backend Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js + Express.js + TypeScript | REST API server |
| Database | PostgreSQL on NeonDB | Serverless PostgreSQL with branching |
| ORM | Prisma | Type-safe DB access, schema migrations |
| Authentication | JWT in HTTP-only cookies | Stateless auth, XSS-resistant |
| Password hashing | bcrypt | Industry-standard password storage |
| Validation | Zod | Shared validation schemas with frontend |
| Security middleware | Helmet.js, CORS, express-rate-limit | HTTP hardening |
| Email | Resend (via SDK) | Transactional emails, OTP delivery |
| File storage | AWS S3 (private bucket) | Document and draft storage |
| Payment | Razorpay (Node SDK) | Orders API, webhook handling |

### 3.3 Tooling & Deployment

| Layer | Technology |
|---|---|
| Frontend hosting | Hostinger Business plan (Node.js app, `gstnoticesupport.in`) |
| Backend hosting | Hostinger Business plan (Node.js app, `api.gstnoticesupport.in`) |
| Version control | Git + GitHub |
| Linting | ESLint |
| Formatting | Prettier |
| Local dev server | Nodemon (backend) |
| CDN + WAF | Cloudflare (post-development) |
| Error monitoring | Sentry (before production launch) |

---

## 4. Deployment Topology

### 4.1 Environments

Three environments are provisioned for the project lifecycle:

| Environment | Purpose | Frontend | Backend | Database |
|---|---|---|---|---|
| Development | Local development | localhost:3000 | localhost:4000 | NeonDB dev branch |
| Staging | Pre-production testing | staging.gstnoticesupport.in | api-staging.gstnoticesupport.in | NeonDB staging branch |
| Production | Live customer-facing | gstnoticesupport.in | api.gstnoticesupport.in | NeonDB main branch |

NeonDB branching is used to create the staging database from the production schema without duplicating infrastructure.

### 4.2 Domain Architecture

The frontend is served from `gstnoticesupport.in` (apex) and the backend from `api.gstnoticesupport.in` (subdomain). This split allows independent deployment, independent scaling, and clean CORS configuration. Both deployments live on Hostinger Business plan as separate Node.js applications managed through hPanel.

### 4.3 CORS Configuration

The Express backend allows requests from the configured frontend origin only. CORS is configured per environment so that the staging backend accepts requests from the staging frontend, and production accepts production. Credentials (cookies) must be allowed in CORS configuration because authentication relies on HTTP-only cookies sent across origins.

### 4.4 Cookie Domain Strategy

The JWT cookie is set with `Domain=.gstnoticesupport.in`, `Secure`, `HttpOnly`, and `SameSite=Lax`. This allows the cookie to be sent from the frontend domain to the backend subdomain. In development, the cookie domain is left unset so it works with localhost.

### 4.5 CDN & DNS

Cloudflare sits in front of both the frontend and the backend at the DNS layer. SSL/TLS mode is "Full (strict)". Cloudflare provides DDoS protection, basic WAF, and edge caching for static assets. Razorpay's published IP ranges are added to a Cloudflare WAF allow rule before going live to ensure webhook delivery is never blocked.

### 4.6 CI/CD

Deployments are triggered manually via Hostinger hPanel. On each production release: SSH into the server, pull the latest code from the `main` branch, run `npm run build` (frontend) or compile TypeScript (backend `dist/`), then restart the Node.js application through hPanel. The hPanel Node.js manager handles process lifecycle and auto-restart on crashes or server reboots. No automated CI/CD pipeline is in place at launch.

---

## 5. Frontend Architecture

### 5.1 Next.js App Router Structure

The application uses Next.js App Router (not Pages Router). Routes are file-system-based under the `app/` directory. The structure separates public routes from authenticated routes using a route group:

```
app/
  (public)/
    page.tsx                 # Homepage
    services/[slug]/page.tsx # Service pages
    pricing/page.tsx
    about/page.tsx
    contact/page.tsx
    faq/page.tsx
    terms/page.tsx
    privacy/page.tsx
  (auth)/
    login/page.tsx
    signup/page.tsx
    verify-otp/page.tsx
    forgot-password/page.tsx
  (dashboard)/
    dashboard/page.tsx
    dashboard/services/page.tsx
    dashboard/services/[id]/page.tsx
    dashboard/services/[id]/draft/page.tsx
    dashboard/payments/page.tsx
    dashboard/settings/page.tsx
  (admin)/
    admin/page.tsx
    admin/bookings/page.tsx
    admin/bookings/[id]/page.tsx
  payment/
    verify/page.tsx
```

### 5.2 Rendering Strategy

Each route uses the rendering strategy appropriate for its content:

| Route Group | Rendering | Why |
|---|---|---|
| Marketing pages | SSG | Static content, maximum SEO and speed |
| Auth pages | SSR | Dynamic but no per-user data |
| Dashboard pages | SSR (Server Components) | Per-user data, auth-gated |
| Admin pages | SSR (Server Components) | Per-user data, role-gated |
| Payment verify | SSR | Receives query params from Razorpay redirect |

### 5.3 Server Components vs Client Components

All dashboard and admin routes default to Server Components. Server Components read the JWT cookie via `cookies()` from `next/headers`, call the Express backend over HTTPS, and render with data already present. The user never sees a loading flash, and no sensitive data ever enters the client bundle.

Client Components are used only for interactive elements: the Razorpay modal trigger, the document upload component, the cancel confirmation dialog, form inputs, and any element using browser APIs. Each Client Component is marked with `'use client'` at the top.

### 5.4 State Management

The application has two kinds of state, managed separately:

- Server state (bookings, payment records, user info) is fetched via TanStack Query in Client Components or via direct HTTP calls in Server Components.
- UI state (dialog open/closed, upload progress, active step in booking flow, active tab) is managed with `useState` or `useReducer` inside the relevant Client Component.

No Redux. No global state library. TanStack Query handles all caching and refetching needs.

### 5.5 Forms

Every form uses React Hook Form for state management and Zod for validation. Zod schemas are defined once in a shared module and imported by both the frontend (for client-side validation) and the backend (for server-side validation). This eliminates the risk of validation drift between layers.

### 5.6 SEO

The marketing pages use Next.js Metadata API for titles, descriptions, Open Graph tags, and Twitter cards. Each service page generates structured data (Schema.org `Service` and `Organization` types) for rich search results. A `sitemap.xml` and `robots.txt` are generated at build time. All marketing pages are statically generated for maximum performance.

### 5.7 Responsive Design

The application is mobile-first responsive across all breakpoints. Tailwind's default breakpoints are used: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px). The booking flow, document upload, and dashboard are optimized for both desktop and mobile usage. No separate mobile app is built — the responsive web app serves both surfaces.

---

## 6. Backend Architecture

### 6.1 Express Server Structure

The backend is a single Express.js application written in TypeScript. The structure follows a controller-service-repository pattern:

```
src/
  routes/          # Route definitions (auth, bookings, payments, admin)
  controllers/     # Request handlers
  services/        # Business logic
  repositories/    # Prisma queries
  middleware/      # Auth, validation, rate limiting, error handling
  schemas/         # Zod schemas (shared with frontend)
  lib/             # Utilities (JWT, bcrypt, S3 SDK, Razorpay SDK)
  config/          # Environment config loading
  index.ts         # Server entry point
```

### 6.2 Request Flow

A typical authenticated request flows through middleware in this order: CORS → Helmet → body parser (or raw for webhooks) → cookie parser → rate limiter (if applicable) → JWT verification → role check (if applicable) → Zod validation → controller → service → repository → Prisma → database. The response flows back through the same chain in reverse, ending with JSON serialization.

### 6.3 Critical Middleware Configuration

Several middleware configurations require special handling and must not be misconfigured:

The Razorpay webhook route (`/webhooks/razorpay`) must use `express.raw({ type: 'application/json' })` as middleware, NOT `express.json()`. The HMAC signature is computed over the raw request body. If the body is parsed to JSON first, signature verification fails permanently.

The CORS middleware must set `credentials: true` and an explicit `origin` (not wildcard `*`) so that HTTP-only cookies are transmitted across origins.

Rate limiting is applied per-route, not globally. The Razorpay webhook is explicitly excluded from rate limiting.

### 6.4 Error Handling

A centralized error handling middleware catches all errors thrown in controllers and services. Errors are classified into operational errors (validation failures, not found, unauthorized) and programmer errors (bugs). Operational errors return appropriate HTTP status codes with user-safe messages. Programmer errors return a generic 500 response and are logged for investigation.

### 6.5 Logging

During development and testing, all logging is via `console.log`, `console.error`, and `console.warn`. On Hostinger, these are captured as `console.log` (stdout) and `stderr.log` (stderr) files in each application's directory, accessible via SSH or hPanel's file manager. Before production launch, Sentry is integrated for error tracking, performance monitoring, and alerting on production incidents.

### 6.6 Rate Limiting

The `express-rate-limit` middleware is applied to five specific endpoints to prevent abuse:

| Endpoint | Window | Max requests |
|---|---|---|
| POST /auth/send-otp | 15 minutes | 5 per IP |
| POST /auth/forgot-password | 15 minutes | 5 per IP |
| POST /auth/login | 15 minutes | 10 per IP |
| POST /contact | 60 minutes | 3 per IP |
| POST /bookings/:id/draft-url | 60 minutes | 20 per user |

---

## 7. Data Model

### 7.1 Core Entities

The database has six core entities. Each entity is described at a logical level here; column-level details are deferred to LLD.

**User** — represents an authenticated user of the platform. Contains identity fields (name, email, phone), authentication fields (hashed password, email verified flag, role), profile fields (services interested), and audit fields (created at, soft deleted at). Email is unique.

**Booking** — represents one service booking made by a user. Contains foreign key to user, service type, booking-time personal info (re-entered every booking, not auto-filled from user profile), GST number, organization name, "filing for self/client" flag, current status, admin notes, and audit fields.

**BookingDocument** — represents one uploaded document attached to a booking. Contains foreign key to booking, document type (one of the service-specific document categories), S3 object key, original filename, file size, upload timestamp.

**Draft** — represents the admin-uploaded draft PDF for a booking. Contains foreign key to booking, S3 object key, uploaded by (admin user ID), uploaded at, replaced at (nullable, for tracking re-uploads).

**PaymentRecord** — represents one Razorpay payment attempt for a booking. Contains foreign key to booking, Razorpay order ID, Razorpay payment ID (unique constraint — this enforces idempotency), amount, currency, status, signature, created at, processed at. The unique constraint on `razorpay_payment_id` is the foundation of payment idempotency and must not be removed.

**ContactSubmission** — present only if the Phase 1 contact form is later moved into the database. For Phase 1 launch, contact form data is emailed only and is not stored. This entity is reserved for future expansion.

### 7.2 Relationships

A User has many Bookings. A Booking belongs to one User. A Booking has many BookingDocuments and zero or one Draft. A Booking has many PaymentRecords (multiple Razorpay attempts may exist for one booking, only one with `status = captured` is the successful one). The unique constraint on `PaymentRecord.razorpay_payment_id` prevents double-recording the same successful payment.

### 7.3 Indexes

LLD will define exact indexes. At minimum, the following indexes are required for query performance: `User.email` (unique), `Booking.userId`, `Booking.status`, `Booking.createdAt`, `BookingDocument.bookingId`, `PaymentRecord.bookingId`, `PaymentRecord.razorpayPaymentId` (unique).

### 7.4 Soft Delete Strategy

User records are soft-deleted by setting a `deletedAt` timestamp rather than removing the row. Bookings and PaymentRecords associated with a deleted user are retained for legal and audit purposes (Indian tax law generally requires retention of financial records for 6 to 8 years). S3 documents associated with the user are hard-deleted 7 days after the account deletion request. This 7-day window allows for accidental deletion recovery if the user contacts support.

---

## 8. Authentication & Authorization

### 8.1 Authentication Mechanism

The platform uses stateless JWT authentication delivered via HTTP-only cookies. On successful login, the backend signs a JWT containing the user ID, role, and email; sets it as an HTTP-only, Secure, SameSite=Lax cookie scoped to `.gstnoticesupport.in`; and returns a success response. The frontend never sees or stores the JWT directly — the browser automatically includes the cookie on subsequent requests.

### 8.2 Signup Flow

The user enters name, email, and password on the signup page. The backend creates a User record with `emailVerified = false`, hashes the password with bcrypt, generates a 6-digit numeric OTP, stores the OTP with a 10-minute expiry, and sends the OTP to the user's email via Resend. The user enters the OTP on the verification page. On successful verification, `emailVerified` is set to `true`, the JWT cookie is issued, and the user is prompted to complete their profile with phone number and services interested.

### 8.3 Login Flow

The user enters email and password. The backend looks up the user by email, verifies the password with bcrypt, checks that `emailVerified` is true, signs the JWT, and sets the cookie. The user is redirected to the dashboard.

### 8.4 Forgot Password Flow

The user enters their email. The backend generates a 6-digit OTP, stores it with a 10-minute expiry, and emails it via Resend. The user enters the OTP and a new password. The backend verifies the OTP, hashes the new password, updates the user record, and signs a fresh JWT.

### 8.5 Role Model

There are two roles: `user` and `admin`. The default role on signup is `user`. The admin role is assigned manually via a direct database update — there is no admin promotion UI. The single admin model is locked for Phase 2; multi-admin support is deferred to future scope.

### 8.6 Authorization Checks

Every authenticated route on the backend performs authorization in three layers: (1) JWT signature verification (is this token valid), (2) role check where required (is this user an admin for admin routes), and (3) resource ownership check where applicable (does this booking belong to this user). Resource ownership is enforced in the repository layer to prevent cross-user data access — for example, fetching a booking by ID always includes `WHERE userId = currentUser.id` unless the request is from an admin.

### 8.7 Session Lifecycle

JWTs are signed with a 7-day expiration. The cookie expires when the JWT expires. There is no separate refresh token mechanism at launch — the user re-logs in after expiry. Logout clears the cookie immediately on the server side and the client side. No server-side session store is used; the JWT is self-contained.

---

## 9. File Handling Architecture

### 9.1 Storage Layer

All user-uploaded documents and admin-uploaded draft PDFs are stored in a single private AWS S3 bucket. The bucket has no public access. All access is mediated by short-lived pre-signed URLs generated by the backend.

### 9.2 Upload Pattern

Files are uploaded directly from the user's browser to S3 using pre-signed PUT URLs. The flow:

1. User selects a file in the browser
2. Frontend sends file metadata (name, size, type) to backend at `POST /bookings/:id/upload-url`
3. Backend verifies: user is authenticated, booking belongs to user, booking is in a valid state for upload, file count under 8, file size under 5 MB, total size under 40 MB, file type is PDF
4. Backend generates a pre-signed PUT URL valid for 5 minutes, scoped to a specific S3 key
5. Backend returns the URL to the frontend along with the S3 key
6. Frontend uploads the file directly to S3 using the pre-signed URL
7. Frontend confirms upload by calling `POST /bookings/:id/confirm-upload` with the S3 key
8. Backend creates a BookingDocument record referencing the S3 key

Multer is not used. Files never pass through the Express server. This pattern keeps the backend memory footprint small and removes the bandwidth cost of proxying file uploads.

### 9.3 File Constraints

| Constraint | Value |
|---|---|
| Allowed file type | PDF only |
| Maximum file size | 5 MB |
| Maximum files per booking | 8 |
| Maximum total upload size | 40 MB |
| Pre-signed upload URL expiry | 5 minutes |

These constraints are enforced both at the pre-signed URL generation step (backend refuses to issue a URL for an oversized file) and by the S3 bucket policy (Content-Length range constraint on the pre-signed URL).

### 9.4 Draft Delivery Pattern

After the user pays for a booking, the draft PDF is delivered via a short-lived pre-signed GET URL. The flow:

1. User navigates to `/dashboard/services/[id]/draft`
2. Server Component verifies: user is authenticated, booking belongs to user, status is `Filing` or `Complete`
3. Backend generates a pre-signed GET URL valid for 15 minutes
4. Frontend opens an in-browser PDF viewer using the URL
5. Within the 15-minute window, the URL allows unlimited downloads
6. After 15 minutes, the URL is dead; a fresh URL must be generated by navigating to the page again

The signed URL is never stored on the client beyond the 15-minute window. The URL is generated fresh on each page load — it is never accepted as a query parameter.

### 9.5 Draft Re-Upload by Admin

While booking status is `Draft Ready` (after admin uploads the draft, before user pays), the admin can re-upload a replacement draft. The new file replaces the existing S3 object, the Draft record's `uploadedAt` is updated, and a notification email is sent to the user: "Your draft has been updated. Please review the latest version." Status remains `Draft Ready`.

Once the booking transitions to `Filing` (payment confirmed), the admin re-upload action is disabled. The draft is final at the point of payment. If a wrong draft is paid for, recovery happens offline via WhatsApp or email — there is no platform-level recovery action in Phase 2.

### 9.6 S3 Lifecycle Policy

Draft PDFs and user documents are not automatically deleted. They are retained as long as the booking record exists. When a user account is soft-deleted, the associated S3 objects are hard-deleted after 7 days via a scheduled job. The 7-day grace period allows for account recovery in case of accidental deletion.

---

## 10. Payment Architecture

### 10.1 Razorpay Integration Choice

The platform uses the Razorpay Orders flow rather than Payment Links. Orders provide a clean linkage between an internal booking record and a Razorpay payment, which is essential for idempotency, signature verification, and reliable status reconciliation.

### 10.2 Three-Layer Reliability Architecture

Payment reliability is built on three independent layers. Any one of them can confirm a payment; idempotency ensures double-processing never happens.

**Layer 1 — Webhook (primary).** Razorpay fires a webhook to `POST /webhooks/razorpay` when a payment is captured. The backend verifies the HMAC-SHA256 signature on the raw request body using the webhook secret. If verification fails, the request is rejected immediately with no processing. If it succeeds, the backend checks whether the `razorpay_payment_id` already exists in the PaymentRecord table. If it exists, the response is HTTP 200 and no further action is taken. If it does not exist, the backend transitions the booking to `Filing` status, records the payment, and sends confirmation emails to the user and admin.

**Layer 2 — Verification Page (fallback).** After the user completes or abandons the Razorpay modal, the user is redirected to `/payment/verify` with the `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` as query parameters. The Server Component on this page verifies the signature, calls the Razorpay Fetch Payment API to confirm the payment status, applies the idempotency check, and either transitions the booking (if the webhook has not arrived) or skips processing (if the webhook has already done it). The user is then redirected to the service detail page with a success or failed banner.

**Layer 3 — Admin Manual Override (safety net).** If a webhook fails persistently and the verification page also fails (rare), an admin can manually mark a booking as paid. The admin enters the `razorpay_payment_id` from the Razorpay dashboard. The backend calls the Razorpay Fetch Payment API to confirm the payment is genuinely captured before transitioning. The admin cannot fabricate a payment — Razorpay's API is the source of truth.

### 10.3 Payment Verification Page

The `/payment/verify` page is a dedicated route without navbar or footer. It has four outcomes:

| Outcome | Behavior |
|---|---|
| Verified | Redirect to `/dashboard/services/[id]?payment=success` with green banner |
| Failed | Redirect to `/dashboard/services/[id]?payment=failed` with neutral banner |
| Inconclusive | Stay on page, show WhatsApp link with pre-filled booking ID |
| Tampered | Stay on page, show invalid link message, no processing |

A 10-second timeout on the loading state ensures the user never sees an infinite spinner.

### 10.4 Idempotency Implementation

The PaymentRecord table has a unique constraint on `razorpay_payment_id`. Every layer that processes a payment first checks if this ID already exists. If it exists, processing is skipped and a success response is returned. If it does not exist, processing proceeds and the record is inserted atomically. This pattern prevents double-transition and double-emails regardless of which layer fires first or how many times.

### 10.5 Pre-Deposit Disclosure

For Service 1 (GSTAT Appeal) and Service 2 (Commissioner Appeal), a statutory government pre-deposit is required. This pre-deposit is paid directly by the user to the government, outside the platform. The platform does not track, calculate, or facilitate the pre-deposit.

Pre-deposit disclosure appears at four mandatory points: (1) the pricing page and service cards for Services 1 and 2, (2) the booking flow Step 1 when Service 1 or 2 is selected, (3) the Draft Ready email for these services, and (4) the Pay to Unlock screen before the Razorpay modal opens. The percentage is never stated; only "as per GST Act" is referenced, with the specific amount communicated by the admin in the booking notes for each case.

---

## 11. Service Status State Machine

### 11.1 States

A booking moves through a defined sequence of states. Each state has specific transition rules and side effects.

| State | Entry Trigger | Triggered By |
|---|---|---|
| Document Upload | Booking submitted | Automatic (system) |
| In Review | Admin starts work on case | Manual (admin) |
| Draft Ready | Admin uploads draft PDF | Automatic (on upload) |
| Filing | Payment confirmed | Automatic (webhook / verify page) |
| Complete | Admin finishes filing | Manual (admin) |
| Cancelled | User cancels at Draft Ready | Manual (user) |

### 11.2 Transition Rules

The following transitions are allowed:

- `Document Upload → In Review` (admin action)
- `In Review → Draft Ready` (admin uploads draft, automatic)
- `Draft Ready → Filing` (payment confirmed, automatic)
- `Draft Ready → Cancelled` (user cancels)
- `Filing → Complete` (admin action)

The following are not allowed in Phase 2:

- Admin-initiated cancellation from any state (deferred to future)
- Reverting from `Filing` back to `Draft Ready` (the draft is final at payment)
- Cancellation from `Document Upload` or `In Review` (deters non-serious users)

### 11.3 State Reflection

Every status change is reflected immediately on both the user dashboard and the admin dashboard. Status changes trigger emails per the notification matrix.

---

## 12. Notification Architecture

### 12.1 Notification Channel

All notifications are email-only via Resend. WhatsApp is a redirect-only button on the public site — there is no API automation for WhatsApp.

### 12.2 Notification Matrix

| Event | User | Admin |
|---|---|---|
| Signup OTP | Yes | No |
| Forgot password OTP | Yes | No |
| New booking submitted | Yes | Yes |
| Status: In Review | Yes | No |
| Status: Draft Ready (draft uploaded) | Yes | No |
| Status: Draft updated (re-upload) | Yes | No |
| Payment confirmed | Yes | Yes |
| Failed payment attempt | No | Yes |
| User cancels service | Yes | Yes |
| Status: Complete | Yes | No |
| User account created | No | Yes |
| User account deleted | Yes | Yes |
| Calendly demo booked | Yes (Calendly direct) | Yes (Calendly direct) |
| Contact Us form submitted | No | Yes |

### 12.3 Email Template Strategy

Email templates are code-based, written using React Email (or equivalent JSX-based template library). Templates live in the backend repository alongside the route handlers that send them. Each template receives typed props (booking ID, user name, status, etc.) and renders to HTML.

For Phase 2 launch, templates are basic HTML with brand colors (navy + green palette) and minimal styling. Template refinement happens post-launch through code edits, not through a dashboard. A template change is a code change, committed to git, and deployed.

### 12.4 Sender Configuration

Resend is configured with a verified sending domain (`gstnoticesupport.in`). All emails are sent from a single address such as `support@gstnoticesupport.in`. SPF, DKIM, and DMARC records are configured at the domain registrar to ensure high deliverability.

---

## 13. External Integrations

### 13.1 Integration Inventory

| Integration | Purpose | Type | Phase |
|---|---|---|---|
| Razorpay | Payment processing | API + webhook | 2 |
| Resend | Transactional email | API | 1, 2 |
| AWS S3 | File storage | API (SDK) | 2 |
| Calendly | Demo booking | Embedded widget | 1 |
| WhatsApp | Chat redirect | URL only | 1, 2 |
| Cloudflare | CDN + WAF | DNS + dashboard config | Post-launch |
| Google Analytics | Traffic analytics | Client-side script | 1 |
| Google Search Console | SEO monitoring | DNS verification | 1 |

### 13.2 Calendly Integration

Calendly is embedded as a popup widget on the public site. When a user books a demo, Calendly handles the entire flow: it sends confirmation emails to both the user and the configured admin/host. No backend integration is implemented in Phase 1 — Calendly's email delivery is the only output. A future webhook integration to record demo bookings in the database is deferred.

### 13.3 WhatsApp Integration

WhatsApp is integrated only as a "click to chat" button using the `wa.me` URL scheme with a pre-filled message. There is no WhatsApp Business API integration. There are no automated WhatsApp notifications. The button appears on the public site (sticky on mobile, header on desktop) and optionally on the dashboard for support contact.

### 13.4 Razorpay Webhook Configuration

The Razorpay webhook URL is `https://api.gstnoticesupport.in/webhooks/razorpay`. The webhook secret is stored in environment variables on the backend. The webhook is subscribed to the `payment.captured` and `payment.failed` events. Webhook signature verification is mandatory before any processing.

### 13.5 AWS S3 Bucket Configuration

A single S3 bucket is provisioned in the `ap-south-1` (Mumbai) region for low-latency access from India. The bucket has all public access blocked. CORS is configured to allow PUT requests from the frontend origin only. Server-side encryption is enabled with S3-managed keys (SSE-S3). No public bucket policy.

---

## 14. Security Architecture

### 14.1 Transport Security

All traffic uses HTTPS in production and staging. Cloudflare provides automatic TLS certificates for the apex domain. Hostinger provides SSL certificates for the origin server for both the frontend and backend. SSL/TLS mode in Cloudflare is set to "Full (strict)" so the connection is encrypted on both legs: user-to-Cloudflare and Cloudflare-to-origin.

### 14.2 Authentication Security

JWTs are stored in HTTP-only cookies, never in `localStorage` or `sessionStorage`. This prevents XSS-based token theft. Passwords are hashed with bcrypt at cost factor 12. Plain passwords are never stored or logged. OTPs are time-bound (10 minutes) and single-use (deleted on successful verification).

### 14.3 Payment Security

Razorpay webhooks are verified using HMAC-SHA256 signature on the raw request body. Unsigned or tampered webhooks are rejected immediately. The Razorpay webhook secret is stored in environment variables, never committed to git. Payment IDs from query parameters (on the `/payment/verify` page) are also signature-verified before any processing.

### 14.4 File Upload Security

Files are uploaded directly from browser to S3 via pre-signed URLs. The pre-signed URL is scoped to a specific S3 key, has a 5-minute expiry, and includes a Content-Length range constraint to prevent oversized uploads. Only PDF files are accepted. The backend never trusts client-reported file metadata as authoritative — S3 enforces the constraints.

### 14.5 Document Access Security

Draft PDFs are served via pre-signed GET URLs with a 15-minute expiry. Authorization is checked at the URL generation step (user must be authenticated, must own the booking, booking must be in `Filing` or `Complete` status). The URL allows unlimited downloads within the 15-minute window — this is acceptable for the audience (professional services users, not adversarial). After 15 minutes, the URL is permanently invalid.

### 14.6 Input Validation

All API request bodies are validated with Zod schemas at the controller level. Validation failures return HTTP 400 with a structured error response. SQL injection is prevented by using Prisma's parameterized queries — raw SQL is never used.

### 14.7 HTTP Hardening

The Helmet.js middleware is applied globally on the backend, setting security headers including Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, and Content-Security-Policy. CORS is configured with explicit allowed origins.

### 14.8 Rate Limiting

See Section 6.6 for the full rate limiting matrix. Rate limiting is applied to authentication endpoints, the contact form, and signed URL generation. The Razorpay webhook is explicitly excluded.

### 14.9 Cloudflare Protection

Cloudflare provides DDoS protection, basic WAF rules, and IP reputation filtering at the DNS edge. Razorpay IP ranges are added to a WAF allow rule before going live. Bot detection is enabled in monitoring mode initially; aggressive blocking is configured only after observing legitimate traffic patterns.

### 14.10 Sensitive Data in URLs

No personally identifiable information, document content, or session tokens are ever placed in URL query parameters. This applies to all redirects, all email links, and all third-party integrations.

---

## 15. Performance & SEO Architecture

### 15.1 Performance Targets

| Metric | Target | Measured on |
|---|---|---|
| First Contentful Paint | < 1.5s | 4G mobile |
| Largest Contentful Paint | < 2.5s | 4G mobile |
| Total Blocking Time | < 200ms | 4G mobile |
| Initial JS bundle | < 200KB | Production build |
| Per-image size | < 100KB | WebP format |

### 15.2 Rendering Strategy for Performance

Marketing pages are statically generated at build time. Static HTML is served from Hostinger's server with Cloudflare's CDN caching in front, ensuring fast response times. Dashboard pages are server-rendered per request, with the rendering happening on the Hostinger server alongside the backend for low-latency data access.

### 15.3 Image Optimization

All images use Next.js's built-in `<Image>` component with automatic WebP conversion, responsive sizing, and lazy loading. Hero images use `priority` to bypass lazy loading. Photographs of team members and office imagery (Phase 2 content) are served at multiple resolutions for retina displays.

### 15.4 Code Splitting

Next.js automatically code-splits per route. Heavy client-side libraries (Razorpay SDK, PDF viewer) are loaded only on the pages that need them. Framer Motion is loaded only on the pages with micro-animations. No global heavy imports.

### 15.5 SEO Foundations

Each marketing page has a unique title, meta description, and canonical URL. Structured data uses Schema.org `Service`, `Organization`, and `FAQPage` types where applicable. Open Graph and Twitter Card metadata are present on every page. A `sitemap.xml` is generated at build time and submitted to Google Search Console. A `robots.txt` allows crawling of public pages and disallows crawling of `/dashboard`, `/admin`, and `/payment` routes.

### 15.6 SEO Targeting

Target keywords align with the service catalog: "GST notice reply", "GSTAT appeal", "Commissioner appeal GST", "DRC-01 reply", "ASMT-10 reply", "GST litigation services India", and long-tail variants. Each service page targets one primary keyword in the H1 and meta tags.

---

## 16. Design System & UX Constraints

### 16.1 Three Design Principles

The entire design execution is governed by three principles, in priority order:

**First impression matters.** The above-the-fold experience on the homepage must immediately communicate institutional credibility. The navy + green + neutral palette signals authority and "safe to proceed" — patterns familiar from GSTN, MCA, and ICAI portals. The H1 headline names the user's exact problem in the first three words ("GST Notice? Get Expert Legal Support in 24 Hours.").

**Reduce cognitive load.** Every screen presents one primary decision at a time. The booking flow shows only the documents required for the selected service, never all possible documents. The pricing section highlights one "Most Popular" tier to remove decision burden. The pre-deposit is shown as a separate line item, never as a footnote.

**Use micro animations purposefully.** Three specific places use motion: the booking step progress indicator (300ms ease-out transition between steps), the document upload confirmation (file icon slide + checkmark replacement), and the Pay-to-Unlock to draft reveal (lock icon animating to unlocked state). No scroll-triggered animations, no parallax, no entrance animations on marketing pages — these read as startup-coded and erode professional trust.

### 16.2 Color Palette

| Token | Hex | Use |
|---|---|---|
| primary-navy | #0A2540 | Headings, navbar, primary text |
| primary-deep-blue | #1B3A6B | Section backgrounds |
| accent-green | #0B8B4E | Primary CTAs, success states |
| accent-green-hover | #0A7A45 | CTA hover |
| warning-amber | #D97706 | Deadline / attention |
| neutral-white | #FFFFFF | Background |
| neutral-50 | #F7F9FC | Alternating section background |
| neutral-200 | #E5E9F0 | Borders, dividers |
| neutral-600 | #5A6878 | Secondary body text |
| neutral-900 | #0F172A | Primary body text |

Forbidden colors: pure red (`#FF0000`), bright yellow, neon colors, and black backgrounds. These trigger associations with tax errors, sales pages, startup aesthetics, and crypto scams respectively.

### 16.3 Typography

Heading font: Inter or Manrope at weight 700. Body font: Inter at weight 400. Monospace font: JetBrains Mono for reference numbers (CIN, GST registration numbers). Type scale follows the design blueprint: H1 48px desktop / 32px mobile, H2 36px / 28px, H3 24px, body 16px (never smaller — readability is a trust signal).

Forbidden fonts: script, decorative, condensed, slab serifs. These signal startup or creative agency, not professional services.

### 16.4 Spacing & Layout

The grid uses an 8px base unit. Vertical spacing between major sections is a minimum of 80px on desktop and 48px on mobile. Card border radius is 12px; button and input border radius is 8px. No pill shapes — they read as consumer apps.

### 16.5 Iconography

Outline icons at 1.5px stroke, sourced from Lucide React. No 3D icons, no gradient icons, no emoji as UI elements. Icons are decorative supplements to text labels, never replacements.

### 16.6 Forbidden UI Patterns

The following patterns are explicitly prohibited because they erode trust with this audience: scrolling tickers for testimonials or awards, countdown timers, fake notification badges ("3 people viewing now"), pop-ups within the first 30 seconds, stock photos of Western businesspeople, auto-play videos with sound, guarantee language ("Guaranteed win"), and chatbots without a human handoff option.

### 16.7 Mobile-First Patterns

Phone number is visible at all times (header on desktop, sticky bar on mobile). WhatsApp floating button appears after first scroll on mobile. Document upload supports camera capture as the primary option on mobile (users will photograph notices). All tap targets are at least 48 pixels. The sticky bottom bar on mobile contains a Call button and a Book Service button.

### 16.8 Trust Signal Requirements

The footer displays company legal name, full physical office address, grievance officer name and email, and Privacy Policy / Terms / (absence of) Refund Policy links. CIN and GSTIN are added once the company is officially registered (not present at launch — see Open Gaps). The team section is redesigned to convey credibility without individual names or registration numbers, due to CA regulatory constraints on public disclosure of individual credentials.

---

## 17. Error Handling & Monitoring

### 17.1 Error Classification

Errors are classified into three categories:

- **Operational errors** — expected failures such as validation errors, not-found, unauthorized. These return appropriate HTTP status codes (400, 401, 403, 404) with user-safe messages.
- **Integration errors** — failures in third-party services (Razorpay timeout, Resend bounce, S3 upload failure). These are logged with context and either retried automatically or surfaced to the user with a recovery action.
- **Programmer errors** — bugs, null reference exceptions, unexpected states. These return HTTP 500 with a generic message and are logged for investigation. Stack traces are never exposed to users.

### 17.2 Monitoring Phases

During development and testing, errors are logged to the console and captured in `console.log` / `stderr.log` files in the Hostinger application directory, accessible via SSH. This is sufficient for the development phase.

Before production launch, Sentry (or an equivalent service) is integrated. Sentry captures uncaught exceptions, monitors performance metrics, and alerts on production incidents. Source maps are uploaded to Sentry to enable readable stack traces. PII is scrubbed from error reports.

### 17.3 Critical Error Paths

Several error paths require explicit handling rather than defaulting to a 500:

| Error Scenario | Handling |
|---|---|
| Razorpay webhook signature invalid | Reject with 400, no logging of payload |
| Razorpay API call fails on /payment/verify | Show inconclusive state with WhatsApp link |
| S3 upload failure during booking | Allow retry, do not delete partial booking |
| Resend email send failure | Log error, do not block the user action |
| NeonDB connection timeout | Retry once, then return 503 with friendly message |
| OTP rate limit exceeded | Return 429 with "Try again in X minutes" message |

### 17.4 Logging Conventions

Each log entry includes a timestamp, log level (info, warn, error), request ID (for tracing), user ID (if authenticated), and the event context. Sensitive data (passwords, OTPs, JWT tokens, full email contents) is never logged.

---

## 18. Environment Strategy

### 18.1 Three Environments

| Environment | URL | Purpose | Database |
|---|---|---|---|
| Development | localhost | Local development | NeonDB dev branch |
| Staging | staging.gstnoticesupport.in | Pre-production testing | NeonDB staging branch |
| Production | gstnoticesupport.in | Live customer-facing | NeonDB main branch |

### 18.2 Environment Variables

Each environment has its own set of environment variables, never committed to git. Production secrets (Razorpay live keys, Resend API key, AWS credentials, JWT signing secret) are stored in Hostinger hPanel's environment variable configuration for each Node.js application. Development secrets are stored in `.env.local` files, included in `.gitignore`.

### 18.3 Razorpay Mode

Development and staging use Razorpay test mode (test API keys, test cards). Production uses Razorpay live mode. The mode is determined entirely by which API key is loaded from environment variables.

### 18.4 Promotion Path

Code changes flow: feature branch → pull request to `staging` → manual deploy to staging via SSH (`git pull` + build + hPanel restart) → manual testing → pull request to `main` → manual deploy to production the same way. No code reaches production without passing through staging first.

### 18.5 Database Migrations

Prisma migrations are version-controlled and applied automatically on deployment. Staging applies migrations against the staging database; production applies against the production database. NeonDB's branching feature allows rolling back schema changes if a migration causes issues in staging before reaching production.

### 18.6 Backup Strategy

NeonDB provides automatic backups according to its plan's retention policy. S3 versioning is enabled on the documents bucket so accidental file deletions can be recovered within the bucket's lifecycle policy. A formal disaster recovery runbook is not in place at launch — this is documented as an open gap to be addressed before significant production traffic.

---

## 19. Out of Scope

The following features are explicitly excluded from Phase 2 scope. They are documented here so the team does not accidentally build them and so future planning sessions know what is deferred.

| Feature | Reason |
|---|---|
| Admin-initiated booking cancellation | Deferred to future phase |
| In-platform messaging between user and admin | All comms via WhatsApp/email |
| Multiple admin accounts | Single admin only at launch |
| Mid-service document re-upload by user | Must create new booking or share externally |
| Hindi or regional language toggle | English-only at launch |
| Refund mechanism | No refund policy |
| EMI or partial payments | Full upfront only |
| Native mobile app (iOS/Android) | Responsive web app serves both surfaces |
| SMS notifications | Email-only at launch |
| Two-factor authentication beyond signup OTP | Single-factor at launch |
| WhatsApp API automation | Redirect button only |
| Automatic pre-deposit calculation | Admin communicates manually via notes |
| In-platform pre-deposit tracking | Fully external |
| Final filed document delivery on platform | User gets "Complete" email only |
| Google Business Profile + map embed | Client doesn't have GBP yet |
| Real testimonials and case outcomes at launch | Dummy content acceptable; real content added later |
| CIN and GSTIN in footer | Added when company is officially registered |
| Individual team member names and credentials | Restricted by CA regulatory rules |

---

## 20. Open Gaps & Future Work

The following items are recognized as gaps or pending decisions that should be addressed in subsequent phases.

| # | Gap | Recommendation |
|---|---|---|
| G1 | Team section design without individual credentials | Aggregate credential statement; design phase task |
| G2 | Admin overview analytics granularity (CSV export, additional KPIs) | Define after launch based on usage |
| G3 | Concurrency edge cases (admin cancels mid-payment, double-pay) | Idempotency handles core cases; full audit in LLD |
| G4 | Disaster recovery runbook | Document before significant production traffic |
| G5 | Real testimonials and case outcomes | Collect post-launch, replace dummy content |
| G6 | CIN and GSTIN footer fields | Add when company is registered |
| G7 | Social media URLs | Add when client provides |
| G8 | Calendly webhook integration to log demo bookings | Future scope |
| G9 | Multiple admin support | Future scope |
| G10 | Mid-service document re-upload mechanism | Future scope |

---

## 21. Glossary

**APL-01** — The form prescribed for filing an appeal before the Commissioner (Appeals) under the GST regime.

**APL-05** — The form prescribed for filing an appeal before the Goods and Services Tax Appellate Tribunal (GSTAT).

**ASMT-10** — A scrutiny notice issued under Section 61 of the CGST Act when the tax authority finds discrepancies in returns.

**Bar Council** — The regulatory body for advocates in India. Individual advocates are enrolled with a State Bar Council and given an enrollment number.

**CGST Act** — The Central Goods and Services Tax Act, 2017, the primary legislation governing GST in India.

**CIN** — Corporate Identification Number, a unique identifier assigned to companies registered with the Ministry of Corporate Affairs.

**DRC-01** — A summary of show cause notice issued under the GST regime, typically demanding tax, interest, and penalty.

**DRC-01A** — An intimation under Section 73(5) or 74(5) giving the taxpayer an opportunity to pay before formal proceedings.

**Draft Gating** — The product mechanic where the admin-prepared draft PDF is locked until the user pays, with admin notes visible to build trust before payment.

**GSTAT** — Goods and Services Tax Appellate Tribunal, the second-level appellate body for GST disputes.

**GSTIN** — Goods and Services Tax Identification Number, a 15-character unique identifier issued to GST-registered entities.

**HMAC-SHA256** — A cryptographic signature scheme used to verify message authenticity. Required for Razorpay webhook verification.

**ICAI** — The Institute of Chartered Accountants of India, the regulatory body for chartered accountants. Members have an ICAI membership number.

**Idempotency** — A property of an operation that ensures running it multiple times produces the same result as running it once. Critical for payment processing.

**OIA** — Order in Appeal, the order issued by the Commissioner (Appeals) on a first appeal.

**OIO** — Order in Original, the order issued by the adjudicating authority that creates a tax demand.

**Pre-Deposit** — A statutory deposit required to file an appeal under the GST regime. Paid by the appellant to the government, not to the platform.

**Pre-Signed URL** — A time-limited URL generated by AWS S3 that grants temporary access to upload or download a specific object without exposing AWS credentials.

**Razorpay Orders** — The Razorpay API flow that creates an Order before payment, providing a clean linkage between the platform's booking and the payment.

**Razorpay Webhook** — A server-to-server HTTP POST sent by Razorpay to notify the platform of payment events.

**RBAC** — Role-Based Access Control, the authorization model where access is determined by the user's assigned role.

**SCN** — Show Cause Notice, a formal notice from the tax authority asking the taxpayer to explain alleged discrepancies.

**Server Component** — A Next.js component that renders on the server, can access server-only resources directly, and never ships its code to the browser.

**SSG** — Static Site Generation, the rendering strategy where pages are generated at build time and served as static HTML.

**SSR** — Server-Side Rendering, the rendering strategy where pages are generated on the server for each request.

---

## 22. Appendix — Locked Decisions Summary

This appendix consolidates every architectural decision locked during the requirement and design phases. For full context behind each decision, refer to the knowledge bases and design blueprint.

### 22.1 Architecture & Deployment
- Decoupled frontend and backend both hosted on Hostinger Business plan as separate Node.js applications on separate subdomains (`gstnoticesupport.in` and `api.gstnoticesupport.in`)
- Frontend domain: `gstnoticesupport.in` and `api.gstnoticesupport.in` for backend
- Three environments: development (localhost), staging (deployed), production (live)
- NeonDB branching for staging database
- Cloudflare added post-development at DNS layer with SSL/TLS "Full (strict)"
- Razorpay IP ranges in Cloudflare WAF allow rule

### 22.2 Frontend
- Next.js App Router + TypeScript + Tailwind CSS
- Server Components for dashboard and admin routes; auth verified before render
- TanStack Query for server state; `useState` for UI state
- React Hook Form + Zod for forms; schemas shared between frontend and backend
- Framer Motion for micro-animations only (booking progress, upload confirmation, draft unlock)
- Lucide React for outline icons
- SSG for marketing pages; SSR for authenticated routes
- Mobile-first responsive design

### 22.3 Backend
- Node.js + Express.js + TypeScript
- Prisma ORM connecting to PostgreSQL on NeonDB
- Express raw body middleware on Razorpay webhook route
- JWT signed and verified in HTTP-only Secure SameSite=Lax cookies
- bcrypt password hashing
- Resend SDK for transactional email
- AWS S3 SDK for pre-signed URL generation
- Razorpay Node SDK for Orders and payment verification

### 22.4 Authentication
- JWT in HTTP-only cookies, never localStorage
- Signup: email + password + OTP verification via Resend
- Profile completion after OTP: phone number + services interested
- GSTN collected per-booking, not per-user
- Forgot password: OTP-based reset
- Single admin role, set via direct DB update
- Resource ownership enforced in repository layer

### 22.5 File Handling
- Direct frontend → S3 upload via pre-signed PUT URLs
- No Multer
- Constraints: PDF only, 5 MB per file, 8 files max, 40 MB total
- Pre-signed upload URL valid for 5 minutes
- Draft delivery via pre-signed GET URL valid for 15 minutes
- Unlimited downloads within the 15-minute window
- Private S3 bucket in `ap-south-1`, no public access

### 22.6 Payment
- Razorpay Orders flow (not Payment Links)
- Three-layer reliability: Webhook (L1) + Verify page (L2) + Admin Mark as Paid (L3)
- HMAC-SHA256 signature verification on all webhooks
- Idempotency via unique constraint on `razorpay_payment_id`
- Four verification page outcomes: success, failed, inconclusive, tampered
- Pre-deposit disclosed at 4 mandatory points without stating percentage

### 22.7 Service Status
- States: Document Upload → In Review → Draft Ready → Filing → Complete + Cancelled
- User can cancel only at Draft Ready stage before payment
- Admin cannot cancel bookings in Phase 2 (deferred)
- Admin can re-upload draft only while status is Draft Ready
- Wrong draft after payment is handled offline; no platform recovery in Phase 2

### 22.8 Account Management
- Soft delete user records, retain bookings and payment records
- Hard delete S3 documents 7 days after account deletion
- Account deletion blocked while any service is active
- Confirmation by typing own email — no OTP

### 22.9 Notifications
- Email-only via Resend
- Code-based templates using React Email
- Basic templates at launch, refined post-launch via code edits
- WhatsApp is redirect-only with no API automation

### 22.10 Validation
- Zod schemas shared between frontend and backend
- GSTN format-only validation (no external API)
- All API request bodies validated at controller level

### 22.11 Security
- Rate limiting on: send OTP, forgot password, login, contact form, signed URL generation
- Razorpay webhook excluded from rate limiting
- Helmet.js for HTTP hardening
- CORS with explicit allowed origins and credentials enabled
- All traffic over HTTPS
- No PII in URL parameters

### 22.12 Monitoring
- `console.log` through development and testing
- Sentry (or equivalent) integrated before production launch
- Source maps uploaded for readable stack traces
- PII scrubbed from error reports

### 22.13 Content & Trust
- Dummy placeholders approved at launch for: company name, address, phone numbers, email, testimonials, case outcomes
- CIN, GSTIN, social URLs, team credentials absent (not placeholder) until real data available
- T&C and Privacy Policy drafted by developer based on service model and disclaimers
- Service card CTAs in Phase 1 redirect to Contact page
- Calendly integrated as popup widget

---

## Document Maintenance

- **Owner:** Project Lead / Technical Architect
- **Update triggers:** When LLD is finalized, when scope changes, after each phase launch, when open gaps are resolved
- **Review cadence:** Before Phase 1 launch (mid-June 2026), before Phase 2 launch (early July 2026), quarterly thereafter
- **Related documents:** `gstnoticesupport_project_knowledge_base_1.md`, `gstnoticesupport_project_knowledge_base_2.md`, `Design_Blueprint_for_Trust__Credibility__Authenticity.md`

*End of High-Level Design document.*
