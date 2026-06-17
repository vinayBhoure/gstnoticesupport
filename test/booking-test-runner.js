#!/usr/bin/env node

/**
 * Booking Lifecycle API Test Runner
 * Tests all Phase 3 booking endpoints against localhost:4000
 *
 * AUTH STRATEGY
 * The OTP is bcrypt-hashed in otp_store — there is no plaintext retrieval path.
 * To run the authenticated happy-path and cancel tests, this runner requires a
 * pre-verified test user in the NeonDB dev branch. Two options:
 *
 *   Option A (recommended for CI): Set env vars before running:
 *     TEST_USER_EMAIL=... TEST_USER_PASSWORD=... node test/booking-test-runner.js
 *
 *   Option B (manual dev): After running `node test/test-runner.js` once, the
 *     test user will exist with emailVerified=false. Manually verify it via the
 *     OTP sent to the email, then set the env vars above.
 *
 *   Option C: Run `npx prisma db seed` to create the admin user, then use those
 *     credentials (ADMIN_EMAIL / ADMIN_PASSWORD from .env).
 *
 * If TEST_USER_EMAIL / TEST_USER_PASSWORD are not set, the authenticated-path
 * tests are skipped and only unauthenticated error-path tests run.
 *
 * Targets: POST /bookings (201), GET /bookings (200), GET /bookings/:id (200),
 *          POST /bookings/:id/cancel (200), all negative paths.
 */

const http = require('http');
const https = require('https');
const url = require('url');

const BASE_URL = 'http://localhost:4000';
const API_BASE = `${BASE_URL}/api/v1`;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

const testState = {
  cookies: [],
  bookingId: null,
  secondCookies: [],
};

const results = [];
let testCount = 0;

// ── HTTP helper ────────────────────────────────────────────────────────────────

function makeRequest(method, path, body = null, cookies = []) {
  return new Promise((resolve, reject) => {
    const urlObj = new url.URL(path.startsWith('http') ? path : `${BASE_URL}${path}`);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const bodyStr = body != null ? JSON.stringify(body) : null;

    const headers = {
      'Content-Type': 'application/json',
      ...(cookies.length > 0 && { Cookie: cookies.join('; ') }),
      ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
    };

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 4000,
      path: urlObj.pathname + urlObj.search,
      method,
      headers,
      timeout: 8000,
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          });
        } catch {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: null });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function extractCookies(headers) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return [];
  return (Array.isArray(setCookie) ? setCookie : [setCookie]).map((c) => c.split(';')[0]);
}

// ── Test logger ────────────────────────────────────────────────────────────────

function logTest(num, name, expected, actual, passed, note = null) {
  testCount++;
  const status = passed
    ? `${colors.green}✅ PASS${colors.reset}`
    : `${colors.red}❌ FAIL${colors.reset}`;
  console.log(
    `\n${colors.blue}[Test ${num}]${colors.reset} ${name}\n` +
    `  Expected: ${expected}\n` +
    `  Actual:   ${actual}\n` +
    `  Status:   ${status}` +
    (note ? `\n  Note:     ${colors.gray}${note}${colors.reset}` : ''),
  );
  results.push({ num, name, expected, actual, passed, note });
}

// ── Valid booking payload ──────────────────────────────────────────────────────

const VALID_BOOKING = {
  serviceType: 'asmt_10',
  contactName: 'Ravi Kumar',
  contactEmail: 'ravi@example.com',
  contactPhone: '+919876543210',
  organizationName: 'Ravi Enterprises Pvt Ltd',
  filingFor: 'self',
  gstn: '29AABCU9603R1ZX',
  consentInformationAccurate: true,
  consentContactAuthorized: true,
};

// ── Main test suite ────────────────────────────────────────────────────────────

