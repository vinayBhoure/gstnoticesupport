# Zone 5 — Admin Users (2 screens) — claude.ai/design prompts

> SIDEBAR: both screens use the admin App Shell. Ensure `components.md → App Shell` admin
> links now read: `Overview · Bookings · Users · Settings` (Users link → /admin/users).
> Generate Users List first, then User Detail.

---

## Prompt 1 — Users List

SCREEN: Admin Users — /admin/users — desktop (minimal mobile fallback)
PURPOSE: Let the admin browse all registered users and open one.
PRIMARY ACTION: Open a user (row click → User Detail).
SECONDARY ACTIONS: Search by name or email; paginate.

LAYOUT (top to bottom):
- App Shell sidebar (Users active) + header strip.
- Page header: H2 "Users"; sub-line "N users".
- Controls bar (wraps <lg): search input (name / email) · "Clear" [Tertiary] when active. No status filter.
- Admin Data Table — cols: Name · Email · Mobile · Interested Services · chevron.
  Not sortable (default order: newest first). Row click → /admin/users/[id]. Pagination footer (25/page).
  Soft-deleted users are excluded from the list entirely.
- RESPONSIVE (<lg): sidebar → drawer; controls stack; table → horizontal scroll (no card collapse — desktop-primary).

SHELL: components.md → App Shell (sidebar) [admin links, Users active]
COMPONENTS: components.md → App Shell, Form Field Primitives (search), Buttons; Admin Data Table
COPY: H2 "Users"; search placeholder "Search by name or email"; "Clear";
  Interested Services cell shows comma-separated service names (e.g. "ASMT-10 Reply, SCN Reply") or "—" if none;
  empty-no-data "No users yet."; empty-no-results "No users match your search."
TRUST ELEMENTS: none (admin-internal).
MOTION: none.
STATES: loading (skeleton rows) · populated · empty-no-data · empty-no-results (search) · error (load failed → retry).
ACCESSIBILITY: labeled search input; rows focusable with visible focus ring, Enter opens detail;
  Interested Services is plain selectable text, not pills.
INHERITS: design.md §1–§7

---

## Prompt 2 — User Detail

SCREEN: Admin User Detail — /admin/users/[id] — desktop (minimal mobile fallback)
PURPOSE: Show a single user's core details and allow deletion when permitted.
PRIMARY ACTION: Delete user (only when allowed).
SECONDARY ACTIONS: Return to Users list.

LAYOUT (top to bottom):
- App Shell sidebar (Users active) + header strip.
- "← Back to users" link.
- Detail header: user's Name (H2).
- User Information (read-only card): labeled rows — Name · Mobile · Email · Interested Services.
  Values are labeled text, NOT inputs. Note: "Read-only — admin cannot edit user profiles."
  No booking history, joined date, or account status on this screen.
- Delete User (card, below info):
  - When user has NO active booking: "Delete user" [Primary] enabled. Opens Confirmation Dialog (destructive,
    typed-confirmation): admin types the user's email to confirm (string match, no OTP). On success → soft delete,
    return to /admin/users with confirmation "User deleted."
  - When user HAS an active booking (document_upload / in_review / draft_ready / filing): button visible but
    DISABLED with a reason shown beneath it. Never silently hidden (design.md §3).
  - Note: delete button is [Primary] green, not red — palette has no destructive token (design.md §2.1);
    weight is carried by copy + the typed-email confirmation step.
- RESPONSIVE (<lg): sidebar → drawer; cards full-width stacked.

SHELL: components.md → App Shell (sidebar) [admin links, Users active]
COMPONENTS: components.md → App Shell, Buttons; Confirmation Dialog (destructive)
COPY: "← Back to users"; labels "Name / Mobile / Email / Interested Services";
  "Read-only — admin cannot edit user profiles.";
  Interested Services = comma-separated service names or "—";
  "Delete user";
  disabled reason "This user has {n} active booking(s). Users can only be deleted once all their bookings are complete or cancelled.";
  dialog title "Delete this user?";
  dialog body "This removes the user's account. Their booking and payment records are retained for compliance. This can't be undone.";
  dialog field label "Type the user's email to confirm" (show the email above for reference);
  dialog destructive button "Delete user"; dialog secondary "Cancel";
  dialog mismatch error "Email doesn't match.";
  success confirmation "User deleted."
TRUST ELEMENTS: none.
MOTION: none.
STATES: loading (card skeleton) · loaded ·
  delete control (enabled / disabled-with-reason) ·
  dialog (idle: action disabled until email matches / ready / submitting / error / success → close + redirect) ·
  user load error → retry.
ACCESSIBILITY: read-only fields are labeled text, not focusable inputs; back link and delete button keyboard-reachable;
  dialog traps focus, Esc + scrim-click cancel, focus returns to the delete button on close;
  destructive action disabled until typed email matches (announced); error tied to the field.
INHERITS: design.md §1–§7
