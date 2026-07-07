## 1. SignUp Error
    {
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Validation failed",
        "details": [
            {
                "field": "name",
                "message": "Invalid input: expected string, received undefined"
            },
            {
                "field": "termsAccepted",
                "message": "Invalid input: expected boolean, received undefined"
            }
        ]
    }
}

---

## 2. S3 pre-signed PUT — `SignatureDoesNotMatch` (Phase 4, 2026-06-23)

**Symptom:** A browser/`fetch` PUT to a pre-signed upload URL returned `403 SignatureDoesNotMatch`. The canonical request showed `X-Amz-Checksum-Crc32=AAAAAA%3D%3D` and `x-amz-sdk-checksum-algorithm=CRC32` in the signed query string.

**Cause:** Recent `@aws-sdk/client-s3` versions enable flexible checksums by default (`requestChecksumCalculation: 'WHEN_SUPPORTED'`), baking a CRC32 value into the signed URL at signing time. When the client streams the real file body, the checksum no longer matches and S3 rejects the signature.

**Fix:** Create the `S3Client` with `requestChecksumCalculation: 'WHEN_REQUIRED'` and `responseChecksumValidation: 'WHEN_REQUIRED'` (`server/src/lib/s3.ts`). See D72.

---

## 3. S3 PUT — `AccessDenied: not authorized to perform: s3:PutObject` (Phase 4, 2026-06-23)

**Symptom:** After fixing the signature, the PUT returned `403 AccessDenied` — IAM user authorized for no S3 action.

**Cause:** The IAM user existed but had no identity-based policy granting object actions.

**Fix:** Attach an inline policy allowing `s3:PutObject`/`s3:GetObject`/`s3:DeleteObject` on `arn:aws:s3:::<bucket>/*` (no `ListBucket` — least privilege). See D72(e).

---

## 4. Newman — `Identifier 'data' has already been declared` (Phase 4, 2026-06-23)

**Symptom:** A Postman test script using `const data = pm.response.json().data;` threw a `SyntaxError` under Newman, which cascaded into later assertions (the captured `s3Key` was never set).

**Cause:** `data` is a reserved global in the Postman/Newman sandbox (the data-file variable). Re-declaring it with `const` is a collision.

**Fix:** Rename the local variable (used `const res = ...`) in the test script.

**Note:** Re-running the full Newman suite against a long-lived server eventually trips the `upload-url` 7/hr rate limit (in-memory counter persists across runs). Restart the server to reset the counter between full re-runs.

---

## 5. Schema sync script blocked — `@prisma/client` string in comment (EP11, 2026-06-29)

**Symptom:** `npm run sync:schemas` silently skipped `booking.schema.ts` despite adding it to the allow-list. A secondary `grep` scan revealed the sync script checks every file for the literal string `@prisma/client` and refuses to copy any file containing it.

**Cause:** The refactored `booking.schema.ts` still had a comment reading *"not z.nativeEnum from @prisma/client"*, which contains the blocked substring verbatim.

**Fix:** Reword all comments to avoid the substring. The comment was changed to *"not z.nativeEnum over a server-only import"*. The schema itself had already dropped the import — only the comment was the issue.

**Rule:** Any comment in a server schema intended for client sync must not mention the string `@prisma/client`. The sync guard (`BLOCK_PATTERN`) in `client/scripts/sync-shared-schemas.mjs` is intentional and must not be weakened.

---

## 6. Newman payment fixture — `ERR_MODULE_NOT_FOUND: Cannot find package 'dotenv'` (EP12, 2026-07-01)

**Symptom:** The payments Newman runner failed at the fixture step: `npx tsx` (run with cwd `server/`) could not resolve `dotenv` / `@prisma/client` from a script located at `test/postman/setup-draft-ready-booking.mjs`.

**Cause:** Node ESM resolves bare imports starting from the **importing file's** directory and walking up — not from the process cwd. A script under `test/postman/` walks `test/postman → test → repo root`, none of which contain `dotenv`/`@prisma/client` (those live in `server/node_modules`). `NODE_PATH` does not help ESM bare-specifier resolution.

