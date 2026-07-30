// Throwaway end-to-end check for the auth-flow-hardening branch.
// Run from server/:  npx tsx scripts/verify-auth-flow.ts
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API = 'http://localhost:4000/api/v1';

const PASSWORD = 'ValidPass@123';
const NEW_PASSWORD = 'BrandNew@456';
const stamp = Date.now();
const UNVERIFIED_EMAIL = `unverified.${stamp}@example.com`;
const VERIFIED_EMAIL = `verified.${stamp}@example.com`;

let passed = 0;
let failed = 0;

function check(name: string, ok: boolean, detail = '') {
  if (ok) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

type Envelope = {
  success?: boolean;
  message?: string;
  data?: { userId?: string; maskedEmail?: string; emailVerified?: boolean; user?: unknown };
  error?: {
    code?: string;
    message?: string;
    meta?: { userId?: string; maskedEmail?: string; attemptsLeft?: number };
  };
};

type Res = { status: number; body: Envelope | null; setCookie: string[] };

async function call(
  method: string,
  path: string,
  body?: unknown,
  cookie?: string,
): Promise<Res> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  let parsed: Envelope | null = null;
  try {
    parsed = (await res.json()) as Envelope;
  } catch {
    /* empty body */
  }
  return { status: res.status, body: parsed, setCookie };
}

function accessCookie(res: Res): string {
  const raw = res.setCookie.find((c) => c.startsWith('access_token='));
  return raw ? raw.split(';')[0]! : '';
}

