// Phone-number normalization for the WhatsApp Cloud API.
//
// Stored numbers (User.phone / Booking.contactPhone) are validated only as
// `^\+?[0-9]{7,15}$` — the country code and leading '+' are optional, so a value
// may be a bare 10-digit Indian mobile. Meta strongly recommends sending the full
// international format with a leading '+'; if the '+' is omitted Meta prepends the
// *business* number's country code, which can misdeliver a message. So we normalize
// to '+<countrycode><number>' here and return null when we cannot do so confidently,
// letting the caller skip the WhatsApp send (the email still goes out).
//
// The platform is India-only (GST litigation), so a bare 10-digit number is treated
// as an Indian mobile (+91). This assumption lives here alone.
const DEFAULT_COUNTRY_CODE = '91';

export function toWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();

  // Already international: keep the digits, re-attach a single '+'.
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15 ? `+${digits}` : null;
  }

  const digits = trimmed.replace(/\D/g, '');

  // Bare national mobile number → assume India.
  if (digits.length === 10) return `+${DEFAULT_COUNTRY_CODE}${digits}`;

  // Country code already present without the '+', e.g. 9198XXXXXXXX.
  if (digits.length === 12 && digits.startsWith(DEFAULT_COUNTRY_CODE)) return `+${digits}`;

  // Anything else is ambiguous — skip rather than risk misdelivery.
  return null;
}
