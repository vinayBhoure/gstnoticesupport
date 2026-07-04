import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { callbackSchema } from '@/lib/schemas/callback.schema';
import { CallbackNotificationEmail } from '@/lib/email/templates/CallbackNotificationEmail';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type Envelope<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
  statusCode: number;
};

function envelope<T>(
  data: T | null,
  error: string | null,
  statusCode: number,
): NextResponse<Envelope<T>> {
  return NextResponse.json(
    { success: error === null, data, error, statusCode },
    { status: statusCode },
  );
}

// Admin-side alert only: Calendly's onEventScheduled payload exposes URIs, not
// invitee name/email (no Calendly API token configured), so the user-facing
// confirmation remains Calendly's own email — this never duplicates it.
export async function POST(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  const limit = checkRateLimit(`callback:${ip}`);
  if (!limit.allowed) {
    return envelope(null, 'Too many requests. Please try again later.', 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return envelope(null, 'Invalid request body', 400);
  }

  const parsed = callbackSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    return envelope(null, message, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !from || !to) {
    return envelope(null, 'Email service is not configured', 500);
  }

  const { eventUri, inviteeUri } = parsed.data;
  const resend = new Resend(apiKey);

  const html = await render(CallbackNotificationEmail({ eventUri, inviteeUri }));

  const { error } = await resend.emails.send({
    from,
    to,
    subject: 'A new callback was scheduled via Calendly',
    html,
  });

  if (error) {
    return envelope(null, 'Could not send the notification', 502);
  }

  return envelope({ sent: true }, null, 200);
}
