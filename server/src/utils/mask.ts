// Masks an email for display on the OTP screen ("ra***@example.com"), matching
// resources/ui/OTP Verification.html. The masked form is safe to return in a response
// body — the full address is PII and must never leave the server (RULES.md §4.1).
export function maskEmail(email: string): string {
  const atIndex = email.lastIndexOf('@');
  if (atIndex <= 0) return '***';

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  const visible = local.slice(0, Math.min(2, local.length));

  return `${visible}***@${domain}`;
}