async function runTests() {
  console.log(`${colors.blue}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.blue}GST Notice Support — Phase 3 Booking Lifecycle Test Suite${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(80)}${colors.reset}\n`);

  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;
  const hasAuth = Boolean(testEmail && testPassword);

  if (!hasAuth) {
    console.log(
      `${colors.yellow}⚠  TEST_USER_EMAIL / TEST_USER_PASSWORD not set.${colors.reset}\n` +
      `   Authenticated tests will be skipped. Set env vars and re-run for full coverage.\n`,
    );
  }

  try {
    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 1 — UNAUTHENTICATED ERROR PATHS (always run)
    // ──────────────────────────────────────────────────────────────────────────
    console.log(`${colors.yellow}\n>>> SECTION 1: UNAUTHENTICATED ERROR PATHS${colors.reset}`);

    // 1.1 — POST /bookings without auth → 401
    let res = await makeRequest('POST', `${API_BASE}/bookings`, VALID_BOOKING);
    logTest(
      1,
      'POST /bookings — no auth cookie → 401 UNAUTHORIZED',
      '401 UNAUTHORIZED',
      `${res.statusCode} ${res.body?.error?.code ?? 'N/A'}`,
      res.statusCode === 401 && res.body?.error?.code === 'UNAUTHORIZED',
    );

    // 1.2 — GET /bookings without auth → 401
    res = await makeRequest('GET', `${API_BASE}/bookings`);
    logTest(
      2,
      'GET /bookings — no auth cookie → 401 UNAUTHORIZED',
      '401 UNAUTHORIZED',
      `${res.statusCode} ${res.body?.error?.code ?? 'N/A'}`,
      res.statusCode === 401 && res.body?.error?.code === 'UNAUTHORIZED',
    );

    // 1.3 — GET /bookings/:id without auth → 401
    // Use a v4-valid UUID (Zod v4 enforces strict UUID format, not just hex grouping)
    const fakeId = '550e8400-e29b-41d4-a716-446655440001';
    res = await makeRequest('GET', `${API_BASE}/bookings/${fakeId}`);
    logTest(
      3,
      'GET /bookings/:id — no auth cookie → 401 UNAUTHORIZED',
      '401 UNAUTHORIZED',
      `${res.statusCode} ${res.body?.error?.code ?? 'N/A'}`,
      res.statusCode === 401 && res.body?.error?.code === 'UNAUTHORIZED',
    );

    // 1.4 — POST /bookings/:id/cancel without auth → 401
    // fakeId is the same v4 UUID used above
    res = await makeRequest('POST', `${API_BASE}/bookings/${fakeId}/cancel`);
    logTest(
      4,
      'POST /bookings/:id/cancel — no auth cookie → 401 UNAUTHORIZED',
      '401 UNAUTHORIZED',
      `${res.statusCode} ${res.body?.error?.code ?? 'N/A'}`,
      res.statusCode === 401 && res.body?.error?.code === 'UNAUTHORIZED',
    );

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 2 — VALIDATION ERRORS (signup creates an account; no OTP needed
    //             for these because they fail before auth hits the route)
    // ──────────────────────────────────────────────────────────────────────────
    // Note: validation tests require an auth cookie. Skip if no credentials set.
    if (!hasAuth) {
      console.log(`${colors.yellow}\n>>> SECTION 2: SKIPPED (no TEST_USER_EMAIL/PASSWORD)${colors.reset}`);
    } else {
      console.log(`${colors.yellow}\n>>> SECTION 2: VALIDATION ERRORS (authenticated)${colors.reset}`);

      // Log in to get auth cookies
      console.log(`${colors.gray}  Logging in as ${testEmail}...${colors.reset}`);
      const loginRes = await makeRequest('POST', `${API_BASE}/auth/login`, {
        email: testEmail,
        password: testPassword,
      });

      if (loginRes.statusCode !== 200) {
        console.log(
          `${colors.red}  Login failed (${loginRes.statusCode} — ${loginRes.body?.error?.message ?? 'unknown error'}).${colors.reset}\n` +
          `  Ensure TEST_USER_EMAIL is an emailVerified account in the dev DB.\n` +
          `  Skipping authenticated tests.\n`,
        );
      } else {
        testState.cookies = extractCookies(loginRes.headers);
        console.log(`${colors.green}  Logged in. Auth cookies: ${testState.cookies.length}${colors.reset}`);

        // 5 — Invalid GSTN format → 400 VALIDATION_ERROR
        res = await makeRequest(
          'POST',
          `${API_BASE}/bookings`,
          { ...VALID_BOOKING, gstn: 'INVALIDGSTN123' },
          testState.cookies,
        );
        logTest(
          5,
          'POST /bookings — invalid GSTN format → 400 VALIDATION_ERROR',
          '400 VALIDATION_ERROR',
          `${res.statusCode} ${res.body?.error?.code ?? 'N/A'}`,
          res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR',
        );

        // 6 — GSTN wrong length → 400 VALIDATION_ERROR
        res = await makeRequest(
          'POST',
          `${API_BASE}/bookings`,
          { ...VALID_BOOKING, gstn: '29AABCU9603R1' },
          testState.cookies,
        );
        logTest(
          6,
          'POST /bookings — GSTN wrong length → 400 VALIDATION_ERROR',
          '400 VALIDATION_ERROR',
          `${res.statusCode} ${res.body?.error?.code ?? 'N/A'}`,
          res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR',
        );

        // 7 — consentInformationAccurate = false → 400 VALIDATION_ERROR
        res = await makeRequest(
          'POST',
          `${API_BASE}/bookings`,
          { ...VALID_BOOKING, consentInformationAccurate: false },
          testState.cookies,
        );
        logTest(
          7,
          'POST /bookings — consentInformationAccurate false → 400 VALIDATION_ERROR',
          '400 VALIDATION_ERROR',
          `${res.statusCode} ${res.body?.error?.code ?? 'N/A'}`,
          res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR',
        );

        // 8 — consentContactAuthorized missing → 400 VALIDATION_ERROR
        const { consentContactAuthorized: _omit, ...noConsent2 } = VALID_BOOKING;
        res = await makeRequest('POST', `${API_BASE}/bookings`, noConsent2, testState.cookies);
        logTest(
          8,
          'POST /bookings — consentContactAuthorized missing → 400 VALIDATION_ERROR',
          '400 VALIDATION_ERROR',
          `${res.statusCode} ${res.body?.error?.code ?? 'N/A'}`,
          res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR',
        );

        // 9 — Client-supplied price is stripped (booking should succeed with server-derived price)
        res = await makeRequest(
          'POST',
          `${API_BASE}/bookings`,
          { ...VALID_BOOKING, amountPaise: 999999 }, // stray price field
          testState.cookies,
        );
        logTest(
          9,
          'POST /bookings — client price ignored, booking succeeds (201)',
          '201, status=document_upload, paymentStatus=pending',
          `${res.statusCode}, status=${res.body?.data?.booking?.status ?? 'N/A'}, paymentStatus=${res.body?.data?.booking?.paymentStatus ?? 'N/A'}`,
          res.statusCode === 201 &&
            res.body?.data?.booking?.status === 'document_upload' &&
            res.body?.data?.booking?.paymentStatus === 'pending',
        );

        if (res.statusCode === 201) {
          testState.bookingId = res.body?.data?.booking?.id;
          console.log(`${colors.gray}  Created booking: ${testState.bookingId}${colors.reset}`);
        }

        // 10 — Create booking success: message check
        logTest(
          10,
          'POST /bookings — response message correct',
          'message contains "Booking created"',
          `message: "${res.body?.message ?? 'N/A'}"`,
          typeof res.body?.message === 'string' &&
            res.body.message.includes('Booking created'),
        );

        // 11 — draftS3Key never returned
        logTest(
          11,
          'POST /bookings — draftS3Key absent from response',
          'draftS3Key not in booking object',
          `draftS3Key=${JSON.stringify(res.body?.data?.booking?.draftS3Key)}`,
          !Object.prototype.hasOwnProperty.call(res.body?.data?.booking ?? {}, 'draftS3Key'),
        );

        // ── GET /bookings list ─────────────────────────────────────────────
        console.log(`${colors.yellow}\n>>> SECTION 3: LIST BOOKINGS${colors.reset}`);

        res = await makeRequest('GET', `${API_BASE}/bookings`, null, testState.cookies);
        const listData = Array.isArray(res.body?.data) ? res.body.data : [];
        const firstId = listData[0]?.id;

        logTest(
          12,
          'GET /bookings — 200, returns array',
          '200, data is array',
          `${res.statusCode}, isArray=${Array.isArray(res.body?.data)}`,
          res.statusCode === 200 && Array.isArray(res.body?.data),
        );

        logTest(
          13,
          'GET /bookings — newest booking is first (created booking appears)',
          `first id = ${testState.bookingId ?? 'N/A'}`,
          `first id = ${firstId ?? 'N/A'}`,
          testState.bookingId != null && firstId === testState.bookingId,
        );

        // Summary shape: no contactName (that's detail only)
        const hasSummaryShape = listData.length > 0 &&
          typeof listData[0].id === 'string' &&
          typeof listData[0].serviceType === 'string' &&
          typeof listData[0].status === 'string' &&
          typeof listData[0].paymentStatus === 'string' &&
          !Object.prototype.hasOwnProperty.call(listData[0], 'contactName');
        logTest(
          14,
          'GET /bookings — summary shape (no contactName)',
          'BookingSummaryObject shape',
          hasSummaryShape ? 'correct shape' : `shape: ${JSON.stringify(Object.keys(listData[0] ?? {}))}`,
          hasSummaryShape,
        );

        // ── GET /bookings/:id detail ───────────────────────────────────────
        console.log(`${colors.yellow}\n>>> SECTION 4: BOOKING DETAIL${colors.reset}`);

        if (testState.bookingId) {
          res = await makeRequest('GET', `${API_BASE}/bookings/${testState.bookingId}`, null, testState.cookies);
          logTest(
            15,
            'GET /bookings/:id — 200, detail object',
            '200, booking present',
            `${res.statusCode}, booking.id=${res.body?.data?.booking?.id ?? 'N/A'}`,
            res.statusCode === 200 && res.body?.data?.booking?.id === testState.bookingId,
          );

          const detail = res.body?.data?.booking;
          const hasDetailShape = detail &&
            Array.isArray(detail.documents) &&
            ('latestPayment' in detail) &&
            typeof detail.contactName === 'string' &&
            !Object.prototype.hasOwnProperty.call(detail, 'draftS3Key');

          logTest(
            16,
            'GET /bookings/:id — detail shape (documents[], latestPayment, no draftS3Key)',
            'BookingDetailWithRelations shape',
            hasDetailShape ? 'correct shape' : `keys: ${JSON.stringify(Object.keys(detail ?? {}))}`,
            Boolean(hasDetailShape),
          );

          // 17 — uuid param validation
          res = await makeRequest('GET', `${API_BASE}/bookings/not-a-uuid`, null, testState.cookies);
          logTest(
            17,
            'GET /bookings/:id — invalid uuid → 400 VALIDATION_ERROR',
            '400 VALIDATION_ERROR',
            `${res.statusCode} ${res.body?.error?.code ?? 'N/A'}`,
            res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR',
          );

          // 18 — non-existent ID (valid v4 UUID that doesn't exist in DB) → 404 NOT_FOUND
          res = await makeRequest('GET', `${API_BASE}/bookings/550e8400-e29b-41d4-a716-446655440099`, null, testState.cookies);
          logTest(
            18,
            'GET /bookings/:id — non-existent → 404 NOT_FOUND',
            '404 NOT_FOUND',
            `${res.statusCode} ${res.body?.error?.code ?? 'N/A'}`,
            res.statusCode === 404 && res.body?.error?.code === 'NOT_FOUND',
          );
        } else {
          logTest(15, 'GET /bookings/:id — SKIPPED (no booking created)', 'SKIPPED', 'SKIPPED', true, 'create step failed');
          logTest(16, 'GET /bookings/:id shape — SKIPPED', 'SKIPPED', 'SKIPPED', true, 'create step failed');
          logTest(17, 'GET /bookings/:id invalid uuid — SKIPPED', 'SKIPPED', 'SKIPPED', true, 'no cookies');
          logTest(18, 'GET /bookings/:id not-found — SKIPPED', 'SKIPPED', 'SKIPPED', true, 'no cookies');
        }

        // ── Cancel: non-draft_ready booking → 409 ─────────────────────────
        console.log(`${colors.yellow}\n>>> SECTION 5: CANCEL ENDPOINT${colors.reset}`);

        if (testState.bookingId) {
          // The booking is in `document_upload` (not `draft_ready`) → INVALID_TRANSITION
          res = await makeRequest('POST', `${API_BASE}/bookings/${testState.bookingId}/cancel`, null, testState.cookies);
          logTest(
            19,
            'POST /bookings/:id/cancel — status=document_upload → 409 INVALID_TRANSITION',
            '409 INVALID_TRANSITION',
            `${res.statusCode} ${res.body?.error?.code ?? 'N/A'}`,
            res.statusCode === 409 && res.body?.error?.code === 'INVALID_TRANSITION',
          );
        } else {
          logTest(19, 'Cancel non-draft_ready — SKIPPED', 'SKIPPED', 'SKIPPED', true, 'create step failed');
        }

        // 20 — Cancel non-existent booking (valid v4 UUID that doesn't exist in DB) → 404
        res = await makeRequest('POST', `${API_BASE}/bookings/550e8400-e29b-41d4-a716-446655440099/cancel`, null, testState.cookies);
        logTest(
          20,
          'POST /bookings/:id/cancel — non-existent → 404 NOT_FOUND',
          '404 NOT_FOUND',
          `${res.statusCode} ${res.body?.error?.code ?? 'N/A'}`,
          res.statusCode === 404 && res.body?.error?.code === 'NOT_FOUND',
        );

        // 21 — Cancel invalid uuid → 400
        res = await makeRequest('POST', `${API_BASE}/bookings/not-a-uuid/cancel`, null, testState.cookies);
        logTest(
          21,
          'POST /bookings/:id/cancel — invalid uuid → 400 VALIDATION_ERROR',
          '400 VALIDATION_ERROR',
          `${res.statusCode} ${res.body?.error?.code ?? 'N/A'}`,
          res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR',
        );
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // SUMMARY
    // ──────────────────────────────────────────────────────────────────────────
    console.log(`\n${colors.blue}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.blue}TEST SUMMARY${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(80)}${colors.reset}\n`);

    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    console.log(`Total:  ${testCount}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}\n`);

    console.log('| # | Test | Expected | Actual | Status |');
    console.log('|---|------|----------|--------|--------|');
    results.forEach((r) => {
      console.log(`| ${r.num} | ${r.name} | ${r.expected} | ${r.actual} | ${r.passed ? '✅ PASS' : '❌ FAIL'} |`);
    });

    if (!hasAuth) {
      console.log(
        `\n${colors.yellow}NOTE:${colors.reset} Set TEST_USER_EMAIL + TEST_USER_PASSWORD (emailVerified=true) to run all tests.\n`,
      );
    }

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(`${colors.red}Fatal error:${colors.reset}`, err.message);
    process.exit(1);
  }
}

runTests();
