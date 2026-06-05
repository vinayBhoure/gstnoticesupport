<div align="center">

# ◆ GST Notice Support

### Your Trusted Partner for GST Litigation, Notices, Appeals & Tax Advisory Services.

A professional services platform that helps Indian businesses, Chartered Accountants, and Advocates respond to GST notices, file appeals, and track case progress through a structured, draft-gated workflow — backed by an expert offline CA and legal practice.

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-336791?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS-S3-FF9900?logo=amazonaws&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?logo=razorpay&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [API](#-api-reference) · [Roadmap](#-roadmap)

</div>

---

## 🎯 What is GST Notice Support?

**GST Notice Support** is a two-phase platform for professional GST litigation services in India. The public marketing site (Phase 1) converts leads via Calendly booking, contact forms, and WhatsApp redirects. The authenticated platform (Phase 2) runs a structured workflow where a user books a service, uploads their GST case documents, and waits for the admin team to prepare a draft response — which is then delivered through a **draft-gated payment model**: pay to unlock the prepared draft, confirm it, and the admin handles the government portal filing offline.

**Not** a legal information site. **Not** a self-filing tool. The platform is the digital front for a real CA and legal practice — it handles the document exchange, draft delivery, and case tracking; the practitioners handle the expertise.

**Built for:**
- 🏢 **Businesses & SMEs** — received a GST notice and need professional guidance fast
- 👨‍💼 **Chartered Accountants** — delegating litigation work for clients, want a reliable process
- ⚖️ **Advocates** — handling GST adjacent matters, need a specialist partner
- 🛠️ **Developers** — a real full-stack project with OTP auth, S3 file handling, Razorpay webhooks, and a state machine

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🏛️ Trust-First Marketing Site
SEO-optimised public pages with Calendly demo booking, contact form, and WhatsApp redirect. Navy + green palette built to signal institutional credibility to India's skeptical professional audience.

### 🔐 OTP-Based Authentication
Email + password signup with 6-digit OTP verification via Resend. Forgot-password as an OTP reset flow. JWT stored in HTTP-only, Secure, SameSite=Lax cookies. Login security alerts on every session.

### 📋 4 Bookable GST Services
GSTAT Appeal (₹14,999), Commissioner Appeal (₹9,999), SCN Reply (₹5,999), ASMT-10 Reply (₹2,999). Service-specific document checklists guide upload at every booking.

### 💎 Draft-Gated Payment Model
The core product mechanic: admin prepares a draft offline → uploads PDF → user reads admin's text notes to build trust → pays via Razorpay → draft unlocks. Pre-proof-of-competence before commitment.

</td>
<td width="50%">

### 📁 Secure Document Upload
Browser-to-S3 via pre-signed PUT URLs — files never touch the Express server. PDF only, 5 MB per file, 8 files, 40 MB total. Drafts delivered via 15-minute pre-signed GET URLs; no public S3 access.

### 🛡️ Three-Layer Payment Reliability
Razorpay webhook (HMAC-SHA256) as the primary path, `/payment/verify` redirect page as fallback, and admin "Mark as Paid" override as the safety net. Idempotency enforced by unique constraint on `razorpay_payment_id`.

### 📊 Admin Dashboard
Single-admin workflow: download user documents, add case notes, upload draft PDF, manually transition booking status, view analytics overview (bookings by status, total revenue). No in-platform messaging.

### 🔄 Service Status State Machine
`Document Upload → In Review → Draft Ready → Filing → Complete` with `Cancelled` as a terminal off-ramp. Auto-transitions on booking submit, draft upload, and webhook confirmation; manual transitions for admin-controlled steps.

</td>
</tr>
</table>

**And also:** Shared Zod schemas (frontend + backend) · Server Components for SSR dashboards · TanStack Query for server state · Framer Motion micro-animations · Calendly popup widget · WhatsApp click-to-chat redirect · Rate limiting on auth + sensitive endpoints · Soft-delete with 7-day S3 cleanup · Schema.org structured data · Three-environment deployment with NeonDB branching

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="33%"><b>Frontend</b></td>
<td align="center" width="33%"><b>Backend</b></td>
<td align="center" width="33%"><b>Infrastructure</b></td>
</tr>
<tr>
<td>

- Next.js 15 (App Router, SSG + SSR)
- TypeScript (strict)
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod
- Framer Motion
- Lucide React
- React Hot Toast

</td>
<td>

- Node.js + Express.js
- Prisma ORM
- PostgreSQL (NeonDB)
- bcrypt + JWT
- Resend (transactional email)
- AWS S3 (pre-signed URLs)
- Razorpay (Orders API + webhook)
- Helmet.js + express-rate-limit

</td>
<td>

- Vercel (frontend)
- Render / Railway (backend)
- NeonDB (serverless Postgres)
- AWS S3 (ap-south-1)
- Cloudflare (CDN + WAF)
- Razorpay (payment gateway)
- Resend (email delivery)
- GitHub (version control + CI/CD)

</td>
</tr>
</table>

---

## 🏗️ Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                 gstnoticesupport.in (Next.js on Vercel)           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│  │ Public Pages │  │  User Dashboard  │  │  Admin Dashboard   │  │
│  │  (SSG / SEO) │  │  (SSR + Auth)    │  │  (SSR + Role gate) │  │
│  └──────────────┘  └──────────────────┘  └────────────────────┘  │
│         │                   │                       │             │
│         └───────────────────┴───────────────────────┘            │
│                             │                                     │
│              Server Components read JWT cookie,                   │
│              call Express API, render with data                   │
└─────────────────────────────┬─────────────────────────────────────┘
                              │ HTTPS (credentials: include)
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│           api.gstnoticesupport.in (Express.js on Render)          │
│                                                                   │
│  Request → CORS → Helmet → Rate Limiter → JWT Verify              │
│         → Role Check → Zod Validate → Controller                  │
│         → Service → Repository → Prisma → Response               │
│                                                                   │
│  /webhooks/razorpay → raw body → HMAC-SHA256 verify → Service    │
│                                                                   │
│  Errors at any layer → Centralised Error Handler → JSON response  │
└──────┬──────────────────────┬──────────────────┬──────────────────┘
       │                      │                  │
       ▼                      ▼                  ▼
  ┌──────────┐       ┌─────────────┐     ┌────────────────┐
  │PostgreSQL│       │   AWS S3    │     │ Resend + Razorpay│
  │ (NeonDB) │       │ (ap-south-1)│     │  (external APIs) │
  └──────────┘       └─────────────┘     └────────────────┘
```

### The Core Mechanic — Draft-Gated Payment Flow

```
User                          Platform                         Admin
 │                               │                               │
 │  1. Book service +            │                               │
 │     upload documents          │                               │
 ├──────────────────────────────►│  status → Document Upload     │
 │                               │  Email → user + admin         │
 │                               │                               │
 │                               │  2. Admin reviews documents   │
 │                               │◄──────────────────────────────┤
 │  Email: "In Review"           │  status → In Review           │
 │◄──────────────────────────────┤                               │
 │                               │                               │
 │                               │  3. Admin uploads draft PDF   │
 │                               │     + adds case notes         │
 │  Email: "Draft is Ready"      │◄──────────────────────────────┤
 │◄──────────────────────────────┤  status → Draft Ready (auto)  │
 │                               │                               │
 │  4. User opens Draft Ready    │                               │
 │     Sees: locked PDF          │                               │
 │           admin notes (text)  │                               │
 │           [Pay to Unlock]     │                               │
 │           [Cancel Service]    │                               │
 │                               │                               │
 │  5a. User pays via Razorpay   │                               │
 ├──────────────────────────────►│  Webhook HMAC verified        │
 │                               │  status → Filing (auto)       │
 │                               │  Draft URL unlocked           │
 │  Draft PDF (15-min S3 URL)    │  Email → user + admin         │
 │◄──────────────────────────────┤                               │
 │                               │                               │
 │  6. User confirms draft       │  7. Admin files on gov portal │
 ├──────────────────────────────►│     (off-platform)            │
 │                               │◄──────────────────────────────┤
 │  Email: "Complete"            │  status → Complete (manual)   │
 │◄──────────────────────────────┤  Email → user                 │
```

### Secure File Upload Flow (Pre-Signed URLs)

```
Browser                     Express API                      AWS S3
   │                             │                              │
   │  1. POST /upload-url        │                              │
   │     (file name, size, type) │                              │
   ├────────────────────────────►│                              │
   │                             │── validate (auth, booking,  │
   │                             │   PDF, size, file count) ──►│
   │  2. Pre-signed PUT URL      │   generate signed URL        │
   │     (5 min expiry, scoped)  │◄────────────────────────────┤
   │◄────────────────────────────┤                              │
   │                             │                              │
   │  3. PUT file directly       │                              │
   ├─────────────────────────────┼─────────────────────────────►│
   │                             │                              │
   │  4. POST /confirm-upload    │                              │
   │     (S3 key)                │                              │
   ├────────────────────────────►│── create BookingDocument     │
   │  200 OK                     │   record in Postgres         │
   │◄────────────────────────────┤                              │
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- A [NeonDB](https://neon.tech) project (or any PostgreSQL 15+ instance)
- AWS S3 bucket (private, `ap-south-1` recommended)
- [Razorpay](https://razorpay.com) account (test mode for development)
- [Resend](https://resend.com) account with a verified sending domain

### Manual Setup

```bash
# Clone the repo
git clone https://github.com/vinay-bhoure/gstnoticesupport.git
cd gstnoticesupport

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install

# Configure environment files
cd ../server && cp .env.example .env         # edit all required variables
cd ../client && cp .env.example .env.local   # edit NEXT_PUBLIC_API_URL

# Setup the database
cd ../server
npx prisma migrate dev --schema=prisma/schema.prisma
npx prisma generate --schema=prisma/schema.prisma
npx prisma db seed                            # seeds admin user from ADMIN_EMAIL + ADMIN_PASSWORD

# Run dev servers (two terminals)
npm run dev                                   # Terminal 1: backend on :4000
cd ../client && npm run dev                   # Terminal 2: frontend on :3000
```

Open **http://localhost:3000** (frontend) and **http://localhost:4000/health** (backend).

---

## 🔑 Environment Variables

### Backend (`server/.env`)

```env
# Database
DATABASE_URL="postgresql://user:pass@host/gstnoticesupport"

# Auth
JWT_ACCESS_SECRET="your-64-char-secret"         # openssl rand -hex 32
JWT_REFRESH_SECRET="your-64-char-secret"         # openssl rand -hex 32
BCRYPT_SALT_ROUNDS=12

# AWS S3
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="ap-south-1"
AWS_S3_BUCKET_NAME=""

# Razorpay
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""

# Resend (email)
RESEND_API_KEY=""
EMAIL_FROM="support@gstnoticesupport.in"

# Admin seed (required before npx prisma db seed)
ADMIN_EMAIL=""
ADMIN_PASSWORD=""

# Server
SERVER_PORT=4000
CLIENT_URL="http://localhost:3000"
NODE_ENV="development"
```

### Frontend (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_RAZORPAY_KEY_ID=""              # Razorpay publishable key
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## 📡 API Reference

Base URL: `https://api.gstnoticesupport.in/api/v1`

<details>
<summary><b>Auth</b> — signup, OTP, login, forgot password, session</summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/signup` | public | Register with name, email, password |
| `POST` | `/auth/verify-otp` | public | Verify signup OTP (6-digit, 10 min) |
| `POST` | `/auth/resend-otp` | public | Resend verification OTP |
| `POST` | `/auth/login` | public | Login — sets JWT in HTTP-only cookie |
| `POST` | `/auth/logout` | authenticated | Logout — clears cookie + blacklists token |
| `POST` | `/auth/forgot-password` | public | Send password reset OTP |
| `POST` | `/auth/reset-password` | public | Submit new password with OTP |
| `GET` | `/auth/session` | authenticated | Verify session + rehydrate user |
| `POST` | `/auth/complete-profile` | authenticated | Set phone number + interested services |
</details>

<details>
<summary><b>User</b> — profile management, account deletion</summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users/me` | authenticated | Get current user profile |
| `PUT` | `/users/me` | authenticated | Update profile fields |
| `DELETE` | `/users/me` | authenticated | Delete account (blocked if active bookings; confirmed by typing email) |
</details>

<details>
<summary><b>Bookings</b> — the full service booking lifecycle</summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/bookings` | authenticated | List user's bookings |
| `GET` | `/bookings/:id` | authenticated | Get booking detail |
| `POST` | `/bookings` | authenticated | Create booking (service + intake form) |
| `POST` | `/bookings/:id/cancel` | authenticated | Cancel booking (only allowed at `draft_ready`, before payment) |
| `POST` | `/bookings/:id/confirm-draft` | authenticated | Confirm draft after payment |
</details>

<details>
<summary><b>Documents</b> — pre-signed S3 upload + download</summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/bookings/:id/upload-url` | authenticated | Generate 5-min pre-signed PUT URL for document |
| `POST` | `/bookings/:id/confirm-upload` | authenticated | Register uploaded document (creates BookingDocument record) |
| `GET` | `/bookings/:id/documents` | authenticated | List uploaded documents for a booking |
| `GET` | `/bookings/:id/draft-url` | authenticated | Generate 15-min pre-signed GET URL for draft PDF (requires `filing`/`complete` status) |
</details>

<details>
<summary><b>Payments</b> — Razorpay Orders, webhook, manual override</summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/payments/create-order` | authenticated | Create Razorpay Order for a booking |
| `POST` | `/payments/verify` | authenticated | Verify signature after Razorpay modal closes |
| `POST` | `/webhooks/razorpay` | webhook secret | Razorpay webhook (raw body, HMAC-SHA256 verified) |
| `POST` | `/admin/bookings/:id/mark-paid` | admin | Manual payment confirmation (calls Razorpay Fetch API internally) |
</details>

<details>
<summary><b>Admin</b> — booking management, draft upload, analytics</summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/overview` | admin | Dashboard analytics (bookings by status, revenue) |
| `GET` | `/admin/bookings` | admin | List all bookings across all users |
| `GET` | `/admin/bookings/:id` | admin | Get full booking detail |
| `PATCH` | `/admin/bookings/:id/status` | admin | Manually change booking status |
| `PUT` | `/admin/bookings/:id/notes` | admin | Add / update admin notes on a booking |
| `POST` | `/admin/bookings/:id/draft-upload-url` | admin | Generate pre-signed PUT URL for draft PDF upload |
| `POST` | `/admin/bookings/:id/confirm-draft-upload` | admin | Confirm draft upload (auto-transitions status to `draft_ready`) |
</details>

**Response envelope** (all endpoints):
```json
{
  "success": true,
  "data": { },
  "error": null,
  "statusCode": 200
}
```

---

## 📁 Project Structure

```
gstnoticesupport/
├── client/                          # Next.js 15 + TypeScript frontend
│   └── src/
│       ├── app/
│       │   ├── (public)/            # Homepage, service pages, pricing, about, contact, FAQ (SSG)
│       │   ├── (auth)/              # Login, Signup, OTP verify, Forgot Password
│       │   ├── (dashboard)/         # User dashboard — bookings, draft viewer, payments (SSR)
│       │   │   └── services/[id]/draft/  # Separate draft PDF page (post-payment)
│       │   ├── (admin)/             # Admin dashboard — bookings, detail, overview (SSR, role-gated)
│       │   └── payment/verify/      # Razorpay redirect landing page
│       ├── components/              # Shared UI, BookingFlow stepper, DraftLockCard
│       ├── hooks/                   # TanStack Query hooks (auth, bookings, payments)
│       └── validators/              # Zod schemas (imported from server/src/schemas)
│
├── server/                          # Express.js + TypeScript backend
│   ├── prisma/                      # Schema, migrations, seed
│   └── src/
│       ├── api/                     # Route definitions + controllers (thin HTTP layer)
│       ├── services/                # Business logic (AuthService, BookingService, PaymentService, DocumentService, NotificationService)
│       ├── repositories/            # Prisma queries (data access layer)
│       ├── middleware/              # JWT auth, role check, Zod validation, rate limiting, error handler
│       ├── schemas/                 # Zod schemas — source of truth, shared with frontend
│       ├── lib/                     # S3 SDK, Razorpay SDK, Resend SDK, JWT utils, bcrypt utils
│       └── config/                  # Environment loading, external service initialisation
│
├── docs/                            # Project knowledge base
│   ├── architecture/                # HLD, LLD, KB (v1 & v2), interaction flows
│   ├── ui-ux/                       # Design system, component spec
│   └── tracking/                    # CHANGELOG, TASKS, ERROR log
│
├── resources/                       # Design assets and reference material
│   └── ui/                          # HTML prototypes, CSS design tokens, screenshots
│
└── .claude/                         # Claude Code agent configuration
    ├── CLAUDE.md                    # Agent memory (loaded every session)
    ├── skills/                      # Reusable task recipes (backend, auth, frontend, etc.)
    └── commands/                    # Slash commands (scaffold, review, deploy, etc.)
```

---

## 🗺️ Roadmap

The build is decomposed into **15 small, sequential execution phases**, each independently shippable and completable within one or a few focused sessions. Every phase ends in a verifiable state — no phase is "done" until its Definition of Done passes. Phases 1–5 deliver the Phase 1 marketing site; Phases 6–15 deliver the Phase 2 platform.

### Phase Summary

| # | Phase | Track | Milestone | Status |
|---|-------|-------|-----------|--------|
| 1 | Project Scaffold, Tooling & Design System | Foundation | — | ⬚ |
| 2 | Public Marketing Pages | Phase 1 | — | ⬚ |
| 3 | Lead Capture & Phase 1 Integrations | Phase 1 | — | ⬚ |
| 4 | SEO, Performance & Legal Pages | Phase 1 | — | ⬚ |
| 5 | Phase 1 Hardening & Launch | Phase 1 | 🚀 **Phase 1 Live** | ⬚ |
| 6 | Database Schema & Repository Layer | Phase 2 | — | ⬚ |
| 7 | Backend Core Infrastructure | Phase 2 | — | ⬚ |
| 8 | Auth — Signup, OTP & Profile | Phase 2 | — | ⬚ |
| 9 | Auth — Login, Sessions & Password Reset | Phase 2 | — | ⬚ |
| 10 | Auth Frontend & Route Protection | Phase 2 | — | ⬚ |
| 11 | Booking Workflow | Phase 2 | — | ⬚ |
| 12 | Document Upload (S3 Pre-Signed) | Phase 2 | — | ⬚ |
| 13 | Admin Dashboard & Draft Management | Phase 2 | — | ⬚ |
| 14 | Payment — Razorpay Three-Layer Reliability | Phase 2 | — | ⬚ |
| 15 | Lifecycle Completion, Hardening & Launch | Phase 2 | 🚀 **Phase 2 Live** | ⬚ |

**Status legend:** ✅ Complete · 🔄 In Progress · ⬚ Not Started

---

### Detailed Phase Breakdown

#### Phase 1 — Project Scaffold, Tooling & Design System
> **Foundation** · Everything downstream depends on this skeleton existing and the design tokens being in place.

- **Deliverables:** Monorepo with independent `client/` (Next.js 15 App Router) and `server/` (Express + TS) packages · strict TypeScript, ESLint, Prettier · `/health` endpoint · CORS wired FE↔BE · Tailwind configured with locked design tokens from `tokens.css` · base UI primitives (Button, Input, Card, Badge) · Lucide icon setup.
- **Definition of Done:** `npm run dev` boots both apps; `GET /health` returns `200`; the homepage renders a primitives showcase using only navy/green/neutral tokens; ESLint and `tsc --noEmit` pass clean.

#### Phase 2 — Public Marketing Pages
> **Phase 1** · The trust-first content layer. Static, fast, responsive — no backend dependency.

- **Deliverables:** Homepage (all 12 sections) · 4 service pages · Pricing · About · FAQ — all statically generated and mobile-first responsive.
- **Definition of Done:** All pages build as static HTML (`next build` emits SSG); every page is responsive at 360/768/1280px; tap targets ≥ 48px; no forbidden UI patterns present; content matches the Design Trust Blueprint.

#### Phase 3 — Lead Capture & Phase 1 Integrations
> **Phase 1** · Turns the static site into a working lead-generation funnel.

- **Deliverables:** Contact form → backend endpoint → Resend email to admin · Zod validation (shared schema) · rate limit (3/60min/IP) · Calendly popup widget · WhatsApp click-to-chat redirect with prefilled message.
- **Definition of Done:** Submitting the contact form delivers an email to the admin inbox; invalid input is rejected with field-level errors; rate limit returns `429` on the 4th attempt; Calendly opens; WhatsApp button deep-links correctly on mobile and desktop.

#### Phase 4 — SEO, Performance & Legal Pages
> **Phase 1** · Search visibility and compliance content.

- **Deliverables:** Metadata API titles/descriptions, OG + Twitter cards, Schema.org JSON-LD (`Service`, `Organization`, `FAQPage`) · `sitemap.xml` + `robots.txt` · Next `<Image>` optimization + code splitting · Terms & Conditions + Privacy Policy pages · Google Analytics + Search Console.
- **Definition of Done:** Every public page has unique metadata and a canonical URL; sitemap lists all public routes; `/dashboard`, `/admin`, `/payment` disallowed in robots; Lighthouse hits FCP < 1.5s and LCP < 2.5s on emulated 4G; legal pages published.

#### Phase 5 — Phase 1 Hardening & Launch
> **Phase 1 → 🚀 Live** · Ship the marketing site to production.

- **Deliverables:** Production env vars on Vercel + backend host · Cloudflare DNS + SSL "Full (strict)" · staging→production promotion · `/deploy` pre + post smoke tests · dummy-content placeholders confirmed for launch.
- **Definition of Done:** `gstnoticesupport.in` serves the live site over HTTPS; contact form delivers email in production; Calendly and WhatsApp work in production; all `/deploy production post` smoke tests pass. **Milestone: Phase 1 live.**

#### Phase 6 — Database Schema & Repository Layer
> **Phase 2** · The data foundation for the platform.

- **Deliverables:** NeonDB connected · Prisma schema for all 6 entities + enums (booking status, role, payment status) · migrations · repository layer scaffold (ownership-filtered queries) · seed script creating the admin user.
- **Definition of Done:** `prisma migrate deploy` applies cleanly to a fresh DB; `prisma db seed` creates the admin from env vars; required indexes exist (incl. unique on `razorpay_payment_id`); each repository method returns typed data via a quick integration check.

#### Phase 7 — Backend Core Infrastructure
> **Phase 2** · The request pipeline every platform endpoint flows through.

- **Deliverables:** Middleware chain in locked order (CORS → Helmet → cookie parser → raw-webhook carve-out → JSON → routes → error handler) · `asyncHandler`, `ApiError`, response `envelope()` · Zod `validate()` middleware · per-route rate limiter configs.
- **Definition of Done:** A test route flows through the full chain and returns the standard envelope; a thrown `ApiError` produces the correct status + shape; an unhandled error returns a generic 500 with no stack leak; validation failures return `400` with messages.

#### Phase 8 — Auth: Signup, OTP & Profile
> **Phase 2** · Account creation half of authentication.

- **Deliverables:** Signup endpoint + bcrypt hashing · 6-digit OTP generation, hashing, expiry · OTP email via Resend · OTP verify endpoint · profile-completion endpoint (phone + interested services) · JWT issuance into HTTP-only cookie on verify.
- **Definition of Done:** A new user can sign up, receive an OTP email, verify it, and complete their profile; unverified accounts cannot obtain a session; OTP respects 10-min expiry and 3/hour limit; OTP never appears in logs or responses.

#### Phase 9 — Auth: Login, Sessions & Password Reset
> **Phase 2** · Returning-user and recovery half of authentication.

- **Deliverables:** Login endpoint · session verify/rehydrate · logout + token blacklist · forgot-password OTP flow · reset-password endpoint · login security-alert email with invalidation link.
- **Definition of Done:** Valid credentials set a cookie and return the user; wrong password returns `401` with no cookie; logout clears the cookie and blacklists the token; full forgot→OTP→reset cycle works; the forgot endpoint does not reveal whether an email is registered.

#### Phase 10 — Auth Frontend & Route Protection
> **Phase 2** · The auth UI and the gates around private routes.

- **Deliverables:** Login, Signup, Verify-OTP, Forgot/Reset pages (React Hook Form + shared Zod schemas) · `apiClient` with `credentials: 'include'` · Server-Component auth checks on `(dashboard)` and `(admin)` · role-based redirects · empty dashboard shell.
- **Definition of Done:** Every auth flow is completable through the UI; unauthenticated access to `/dashboard` redirects to `/login`; a non-admin hitting `/admin` is redirected; submit buttons disable during pending requests; cookies traverse FE↔BE correctly.

#### Phase 11 — Booking Workflow
> **Phase 2** · Users can create service bookings.

- **Deliverables:** Booking create endpoint + intake validation · multi-step booking flow UI (stepper: service → personal info → review) · service-specific field handling · status auto-set to `Document Upload` · Services table on the dashboard · new-booking emails to user + admin.
- **Definition of Done:** A user completes the booking flow and the booking appears in their Services table at `Document Upload`; intake data is re-entered per booking (no pre-fill); both confirmation emails send; invalid intake is rejected with inline errors.

#### Phase 12 — Document Upload (S3 Pre-Signed)
> **Phase 2** · Attach case documents to a booking — direct browser→S3.

- **Deliverables:** Pre-signed PUT URL endpoint with full validation · direct browser→S3 upload (no Multer) · confirm-upload endpoint creating `BookingDocument` rows · constraint enforcement (PDF only, ≤5MB/file, ≤8 files, ≤40MB total) · uploaded-document list with downloads.
- **Definition of Done:** A valid PDF uploads to the private bucket and is recorded; a >5MB file, a 9th file, a non-PDF, and a total >40MB are each rejected with a clear message before any URL is issued; no file passes through Express; download links use short-lived pre-signed GET URLs.

#### Phase 13 — Admin Dashboard & Draft Management
> **Phase 2** · The admin side of the workflow.

- **Deliverables:** Admin bookings list + detail (role-gated) · download user documents · add/edit admin notes · draft PDF upload (auto-transition → `Draft Ready`) · manual status changes (`In Review`, `Complete`) · overview analytics (counts by status, revenue).
- **Definition of Done:** Admin can open any booking, download its documents, save notes (visible to the user), and upload a draft that auto-moves status to `Draft Ready` and emails the user; allowed manual transitions work and forbidden ones are blocked; overview totals are accurate.

#### Phase 14 — Payment: Razorpay Three-Layer Reliability
> **Phase 2** · The draft-gated payment mechanic — the core of the product.

- **Deliverables:** Create-order endpoint · Razorpay modal (client) · webhook handler (raw body, HMAC-SHA256, idempotency) · `/payment/verify` fallback page (4 outcomes) · admin Mark-as-Paid override (Fetch Payment API confirmed) · `Draft Ready → Filing` transition + draft unlock · payment history · pre-deposit disclosure at all 4 mandatory points.
- **Definition of Done:** A test-card payment transitions the booking to `Filing`, unlocks the draft, and emails user + admin; replaying the webhook does not double-process (idempotency holds); tampered signatures are rejected; Mark-as-Paid refuses without confirmed capture; pre-deposit copy shows on pricing, booking step 1, Draft Ready email, and the Pay-to-Unlock screen for GSTAT/Commissioner Appeal.

#### Phase 15 — Lifecycle Completion, Hardening & Launch
> **Phase 2 → 🚀 Live** · Close the loop and ship.

- **Deliverables:** Draft viewer page (15-min pre-signed GET, fresh per load) · Confirm Draft action · user cancellation (Draft Ready only) · account deletion (email-typed confirm, active-booking gate, 7-day S3 cleanup job) · `Complete` flow · full notification matrix · Sentry · Cloudflare WAF + Razorpay IP allowlist · SPF/DKIM/DMARC · end-to-end QA · production promotion.
- **Definition of Done:** The full lifecycle `Document Upload → In Review → Draft Ready → Filing → Complete` works end to end in production; cancellation is allowed only at Draft Ready; account deletion is blocked while a service is active and succeeds otherwise; every notification-matrix email fires on its event; Sentry captures errors; all `/deploy production post` smoke tests pass. **Milestone: Phase 2 live.**

---

## 🏛️ Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Payment model | Full upfront, draft-gated | User pays only after seeing admin's prepared work; proves competence before commitment |
| Auth token storage | HTTP-only Secure cookies | XSS-resistant; token never enters `localStorage` or client bundle |
| JWT strategy | 15-min access + 7-day refresh (server-stored) | Short access window; refresh stored server-side enables revocation at logout |
| File upload pattern | Browser → S3 via pre-signed PUT URLs | Files never pass through Express; keeps server memory footprint small |
| Draft delivery | 15-min pre-signed GET URL | Controlled access per request; no permanent public URLs; re-generates on page load |
| Payment reliability | 3-layer (webhook → verify page → admin override) | Webhook can miss; verify page catches redirect; admin override handles worst case |
| Idempotency | Unique constraint on `razorpay_payment_id` | Any layer that processes payment inserts once; constraint enforces single-write |
| Admin role promotion | Direct database update only | Single admin, no UI needed; reduces attack surface |
| Booking personal info | Re-entered per booking (no pre-fill) | Each booking may represent a different client or GSTN; pre-fill creates errors |
| User cancellation | Only at `Draft Ready` stage | Cancellation before draft preparation wastes admin effort; gate deters abuse |
| Data retention on deletion | Soft-delete user; hard-delete S3 after 7 days | Indian tax law requires retention of financial records; 7-day window allows recovery |
| GSTN validation | Format check only (no external API) | External GSTN API adds latency and cost; format check catches typos |
| Marketing pages | SSG | Static HTML served from Vercel edge + Cloudflare CDN; maximum SEO and speed |
| Dashboard pages | SSR (Server Components) | Per-user data, no client-side data fetching flash, auth checked before render |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b phase-1/feature-name` or `phase-2/feature-name`)
3. Commit using the format: `[Phase N] type: short description`
4. Open a Pull Request against `staging` — all code passes through staging before `main`
5. Update `docs/tracking/CHANGELOG.md` and `docs/tracking/TASKS.md` as part of the PR

---

<div align="center">

## 📝 License

MIT

Built by [Vinay Bhoure](https://github.com/vinay-bhoure) for [GST Notice Support](https://gstnoticesupport.in)

</div>