**Fix:** Relocate the fixture to `server/scripts/setup-draft-ready-booking.mjs` so resolution finds `server/node_modules`. The runner calls it via `(cd ../../server && npx tsx scripts/setup-draft-ready-booking.mjs)`.

**Rule:** Any standalone `.mjs`/`.ts` script that imports server dependencies must live under `server/` (or be run with those deps resolvable from its own location), regardless of cwd.

---

## 7. Razorpay test checkout — "International cards are not supported" (EP12, 2026-07-01)

**Symptom:** Completing the Razorpay **test** Checkout with the common test card `4111 1111 1111 1111` returned "Payment could not be completed. International cards are not supported."

**Cause:** International payments are not enabled on the test account, and that card BIN is treated as international.

**Fix (testing):** Use **Netbanking → Success** on the mock bank page (`api.razorpay.com/v1/gateway/mocksharp/payment`) — the deterministic domestic test-capture path — or a domestic test card. This produces a real `captured` payment, fires the real signed webhook, and transitions the booking to `filing`.

**Note:** This is a test-account capability, not a code issue. Before production, enable the payment methods/cards you intend to accept in the Razorpay dashboard (and complete live-mode KYC).

---

## 8. Admin Newman runner — spurious admin login `401` from a stale `.env` duplicate (EP13, 2026-07-01)

**Symptom:** The first `run-admin-newman.sh` run passed unauthenticated (401) and RBAC (403) checks, but "Login (admin)" itself returned `401 INVALID_CREDENTIALS`. Every subsequent admin-only request then ran on the still-active **user** cookie and failed as `403`/`TypeError` instead of the expected `200` — a single root cause cascading into ~25 apparent failures.

**Cause:** `server/.env` contained **two** `ADMIN_EMAIL=`/`ADMIN_PASSWORD=` lines (an old value followed by the current one). The app and `prisma db seed` both load `.env` via `dotenv`, which is **last-value-wins**, so they use the correct, current password. The runner's credential extraction used `grep -E "^ADMIN_PASSWORD=" | head -1`, which grabs the **first** (stale) duplicate — a 9-character leftover instead of the real 14-character password. `bcrypt.compare` against the DB hash correctly rejected it.

---

## 9. Independent Hostinger deploys — client-only repo build failures (D93, 2026-07-08)

**Symptom (a):** `npm run build` in the standalone `frontend.gstnoticesupport` deploy repo (a copy of `client/` only, pushed to its own GitHub repo) failed at `predev`/`prebuild`: `Error: ENOENT: no such file or directory, scandir '.../server/src/schemas'`.

**Cause:** `client/scripts/sync-shared-schemas.mjs` resolves its source as `../../server/src/schemas` relative to itself, assuming the monorepo layout. A client-only repo has no `server/` sibling.

**Fix:** The script now checks `existsSync(SRC_DIR)` first; if absent, it verifies the already-committed files in `client/src/lib/shared-schemas/` are all present and skips the sync instead of throwing. Only fails loudly if a required generated file is actually missing.

**Symptom (b):** Same repo's `npm run build` then failed with `'next' is not recognized as an internal or external command`.

**Cause:** `node_modules` had never been installed in the standalone repo.

