// Password policy mirrored from server/src/schemas/auth.schema.ts → passwordField.
// The schema remains the gate; these are the live hints shown while typing.
// Keep the predicates in step with the schema's regexes.
export const PASSWORD_RULES: { label: string; test: (password: string) => boolean }[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /[0-9]/.test(pw) },
  { label: 'One special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

// Visual aid only, per resources/ui/Admin Settings.html — a "Strong" score does not
// imply the schema accepts it, and vice versa.
export const STRENGTH_COLORS = [
  'var(--warning-amber)',
  'var(--warning-amber)',
  'var(--primary-deep-blue)',
  'var(--accent-green)',
];

export const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'];

export function passwordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(4, score);
}
