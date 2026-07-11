# Graph Report - .  (2026-07-11)

## Corpus Check
- Large corpus: 351 files · ~417,210 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 1594 nodes · 3106 edges · 105 communities (89 shown, 16 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 161 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Auth Backend Layer|Auth Backend Layer]]
- [[_COMMUNITY_Contact & Callback Notifications|Contact & Callback Notifications]]
- [[_COMMUNITY_App Router Pages|App Router Pages]]
- [[_COMMUNITY_Service Catalog Pages|Service Catalog Pages]]
- [[_COMMUNITY_Homepage Content & Types|Homepage Content & Types]]
- [[_COMMUNITY_UI Prototype Pages|UI Prototype Pages]]
- [[_COMMUNITY_Admin & Feature Test Suite|Admin & Feature Test Suite]]
- [[_COMMUNITY_Payment Service Core|Payment Service Core]]
- [[_COMMUNITY_Auth Forms|Auth Forms]]
- [[_COMMUNITY_Booking Wizard Flow|Booking Wizard Flow]]
- [[_COMMUNITY_Booking & Document Routes|Booking & Document Routes]]
- [[_COMMUNITY_Admin DTOs & Types|Admin DTOs & Types]]
- [[_COMMUNITY_API Client Layer|API Client Layer]]
- [[_COMMUNITY_Site & About Content|Site & About Content]]
- [[_COMMUNITY_Email Template Builders|Email Template Builders]]
- [[_COMMUNITY_Account Settings|Account Settings]]
- [[_COMMUNITY_Design System Docs|Design System Docs]]
- [[_COMMUNITY_Booking Status Display|Booking Status Display]]
- [[_COMMUNITY_Admin API Layer|Admin API Layer]]
- [[_COMMUNITY_UI Design Rules|UI Design Rules]]
- [[_COMMUNITY_Admin Service & DTOs|Admin Service & DTOs]]
- [[_COMMUNITY_Server Config & Notifications|Server Config & Notifications]]
- [[_COMMUNITY_Auth Card Screens|Auth Card Screens]]
- [[_COMMUNITY_Document Upload & Draft Viewer|Document Upload & Draft Viewer]]
- [[_COMMUNITY_Booking Steps & Motion|Booking Steps & Motion]]
- [[_COMMUNITY_Shared Layout Components|Shared Layout Components]]
- [[_COMMUNITY_S3 Document Storage|S3 Document Storage]]
- [[_COMMUNITY_Pricing Page|Pricing Page]]
- [[_COMMUNITY_User Backend Layer|User Backend Layer]]
- [[_COMMUNITY_Admin Dashboard Pages|Admin Dashboard Pages]]
- [[_COMMUNITY_Services List View|Services List View]]
- [[_COMMUNITY_Payment Reliability Architecture|Payment Reliability Architecture]]
- [[_COMMUNITY_UI Prototype App State|UI Prototype App State]]
- [[_COMMUNITY_Booking Service Layer|Booking Service Layer]]
- [[_COMMUNITY_Marketing Pages|Marketing Pages]]
- [[_COMMUNITY_Signup & Session|Signup & Session]]
- [[_COMMUNITY_Profile Page Guard|Profile Page Guard]]
- [[_COMMUNITY_Booking Detail Actions|Booking Detail Actions]]
- [[_COMMUNITY_FAQ & Callback|FAQ & Callback]]
- [[_COMMUNITY_Changelog & Decisions Log|Changelog & Decisions Log]]
- [[_COMMUNITY_Product Knowledge Base 1|Product Knowledge Base 1]]
- [[_COMMUNITY_Brand Logo Assets|Brand Logo Assets]]
- [[_COMMUNITY_Payment API Layer|Payment API Layer]]
- [[_COMMUNITY_Task Board & Roadmap|Task Board & Roadmap]]
- [[_COMMUNITY_Payment Verification Page|Payment Verification Page]]
- [[_COMMUNITY_Architecture Decisions Log|Architecture Decisions Log]]
- [[_COMMUNITY_Product Knowledge Base 2|Product Knowledge Base 2]]
- [[_COMMUNITY_Homepage Hero Screenshot|Homepage Hero Screenshot]]
- [[_COMMUNITY_Settings Page Screenshot|Settings Page Screenshot]]
- [[_COMMUNITY_Hero Section Screenshot|Hero Section Screenshot]]
- [[_COMMUNITY_Booking Test Runner|Booking Test Runner]]
- [[_COMMUNITY_ASMT-10 Service Page|ASMT-10 Service Page]]
- [[_COMMUNITY_Service Detail Screenshot|Service Detail Screenshot]]
- [[_COMMUNITY_Dashboard Shell & Errors|Dashboard Shell & Errors]]
- [[_COMMUNITY_Pay-to-Unlock Checkout|Pay-to-Unlock Checkout]]
- [[_COMMUNITY_Generic Test Runner|Generic Test Runner]]
- [[_COMMUNITY_HLDLLD Architecture Docs|HLD/LLD Architecture Docs]]
- [[_COMMUNITY_Contact Page|Contact Page]]
- [[_COMMUNITY_App Providers & Layout|App Providers & Layout]]
- [[_COMMUNITY_Auth API Test Suite|Auth API Test Suite]]
- [[_COMMUNITY_Admin Shell Guard|Admin Shell Guard]]
- [[_COMMUNITY_Scroll Animation Hooks|Scroll Animation Hooks]]
- [[_COMMUNITY_My Services Dashboard Screenshot|My Services Dashboard Screenshot]]
- [[_COMMUNITY_Admin Email Config Check|Admin Email Config Check]]
- [[_COMMUNITY_Schema Sync Script|Schema Sync Script]]
- [[_COMMUNITY_Trust & Credibility Signals|Trust & Credibility Signals]]
- [[_COMMUNITY_Pricing Cards Screenshot|Pricing Cards Screenshot]]
- [[_COMMUNITY_Change Password Form|Change Password Form]]
- [[_COMMUNITY_Homepage FAQ Content|Homepage FAQ Content]]
- [[_COMMUNITY_Dashboard Mobile Spec|Dashboard Mobile Spec]]
- [[_COMMUNITY_Admin Test Fixtures|Admin Test Fixtures]]
- [[_COMMUNITY_Final Draft Test Fixtures|Final Draft Test Fixtures]]
- [[_COMMUNITY_Privacy Policy Page|Privacy Policy Page]]
- [[_COMMUNITY_Brand Identity|Brand Identity]]
- [[_COMMUNITY_Badge Component|Badge Component]]
- [[_COMMUNITY_Button Component|Button Component]]
- [[_COMMUNITY_Draft-Ready Booking Fixture|Draft-Ready Booking Fixture]]
- [[_COMMUNITY_Graphify Integration Setup|Graphify Integration Setup]]
- [[_COMMUNITY_Card Component|Card Component]]
- [[_COMMUNITY_DB Seed Script|DB Seed Script]]
- [[_COMMUNITY_Next.js Boilerplate Assets|Next.js Boilerplate Assets]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Express Type Extensions|Express Type Extensions]]
- [[_COMMUNITY_Client Boilerplate README|Client Boilerplate README]]
- [[_COMMUNITY_Draft Viewer Preview Harness|Draft Viewer Preview Harness]]
- [[_COMMUNITY_File Icon Asset|File Icon Asset]]
- [[_COMMUNITY_Globe Icon Asset|Globe Icon Asset]]
- [[_COMMUNITY_Vercel Logo Asset|Vercel Logo Asset]]
- [[_COMMUNITY_Window Icon Asset|Window Icon Asset]]
- [[_COMMUNITY_Homepage Mobile Preview|Homepage Mobile Preview]]
- [[_COMMUNITY_Notice Card Illustration|Notice Card Illustration]]