**Fix:** Run `npm install` before `npm run build` in every environment (including Hostinger's build step) — not a code fix.

---

## 10. Independent Hostinger deploys — CORS blocked + login doesn't redirect (D93, 2026-07-08)

**Symptom (a):** Browser console: `Access to fetch at 'https://api.gstnoticesupport.in//api/v1/auth/login' ... blocked by CORS policy: ... No 'Access-Control-Allow-Origin' header`. Note the double slash before `api/v1`.

**Cause:** Two independent bugs. First, `client/src/lib/api/client.ts` and `client/src/lib/auth/session.ts` built request URLs as `` `${BASE_URL}/api/v1${path}` `` with no trailing-slash normalization on `NEXT_PUBLIC_API_URL`, producing `https://api.gstnoticesupport.in//api/v1/...` when the env var had a trailing slash. Second, and the actual cause of the missing CORS header: `server/src/index.ts` sets `cors({ origin: env.CLIENT_URL })`, an exact-string match against the request's `Origin` header. The deployed `server/.env`'s `CLIENT_URL` was `https://gstnoticesupport.in/` (trailing slash) — browsers never send a trailing slash in `Origin`, so the `cors` package silently omitted the header rather than erroring.

**Fix:** `client.ts`/`session.ts` now strip trailing slashes from `BASE_URL` defensively. The real fix is deployment config: `CLIENT_URL=https://gstnoticesupport.in` (no trailing slash) on the Hostinger backend app, followed by a process restart (env vars are read once at boot via `dotenv/config`).

**Symptom (b):** After the CORS fix, login/signup succeeded (200 response) but the browser stayed on `/login`, and post-signup flows bounced back to `/login` too.

**Cause:** `client/src/lib/auth/session.ts`'s `getCurrentUser()` forwards the browser's own cookies (via Next.js `cookies()`) to the backend's `/auth/me`. The auth cookie is set by `api.gstnoticesupport.in` and, with `COOKIE_DOMAIN` unset in `server/src/utils/cookies.ts`, is scoped to that exact host — the browser never attaches it to requests made to `gstnoticesupport.in` (the frontend's own Next.js server), so `cookies().toString()` is empty and `requireUser()` redirects to `/login`.

**Fix:** Set `COOKIE_DOMAIN=.gstnoticesupport.in` on the Hostinger backend app so the cookie is shared across both subdomains. Requires a backend restart to take effect.

---

## 11. Backend `tsc` build failure on Hostinger — `'env' is possibly 'undefined'` (D93, 2026-07-08)

**Symptom:** `server/src/utils/cookies.ts(5,16)` / `(16,9)` / `(16,39)`: `error TS18048: 'env' is possibly 'undefined'`, referencing `env.NODE_ENV` and `env.COOKIE_DOMAIN`. Did not reproduce locally — `npx tsc --noEmit` in the monorepo and in a fresh install of the `backend.gstnoticesupport` deploy repo (same pinned `typescript@5.9.3`/`@types/node@20.19.42`/`zod@4.4.3` per its lockfile) both compiled clean.

**Cause:** `server/src/lib/env.ts` narrowed `result.data` to non-`undefined` after `if (!result.success) { ...; process.exit(1); }`, relying on `@types/node` typing `process.exit` as returning `never`. Some build environment (exact cause unconfirmed — likely a `devDependencies` install discrepancy on Hostinger's build step, since `typescript`/`@types/node` are devDependencies and `NODE_ENV=production` at install time can cause npm to skip them) resolved a `process.exit` signature that didn't narrow the type, so `env`'s exported type included `undefined`.

**Fix:** Added an explicit `throw new Error('unreachable')` immediately after `process.exit(1)` in the `if (!result.success)` block. `throw` is always recognized as non-returning by TypeScript's control-flow analysis regardless of a library's type declarations, making the narrowing immune to this class of environment difference.

**Diagnosis path:** Verified in order, without ever printing the secret itself: (1) the *literal* credential the user provided also failed login — ruling out a typo on my end; (2) direct DB lookup showed `bcrypt.compare(process.env.ADMIN_PASSWORD, hash)` via `dotenv` was `true`, so the seeded hash was correct; (3) `read_env`'s extracted value was a different *length* (9 vs. 14 chars) than the dotenv-resolved value — isolating the bug to the shell extraction, not the database or the app.

**Fix:** Changed `run-admin-newman.sh` to resolve `ADMIN_EMAIL`/`ADMIN_PASSWORD` via `node -e "require('dotenv').config(); ..."` (the exact mechanism the app and seed script use) instead of `grep | head -1`. The user then deduplicated `server/.env` directly, which independently makes `grep | head -1` correct too — but the dotenv-based extraction is the durable fix regardless of `.env` hygiene.

**Rule:** Any test runner that reads secrets out of `.env` for injection into Newman/curl must resolve them the same way the application does (`dotenv`, last-value-wins), never `grep -E "^KEY=" | head -1` — a duplicate or commented-out line silently produces the wrong value with no error. `test/postman/run-payments-newman.sh` uses the same `grep | head -1` pattern for `ADMIN_EMAIL`/`ADMIN_PASSWORD`/Razorpay secrets and carries the same latent risk if `.env` ever regains a duplicate; not yet migrated to the dotenv-based pattern.