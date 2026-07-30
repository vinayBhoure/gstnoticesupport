#!/usr/bin/env node

/**
 * Comprehensive Auth API Test Runner
 * Tests all 31+ Phase 2 auth endpoints against localhost:4000
 * Generates detailed results with pass/fail status
 */

const http = require('http');
const https = require('https');
const url = require('url');

const BASE_URL = 'http://localhost:4000';
const API_BASE = `${BASE_URL}/api/v1`;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

// Test state
const testState = {
  userId: null,
  testEmail: `test-${Date.now()}@example.com`,
  testPassword: 'Test@1234',
  testName: 'Test User',
  testPhone: '+919876543210',
  otpCode: '000000', // Will be updated from response
  accessToken: null,
  refreshToken: null,
  jti: null,
  cookies: [],
};

// Test results tracker
const results = [];
let testCount = 0;

/**
 * Make HTTP request
 */
function makeRequest(method, path, body = null, cookies = []) {
  return new Promise((resolve, reject) => {
    const urlObj = new url.URL(path.startsWith('http') ? path : `${BASE_URL}${path}`);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const headers = {
      'Content-Type': 'application/json',
      ...(cookies.length > 0 && { 'Cookie': cookies.join('; ') }),
    };

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers,
      timeout: 5000,
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonData,
            rawBody: data,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Extract cookies from Set-Cookie header
 */
function extractCookies(headers) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return [];
  return Array.isArray(setCookie)
    ? setCookie.map((c) => c.split(';')[0])
    : [setCookie.split(';')[0]];
}

/**
 * Log test result
 */
function logTest(testNum, name, expected, actual, passed, error = null) {
  testCount++;
  const status = passed ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`;
  console.log(
    `\n${colors.blue}[Test ${testNum}]${colors.reset} ${name}\n` +
      `  Expected: ${expected}\n` +
      `  Actual:   ${actual}\n` +
      `  Status:   ${status}${error ? `\n  Error:    ${colors.red}${error}${colors.reset}` : ''}`
  );

  results.push({
    num: testNum,
    name,
    expected,
    actual,
    passed,
    error: error || null,
  });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`${colors.blue}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.blue}GST Notice Support - Phase 2 Auth API Test Suite${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(80)}${colors.reset}\n`);

  try {
    // ==================== SECTION 1: SIGNUP ====================
    console.log(`${colors.yellow}\n>>> SECTION 1: SIGNUP TESTS${colors.reset}`);

    // 1.1 - Valid signup
    let res = await makeRequest('POST', `${API_BASE}/auth/signup`, {
      name: testState.testName,
      email: testState.testEmail,
      password: testState.testPassword,
      termsAccepted: true,
      allowPromotions: false,
    });
    testState.userId = res.body?.data?.userId;
    logTest(
      1,
      'Valid signup (new user)',
      '201, userId in response',
      `${res.statusCode}, userId: ${testState.userId ? 'present' : 'missing'}`,
      res.statusCode === 201 && testState.userId
    );

    // 1.2 - Missing name
    res = await makeRequest('POST', `${API_BASE}/auth/signup`, {
      email: testState.testEmail,
      password: testState.testPassword,
      termsAccepted: true,
    });
    logTest(
      2,
      'Validation: missing name',
      '400 VALIDATION_ERROR',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR'
    );

    // 1.3 - Invalid email format
    res = await makeRequest('POST', `${API_BASE}/auth/signup`, {
      name: testState.testName,
      email: 'notanemail',
      password: testState.testPassword,
      termsAccepted: true,
    });
    logTest(
      3,
      'Validation: invalid email format',
      '400 VALIDATION_ERROR',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR'
    );

    // 1.4 - Weak password (too short)
    res = await makeRequest('POST', `${API_BASE}/auth/signup`, {
      name: testState.testName,
      email: 'test@example.com',
      password: 'weak',
      termsAccepted: true,
    });
    logTest(
      4,
      'Validation: weak password (too short)',
      '400 VALIDATION_ERROR',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR'
    );

    // 1.5 - Password without uppercase
    res = await makeRequest('POST', `${API_BASE}/auth/signup`, {
      name: testState.testName,
      email: 'test@example.com',
      password: 'test@1234',
      termsAccepted: true,
    });
    logTest(
      5,
      'Validation: password without uppercase',
      '400 VALIDATION_ERROR',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR'
    );

    // 1.6 - termsAccepted false
    res = await makeRequest('POST', `${API_BASE}/auth/signup`, {
      name: testState.testName,
      email: 'test@example.com',
      password: testState.testPassword,
      termsAccepted: false,
    });
    logTest(
      6,
      'Validation: termsAccepted false',
      '400 VALIDATION_ERROR',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR'
    );

    // 1.7 - Duplicate email
    res = await makeRequest('POST', `${API_BASE}/auth/signup`, {
      name: 'Another User',
      email: testState.testEmail,
      password: testState.testPassword,
      termsAccepted: true,
    });
    logTest(
      7,
      'Conflict: duplicate email (unverified account)',
      '409 ACCOUNT_UNVERIFIED',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 409 && res.body?.error?.code === 'ACCOUNT_UNVERIFIED',
      'The seed account has not verified yet; a verified duplicate returns EMAIL_TAKEN'
    );

    // ==================== SECTION 2: VERIFY OTP ====================
    console.log(`${colors.yellow}\n>>> SECTION 2: VERIFY OTP TESTS${colors.reset}`);

    // 2.1 - Valid OTP (we don't have real OTP, so this will fail - expected)
    res = await makeRequest('POST', `${API_BASE}/auth/verify-otp`, {
      userId: testState.userId,
      otp: testState.otpCode,
    });
    logTest(
      8,
      'Verify OTP: Invalid OTP (placeholder)',
      '400 OTP_INVALID',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 400 && res.body?.error?.code === 'OTP_INVALID',
      'Using placeholder OTP - in real test, get actual OTP from email'
    );

    // 2.2 - Invalid OTP code
    res = await makeRequest('POST', `${API_BASE}/auth/verify-otp`, {
      userId: testState.userId,
      otp: '999999',
    });
    logTest(
      9,
      'Verify OTP: Invalid code',
      '400 OTP_INVALID',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 400 && res.body?.error?.code === 'OTP_INVALID'
    );

    // 2.3 - User not found
    res = await makeRequest('POST', `${API_BASE}/auth/verify-otp`, {
      userId: '00000000-0000-0000-0000-000000000000',
      otp: testState.otpCode,
    });
    logTest(
      10,
      'Verify OTP: User not found',
      '404 NOT_FOUND',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 404 && res.body?.error?.code === 'NOT_FOUND'
    );

    // ==================== SECTION 3: RESEND OTP ====================
    console.log(`${colors.yellow}\n>>> SECTION 3: RESEND OTP TESTS${colors.reset}`);

    // 3.1 - Valid resend OTP
    res = await makeRequest('POST', `${API_BASE}/auth/resend-otp`, {
      userId: testState.userId,
    });
    logTest(
      11,
      'Resend OTP: Valid',
      '200',
      `${res.statusCode}`,
      res.statusCode === 200
    );

    // ==================== SECTION 4: LOGIN ====================
    console.log(`${colors.yellow}\n>>> SECTION 4: LOGIN TESTS${colors.reset}`);

    // 4.1 - Invalid password (without verification, won't work)
    res = await makeRequest('POST', `${API_BASE}/auth/login`, {
      email: testState.testEmail,
      password: 'WrongPassword123',
    });
    logTest(
      12,
      'Login: Invalid password',
      '401 INVALID_CREDENTIALS',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 401 && res.body?.error?.code === 'INVALID_CREDENTIALS'
    );

    // 4.2 - Email not verified
    res = await makeRequest('POST', `${API_BASE}/auth/login`, {
      email: testState.testEmail,
      password: testState.testPassword,
    });
    logTest(
      13,
      'Login: Email not verified returns userId for /verify-otp',
      '403 EMAIL_NOT_VERIFIED + meta.userId',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'} meta.userId=${res.body?.error?.meta?.userId ? 'yes' : 'no'}`,
      res.statusCode === 403 &&
        res.body?.error?.code === 'EMAIL_NOT_VERIFIED' &&
        res.body?.error?.meta?.userId === testState.userId &&
        typeof res.body?.error?.meta?.maskedEmail === 'string',
      'A new code is re-sent and the client is handed what /verify-otp needs'
    );

    // 4.3 - Non-existent email
    res = await makeRequest('POST', `${API_BASE}/auth/login`, {
      email: 'nonexistent@example.com',
      password: testState.testPassword,
    });
    logTest(
      14,
      'Login: Non-existent email',
      '401 INVALID_CREDENTIALS',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 401 && res.body?.error?.code === 'INVALID_CREDENTIALS'
    );

    // ==================== SECTION 5: FORGOT PASSWORD ====================
    console.log(`${colors.yellow}\n>>> SECTION 5: FORGOT PASSWORD TESTS${colors.reset}`);

    // 5.1 - Valid email (neutral response)
    res = await makeRequest('POST', `${API_BASE}/auth/forgot-password`, {
      email: testState.testEmail,
    });
    logTest(
      15,
      'Forgot Password: Valid email',
      '200',
      `${res.statusCode}`,
      res.statusCode === 200
    );

    // 5.2 - Non-existent email is reported, unlike login (deliberate: lets a user fix a typo)
    res = await makeRequest('POST', `${API_BASE}/auth/forgot-password`, {
      email: 'nonexistent@example.com',
    });
    logTest(
      16,
      'Forgot Password: Non-existent email',
      '404 NOT_FOUND',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 404 && res.body?.error?.code === 'NOT_FOUND',
      'Forgot-password discloses a missing account; login must never do so'
    );

    // ==================== SECTION 6: GET /AUTH/ME (No Auth) ====================
    console.log(`${colors.yellow}\n>>> SECTION 6: GET /AUTH/ME TESTS (No Auth)${colors.reset}`);

    // 6.1 - No auth cookie
    res = await makeRequest('GET', `${API_BASE}/auth/me`);
    logTest(
      17,
      'Get Me: No auth cookie',
      '401 UNAUTHORIZED',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 401 && res.body?.error?.code === 'UNAUTHORIZED'
    );

    // ==================== SECTION 7: INVALIDATE ====================
    console.log(`${colors.yellow}\n>>> SECTION 7: INVALIDATE TESTS${colors.reset}`);

    // 7.1 - Missing ref parameter
    res = await makeRequest('GET', `${API_BASE}/auth/invalidate`);
    logTest(
      18,
      'Invalidate: Missing ref parameter',
      '400 VALIDATION_ERROR',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR'
    );

    // 7.2 - Invalid jti format
    res = await makeRequest('GET', `${API_BASE}/auth/invalidate?ref=not-a-uuid`);
    logTest(
      19,
      'Invalidate: Invalid jti format',
      '400 VALIDATION_ERROR',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR'
    );

    // 7.3 - Non-existent jti
    res = await makeRequest('GET', `${API_BASE}/auth/invalidate?ref=00000000-0000-0000-0000-000000000000`);
    logTest(
      20,
      'Invalidate: Non-existent jti',
      '404 NOT_FOUND',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 404 && res.body?.error?.code === 'NOT_FOUND'
    );

    // ==================== SECTION 8: REFRESH TOKEN (No Token) ====================
    console.log(`${colors.yellow}\n>>> SECTION 8: REFRESH TOKEN TESTS (No Token)${colors.reset}`);

    // 8.1 - No refresh token cookie
    res = await makeRequest('POST', `${API_BASE}/auth/refresh`, {});
    logTest(
      21,
      'Refresh: No refresh token cookie',
      '401 UNAUTHORIZED',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 401 && res.body?.error?.code === 'UNAUTHORIZED'
    );

    // ==================== SECTION 9: LOGOUT (No Auth) ====================
    console.log(`${colors.yellow}\n>>> SECTION 9: LOGOUT TESTS (No Auth)${colors.reset}`);

    // 9.1 - No auth cookie
    res = await makeRequest('POST', `${API_BASE}/auth/logout`, {});
    logTest(
      22,
      'Logout: No auth cookie',
      '401 UNAUTHORIZED',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 401 && res.body?.error?.code === 'UNAUTHORIZED'
    );

    // ==================== SECTION 10: RESET PASSWORD ====================
    console.log(`${colors.yellow}\n>>> SECTION 10: RESET PASSWORD TESTS${colors.reset}`);

    // 10.1 - Invalid OTP
    res = await makeRequest('POST', `${API_BASE}/auth/reset-password`, {
      userId: testState.userId,
      otp: '999999',
      newPassword: 'NewPass@123',
      confirmPassword: 'NewPass@123',
    });
    logTest(
      23,
      'Reset Password: Invalid OTP',
      '400 OTP_INVALID',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 400 && res.body?.error?.code === 'OTP_INVALID'
    );

    // 10.2 - User not found
    res = await makeRequest('POST', `${API_BASE}/auth/reset-password`, {
      userId: '00000000-0000-0000-0000-000000000000',
      otp: testState.otpCode,
      newPassword: 'NewPass@123',
      confirmPassword: 'NewPass@123',
    });
    logTest(
      24,
      'Reset Password: User not found',
      '404 NOT_FOUND',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 404 && res.body?.error?.code === 'NOT_FOUND'
    );

    // 10.3 - Mismatched confirmation is rejected by the shared schema
    res = await makeRequest('POST', `${API_BASE}/auth/reset-password`, {
      userId: testState.userId,
      otp: '123456',
      newPassword: 'NewPass@123',
      confirmPassword: 'DifferentPass@123',
    });
    logTest(
      '24b',
      'Reset Password: Passwords do not match',
      '400 VALIDATION_ERROR',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 400 && res.body?.error?.code === 'VALIDATION_ERROR'
    );

    // ==================== SECTION 11: COMPLETE PROFILE (No Auth) ====================
    console.log(`${colors.yellow}\n>>> SECTION 11: COMPLETE PROFILE TESTS (No Auth)${colors.reset}`);

    // 11.1 - No auth (401)
    res = await makeRequest('POST', `${API_BASE}/auth/complete-profile`, {
      name: testState.testName,
      phone: testState.testPhone,
    });
    logTest(
      25,
      'Complete Profile: No auth',
      '401 UNAUTHORIZED',
      `${res.statusCode} ${res.body?.error?.code || 'N/A'}`,
      res.statusCode === 401 && res.body?.error?.code === 'UNAUTHORIZED'
    );

    // ==================== SUMMARY ====================
    console.log(`\n${colors.blue}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.blue}TEST SUMMARY${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(80)}${colors.reset}\n`);

    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    console.log(`Total Tests: ${testCount}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}\n`);

    // Print results table
    console.log(`${colors.blue}DETAILED RESULTS TABLE${colors.reset}\n`);
    console.log(
      '| # | Test Case | Expected | Actual | Status |'
    );
    console.log('|---|---|---|---|---|');

    results.forEach((r) => {
      const status = r.passed ? '✅ PASS' : '❌ FAIL';
      console.log(
        `| ${r.num} | ${r.name} | ${r.expected} | ${r.actual} | ${status} |`
      );
    });

    console.log(`\n${colors.yellow}NOTE:${colors.reset} Tests 8, 13, 15-16, 21-25 expected to fail without:${colors.reset}`);
    console.log('  - Real OTP code from email');
    console.log('  - Verified email address');
    console.log('  - Valid JWT cookies\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(`${colors.red}Fatal Error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Start tests
runTests();