## God Nodes (most connected - your core abstractions)
1. `getErrorMessage()` - 26 edges
2. `escapeHtml()` - 25 edges
3. `requireUser()` - 23 edges
4. `layout()` - 23 edges
5. `components.md Design Spec` - 23 edges
6. `Homepage` - 20 edges
7. `Design Tokens (css/tokens.css)` - 20 edges
8. `Decision Log` - 18 edges
9. `SERVICE_META` - 17 edges
10. `Service Detail Page` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Key Design Decisions Table (README)` --semantically_similar_to--> `Decision Log`  [INFERRED] [semantically similar]
  README.md → docs/tracking/decisions.md
- `Pay-to-Unlock -> Draft Reveal Component` --semantically_similar_to--> `FEATURE_TEST_PLAN.md — Final Draft / Representation / Admin Notifications`  [INFERRED] [semantically similar]
  docs/ui-ux/components.md → test/postman/FEATURE_TEST_PLAN.md
- `Confirmation Dialog Component` --semantically_similar_to--> `ADMIN_TEST_PLAN.md — EP13 Admin Surface API Test Plan`  [INFERRED] [semantically similar]
  docs/ui-ux/components.md → test/postman/ADMIN_TEST_PLAN.md
- `OTP Input Component` --semantically_similar_to--> `test/README.md — Phase 2 Auth API Test Suite`  [INFERRED] [semantically similar]
  docs/ui-ux/components.md → test/README.md
- `Tech Stack Overview (README)` --conceptually_related_to--> `High-Level Design (HLD)`  [INFERRED]
  README.md → docs/architecture/gstnoticesupport_HLD.md

## Hyperedges (group relationships)
- **Three-Layer Payment Reliability: Spec to Implementation** — hld_three_layer_reliability, kb2_three_layer_design, decisions_D76_idempotency_core, apicontract_webhook_endpoint, lld_payment_records_table [INFERRED 0.85]
- **Draft-Gated Payment Mechanic Lineage (KB1 to Component)** — hld_draft_gated_payment, kb1_draft_gating, kb2_pdf_gating_final, components_pay_to_unlock [INFERRED 0.85]
- **Admin Mark-as-Paid (Layer 3 Override) Design Chain** — kb2_admin_scope_changes, decisions_D66_payment_source_audit, decisions_D78_markpaid_reuses_core, apicontract_markpaid_endpoint [INFERRED 0.85]
- **Multi-step booking flow — Service Selection to Case Details to Document Upload** — booking_step1_html, booking_step2_html, booking_step3_html, booking_step3_mobile_html [EXTRACTED 1.00]
- **Admin views/actions reflecting the six-status booking lifecycle across overview, list, detail, and user dashboard** — admin_overview_booking_status_machine, admin_bookings_status_badge, admin_booking_detail_status_actions, dashboard_home_active_services [INFERRED 0.85]
- **Trust-before-conversion principle realized through team credibility, legal identity, and design-system trust patterns** — design_trust_credibility_patterns, design_system_trust_a11y, about_expert_team, about_company_identity, contact_grievance_officer [INFERRED 0.85]
- **Draft-to-Payment Booking Lifecycle Flow** — servicedetail_page, draftviewer_page, paymentverification_page, concept_bookingstatusmachine [INFERRED 0.85]
- **Three-Step Onboarding Auth Flow** — signup_page, otpverification_page, profilecompletion_page, concept_authcardshell [INFERRED 0.85]
- **Shared Marketing Page Shell** — homepage_page, concept_navbar, concept_footer, concept_whatsappfloat [INFERRED 0.85]
- **components.md revision family (canonical + duplicate + prior drafts)** — components_doc, components07b73c2a_doc, components25231725_doc, components84c03f26_doc, componentsuploads_doc [INFERRED 0.85]
- **design.md duplicate family across uploads** — design_doc, design50a0276d_doc, designuploads_doc [INFERRED 0.90]
- **Admin API test coverage workflow (automated + deferred manual Razorpay path)** — admintestplan_doc, postmanreadme_doc, checkouthtml_doc, decision_d77 [INFERRED 0.80]

## Communities (105 total, 16 thin omitted)

### Community 0 - "Auth Backend Layer"
Cohesion: 0.06
Nodes (50): authController, AccessTokenPayload, hashToken(), RefreshTokenPayload, verifyAccessToken(), verifyRefreshToken(), adminDraftUploadRateLimiter, documentUploadRateLimiter (+42 more)

### Community 1 - "Contact & Callback Notifications"
Cohesion: 0.05
Nodes (40): Envelope, POST(), ContactForm(), Envelope, POST(), checkRateLimit(), RateLimitResult, store (+32 more)

### Community 2 - "App Router Pages"
Cohesion: 0.1
Nodes (28): Asmt10Page(), metadata, CommissionerAppealPage(), metadata, WHATSAPP_LINKS, ServicePageContent, GstatAppealPage(), metadata (+20 more)

### Community 3 - "Service Catalog Pages"
Cohesion: 0.08
Nodes (27): BookingControls(), PAYMENT_OPTIONS, STATUS_OPTIONS, AdminOverviewPage(), formatInr(), metadata, STATUS_ORDER, pageHref() (+19 more)

### Community 4 - "Homepage Content & Types"
Cohesion: 0.08
Nodes (34): homeDisclaimer, homeFaqHead, homeFinalCta, homeHero, homeMeta, homeNotices, homeOutcomes, homePricing (+26 more)

### Community 5 - "UI Prototype Pages"
Cohesion: 0.21
Nodes (40): App Shell (Sidebar) Pattern, Auth Card Shell Pattern, Booking Status State Machine, Design Tokens (css/tokens.css), FAQ Accordion Pattern, Marketing Footer Component, GNS Client Session State (js/app-state.js), Mobile Bottom Tab Bar (+32 more)

### Community 6 - "Admin & Feature Test Suite"
Cohesion: 0.05
Nodes (40): ADMIN_TEST_PLAN.md — EP13 Admin Surface API Test Plan, checkout.html — Razorpay TEST checkout harness, GET /admin/bookings/:id, GET /admin/bookings, Admin.postman_collection.json, POST /admin/bookings/:id/draft-confirm, POST /admin/bookings/:id/draft-upload-url, admin-local.postman_environment.json (+32 more)

### Community 7 - "Payment Service Core"
Cohesion: 0.08
Nodes (29): InitiateOrderDTO, PaymentHistoryItemDTO, PaymentHistoryRow, toPaymentHistoryItemDTO(), VerifyOutcome, VerifyResultDTO, getBookingAmountPaise(), SERVICE_PRICING (+21 more)

### Community 8 - "Auth Forms"
Cohesion: 0.09
Nodes (28): UserResponse, SignupResponseData, CompleteProfileFormProps, ForgotPasswordForm(), metadata, Banner, LoginFormProps, Banner (+20 more)

### Community 9 - "Booking Wizard Flow"
Cohesion: 0.08
Nodes (25): ServiceType, PRE_DEPOSIT_SERVICES, PreDepositNotice(), PreDepositNoticeProps, requiresPreDeposit(), SegmentedOption, SegmentedToggle(), SegmentedToggleProps (+17 more)

### Community 10 - "Booking & Document Routes"
Cohesion: 0.11
Nodes (24): bookingController, documentController, healthController, requireRole(), router, healthRouter, BookingIdParam, bookingIdParamSchema (+16 more)

### Community 11 - "Admin DTOs & Types"
Cohesion: 0.07
Nodes (30): AdminUserListParams, BookingResponse, UserResponse, AdminBookingDetailDTO, AdminStatsDTO, AdminUserListItemDTO, DocumentDownloadResponse, ADMIN_TRANSITION_STATUSES (+22 more)

### Community 12 - "API Client Layer"
Cohesion: 0.09
Nodes (24): DeleteUserCard(), DeleteUserCardProps, apiClient, BASE_URL, requestEnvelope(), RequestOptions, tryRefresh(), AdminUserDetailDTO (+16 more)

### Community 13 - "Site & About Content"
Cohesion: 0.09
Nodes (13): metadata, size, aboutCompany, aboutCta, aboutHero, aboutMeta, aboutMission, aboutWhy (+5 more)

### Community 14 - "Email Template Builders"
Cohesion: 0.2
Nodes (30): accountCreatedAdmin(), accountDeletedAdmin(), accountDeletedUser(), bookingCancelledAdmin(), bookingCancelledUser(), bookingCreatedAdmin(), bookingCreatedUser(), button() (+22 more)

### Community 15 - "Account Settings"
Cohesion: 0.09
Nodes (24): getErrorCode(), PaginatedResult, PaymentHistoryItemDTO, UserObject, userApi, UserResponse, AccountSettingsForm(), AccountSettingsFormProps (+16 more)

### Community 16 - "Design System Docs"
Cohesion: 0.1
Nodes (30): Component Reuse Matrix, Phase 2 Frontend Audit, Phase 2 Frontend Gap Analysis, components-07b73c2a.md (uploads revision), components-25231725.md (uploads revision), components-84c03f26.md (uploads revision), Admin Data Table Component, Admin Stat Card (+22 more)

### Community 17 - "Booking Status Display"
Cohesion: 0.13
Nodes (21): AdminDocumentList(), AdminDocumentListProps, AdminNoteEditor(), AdminNoteEditorProps, DraftCard(), DraftCardProps, UploadState, FinalDraftCard() (+13 more)

### Community 18 - "Admin API Layer"
Cohesion: 0.12
Nodes (26): adminController, router, ADMIN_TRANSITION_STATUSES, AdminBookingIdParams, adminBookingIdParamsSchema, AdminBookingListQuery, adminBookingListQuerySchema, AdminDocumentParams (+18 more)

### Community 19 - "UI Design Rules"
Cohesion: 0.1
Nodes (29): Accessibility Constraints — 48px tap targets, WCAG AA contrast, visible focus rings, prefers-reduced-motion, App shell (authenticated screens) — persistent left sidebar desktop, slide-in drawer mobile, admin is desktop-primary, Persistent contact affordances — phone always visible, WhatsApp float after scroll, sticky mobile bottom bar, Design Principles, priority order — trust before conversion, one decision per screen, restraint, specificity, readability, Iconography — Lucide outline icons, 1.5px stroke, supplement labels never replace, Interaction Rules — explicit states, one primary button rule, whole-card clickable, single-item accordions, Layout Behavior — mobile-first responsive, Tailwind breakpoints, stepper for multi-step flows, design.md — gstnoticesupport Design System (+21 more)

### Community 20 - "Admin Service & DTOs"
Cohesion: 0.1
Nodes (23): AdminBookingDetailDTO, AdminBookingListItemDTO, AdminStatsDTO, AdminUserDetailDTO, AdminUserListItemDTO, AdminUserSummaryDTO, BookingWithAdminRelations, BookingWithUser (+15 more)

### Community 21 - "Server Config & Notifications"
Cohesion: 0.12
Nodes (15): webhookController, emailService, resend, SendEmailInput, SendEmailResult, envSchema, result, logger (+7 more)

### Community 22 - "Auth Card Screens"
Cohesion: 0.11
Nodes (15): metadata, AuthCardShell(), AuthCardShellProps, metadata, ResetPasswordForm(), ResetPasswordFormProps, ResetPasswordInput, resetPasswordSchema (+7 more)

### Community 23 - "Document Upload & Draft Viewer"
Cohesion: 0.11
Nodes (20): documentApi, BookingDocumentDTO, DraftUrlResponse, UploadUrlResponse, DocumentUpload(), DocumentUploadProps, fmtSize(), SessionUpload (+12 more)

### Community 24 - "Booking Steps & Motion"
Cohesion: 0.12
Nodes (25): Booking Step 1 — Service Selection page, Pre-deposit disclosure banner — animated reveal, aria-live announced, Case Details form — name, email, mobile (+91), GSTIN (mono), organisation, Filing For segmented toggle — Self vs A Client, with conditional client-name field, Booking Step 2 — Personal Info page, Privacy note — cites design.md §6 trust signal near sensitive data entry, Booking Summary panel — appears after >=1 upload success, Document Upload Component — drag/drop zone, desktop (+17 more)

### Community 25 - "Shared Layout Components"
Cohesion: 0.13
Nodes (16): metadata, FOOTER_COLUMNS, FOOTER_LABELS, FOOTER_POLICIES, NAV_LABELS, NAV_LINKS, NAV_SERVICE_ITEMS, NOT_FOUND (+8 more)

### Community 26 - "S3 Document Storage"
Cohesion: 0.14
Nodes (19): BookingDocumentDTO, toBookingDocumentDTO(), buildDocumentKey(), buildDraftKey(), buildFinalDraftKey(), draftUrlExpiresAt(), formatDateStamp(), getDownloadUrl() (+11 more)

### Community 27 - "Pricing Page"
Cohesion: 0.13
Nodes (16): PRICING_FAQS, PaymentPolicyItem, pricingCta, pricingFaqHead, pricingHero, pricingMeta, pricingPaymentPolicy, pricingRepresentation (+8 more)

### Community 28 - "User Backend Layer"
Cohesion: 0.16
Nodes (17): userController, toUserDTO(), UserDTO, authenticate, validateBody(), router, DeleteAccountInput, deleteAccountSchema (+9 more)

### Community 29 - "Admin Dashboard Pages"
Cohesion: 0.13
Nodes (22): Admin Note field, Draft upload panel — dropzone/uploading/uploaded states for admin-prepared draft PDF, Admin Booking Detail page, Mark as Paid action — fallback for off-portal payments; verifies Razorpay Payment ID before any status change, Razorpay (payment verification reference in Mark as Paid), Status Actions panel — status-gated admin action buttons (Set to In Review, Mark as Paid, Mark Complete), Uploaded Documents section, Controls bar — filter/search for bookings table (+14 more)

### Community 30 - "Services List View"
Cohesion: 0.15
Nodes (16): BookingSummaryDTO, BookingCard(), BookingCardProps, NEXT_ACTION_COPY, ACTIVE_STATUSES, DashboardPage(), greetingParts(), metadata (+8 more)

### Community 31 - "Payment Reliability Architecture"
Cohesion: 0.14
Nodes (21): API Contract, GET /bookings/:id/draft-url, Common Error Codes, POST /payments/:bookingId/initiate, POST /admin/bookings/:id/mark-paid, Response Envelope Convention, POST /bookings/:id/upload-url, GET /payments/verify (+13 more)

### Community 32 - "UI Prototype App State"
Cohesion: 0.17
Nodes (15): addBooking(), clearSession(), closeLogoutModal(), getBooking(), getBookings(), getSession(), hasActiveBookings(), injectDeleteModal() (+7 more)

### Community 33 - "Booking Service Layer"
Cohesion: 0.16
Nodes (15): BookingDetailDTO, BookingDetailWithRelationsDTO, BookingSummaryDTO, toBookingDetailDTO(), toBookingDetailWithRelationsDTO(), toBookingSummaryDTO(), toPaymentRecordDTO(), ExtendedPrismaClient (+7 more)

### Community 34 - "Marketing Pages"
Cohesion: 0.15
Nodes (19): About Us page, About page hero — "India's GST Litigation Experts — Backed by Real Credentials", Why Choose Us section, Category filter — updates / bench / practice, Blog hero — "Field Notes from the GST Litigation Bench", Blog page, Notice Type Service Selector — 4 radio cards for booking step 1, Commissioner Appeal service card — ₹9,999, data-predep=false (+11 more)

### Community 35 - "Signup & Session"
Cohesion: 0.16
Nodes (13): sanitizeReturnTo(), BASE_URL, getCurrentUser, redirectIfAuthenticated(), LoginForm(), LoginPage(), LoginPageProps, metadata (+5 more)

### Community 36 - "Profile Page Guard"
Cohesion: 0.15
Nodes (13): requireUser(), CompleteProfileForm(), CompleteProfilePage(), metadata, DashboardLayout(), DraftPage(), PaymentsPage(), formatMemberSince() (+5 more)

### Community 37 - "Booking Detail Actions"
Cohesion: 0.2
Nodes (12): bookingApi, ApiRequestError, BookingDetailDTO, BookingDetailWithRelationsDTO, bookingRef(), formatInr(), metadata, BookingActionPanel() (+4 more)

### Community 38 - "FAQ & Callback"
Cohesion: 0.19
Nodes (11): FAQ_GROUPS, FAQ_SEARCH_UI, faqCta, faqHero, faqMeta, faqSchema, faqStillQuestions, FaqSection() (+3 more)

### Community 39 - "Changelog & Decisions Log"
Cohesion: 0.13
Nodes (18): Backend Development Roadmap, Locked Backend Invariants, 2026-06-16 EP2 Auth & Identity, 2026-07-03 EP13 Admin Frontend, 2026-07-05 Representation Bookable Service, 2026-07-08 Split-Repo Deploy Blocker Fixes, Changelog, client/AGENTS.md (+10 more)

### Community 40 - "Product Knowledge Base 1"
Cohesion: 0.13
Nodes (17): Missing Confirm-Draft Endpoint (Contract Gap), Confirm Draft - Hard Backend Gap (OQ-2), App Shell Component, Admin Flow (Access to Filing & Completion), Platform Interaction Flows, Shared State Machine - Full Service Lifecycle, User Flow (Discovery to Completion), Account Deletion Rules (KB1) (+9 more)

### Community 41 - "Brand Logo Assets"
Cohesion: 0.21
Nodes (17): Brand Color Palette (Navy Blue + Green), Navy Blue and Green Brand Colors, GST Notice Support (Brand Name), "GST Notice Support" Wordmark, Circular "C"-shaped Swoosh Enclosing GST Text, Brand Color Palette (Navy Blue + Green), Circular GST Monogram, GST Monogram Circular Emblem (+9 more)

### Community 42 - "Payment API Layer"
Cohesion: 0.19
Nodes (11): paymentController, paymentInitiateRateLimiter, paymentVerifyRateLimiter, IssueLike, validateParams(), validateQuery(), router, InitiateParams (+3 more)

### Community 43 - "Task Board & Roadmap"
Cohesion: 0.12
Nodes (16): 8-Phase Backend Roadmap Sequencing, Error #8 - Admin Login 401 from Stale .env Duplicate, Soft Delete + 7-Day S3 Cleanup Strategy, Backend Roadmap Alignment Section, Phase 2 Frontend Build Plan, Project README, Key Design Decisions Table (README), 15-Phase Roadmap (README) (+8 more)

### Community 44 - "Payment Verification Page"
Cohesion: 0.2
Nodes (10): paymentApi, InitiateParams, initiateParamsSchema, VerifyQuery, verifyQuerySchema, InvalidLinkState(), metadata, SearchParams (+2 more)

### Community 45 - "Architecture Decisions Log"
Cohesion: 0.18
Nodes (15): complete-profile Field-Set Conflict, 2026-06-17 EP3 Booking Lifecycle, D63 - Hostinger Hosting Decision, D64 - Payment History Pagination + Receipt Link, D65 - Login Security Alert Content, D67 - complete-profile Collects name+phone, D69 - 404 for Foreign-Booking Lookups, D70 - Booking State Machine Module (+7 more)

### Community 46 - "Product Knowledge Base 2"
Cohesion: 0.14
Nodes (14): 2026-07-03 EP12 Payment UI, D77 - Newman + Manual Payment Verification Split, Error #7 - Razorpay Test Checkout International Cards, Draft-Gated Payment Model, Pre-Deposit Disclosure (HLD), KB2 Decision Log (D34-D62), Project Knowledge Base 2, Payment Verification Page Specification (+6 more)

### Community 47 - "Homepage Hero Screenshot"
Cohesion: 0.19
Nodes (14): Book Service Button (nav, primary green CTA), Hero Headline ("GST Notice? Get Expert Legal Support in 24 Hours."), Hero Subheading (ICAI CAs / Bar Council Advocates, fully managed, fixed fee), Hero Video Placeholder (black box, unloaded media player), Homepage Hero Screenshot (frame-probe.png), Logo Element Bounding-Box Probe Overlay (red rectangle), Site Navbar (Logo, Services, About, Resources, Pricing, Phone, Request Callback, Book Service), Phone Number Display (+91 98000 00000) (+6 more)

### Community 48 - "Settings Page Screenshot"
Cohesion: 0.18
Nodes (14): Account Nav Item (active), Account Settings Panel, Billing Nav Item, Breadcrumb: Dashboard / Settings, Danger Zone Nav Item, Devices Nav Item, Email Address Field, Mobile Number Field (+6 more)

### Community 49 - "Hero Section Screenshot"
Cohesion: 0.22
Nodes (13): Secondary CTA: Request a Callback, Primary CTA: Upload Your Notice, Hero Headline: GST Notice? Get Expert Legal Support in 24 Hours., Hero Media Placeholder (video/image player, dark rounded panel), GSTNoticeSupport Logo/Wordmark, Nav Button: Book Service (primary CTA), Nav Button: Request Callback, Homepage Navbar (Services, About, Resources, Pricing) (+5 more)

### Community 50 - "Booking Test Runner"
Cohesion: 0.21
Nodes (11): colors, extractCookies(), http, https, logTest(), makeRequest(), results, runTests() (+3 more)

### Community 51 - "ASMT-10 Service Page"
Cohesion: 0.17
Nodes (12): Documents Required section, How It Works — 3-step process (upload, expert review, response filed), ASMT-10 Reply Service marketing page, Pricing & CTA section, What We Do section, ASMT-10 Scrutiny Notice service card — ₹4,999, Dashboard Home Mobile — iOS device preview wrapper, iOS device frame preview — React IOSDevice component loaded from frames/ios-frame.jsx (+4 more)

### Community 52 - "Service Detail Screenshot"
Cohesion: 0.24
Nodes (12): Cancel This Service Link, Case Information Card (name, email, mobile, GSTIN, org, filing period), Draft Ready Status Badge, Expert Summary Card (admin-authored case analysis), Header Bar (logo, phone, user profile menu), Pay to Unlock Draft Button (locked padlock icon), Pre-deposit Disclosure Line Item (Rs 19,000, as per GST Act), Reply Preparation Fee Line Item (Rs 4,999) (+4 more)

### Community 53 - "Dashboard Shell & Errors"
Cohesion: 0.25
Nodes (7): getErrorMessage(), DashboardShell(), DashboardShellProps, initials(), DashboardError(), BookingDetailError(), ShellLayout()

### Community 54 - "Pay-to-Unlock Checkout"
Cohesion: 0.22
Nodes (9): PayToUnlock(), PayToUnlockProps, loadRazorpayScript(), RazorpayCheckoutInstance, RazorpayCheckoutOptions, RazorpayConstructor, RazorpayFailureResponse, RazorpayPaymentResponse (+1 more)

### Community 55 - "Generic Test Runner"
Cohesion: 0.22
Nodes (9): colors, http, https, logTest(), makeRequest(), results, runTests(), testState (+1 more)

### Community 56 - "HLD/LLD Architecture Docs"
Cohesion: 0.25
Nodes (11): Service Status Badge Component, Accessibility Constraints, Service Status State Machine, Three Design Principles, High-Level Design (HLD), booking_documents table schema, bookings table schema, LLD Data Model (4 core + 3 aux tables) (+3 more)

### Community 57 - "Contact Page"
Cohesion: 0.29
Nodes (5): metadata, contactContent, contactHero, contactMeta, HeroScrollIndicator()

### Community 58 - "App Providers & Layout"
Cohesion: 0.24
Nodes (6): CalendlyCallbackListener(), inter, jetbrainsMono, metadata, Providers(), ProvidersProps

### Community 59 - "Auth API Test Suite"
Cohesion: 0.27
Nodes (10): server/src/controllers/auth.controller.ts, server/src/routes/auth.routes.ts, server/src/schemas/auth.schema.ts, server/src/services/auth.service.ts, server/src/middleware/authenticate.ts, test/test-runner.js, tokenBlacklistRepository, OTP Input Component (+2 more)

### Community 60 - "Admin Shell Guard"
Cohesion: 0.31
Nodes (7): AdminShell(), AdminShellProps, initials(), NAV_ITEMS, AdminLayout(), authApi, requireAdmin()

### Community 61 - "Scroll Animation Hooks"
Cohesion: 0.33
Nodes (6): useInView(), UseInViewOptions, AnimateIn(), AnimateInProps, CountUp(), CountUpProps

### Community 62 - "My Services Dashboard Screenshot"
Cohesion: 0.31
Nodes (9): Booking.status State Machine (document_upload, in_review, draft_ready, filing, complete, cancelled), Booking Status Badges (Draft Ready, In Review, Filing, Complete, Cancelled), Book New Service Button, Status Filter Tabs (All / Active / Complete / Cancelled), My Services Dashboard Page, Service Bookings Table (Service, Date, Status, Next Action, View), Sidebar Navigation (Dashboard, My Services, Payments, Settings), Prototype State Toggle (Populated / Empty filtered / Empty new user / Loading) (+1 more)

### Community 64 - "Admin Email Config Check"
Cohesion: 0.25
Nodes (4): clientEnvPath, contactTo, here, results

### Community 65 - "Schema Sync Script"
Cohesion: 0.33
Nodes (6): __dirname, HEADER(), main(), OUT_DIR, SRC_DIR, SYNC

### Community 66 - "Trust & Credibility Signals"
Cohesion: 0.29
Nodes (7): Company Identity section — CIN, GSTIN, legal name, office address, Expert Team section — real photos, ICAI/Bar reg numbers, LinkedIn, min. 3 members, Contact Details panel — phone, WhatsApp, email, office address, hours, Grievance Officer contact (grievance@gstnoticesupport.in), Request Callback banner, Design System §3.2 People & Proof — expert card, stats, testimonial, trust badges, Trust & Credibility Patterns — legal identity footer, real-photo team credibility, outcome proof, specific testimonials, upload reassurance, India-specific trust signals

### Community 67 - "Pricing Cards Screenshot"
Cohesion: 0.52
Nodes (7): ASMT-10 Reply pricing card (₹2,999), Book This Service button (repeated CTA pattern), Commissioner Appeal pricing card (₹9,999), GSTAT Appeal pricing card (₹14,999), Pricing Cards Screenshot (4-tier service pricing), Pre-deposit required by law badge (on GSTAT Appeal card), SCN Reply pricing card (₹5,999, Most Popular)

### Community 68 - "Change Password Form"
Cohesion: 0.4
Nodes (5): Banner, ChangePasswordForm(), strength(), STRENGTH_COLORS, STRENGTH_LABELS

### Community 69 - "Homepage FAQ Content"
Cohesion: 0.47
Nodes (4): HOME_FAQ_UI, HOME_FAQS, HomeFaqItem, FaqAccordion()

### Community 70 - "Dashboard Mobile Spec"
Cohesion: 0.47
Nodes (6): Narrowed Account Drawer (Menu), App Shell Header (Top), Fixed Bottom Tab Bar, Single-column Case Stack, Full-width Primary CTA, Dashboard Home — Mobile (Prototype Spec)

### Community 71 - "Admin Test Fixtures"
Cohesion: 0.6
Nodes (4): createBooking(), ensureTestUser(), main(), prisma

### Community 72 - "Final Draft Test Fixtures"
Cohesion: 0.6
Nodes (4): createBooking(), ensureTestUser(), main(), prisma

### Community 73 - "Privacy Policy Page"
Cohesion: 0.4
Nodes (5): Legal Breadcrumb Navigation (Home / Legal / Privacy Policy), DPDP Act 2023 & IT Rules 2011 Compliance Notice, Site Header (Logo, Phone, Menu), Privacy Policy Page, Scope & Applicability Section

### Community 74 - "Brand Identity"
Cohesion: 0.6
Nodes (5): GST Notice Support (brand name), GST Notice Support Logo, Navy blue + green brand color pairing, Notice document + shield/checkmark icon, "We Support, You Comply" tagline

### Community 77 - "Draft-Ready Booking Fixture"
Cohesion: 0.67
Nodes (3): createDraftReadyBooking(), main(), prisma

### Community 78 - "Graphify Integration Setup"
Cohesion: 0.5
Nodes (4): Graphify x Claude Code Integration Plan, Graphify Setup Pipeline (install to commit), Root CLAUDE.md (Graphify Trigger), Graphify Skill Trigger Rule

### Community 81 - "Next.js Boilerplate Assets"
Cohesion: 0.67
Nodes (3): client/public Static Assets Directory, Next.js Logo (next.svg), Next.js Framework

## Ambiguous Edges - Review These
- `Locked Backend Invariants` → `Error #11 - tsc 'env' possibly undefined on Hostinger`  [AMBIGUOUS]
  docs/tracking/ERROR.md · relation: conceptually_related_to
