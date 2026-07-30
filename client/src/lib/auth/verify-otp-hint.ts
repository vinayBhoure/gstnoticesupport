// Carries the masked email ("ra***@example.com") from signup/login into /verify-otp so the
// screen can say where the code went, per resources/ui/OTP Verification.html.
//
// sessionStorage rather than a query param: even masked, an address is closer to PII than
// the opaque userId, and RULES.md §4.2 keeps identifying data out of URLs (which leak via
// history and Referer). Absence is not an error — the screen simply omits the line.

const KEY = 'gns:verify-otp-masked-email';

export function storeMaskedEmail(maskedEmail: string): void {
  try {
    sessionStorage.setItem(KEY, maskedEmail);
  } catch {
    // Private-mode / storage-disabled browsers: the hint is cosmetic, never block the flow.
  }
}

export function readMaskedEmail(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearMaskedEmail(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}