async function main() {
  console.log('\n=== 1. Signup + unverified duplicate ===');
  const signup = await call('POST', '/auth/signup', {
    name: 'Unverified User',
    email: UNVERIFIED_EMAIL,
    password: PASSWORD,
    termsAccepted: true,
  });
  check('signup 201', signup.status === 201, `got ${signup.status}`);
  check('signup returns maskedEmail', typeof signup.body?.data?.maskedEmail === 'string',
    JSON.stringify(signup.body?.data));
  const userId: string = signup.body?.data?.userId;

  const dup = await call('POST', '/auth/signup', {
    name: 'Someone Else',
    email: UNVERIFIED_EMAIL,
    password: PASSWORD,
    termsAccepted: true,
  });
  check('duplicate unverified -> ACCOUNT_UNVERIFIED',
    dup.status === 409 && dup.body?.error?.code === 'ACCOUNT_UNVERIFIED',
    `${dup.status} ${dup.body?.error?.code}`);

  console.log('\n=== 2. Login on an unverified account re-issues the code ===');
  // The signup code is still inside its 60s cooldown, so login swallows OTP_COOLDOWN and
  // still redirects — that swallow is exactly what this asserts.
  const unverifiedLogin = await call('POST', '/auth/login', {
    email: UNVERIFIED_EMAIL,
    password: PASSWORD,
  });
  check('login unverified -> 403 EMAIL_NOT_VERIFIED',
    unverifiedLogin.status === 403 && unverifiedLogin.body?.error?.code === 'EMAIL_NOT_VERIFIED',
    `${unverifiedLogin.status} ${unverifiedLogin.body?.error?.code}`);
  check('error.meta.userId matches',
    unverifiedLogin.body?.error?.meta?.userId === userId,
    JSON.stringify(unverifiedLogin.body?.error?.meta));
  check('error.meta.maskedEmail present',
    typeof unverifiedLogin.body?.error?.meta?.maskedEmail === 'string');
  check('message matches spec',
    unverifiedLogin.body?.error?.message ===
      'Email not verified. A new verification OTP has been sent to your email.',
    unverifiedLogin.body?.error?.message);

  console.log('\n=== 3. Login never discloses account existence ===');
  const wrongPw = await call('POST', '/auth/login', {
    email: VERIFIED_EMAIL,
    password: 'NotTheRightOne@1',
  });
  const noSuchUser = await call('POST', '/auth/login', {
    email: `ghost.${stamp}@example.com`,
    password: PASSWORD,
  });
  check('unknown account -> 401 INVALID_CREDENTIALS',
    noSuchUser.status === 401 && noSuchUser.body?.error?.code === 'INVALID_CREDENTIALS',
    `${noSuchUser.status} ${noSuchUser.body?.error?.code}`);
  check('identical message for unknown vs wrong password',
    noSuchUser.body?.error?.message === 'Incorrect email/mobile number or password.',
    `${wrongPw.body?.error?.message} / ${noSuchUser.body?.error?.message}`);

  console.log('\n=== 4. Forgot password ===');
  const unknownReset = await call('POST', '/auth/forgot-password', {
    email: `ghost.${stamp}@example.com`,
  });
  check('unknown email -> 404 NOT_FOUND',
    unknownReset.status === 404 && unknownReset.body?.error?.code === 'NOT_FOUND',
    `${unknownReset.status} ${unknownReset.body?.error?.code}`);
  check('message matches spec',
    unknownReset.body?.error?.message === 'No account found with the provided email.',
    unknownReset.body?.error?.message);

  const knownReset = await call('POST', '/auth/forgot-password', { email: UNVERIFIED_EMAIL });
  check('known email -> 200', knownReset.status === 200, `${knownReset.status}`);

  console.log('\n=== 5. OTP purpose separation ===');
  const rows = await prisma.otpStore.findMany({ where: { userId } });
  const purposes = rows.map((r) => r.purpose).sort();
  check('both an email_verification and a password_reset code coexist',
    purposes.includes('email_verification') && purposes.includes('password_reset'),
    `rows=${JSON.stringify(purposes)}`);

  console.log('\n=== 6. Reset password validation ===');
  const mismatch = await call('POST', '/auth/reset-password', {
    userId,
    otp: '123456',
    newPassword: NEW_PASSWORD,
    confirmPassword: 'SomethingElse@9',
  });
  check('mismatched confirm -> 400 VALIDATION_ERROR',
    mismatch.status === 400 && mismatch.body?.error?.code === 'VALIDATION_ERROR',
    `${mismatch.status} ${mismatch.body?.error?.code}`);
  check('message says passwords do not match',
    JSON.stringify(mismatch.body?.error).includes('Passwords do not match'),
    JSON.stringify(mismatch.body?.error));

  console.log('\n=== 7. sessions_valid_from — the off-by-one check ===');
  // A verified user with a known password, seeded directly (no email round-trip).
  const verified = await prisma.user.create({
    data: {
      name: 'Verified User',
      email: VERIFIED_EMAIL,
      hashedPassword: await bcrypt.hash(PASSWORD, 12),
      emailVerified: true,
      termsAccepted: true,
      phone: `9${String(stamp).slice(-9)}`,
    },
  });

  const loginA = await call('POST', '/auth/login', { email: VERIFIED_EMAIL, password: PASSWORD });
  check('verified login -> 200', loginA.status === 200, `${loginA.status}`);
  const cookieA = accessCookie(loginA);

  const meA = await call('GET', '/auth/me', undefined, cookieA);
  check('session A works before the change', meA.status === 200, `${meA.status}`);

  // >1s gap so token A's second-resolution `iat` is strictly before the cut-off.
  await new Promise((r) => setTimeout(r, 1500));

  const changed = await call('POST', '/auth/change-password',
    { currentPassword: PASSWORD, newPassword: NEW_PASSWORD }, cookieA);
  check('change-password -> 200', changed.status === 200, `${changed.status}`);
  const cookieB = accessCookie(changed);
  check('change-password re-issues a cookie', cookieB.length > 0);

  const meB = await call('GET', '/auth/me', undefined, cookieB);
  check('NEW session still works (off-by-one guard)', meB.status === 200,
    `${meB.status} — a millisecond cut-off would break this`);

  const meAAfter = await call('GET', '/auth/me', undefined, cookieA);
  check('OLD session is now rejected', meAAfter.status === 401,
    `${meAAfter.status} ${meAAfter.body?.error?.code}`);

  const relogin = await call('POST', '/auth/login',
    { email: VERIFIED_EMAIL, password: NEW_PASSWORD });
  check('login with the new password works', relogin.status === 200, `${relogin.status}`);

  console.log('\n=== 8. Password policy now requires lowercase ===');
  const noLower = await call('POST', '/auth/signup', {
    name: 'Policy Test',
    email: `policy.${stamp}@example.com`,
    password: 'ALLUPPER@123',
    termsAccepted: true,
  });
  check('uppercase-only password rejected',
    noLower.status === 400 && noLower.body?.error?.code === 'VALIDATION_ERROR',
    `${noLower.status} ${noLower.body?.error?.code}`);

  console.log('\n=== 9. A password_reset code cannot verify an email ===');
  const targetEmail = `purpose.${stamp}@example.com`;
  const target = await prisma.user.create({
    data: {
      name: 'Purpose Test',
      email: targetEmail,
      hashedPassword: await bcrypt.hash(PASSWORD, 12),
      emailVerified: false,
      termsAccepted: true,
    },
  });
  const seedOtp = async (purpose: 'email_verification' | 'password_reset', code: string) =>
    prisma.otpStore.create({
      data: {
        userId: target.id,
        purpose,
        hashedOtp: await bcrypt.hash(code, 12),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

  await seedOtp('password_reset', '111111');
  const replay = await call('POST', '/auth/verify-otp', { userId: target.id, otp: '111111' });
  check('reset code rejected at /verify-otp',
    replay.status === 400 && replay.body?.error?.code === 'OTP_INVALID',
    `${replay.status} ${replay.body?.error?.code}`);

  await seedOtp('email_verification', '222222');
  const goodVerify = await call('POST', '/auth/verify-otp', { userId: target.id, otp: '222222' });
  check('correct verification code -> 200', goodVerify.status === 200, `${goodVerify.status}`);
  check('verify-otp issues a session', accessCookie(goodVerify).length > 0);
  const nowVerified = await prisma.user.findUnique({ where: { id: target.id } });
  check('emailVerified is now true', nowVerified?.emailVerified === true);

  const reVerify = await call('POST', '/auth/verify-otp', { userId: target.id, otp: '222222' });
  check('already-verified -> 409 ALREADY_VERIFIED',
    reVerify.status === 409 && reVerify.body?.error?.code === 'ALREADY_VERIFIED',
    `${reVerify.status} ${reVerify.body?.error?.code}`);
  check('message matches spec',
    reVerify.body?.error?.message === 'Your email is already verified.',
    reVerify.body?.error?.message);

  console.log('\n=== 10. Reset password grants a session only to a verified account ===');
  const unverifiedResetEmail = `ureset.${stamp}@example.com`;
  const uReset = await prisma.user.create({
    data: {
      name: 'Unverified Reset',
      email: unverifiedResetEmail,
      hashedPassword: await bcrypt.hash(PASSWORD, 12),
      emailVerified: false,
      termsAccepted: true,
    },
  });
  await prisma.otpStore.create({
    data: {
      userId: uReset.id,
      purpose: 'password_reset',
      hashedOtp: await bcrypt.hash('333333', 12),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  const unverifiedResetRes = await call('POST', '/auth/reset-password', {
    userId: uReset.id,
    otp: '333333',
    newPassword: NEW_PASSWORD,
    confirmPassword: NEW_PASSWORD,
  });
  check('reset succeeds -> 200', unverifiedResetRes.status === 200, `${unverifiedResetRes.status}`);
  check('emailVerified reported false', unverifiedResetRes.body?.data?.emailVerified === false,
    JSON.stringify(unverifiedResetRes.body?.data));
  check('NO session issued to an unverified account',
    accessCookie(unverifiedResetRes) === '',
    `cookies=${JSON.stringify(unverifiedResetRes.setCookie)}`);

  // Same flow on the now-verified account from step 9 must issue a session.
  await prisma.otpStore.create({
    data: {
      userId: target.id,
      purpose: 'password_reset',
      hashedOtp: await bcrypt.hash('444444', 12),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  const verifiedResetRes = await call('POST', '/auth/reset-password', {
    userId: target.id,
    otp: '444444',
    newPassword: NEW_PASSWORD,
    confirmPassword: NEW_PASSWORD,
  });
  check('verified reset -> emailVerified true',
    verifiedResetRes.status === 200 && verifiedResetRes.body?.data?.emailVerified === true,
    JSON.stringify(verifiedResetRes.body?.data));
  check('verified reset issues a session', accessCookie(verifiedResetRes).length > 0);

  console.log('\n--- cleanup ---');
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          UNVERIFIED_EMAIL,
          VERIFIED_EMAIL,
          `policy.${stamp}@example.com`,
          targetEmail,
          unverifiedResetEmail,
        ],
      },
    },
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