- `Error #5 - Schema Sync Blocked by @prisma/client string` → `Next.js Breaking-Changes Warning`  [AMBIGUOUS]
  docs/tracking/ERROR.md · relation: conceptually_related_to
- `Homepage Hero Screenshot (frame-probe.png)` → `Logo Element Bounding-Box Probe Overlay (red rectangle)`  [AMBIGUOUS]
  resources/ui/screenshots/frame-probe.png · relation: conceptually_related_to
- `Primary CTA: Upload Your Notice` → `Hero Media Placeholder (video/image player, dark rounded panel)`  [AMBIGUOUS]
  resources/ui/screenshots/hero-check.png · relation: conceptually_related_to
- `Account Nav Item (active)` → `Danger Zone Nav Item`  [AMBIGUOUS]
  resources/ui/screenshots/settings-check.png · relation: conceptually_related_to
- `Commissioner Appeal pricing card (₹9,999)` → `Pre-deposit required by law badge (on GSTAT Appeal card)`  [AMBIGUOUS]
  resources/ui/uploads/pasted-1780457476207-0.png · relation: conceptually_related_to

## Knowledge Gaps
- **462 isolated node(s):** `eslintConfig`, `nextConfig`, `config`, `__dirname`, `SRC_DIR` (+457 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Locked Backend Invariants` and `Error #11 - tsc 'env' possibly undefined on Hostinger`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Error #5 - Schema Sync Blocked by @prisma/client string` and `Next.js Breaking-Changes Warning`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Homepage Hero Screenshot (frame-probe.png)` and `Logo Element Bounding-Box Probe Overlay (red rectangle)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Primary CTA: Upload Your Notice` and `Hero Media Placeholder (video/image player, dark rounded panel)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Account Nav Item (active)` and `Danger Zone Nav Item`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Commissioner Appeal pricing card (₹9,999)` and `Pre-deposit required by law badge (on GSTAT Appeal card)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Motion Guidelines — restrained Framer Motion, allowed in exactly 3 places (booking step, upload confirmation, pay-to-unlock reveal)` connect `Booking Steps & Motion` to `Design System Docs`, `UI Design Rules`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._